const express = require("express");
require("dotenv").config();
const mongoose = require("mongoose");
const multer = require("multer");
const router = express.Router();

const {
  getAll,
  upload,
  getFile,
  getFullFile,
  status,
  eval,
} = require("../controllers/answerSheetController");

// ----------------------
// MongoDB & GridFS Setup
// ----------------------
let bucket;
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

mongoose.connection.once("open", () => {
  bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
    bucketName: "uploads",
  });
  console.log("GridFSBucket ready 🎯");
});

// ----------------------
// Multer Setup (memory)
// ----------------------
const storage = multer.memoryStorage();
const uploader = multer({ storage });

// ----------------------
// Routes
// ----------------------
router.get("/", getAll);

// Upload multiple files
router.post("/multiple", uploader.array("files"), upload);

// Other existing routes
router.get("/:assignmentId", getFile);
router.get("/full/:assignmentId", getFullFile);
router.put("/status/:assignmentId", status);
router.put("/update/:assignmentId", eval);

module.exports = router;
