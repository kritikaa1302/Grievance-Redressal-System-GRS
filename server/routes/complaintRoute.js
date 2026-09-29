const express = require('express')
const router = express.Router()
const Complaint = require('../models/Complaint')
const Admin = require('../models/Admin')
const Student = require('../models/Student')
const Staff = require('../models/Staff')
const authMiddleware = require('../middleware/authMiddleware')
const { requireRole } = require('../middleware/authMiddleware')
const { upload, toAttachment } = require('../middleware/upload')
const { sendAssignmentEmail } = require('../utils/mailer')

// Loose but sane email validation — good enough to catch typos before we
// try to send to it. Not meant to be a full RFC 5322 validator.
const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

// Figures out whether the calling user (from their JWT) is an admin,
// staff, or student, and returns a display name to attach to
// messages/notes. Returns null if the id doesn't match any collection.
const resolveSender = async (userId) => {
    const admin = await Admin.findById(userId).select('email')
    if (admin) {
        return { role: 'admin', name: admin.email }
    }
    const staff = await Staff.findById(userId).select('name email')
    if (staff) {
        return { role: 'staff', name: staff.name, email: staff.email }
    }
    const student = await Student.findById(userId).select('name')
    if (student) {
        return { role: 'student', name: student.name }
    }
    return null
}

// The email/name to record as the actor in the audit trail — works for
// both admins and staff. Never trust a client-supplied name for this.
const resolveActorEmail = async (req) => {
    if (req.user.role === 'staff') {
        const staff = await Staff.findById(req.user.id).select('email')
        return staff?.email || 'Unknown Staff'
    }
    const admin = await Admin.findById(req.user.id).select('email')
    return admin?.email || 'Unknown Admin'
}

// Staff can only act on a complaint that's actually assigned to them.
// Admins can act on anything. Returns true/false.
const canActOnComplaint = (req, complaint) => {
    if (req.user.role === 'admin') return true
    if (req.user.role === 'staff') {
        return !!complaint.assignedStaffId && complaint.assignedStaffId.toString() === req.user.id
    }
    return false
}

// Create a new complaint (Student) — accepts up to 3 attachments
// (photos, screenshots, PDFs) under the 'attachments' field.
router.post('/create', authMiddleware, upload.array('attachments', 3), async (req, res) => {
    try {
        const { complaintType, complaint } = req.body
        const studentId = req.user.id // From authMiddleware

        const attachments = (req.files || []).map(toAttachment)

        const newComplaint = new Complaint({
            complaintType,
            complaint,
            studentId,
            attachments
        })

        await newComplaint.save()
        res.status(201).json({ message: 'Complaint filed successfully' })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Internal server error' })
    }
})

// Get complaints for a specific student (Student). Excludes `notes` —
// that's the admin-internal audit trail and shouldn't be visible to
// students; `messages` (the two-way conversation) is fine to expose.
router.get('/student-complaints', authMiddleware, async (req, res) => {
    try {
        const studentId = req.user.id
        const complaints = await Complaint.find({ studentId })
            .select('-notes')
            .populate('complaintType', 'name')
            .sort({ createdAt: -1 })
        res.status(200).json(complaints)
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Internal server error' })
    }
})

// Get all complaints (Admin only — staff use /assigned-to-me instead,
// since they should only ever see complaints routed to them).
router.get('/get-all', authMiddleware, requireRole('admin'), async (req, res) => {
    try {
        const complaints = await Complaint.find()
            .populate({
                path: 'studentId',
                select: 'name email mobile collegeId course',
                populate: { path: 'collegeId', select: 'name' }
            })
            .populate('complaintType', 'name')
            .sort({ createdAt: -1 })
        res.status(200).json(complaints)
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Internal server error' })
    }
})

// Get complaints assigned to the logged-in staff member (Staff only).
// This is the entire visibility boundary for staff — they never see
// anything outside this list.
router.get('/assigned-to-me', authMiddleware, requireRole('staff'), async (req, res) => {
    try {
        const complaints = await Complaint.find({ assignedStaffId: req.user.id })
            .populate({
                path: 'studentId',
                select: 'name email mobile collegeId course',
                populate: { path: 'collegeId', select: 'name' }
            })
            .populate('complaintType', 'name')
            .sort({ createdAt: -1 })
        res.status(200).json(complaints)
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Internal server error' })
    }
})

// Update complaint status (Admin, or Staff on a complaint assigned to
// them) — also logs an audit trail entry, optionally with a note
// explaining the change.
router.put('/update-status/:id', authMiddleware, requireRole('admin', 'staff'), async (req, res) => {
    try {
        const { status, note } = req.body
        if (!['notProcessed', 'pending', 'closed'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' })
        }

        const existing = await Complaint.findById(req.params.id)
        if (!existing) {
            return res.status(404).json({ message: 'Complaint not found' })
        }
        if (!canActOnComplaint(req, existing)) {
            return res.status(403).json({ message: 'This complaint is not assigned to you' })
        }

        // Resolve the acting user's email server-side (never trust a
        // client-supplied name/email for the audit trail).
        const actorEmail = await resolveActorEmail(req)

        const previousStatus = existing.status
        existing.status = status
        existing.notes.push({
            type: 'status_change',
            fromStatus: previousStatus,
            toStatus: status,
            text: note && note.trim() ? note.trim() : undefined,
            addedByEmail: actorEmail
        })

        await existing.save()
        await existing.populate({
            path: 'studentId',
            select: 'name email mobile collegeId course',
            populate: { path: 'collegeId', select: 'name' }
        })
        await existing.populate('complaintType', 'name')

        res.status(200).json({ message: 'Complaint status updated', complaint: existing })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Internal server error' })
    }
})

// Add a free-text note without changing status (Admin, or Staff on a
// complaint assigned to them).
router.post('/:id/notes', authMiddleware, requireRole('admin', 'staff'), async (req, res) => {
    try {
        const { text } = req.body
        if (!text || !text.trim()) {
            return res.status(400).json({ message: 'Note text is required' })
        }

        const complaint = await Complaint.findById(req.params.id)
        if (!complaint) {
            return res.status(404).json({ message: 'Complaint not found' })
        }
        if (!canActOnComplaint(req, complaint)) {
            return res.status(403).json({ message: 'This complaint is not assigned to you' })
        }

        const actorEmail = await resolveActorEmail(req)

        complaint.notes.push({
            type: 'note',
            text: text.trim(),
            addedByEmail: actorEmail
        })

        await complaint.save()
        await complaint.populate({
            path: 'studentId',
            select: 'name email mobile collegeId course',
            populate: { path: 'collegeId', select: 'name' }
        })
        await complaint.populate('complaintType', 'name')

        res.status(201).json({ message: 'Note added', complaint })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Internal server error' })
    }
})

// Update who's assigned to a complaint (Admin only — staff can't
// reassign). Accepts either a real staffId (preferred) or the legacy
// free-text assignedTo/assignedToEmail pair for cases with no matching
// staff account yet. Logs an audit entry whenever the assignee changes,
// and sends a best-effort notification email.
router.put('/:id/assign', authMiddleware, requireRole('admin'), async (req, res) => {
    try {
        const { staffId, assignedTo, assignedToEmail } = req.body

        const complaint = await Complaint.findById(req.params.id)
        if (!complaint) {
            return res.status(404).json({ message: 'Complaint not found' })
        }

        let nextAssignedTo = ''
        let nextAssignedToEmail = ''
        let nextStaffId = null
        let staffDoc = null

        if (staffId) {
            staffDoc = await Staff.findById(staffId)
            if (!staffDoc) {
                return res.status(404).json({ message: 'Selected staff member not found' })
            }
            nextAssignedTo = staffDoc.name
            nextAssignedToEmail = staffDoc.email
            nextStaffId = staffDoc._id
        } else {
            const trimmedEmail = (assignedToEmail || '').trim()
            if (trimmedEmail && !isValidEmail(trimmedEmail)) {
                return res.status(400).json({ message: "That email address doesn't look valid" })
            }
            nextAssignedTo = (assignedTo || '').trim()
            nextAssignedToEmail = trimmedEmail
            nextStaffId = null
        }

        const previous = complaint.assignedTo || ''
        const previousEmail = complaint.assignedToEmail || ''
        const previousStaffId = complaint.assignedStaffId ? complaint.assignedStaffId.toString() : null

        const changed = previous !== nextAssignedTo ||
            previousEmail !== nextAssignedToEmail ||
            previousStaffId !== (nextStaffId ? nextStaffId.toString() : null)

        if (changed) {
            const actorEmail = await resolveActorEmail(req)

            complaint.assignedTo = nextAssignedTo
            complaint.assignedToEmail = nextAssignedToEmail
            complaint.assignedStaffId = nextStaffId
            complaint.notes.push({
                type: 'assignment',
                fromAssignee: previous || undefined,
                toAssignee: nextAssignedTo || undefined,
                toAssigneeEmail: nextAssignedToEmail || undefined,
                addedByEmail: actorEmail
            })
            await complaint.save()
        }

        await complaint.populate({
            path: 'studentId',
            select: 'name email mobile collegeId course',
            populate: { path: 'collegeId', select: 'name' }
        })
        await complaint.populate('complaintType', 'name')

        // Best-effort notification — only fires when the assignee
        // actually changed, so re-saving the same assignment doesn't
        // spam a fresh email every time.
        let emailSent = false
        if (changed && nextAssignedToEmail) {
            emailSent = await sendAssignmentEmail({
                toEmail: nextAssignedToEmail,
                complaint,
                assignedTo: nextAssignedTo,
                isStaffAccount: !!nextStaffId
            })
        }

        res.status(200).json({ message: 'Assignment updated', complaint, emailSent })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Internal server error' })
    }
})

// Delete a manual note (Admin only). Status-change and assignment
// entries can't be deleted — they're an audit trail of what actually
// happened, not just a comment.
router.delete('/:id/notes/:noteId', authMiddleware, requireRole('admin'), async (req, res) => {
    try {
        const complaint = await Complaint.findById(req.params.id)
        if (!complaint) {
            return res.status(404).json({ message: 'Complaint not found' })
        }

        const note = complaint.notes.id(req.params.noteId)
        if (!note) {
            return res.status(404).json({ message: 'Note not found' })
        }
        if (note.type !== 'note') {
            return res.status(400).json({ message: 'Only manual notes can be deleted' })
        }

        complaint.notes.pull({ _id: req.params.noteId })
        await complaint.save()
        await complaint.populate({
            path: 'studentId',
            select: 'name email mobile collegeId course',
            populate: { path: 'collegeId', select: 'name' }
        })
        await complaint.populate('complaintType', 'name')

        res.status(200).json({ message: 'Note deleted', complaint })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Internal server error' })
    }
})

// Post a message in the two-way conversation on a complaint (Student,
// Admin, or Staff on a complaint assigned to them). Students can only
// message on their own complaint; any admin can message on any
// complaint. Accepts an optional single file attachment.
router.post('/:id/messages', authMiddleware, upload.single('attachment'), async (req, res) => {
    try {
        const { text } = req.body
        const hasFile = !!req.file
        if ((!text || !text.trim()) && !hasFile) {
            return res.status(400).json({ message: 'Message text or an attachment is required' })
        }

        const complaint = await Complaint.findById(req.params.id)
        if (!complaint) {
            return res.status(404).json({ message: 'Complaint not found' })
        }

        const sender = await resolveSender(req.user.id)
        if (!sender) {
            return res.status(403).json({ message: 'Not authorized' })
        }
        if (sender.role === 'student' && complaint.studentId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to message on this complaint' })
        }
        if (sender.role === 'staff' && !canActOnComplaint(req, complaint)) {
            return res.status(403).json({ message: 'This complaint is not assigned to you' })
        }

        complaint.messages.push({
            sender: sender.role === 'staff' ? 'admin' : sender.role,
            senderName: sender.name,
            text: text && text.trim() ? text.trim() : undefined,
            attachment: hasFile ? toAttachment(req.file) : undefined
        })

        await complaint.save()
        await complaint.populate({
            path: 'studentId',
            select: 'name email mobile collegeId course',
            populate: { path: 'collegeId', select: 'name' }
        })
        await complaint.populate('complaintType', 'name')

        // Students never see the internal admin/staff audit trail, even
        // via this route's response.
        const responseComplaint = complaint.toObject()
        if (sender.role === 'student') {
            delete responseComplaint.notes
        }

        res.status(201).json({ message: 'Message sent', complaint: responseComplaint })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Internal server error' })
    }
})

module.exports = router
