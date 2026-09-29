const express = require('express')
const Student = require('../models/Student')
const router = express.Router()
const bcrypt = require('bcrypt')
const authMiddleware = require('../middleware/authMiddleware')
const jwt = require('jsonwebtoken')
router.post('/register', async (req, res) => {
    try {
        const { name, fatherName, email, gender, password, address, mobile, dob, sessionId, city, pincode, course, collegeId, picture } = req.body
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)
        const student = await new Student({
            name,
            fatherName,
            email,
            gender,
            password: hashedPassword,
            address,
            mobile,
            dob,
            sessionId,
            city,
            pincode,
            course,
            collegeId,
            picture
        })
        await student.save()
        res.status(201).json({ message: 'Student registered' })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Internal server error' })
    }
})
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body
        const student = await Student.findOne({ email })
        if (!student) {
            return res.status(401).json({ message: 'Invalid credentials' })
        }
        const isPasswordValid = await bcrypt.compare(password, student.password)
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' })
        }
        const token = jwt.sign({ id: student._id }, process.env.JWT_SECRET, { expiresIn: '1d' })
        res.status(200).json({
            msg: "Login successfull",
            token,
            student: {
                id: student._id,
                name: student.name,
                email: student.email,
                picture: student.picture
            }
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Internal server error' })
    }
})
//get all students
router.get('/all', authMiddleware, async (req, res) => {
    try {
        const students = await Student.find().populate('collegeId', 'name').populate('sessionId', 'name')
        res.status(200).json(students)
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Internal server error' })
    }
})
// get particular student
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const student = await Student.findById(req.params.id).populate('collegeId', 'name').populate('sessionId', 'name')
        res.status(200).json(student)
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Internal server error' })
    }
})
// update student
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const student = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true })
        res.status(200).json(student)
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Internal server error' })
    }
})
// soft delete student
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const student = await Student.findByIdAndUpdate(req.params.id, { isDeleted: true }, { new: true })
        res.status(200).json({ message: 'Student deleted' })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Internal server error' })
    }
})
// verify students
router.put('/:id/verify', authMiddleware, async (req, res) => {
    try {
        const student = await Student.findByIdAndUpdate(req.params.id, { isVerified: true }, { new: true })
        res.status(200).json({ message: 'Student verified' })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Internal server error' })
    }
})
// unverify students
router.put('/:id/unverify', authMiddleware, async (req, res) => {
    try {
        const student = await Student.findByIdAndUpdate(req.params.id, { isVerified: false }, { new: true })
        res.status(200).json({ message: 'Student unverified' })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Internal server error' })
    }
})
// get unverified students
router.get('/unverified', authMiddleware, async (req, res) => {
    try {
        const students = await Student.find({ isVerified: false })
        res.status(200).json(students)
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Internal server error' })
    }
})
// get verified students
router.get('/verified', authMiddleware, async (req, res) => {
    try {
        const students = await Student.find({ isVerified: true })
        res.status(200).json(students)
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Internal server error' })
    }
})
// get deleted students
router.get('/deleted', authMiddleware, async (req, res) => {
    try {
        const students = await Student.find({ isDeleted: true })
        res.status(200).json(students)
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Internal server error' })
    }
})
// get active students
router.get('/active', authMiddleware, async (req, res) => {
    try {
        const students = await Student.find({ status: 'active' })
        res.status(200).json(students)
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Internal server error' })
    }
})
// get inactive students
router.get('/inactive', authMiddleware, async (req, res) => {
    try {
        const students = await Student.find({ status: 'inactive' })
        res.status(200).json(students)
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Internal server error' })
    }
})
// get students by college id
router.get('/college/:id', authMiddleware, async (req, res) => {
    try {
        const students = await Student.find({ collegeId: req.params.id })
        res.status(200).json(students)
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Internal server error' })
    }
})
// get students by session id
router.get('/session/:id', authMiddleware, async (req, res) => {
    try {
        const students = await Student.find({ sessionId: req.params.id })
        res.status(200).json(students)
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Internal server error' })
    }
})
module.exports = router