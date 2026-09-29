const nodemailer = require('nodemailer')

// Lazily built + cached so we don't reconnect on every call, and so the
// app doesn't crash on boot if SMTP env vars aren't set yet — it just
// won't be able to send until they are.
let transporter = null
let warnedMissingConfig = false

const isConfigured = () => (
    !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS)
)

const getTransporter = () => {
    if (!isConfigured()) return null
    if (transporter) return transporter

    transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    })
    return transporter
}

// Fire-and-forget notification email to whoever a complaint was just
// assigned to. Never throws — a failed/unsent email should never break
// the assignment request itself. Returns true/false for whether it sent.
//
// isStaffAccount: true  -> they have a real login; email points them to
//   log in rather than embedding a direct link (the dashboard route is
//   auth-gated).
// isStaffAccount: false -> free-text fallback assignee with no account;
//   same notify-only behaviour as before, no login mentioned.
const sendAssignmentEmail = async ({ toEmail, complaint, assignedTo, isStaffAccount }) => {
    const t = getTransporter()
    if (!t) {
        if (!warnedMissingConfig) {
            console.warn('[mailer] SMTP_HOST/SMTP_USER/SMTP_PASS not set — assignment emails are disabled.')
            warnedMissingConfig = true
        }
        return false
    }

    const baseUrl = (process.env.CLIENT_URL || '').replace(/\/$/, '')
    const loginLink = baseUrl ? `${baseUrl}/admin/login` : null

    const studentName = complaint.studentId?.name || 'A student'
    const complaintTypeName = complaint.complaintType?.name || 'General'
    const summary = (complaint.complaint || '').slice(0, 300)
    const truncated = complaint.complaint && complaint.complaint.length > 300

    const textLines = [
        `You've been assigned a grievance to look into: "${assignedTo}".`,
        '',
        `Complaint type: ${complaintTypeName}`,
        `Submitted by: ${studentName}`,
        `Summary: ${summary}${truncated ? '...' : ''}`,
        ''
    ]

    if (isStaffAccount) {
        textLines.push(
            loginLink
                ? `Log in to view the full complaint and respond: ${loginLink}`
                : 'Log in to the portal to view the full complaint and respond.'
        )
    } else {
        textLines.push(
            "This is a notification only — you don't have a login for this system. Please follow up with the college's grievance admin directly to update or resolve this complaint."
        )
    }

    try {
        await t.sendMail({
            from: process.env.SMTP_FROM || process.env.SMTP_USER,
            to: toEmail,
            subject: `Grievance assigned to you: ${complaintTypeName}`,
            text: textLines.filter((line) => line !== null).join('\n')
        })
        return true
    } catch (error) {
        console.error('[mailer] Failed to send assignment email:', error.message)
        return false
    }
}

module.exports = { sendAssignmentEmail, isConfigured }
