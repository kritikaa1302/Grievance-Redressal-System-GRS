const express = require('express')
const router = express.Router()
const Admin = require('../models/Admin')
const Staff = require('../models/Staff')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body
        const adminExists = await Admin.findOne({ email })
        if (adminExists) {
            return res.status(400).json({ message: 'Admin already exists' })
        }
        // if already have atleast one admin then return error
        const adminCount = await Admin.countDocuments()
        if (adminCount > 0) {
            return res.status(400).json({ message: 'Admin already exists' })
        }
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)
        const admin = await new Admin({
            name,
            email,
            password: hashedPassword
        })
        await admin.save()
        res.status(201).json({ message: 'Admin registered' })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Internal server error' })
    }
})
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body
        const admin = await Admin.findOne({ email })

        // Shared login: try Admin first, then fall back to Staff — same
        // form/endpoint either way, the frontend redirects based on the
        // role we return rather than needing a separate staff login page.
        if (!admin) {
            const staff = await Staff.findOne({ email })
            if (!staff) {
                return res.status(401).json({ message: 'Invalid credentials' })
            }
            if (!staff.active) {
                return res.status(403).json({ message: 'This staff account has been deactivated. Contact your admin.' })
            }
            const isStaffPasswordValid = await bcrypt.compare(password, staff.password)
            if (!isStaffPasswordValid) {
                return res.status(401).json({ message: 'Invalid credentials' })
            }
            const staffToken = jwt.sign({ id: staff._id, role: 'staff' }, process.env.JWT_SECRET, { expiresIn: '1d' })
            return res.status(200).json({
                msg: "Login successfull",
                token: staffToken,
                role: 'staff',
                admin: {
                    id: staff._id,
                    name: staff.name,
                    email: staff.email
                }
            })
        }

        const isPasswordValid = await bcrypt.compare(password, admin.password)
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' })
        }
        const token = jwt.sign({ id: admin._id, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1d' })
        res.status(200).json({
            msg: "Login successfull",
            token,
            role: 'admin',
            admin: {
                id: admin._id,
                email: admin.email
            }
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Internal server error' })
    }
})
// get verify token with the timeline
router.get('/verify-token', async (req, res) => {
    try {
        const token = req.headers.authorization
        if (!token) {
            return res.status(401).json({ message: 'Unauthorized' })
        }
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET)
        const admin = await Admin.findById(decodedToken.id)
        if (!admin) {
            return res.status(401).json({ message: 'Unauthorized' })
        }
        res.status(200).json({ message: 'Authorized' })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Internal server error' })
    }
})
module.exports = router
