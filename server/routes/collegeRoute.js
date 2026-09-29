const express = require('express')
const router = express.Router()
const College = require('../models/College')
const authMiddleware = require('../middleware/authMiddleware')
router.post('/create', authMiddleware, async (req, res) => {
    try {
        const { name, description } = req.body
        const college = await new College({
            name,
            description
        })
        await college.save()
        res.status(201).json({ message: 'College created' })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Internal server error' })
    }
})
// get all colleges
router.get('/get-all', async (req, res) => {
    try {
        const colleges = await College.find()
        res.status(200).json(colleges)
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Internal server error' })
    }
})
// update college
router.put('/update/:id', authMiddleware, async (req, res) => {
    try {
        const { name, description } = req.body
        const college = await College.findByIdAndUpdate(req.params.id, {
            name,
            description
        })
        await college.save()
        res.status(200).json({ message: 'College updated' })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Internal server error' })
    }
})
// delete college
router.delete('/delete/:id', authMiddleware, async (req, res) => {
    try {
        const college = await College.findByIdAndDelete(req.params.id)
        res.status(200).json({ message: 'College deleted' })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Internal server error' })
    }
})
module.exports = router