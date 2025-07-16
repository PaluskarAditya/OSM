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

// Helper function for UUID generation
const generateUUID = () =>
  [...Array(6)].map(() => Math.random().toString(36)[2].toUpperCase()).join("");

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

// POST /api/v1/academic-years/bulk
app.post("/api/v1/academic-years/bulk", async (req, res) => {
  try {
    console.log("Received payload:", JSON.stringify(req.body, null, 2));

    if (!Array.isArray(req.body)) {
      return sendError(res, 400, "Expected an array of academic years");
    }

    const createdAcademicYears = [];
    const errors = [];

    for (const [index, academicYearData] of req.body.entries()) {
      try {
        console.log(
          `Processing academic year ${index}:`,
          JSON.stringify(academicYearData, null, 2)
        );

        const {
          year,
          stream,
          degree,
          isActive = true,
          uuid,
        } = academicYearData;

        // Validate required fields
        if (!year || !stream || !degree) {
          errors.push({
            index,
            error: "Missing required fields (year, stream, degree)",
            academicYearData,
          });
          continue;
        }

        // Validate year format (YYYY-YY)
        if (!/^\d{4}-\d{2}$/.test(year)) {
          errors.push({
            index,
            error: "Invalid year format (use YYYY-YY)",
            academicYearData,
          });
          continue;
        }

        // Process Stream
        let streamDoc = await Stream.findOne({ name: stream });
        if (!streamDoc) {
          streamDoc = new Stream({
            name: stream,
            uuid: generateUUID(),
            isActive: true,
          });
          await streamDoc.save();
          console.log("Created new stream:", streamDoc.name);
        }

        // Process Degree
        let degreeDoc = await Degree.findOne({
          name: degree,
          stream: streamDoc.uuid,
        });
        if (!degreeDoc) {
          degreeDoc = new Degree({
            name: degree,
            stream: streamDoc.uuid,
            uuid: generateUUID(),
            isActive: true,
          });
          await degreeDoc.save();
          console.log("Created new degree:", degreeDoc.name);
        }

        // Check for existing academic year
        const existingAcademicYear = await AcademicYear.findOne({
          year,
          stream: streamDoc.uuid,
          degree: degreeDoc.uuid,
        });

        if (existingAcademicYear) {
          console.log(
            `Skipping duplicate academic year ${year} for stream ${stream} and degree ${degree}`
          );
          continue;
        }

        // Create Academic Year
        const newAcademicYear = new AcademicYear({
          year,
          stream: streamDoc.uuid,
          degree: degreeDoc.uuid,
          uuid: uuid || generateUUID(),
          isActive,
        });

        await newAcademicYear.save();
        createdAcademicYears.push(newAcademicYear);
        console.log("Created new academic year:", newAcademicYear.year);
      } catch (error) {
        console.error(`Error processing academic year ${index}:`, error);
        errors.push({ index, error: error.message, academicYearData });
      }
    }

    res.status(200).json({
      success: true,
      created: createdAcademicYears.length,
      data: createdAcademicYears,
      errors,
      totalProcessed: req.body.length,
    });
  } catch (error) {
    console.error("Bulk import error:", error);
    if (error.code === 11000) {
      return sendError(res, 400, "One or more academic years already exist");
    }
    sendError(res, 500, error.message);
  }
});

// @POST - Custom Route for creating Course Data in bulk
app.post("/api/v1/courses/bulk", async (req, res) => {
  try {
    console.log("Received payload:", JSON.stringify(req.body, null, 2));

    if (!Array.isArray(req.body)) {
      return sendError(res, 400, "Expected an array of courses");
    }

    const createdCourses = [];
    const errors = [];
    let skipped = 0;

    for (const [index, courseData] of req.body.entries()) {
      try {
        console.log(
          `Processing course ${index}:`,
          JSON.stringify(courseData, null, 2)
        );

        const {
          name,
          code,
          stream,
          degree,
          academicYear,
          semester,
          numSemesters,
          uuid,
        } = courseData;

        // Validate required fields
        if (
          !name ||
          !code ||
          !stream ||
          !degree ||
          !academicYear ||
          !semester ||
          !numSemesters
        ) {
          errors.push({ index, error: "Missing required fields", courseData });
          continue;
        }

        // Validate numSemesters
        if (isNaN(numSemesters) || numSemesters <= 0 || numSemesters > 8) {
          errors.push({
            index,
            error: "Number of semesters must be between 1 and 8",
            courseData,
          });
          continue;
        }

        // Check for existing course (case insensitive)
        const existingCourse = await Course.findOne({
          $or: [
            { code: { $regex: new RegExp(`^${code}$`, "i") } },
            { name: { $regex: new RegExp(`^${name}$`, "i") } },
          ],
        });

        if (existingCourse) {
          console.log(`Skipping duplicate course ${code} - ${name}`);
          skipped++;
          continue;
        }

        // Process Stream
        let streamDoc = await Stream.findOne({
          name: { $regex: new RegExp(`^${stream}$`, "i") },
        });
        if (!streamDoc) {
          streamDoc = new Stream({
            name: stream,
            uuid: generateUUID(),
          });
          await streamDoc.save();
          console.log("Created new stream:", streamDoc.name);
        }

        // Process Degree
        let degreeDoc = await Degree.findOne({
          name: { $regex: new RegExp(`^${degree}$`, "i") },
          stream: streamDoc.uuid,
        });
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
        let yearDoc = await AcademicYear.findOne({
          year: academicYear,
          degree: degreeDoc.uuid,
          stream: streamDoc.uuid,
        });
        if (!yearDoc) {
          yearDoc = new AcademicYear({
            year: academicYear,
            degree: degreeDoc.uuid,
            stream: streamDoc.uuid,
            uuid: generateUUID(),
          });
          await yearDoc.save();
          console.log("Created new academic year:", yearDoc.year);
        }

        // Create Course
        const newCourse = new Course({
          name,
          code,
          stream: streamDoc.uuid,
          degree: degreeDoc.uuid,
          academicYear: yearDoc.uuid,
          semester,
          numSemesters,
          uuid: uuid || generateUUID(),
          isActive: true,
        });

        await newCourse.save();
        createdCourses.push(newCourse);
        console.log("Created new course:", newCourse.code);
      } catch (error) {
        console.error(`Error processing course ${index}:`, error);
        errors.push({ index, error: error.message, courseData });
      }
    }

    res.status(200).json({
      success: true,
      created: createdCourses.length,
      skipped,
      data: createdCourses,
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
        if (path === "streams" && req.body.name) {
          // Find all Combined documents referencing this stream
          const combinedDocs = await Combined.find({
            name: { $regex: new RegExp(`^${updated.name}\\|`, "i") },
          }).session(session);

          // Update each Combined document with the new stream name
          for (const combinedDoc of combinedDocs) {
            const [_, degree, year] = combinedDoc.name
              .split("|")
              .map((s) => s.trim());
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
crudRoutes(app, "courses", Course);
crudRoutes(app, "specializations", Specialization);
crudRoutes(app, "subjects", Subject);
crudRoutes(app, "combineds", Combined);

// Server start
const PORT = process.env.NODE_PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
