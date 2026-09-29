const jwt = require('jsonwebtoken')
const authMiddleware = (req, res, next) => {
    try {
        const token = req.headers.authorization
        if (!token) {
            return res.status(401).json({ message: 'Unauthorized' })
        }
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET)
        req.user = decodedToken
        next()
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Internal server error' })
    }
}

// Gate a route to specific roles. Must run after authMiddleware (needs
// req.user). Relies on `role` being present in the JWT payload — tokens
// issued before this field existed won't have it, so anyone with an old
// token will be rejected here and need to log in again.
const requireRole = (...allowedRoles) => (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ message: 'You do not have permission to do that. Try logging out and back in.' })
    }
    next()
}

module.exports = authMiddleware
module.exports.requireRole = requireRole
