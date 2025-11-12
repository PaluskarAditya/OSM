const express = require("express");
require("dotenv").config();
const mongoose = require("mongoose");
const multer = require("multer");
const router = express.Router();
const { create, getAll, getFile } = require("../controllers/qpKeyController");
const authMiddleware = require("../middlewares/authMiddleware");

// ----------------------
// Multer Setup (memory)
// ----------------------
const storage = multer.memoryStorage();
const uploader = multer({ storage });

// ----------------------
// MongoDB & GridFS Setup
// ----------------------
let bucket;
mongoose.connection.once("open", () => {
  bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
    bucketName: "uploads",
  });
  console.log("GridFSBucket ready 🎯");
});

// ----------------------
// Routes
// ----------------------
router.get("/", authMiddleware, getAll);
router.get("/view/:type/:filename", getFile);
router.post(
  "/",
  authMiddleware,
  uploader.fields([
    { name: "qp", maxCount: 1 },
    { name: "key", maxCount: 1 },
  ]),
  (req, res, next) => {
    req.bucket = bucket;
    next();
  },
  create
);

module.exports = router;
