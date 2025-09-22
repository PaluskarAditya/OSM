const express = require("express");
const fs = require('fs');
const path = require('path');
const {
  getAll,
  upload,
  getFile,
} = require("../controllers/answerSheetController");
const router = express.Router();

// Configure multer for file uploads
const multer = require("multer");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = "uploads/";
    fs.mkdir(uploadDir, { recursive: true }, (err) => {
      if (err) {
        return cb(err);
      }
      cb(null, uploadDir);
    });
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext);
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${basename}-${uniqueSuffix}${ext}`);
  },
});

const uploader = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only Excel and PDF files are allowed!"), false);
    }
  },
  limits: {
    fileSize: 50 * 1024 * 1024, // 10MB limit
  },
});

router.get("/", getAll);
router.post("/multiple", uploader.array("files"), upload);
router.get("/:assignmentId", getFile);

module.exports = router;
