const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { body, validationResult } = require("express-validator");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: "*",
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
const Combined = require("./models/combinedModel");

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

// @GET - Test Route
app.get("/foo", (req, res) => res.send("bar"));

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

// @GET - Coustom Route to get courses by combined
app.get("/api/v1/courses/:uuid/combineds", async (req, res) => {
  try {
    const course = await Course.findOne({ uuid: req.params.uuid });
    console.log("Courses:", course);
    if (!course) return sendError(res, 404, "Course not found");

    res.status(200).json([course]);
  } catch (error) {
    sendError(res, 500, err.message);
  }
});

// Helper function for UUID generation
const generateUUID = () =>
  [...Array(6)].map(() => Math.random().toString(36)[2].toUpperCase()).join("");

// @POST - Custom Route for creating Subject Data in bulk
app.post("/api/v1/subjects/bulk", async (req, res) => {
  try {
    console.log("Received payload:", JSON.stringify(req.body, null, 2));

    if (!Array.isArray(req.body)) {
      return sendError(res, 400, "Expected an array of subjects");
    }

    const createdSubjects = [];
    const errors = [];

    for (const [index, subjectData] of req.body.entries()) {
      try {
        console.log(
          `Processing subject ${index}:`,
          JSON.stringify(subjectData, null, 2)
        );

        const {
          name,
          code,
          type = "Compulsory",
          semester,
          exam,
          course,
          stream,
          degree,
          year,
          uuid,
        } = subjectData;

        // Validate required fields
        if (!name || !code || !course || !stream || !degree || !year) {
          errors.push({ index, error: "Missing required fields", subjectData });
          continue;
        }

        // Check for existing subject (case insensitive)
        const existingSubject = await Subject.findOne({
          $or: [
            { code: { $regex: new RegExp(`^${code}$`, "i") } },
            { name: { $regex: new RegExp(`^${name}$`, "i") } },
          ],
        });

        if (existingSubject) {
          console.log(`Skipping duplicate subject ${code} - ${name}`);
          continue;
        }

        // Process Stream
        let streamDoc = await Stream.findOne({ name: stream });
        if (!streamDoc) {
          streamDoc = new Stream({
            name: stream,
            uuid: generateUUID(),
          });
          await streamDoc.save();
          console.log("Created new stream:", streamDoc.name);
        }

        // Process Degree
        let degreeDoc = await Degree.findOne({ name: degree });
        if (!degreeDoc) {
          degreeDoc = new Degree({
            name: degree,
            stream: streamDoc.uuid,
            uuid: generateUUID(),
          });
          await degreeDoc.save();
          console.log("Created new degree:", degreeDoc.name);
        }

        // Process Academic Year
        let yearDoc = await AcademicYear.findOne({ year });
        if (!yearDoc) {
          yearDoc = new AcademicYear({
            year,
            degree: degreeDoc.uuid,
            stream: streamDoc.uuid,
            uuid: generateUUID(),
          });
          await yearDoc.save();
          console.log("Created new academic year:", yearDoc.year);
        }

        // Process Course
        let courseDoc = await Course.findOne({
          $or: [{ name: course }, { code: subjectData.courseCode }],
        });

        if (!courseDoc) {
          courseDoc = new Course({
            name: course,
            code: subjectData.courseCode || generateUUID().slice(0, 8),
            stream: streamDoc.uuid,
            degree: degreeDoc.uuid,
            academicYear: yearDoc.uuid,
            semester: semester,
            uuid: generateUUID(),
          });
          await courseDoc.save();
          console.log("Created new course:", courseDoc.name);
        }

        // Create Combined Data
        let combinedDoc = await Combined.findOne({
          name: `${stream} | ${degree} | ${year}`,
        });

        if (!combinedDoc) {
          combinedDoc = new Combined({
            name: `${stream} | ${degree} | ${year}`,
            course,
            uuid: generateUUID(),
          });
          await combinedDoc.save();
        }

        // Create Subject
        const newSubject = new Subject({
          name,
          code,
          type,
          semester,
          exam,
          course: courseDoc.uuid,
          combined: combinedDoc.uuid,
          year: yearDoc.uuid,
          uuid: uuid || generateUUID(),
        });

        await newSubject.save();
        createdSubjects.push(newSubject);
        console.log("Created new subject:", newSubject.code);
      } catch (error) {
        console.error(`Error processing subject ${index}:`, error);
        errors.push({ index, error: error.message, subjectData });
      }
    }

    res.status(200).json({
      success: true,
      created: createdSubjects.length,
      data: createdSubjects,
      errors,
      totalProcessed: req.body.length,
    });
  } catch (error) {
    console.error("Bulk import error:", error);
    sendError(res, 500, error.message);
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

      if (path === "courses") {
        const doc = new Model(req.body);
        await doc.save();

        const [stream, degree, year] = await Promise.all([
          Stream.findOne({ uuid: doc.stream }),
          Degree.findOne({ uuid: doc.degree }),
          AcademicYear.findOne({ uuid: doc.academicYear }),
        ]);

        if (!stream || !degree || !year) {
          return sendError(
            res,
            400,
            "Invalid stream, degree or year reference"
          );
        }

        const combinedName = `${stream.name} | ${degree.name} | ${year.year}`;
        let combined = await Combined.findOne({ name: combinedName });

        if (!combined) {
          combined = new Combined({
            name: combinedName,
            course: doc.uuid,
            uuid: generateUUID(),
            stream: stream.uuid,
            degree: degree.uuid,
            year: year.uuid,
          });

          console.log(combined);
          await combined.save();
        }

        return res.status(201).json(doc);
      }

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

<<<<<<< HEAD
      // Handle updates for other paths
      const updated = await Model.findOneAndUpdate(
        { uuid: req.params.uuid },
        req.body,
        { new: true }
      );

      if (path === 'streams') {
        const combined = await Combined.findOne({ stream: req.params.uuid });
        console.log(combined?.name);

        if (!updated) {
          return sendError(res, 404, "Document not found");
        }
  
        return res.status(200).json(updated);
      }

=======
      // Start a MongoDB session for transaction
      const session = await mongoose.startSession();
      await session.withTransaction(async () => {
        // Update the main document (Stream or other model)
        const updated = await Model.findOneAndUpdate(
          { uuid: req.params.uuid },
          { $set: req.body },
          { new: true, session }
        );

        if (!updated) {
          throw new Error("Not found");
        }

        // Handle stream-specific updates for Combined collection
        if (path === 'streams' && req.body.name) {
          // Find all Combined documents referencing this stream
          const combinedDocs = await Combined.find({
            name: { $regex: new RegExp(`^${updated.name}\\|`, 'i') }
          }).session(session);

          // Update each Combined document with the new stream name
          for (const combinedDoc of combinedDocs) {
            const [_, degree, year] = combinedDoc.name.split('|').map(s => s.trim());
            const newCombinedName = `${req.body.name} | ${degree} | ${year}`;

            await Combined.findByIdAndUpdate(
              combinedDoc._id,
              { $set: { name: newCombinedName } },
              { session }
            );
          }
        }

        res.status(200).json(updated);
      });

      session.endSession();
>>>>>>> 1a0c944 (Degree Module working properly)
    } catch (err) {
      sendError(res, err.message === "Not found" ? 404 : 500, err.message);
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
crudRoutes(app, "combineds", Combined);

// Server start
const PORT = process.env.NODE_PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
