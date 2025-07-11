const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { body, validationResult } = require("express-validator");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type"],
  })
);

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Load models
const Stream = require("./models/streamModel");
const Degree = require("./models/degreeModel");
const AcademicYear = require("./models/academicyearModel");
const Course = require("./models/courseModel");
const Specialization = require("./models/specializationModel");
const Subject = require("./models/subjectModel");

// Validation middleware
const validateCourse = [
  body("name").trim().notEmpty().withMessage("Course name is required"),
  body("code").trim().notEmpty().withMessage("Course code is required"),
  body("stream").notEmpty().withMessage("Stream is required"),
  body("degree").notEmpty().withMessage("Degree is required"),
  body("academicYear").notEmpty().withMessage("Academic year is required"),
  body("semester").notEmpty().withMessage("Semester is required"),
  body("numSemesters")
    .isInt({ min: 1 })
    .withMessage("Number of semesters must be a positive integer"),
];

// Error response formatter
const sendError = (res, status, message) => {
  return res.status(status).json({ success: false, error: message });
};

// @GET - Custom Route to get degrees by stream
app.get("/api/v1/streams/:uuid/degrees", async (req, res) => {
  try {
    const stream = await Stream.findOne({ uuid: req.params.uuid });
    console.log(stream, req.params.uuid);
    if (!stream) return sendError(res, 404, "Stream not found");

    const degrees = await Degree.find({ stream: stream.uuid });
    console.log(degrees, req.params.uuid);
    res.status(200).json(degrees);
  } catch (err) {
    sendError(res, 500, err.message);
  }
});

// @GET - Custom Route to get academic years by degree
app.get("/api/v1/degrees/:uuid/academic-years", async (req, res) => {
  try {
    const degree = await Degree.findOne({ uuid: req.params.uuid });
    if (!degree) return sendError(res, 404, "Degree not found");

    const academicYears = await AcademicYear.find({ degree: degree.uuid });
    res.status(200).json(academicYears);
  } catch (err) {
    sendError(res, 500, err.message);
  }
});

// ----- Generic CRUD Factory -----
function crudRoutes(app, path, Model, validation = []) {
  app.post(`/api/v1/${path}`, validation, async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return sendError(res, 400, errors.array()[0].msg);
      }
      console.log(req.body);
      const doc = new Model(req.body);
      await doc.save();
      res.status(201).json(doc);
    } catch (err) {
      sendError(res, 500, err.message);
    }
  });

  app.get(`/api/v1/${path}`, async (req, res) => {
    try {
      const docs = await Model.find();
      res.status(200).json(docs);
    } catch (err) {
      sendError(res, 500, err.message);
    }
  });

  app.get(`/api/v1/${path}/:uuid`, async (req, res) => {
    try {
      const doc = await Model.findOne({ uuid: req.params.uuid });
      if (!doc) return sendError(res, 404, "Not found");
      res.status(200).json(doc);
    } catch (err) {
      sendError(res, 500, err.message);
    }
  });

  app.put(`/api/v1/${path}/:uuid`, validation, async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return sendError(res, 400, errors.array()[0].msg);
      }
      const updated = await Model.findOneAndUpdate(
        { uuid: req.params.uuid },
        req.body,
        { new: true }
      );
      if (!updated) return sendError(res, 404, "Not found");
      res.status(200).json(updated);
    } catch (err) {
      sendError(res, 500, err.message);
    }
  });

  app.delete(`/api/v1/${path}/:uuid`, async (req, res) => {
    try {
      const deleted = await Model.findOneAndDelete({ uuid: req.params.uuid });
      if (!deleted) return sendError(res, 404, "Not found");
      res.status(200).json({ message: "Deleted successfully" });
    } catch (err) {
      sendError(res, 500, err.message);
    }
  });
}

// ----- Register Routes -----
crudRoutes(app, "streams", Stream);
crudRoutes(app, "degrees", Degree);
crudRoutes(app, "academic-years", AcademicYear);
crudRoutes(app, "courses", Course, validateCourse);
crudRoutes(app, "specializations", Specialization);
crudRoutes(app, "subjects", Subject);

// Server start
const PORT = process.env.NODE_PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));