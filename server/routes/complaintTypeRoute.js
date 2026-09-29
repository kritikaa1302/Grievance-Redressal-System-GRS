const express = require('express')
const router = express.Router()
const ComplaintType = require('../models/ComplaintType')
const authMiddleware = require('../middleware/authMiddleware')
router.post('/create', authMiddleware, async (req, res) => {
    try {
        const { name, description } = req.body
        const complaintType = await new ComplaintType({
            name,
            description
        })
        await complaintType.save()
        res.status(201).json({ message: 'Complaint type created' })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Internal server error' })
    }
})
// get all complaint types
router.get('/get-all', async (req, res) => {
    try {
        const complaintTypes = await ComplaintType.find()
        res.status(200).json(complaintTypes)
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Internal server error' })
    }
})
// update complaint type
router.put('/update/:id', authMiddleware, async (req, res) => {
    try {
        const { name, description } = req.body
        const complaintType = await ComplaintType.findByIdAndUpdate(req.params.id, {
            name,
            description
        })
        await complaintType.save()
        res.status(200).json({ message: 'Complaint type updated' })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Internal server error' })
    }
})
// delete complaint type
router.delete('/delete/:id', authMiddleware, async (req, res) => {
    try {
        const complaintType = await ComplaintType.findByIdAndDelete(req.params.id)
        res.status(200).json({ message: 'Complaint type deleted' })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Internal server error' })
    }
})
module.exports = router