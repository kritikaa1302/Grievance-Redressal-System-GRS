const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const Staff = require('../models/Staff')
const authMiddleware = require('../middleware/authMiddleware')
const { requireRole } = require('../middleware/authMiddleware')

// List all staff (Admin only) — used by Manage Entities and by the
// assignment dropdown on the complaints dashboard.
router.get('/get-all', authMiddleware, requireRole('admin'), async (req, res) => {
    try {
        const staff = await Staff.find()
            .select('-password')
            .populate('complaintType', 'name')
            .sort({ createdAt: -1 })
        res.status(200).json(staff)
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Internal server error' })
    }
})

// Create a staff account (Admin only). No self-signup — this is the only
// way a staff login gets created.
router.post('/create', authMiddleware, requireRole('admin'), async (req, res) => {
    try {
        const { name, email, password, complaintType } = req.body
        if (!name || !email || !password || !complaintType) {
            return res.status(400).json({ message: 'Name, email, password, and department are all required' })
        }
        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' })
        }

        const existing = await Staff.findOne({ email: email.toLowerCase().trim() })
        if (existing) {
            return res.status(400).json({ message: 'A staff account with that email already exists' })
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const staff = await new Staff({
            name,
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            complaintType
        })
        await staff.save()

        const populated = await Staff.findById(staff._id).select('-password').populate('complaintType', 'name')
        res.status(201).json({ message: 'Staff account created', staff: populated })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Internal server error' })
    }
})

// Toggle a staff account active/inactive (Admin only). Deactivating
// blocks login without deleting their assignment/audit-trail history.
router.put('/:id/toggle-active', authMiddleware, requireRole('admin'), async (req, res) => {
    try {
        const staff = await Staff.findById(req.params.id)
        if (!staff) {
            return res.status(404).json({ message: 'Staff not found' })
        }
        staff.active = !staff.active
        await staff.save()
        const populated = await Staff.findById(staff._id).select('-password').populate('complaintType', 'name')
        res.status(200).json({ message: 'Staff status updated', staff: populated })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Internal server error' })
    }
})

// Delete a staff account (Admin only). Complaints previously assigned to
// them keep their assignedTo/assignedToEmail text, but assignedStaffId is
// left dangling — the assign UI treats a missing/inactive staff doc as
// "no longer assignable" without touching complaint history.
router.delete('/:id', authMiddleware, requireRole('admin'), async (req, res) => {
    try {
        await Staff.findByIdAndDelete(req.params.id)
        res.status(200).json({ message: 'Staff account deleted' })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Internal server error' })
    }
})

module.exports = router
