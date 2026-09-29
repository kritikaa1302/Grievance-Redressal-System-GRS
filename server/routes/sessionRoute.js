const express = require('express')
const router = express.Router()
const Session = require('../models/Session')
const authMiddleware = require('../middleware/authMiddleware')
router.post('/create', authMiddleware, async (req, res) => {
    try {
        const { name, description } = req.body
        const session = await new Session({
            name,
            description
        })
        await session.save()
        res.status(201).json({ message: 'Session created' })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Internal server error' })
    }
})
// get all sessions
router.get('/get-all', async (req, res) => {
    try {
        const sessions = await Session.find()
        res.status(200).json(sessions)
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Internal server error' })
    }
})
// update session
router.put('/update/:id', authMiddleware, async (req, res) => {
    try {
        const { name, description } = req.body
        const session = await Session.findByIdAndUpdate(req.params.id, {
            name,
            description
        })
        await session.save()
        res.status(200).json({ message: 'Session updated' })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Internal server error' })
    }
})
// delete session
router.delete('/delete/:id', authMiddleware, async (req, res) => {
    try {
        const session = await Session.findByIdAndDelete(req.params.id)
        res.status(200).json({ message: 'Session deleted' })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Internal server error' })
    }
})
module.exports = router