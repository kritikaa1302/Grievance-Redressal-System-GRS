const multer = require('multer')
const path = require('path')
const fs = require('fs')

// Files land in server/public/uploads, and are served statically at
// /uploads/<filename> since index.js already does app.use(express.static("public")).
const uploadDir = path.join(__dirname, '..', 'public', 'uploads')
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true })
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
        cb(null, `${unique}${path.extname(file.originalname)}`)
    }
})

const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']

const fileFilter = (req, file, cb) => {
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true)
    } else {
        cb(new Error('Only images (jpg, png, webp, gif) and PDF files are allowed'))
    }
}

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB per file
        files: 3
    }
})

// Turns a saved multer file into the shape stored on the Complaint document.
const toAttachment = (file) => ({
    url: `/uploads/${file.filename}`,
    originalName: file.originalname,
    mimeType: file.mimetype,
    size: file.size
})

module.exports = { upload, toAttachment }
