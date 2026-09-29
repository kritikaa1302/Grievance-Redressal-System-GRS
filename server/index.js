
const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(express.static("public"));

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "Too many requests from this user, please try again later",
  })
);

// APIs
app.use("/api/student", require("./routes/studentRoute"));
app.use("/api/admin", require("./routes/adminRoute"));
app.use("/api/college", require("./routes/collegeRoute"));
app.use("/api/session", require("./routes/sessionRoute"));
app.use("/api/complaintType", require("./routes/complaintTypeRoute"));
app.use("/api/staff", require("./routes/staffRoute"));
app.use("/api/complaint", require("./routes/complaintRoute"));

// Error handling
app.use((err, req, res, next) => {
  if (err) {
    console.error(err);

    if (
      err.name === "MulterError" ||
      /image|PDF|attachment/i.test(err.message || "")
    ) {
      return res.status(400).json({ message: err.message });
    }

    return res.status(500).json({
      message: "Internal server error",
    });
  }

  next();
});

// Start the server after connecting to MongoDB
connectDB()
  .then(() => {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Database connection failed:", err);
    process.exit(1);
  });
