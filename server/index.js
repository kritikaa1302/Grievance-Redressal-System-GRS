const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const helmet = require("helmet");
const cors = require("cors");
const cluster = require("cluster");
const numCPUs = require("os").cpus().length;

const rateLimit = require("express-rate-limit");
if(cluster.isPrimary){
    for(let i=0;i<numCPUs;i++){
        cluster.fork();
    }
    cluster.on("exit",()=>{
        cluster.fork();
    })
}else{
    const PORT = process.env.PORT ;
    dotenv.config();
    const app = express();
    connectDB();

    app.use(express.json());
    app.use(cors());
    app.use(helmet());
    app.use(express.static("public"));
    app.use(rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 100,
        message: "Too many requests from this user, please try again later",
    }));
    
    // apis started
    app.use("/api/student", require("./routes/studentRoute"));
    app.use("/api/admin", require("./routes/adminRoute"));
    app.use("/api/college", require("./routes/collegeRoute"));
    app.use("/api/session", require("./routes/sessionRoute"));
    app.use("/api/complaintType", require("./routes/complaintTypeRoute"));
    app.use("/api/staff", require("./routes/staffRoute"));
    app.use("/api/complaint", require("./routes/complaintRoute"));

    // apis ended

    // Catches errors passed to next(err) — importantly this includes
    // multer's upload errors (file too large, wrong type, too many
    // files), which otherwise fall through to Express's default HTML
    // error page instead of a JSON response the frontend can read.
    app.use((err, req, res, next) => {
        if (err) {
            console.error(err)
            if (err.name === 'MulterError' || /image|PDF|attachment/i.test(err.message || '')) {
                return res.status(400).json({ message: err.message })
            }
            return res.status(500).json({ message: 'Internal server error' })
        }
        next()
    })

    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}
