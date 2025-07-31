const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const XLSX = require("xlsx");
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
const QP = require("./models/qpModel");

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
            stream: streamDoc.uuid,
            degree: degreeDoc.uuid,
            year: yearDoc.uuid,
          });
          await combinedDoc.save();
        }

        // ---- NEW DUPLICATE CHECK LOGIC ----
        const existingSubject = await Subject.findOne({
          name: name,
          code: code,
          course: courseDoc.uuid,
          year: yearDoc.uuid,
          semester: semester,
        });

        if (existingSubject) {
          console.log(
            `Skipping duplicate subject ${code} - ${name} for course ${courseDoc.name}, year ${yearDoc.year}, semester ${semester}`
          );
          continue;
        }
        // ---- END NEW DUPLICATE CHECK ----

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
    const uniqueFilename = file.originalname;
    cb(null, uniqueFilename);
  },
});

const upload = multer({
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
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Create uploads directory if it doesn't exist
const fs = require("fs");
const path = require("path");
const PdfParse = require("pdf-parse");
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Helper function to process question hierarchy
function processQuestionPaper(jsonData) {
  const result = {};

  // First pass: Create main questions
  jsonData.forEach((row) => {
    if (row["Question Type"] === "Main") {
      result[row["Question No"]] = {
        QuestionNo: row["Question No"],
        QuestionText: row["Question Text"],
        Marks: row["Marks"],
        QuestionType: row["Question Type"],
        QuestionFormat: row["Question Format"],
        Notes: row["Notes"],
        subQuestions: {},
      };
    }
  });

  // Second pass: Add sub questions
  jsonData.forEach((row) => {
    if (row["Question Type"] === "Sub") {
      const parts = row["Question No"].split(".");
      if (parts.length === 2) {
        const mainQId = parts[0];
        if (result[mainQId]) {
          result[mainQId].subQuestions[row["Question No"]] = {
            QuestionNo: row["Question No"],
            QuestionText: row["Question Text"],
            Marks: row["Marks"],
            QuestionType: row["Question Type"],
            QuestionFormat: row["Question Format"],
            Notes: row["Notes"],
            Optional: row["Optional"],
            TotalQuestions: row["Total Questions"],
            actualQuestions: {},
          };
        }
      }
    }
  });

  // Third pass: Add actual questions
  jsonData.forEach((row) => {
    if (row["Question Type"] === "Actual") {
      const parts = row["Question No"].split(".");
      if (parts.length === 2) {
        // e.g., "Q1.a1" splits to ["Q1", "a1"]
        const mainQId = parts[0]; // "Q1"
        const subQId = mainQId + "." + parts[1].charAt(0); // "Q1.a" from "a1"

        if (result[mainQId]?.subQuestions[subQId]) {
          result[mainQId].subQuestions[subQId].actualQuestions[
            row["Question No"]
          ] = {
            QuestionNo: row["Question No"],
            QuestionText: row["Question Text"],
            Marks: row["Marks"],
            QuestionType: row["Question Type"],
            QuestionFormat: row["Question Format"],
            Notes: row["Notes"],
          };
        }
      }
    }
  });

  return result;
}

// @POST - Import Question Paper from Excel
app.post("/api/v1/import/qp", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    const {
      subject,
      course,
      stream,
      degree,
      year,
      semester,
      examName,
      combined,
      specialization,
    } = req.body;

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Question Paper Processing
    const workbook = XLSX.readFile(file.path);
    const sheetName = workbook.SheetNames[0];
    const workSheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(workSheet);

    // Calculate total marks (include both Main and Sub Questions)
    const totalMarks = jsonData.reduce((sum, question) => {
      if (question["Question Type"] === "Main") {
        return sum + (Number(question.Marks) || 0);
      }
      return sum;
    }, 0);

    // Count questions
    const mainQuestionsCount = jsonData.filter(
      (el) => el["Question Type"] === "Main"
    ).length;

    const subQuestionsCount = jsonData.filter(
      (el) => el["Question Type"] === "Sub"
    ).length;

    const actualQuestionsCount = jsonData.filter(
      (el) => el["Question Type"] === "Actual"
    ).length;

    // Process question hierarchy
    const questionData = processQuestionPaper(jsonData);

    const newQP = await QP.create({
      name: examName,
      stream,
      degree,
      year,
      subject,
      course,
      specialization,
      data: questionData,
      totalMarks,
      semester,
      questionsCount: mainQuestionsCount,
      subQuestionsCount,
      actualQuestionsCount,
      combined,
    });

    // Cleanup uploaded file
    fs.unlinkSync(file.path);

    res.status(201).json({
      success: true,
      data: newQP,
      message: "Question paper imported successfully",
      stats: {
        totalMarks,
        mainQuestionsCount,
        subQuestionsCount,
        actualQuestionsCount,
      },
    });
  } catch (error) {
    console.error("Error processing question paper:", error);

    // Cleanup file if error occurred
    if (req.file?.path) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      error: "Failed to process question paper",
      details: error.message,
    });
  }
});

// @POST - Process PDF Question Paper to Excel
app.post(
  "/api/v1/process/question-paper",
  upload.single("file"),
  async (req, res) => {
    try {
      if (!req.file) {
        return sendError(res, 400, "No file uploaded");
      }

      // Log the received file details
      console.log("Received file:", {
        originalName: req.file.originalname,
        filename: req.file.filename,
        mimetype: req.file.mimetype,
        size: req.file.size,
      });

      // Process the PDF file here
      const pdfBuffer = fs.readFileSync(
        path.join(uploadsDir, req.file.filename)
      );
      const data = await PdfParse(pdfBuffer);
      const text = data.text;

      // Initialize arrays for storing structured data
      const questions = [];
      const lines = text
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);

      // Define all regex patterns
      const sectionPattern =
        /^(Section|SECTION)\s+([A-Z])|^([A-Z])\.\s+(Reading|Writing|Grammar|Literature|Text Books)/i;
      const questionPattern = /^(?:Q\.?\s*)?(\d+(?:\.\d+)?[.]?|\([a-z]\))\s+/i;
      const marksPattern =
        /(?:\[|(?:\()?)\s*(\d+)(?:\s*marks?\s*\)?|\s*m\s*\)?|\])/i;
      const instructionPattern =
        /(Answer|Attempt|Read|Write|Note|Do|Complete|Choose|Fill)/i;
      const subQuestionPattern = /^\([a-z]\)\s+/i;

      // Initialize tracking variables
      const alphabet = ["A", "B", "C", "D"];
      let optionIndex = -1;
      let currentSection = "";
      let currentTopic = "";
      let currentInstructions = "";
      let totalMarks = 0;
      let sectionMarks = {};

      // First pass - analyze structure and detect section marks
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        const marksMatch = line.match(marksPattern);
        const sectionMatch = line.match(sectionPattern);

        if (sectionMatch) {
          const sectionName = sectionMatch[2] || sectionMatch[3];
          if (marksMatch) {
            sectionMarks[sectionName] = parseInt(marksMatch[1]);
          }
        }
      }

      let questionBuffer = {
        text: "",
        options: [],
        section: "",
        type: "Long Answer",
        difficulty: "Medium",
        subQuestions: [],
      };

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // SECTION DETECTION
        const sectionMatch = line.match(sectionPattern);
        if (sectionMatch) {
          currentSection = sectionMatch[2];
          continue;
        }

        // INSTRUCTION DETECTION
        if (instructionPattern.test(line)) {
          currentInstructions = line;
          continue;
        }

        // QUESTION START
        const questionMatch = line.match(questionPattern);
        if (questionMatch) {
          if (questionBuffer.text) processAndAddQuestion(); // Add previous

          const marksMatch = line.match(marksPattern);
          let marks = 0;

          // Look ahead for marks if not found in the current line
          if (!marksMatch) {
            for (let j = i + 1; j < Math.min(i + 3, lines.length); j++) {
              const nextMarksMatch = lines[j].match(marksPattern);
              if (nextMarksMatch) {
                marks = parseInt(nextMarksMatch[1]);
                break;
              }
            }
          } else {
            marks = parseInt(marksMatch[1]);
          }

          // If still no marks found, use section marks or default
          if (marks === 0 && currentSection && sectionMarks[currentSection]) {
            marks = sectionMarks[currentSection];
          }

          const qText = line
            .replace(questionPattern, "")
            .replace(marksPattern, "")
            .trim();
          const qId = questionMatch[1].replace(/\.$/, "");

          questionBuffer = {
            id: qId,
            questionNo: isNaN(parseInt(qId)) ? qId : parseInt(qId),
            text: qText,
            options: [],
            marks: marks || 1,
            section: currentSection,
            instructions: currentInstructions,
            type: determineQuestionType(qText, line),
            difficulty: assessDifficulty(marks, qText),
            topic: currentTopic,
            subQuestions: [],
          };

          optionIndex = -1;
          continue;
        }

        // OPTION DETECTION
        const cleanLine = line.trim();
        const optMatch = cleanLine.match(/^([A-D])[\).]\s*(.*)/);

        if (optMatch) {
          optionIndex = alphabet.indexOf(optMatch[1]);
          questionBuffer.options[optionIndex] = optMatch[2];
          questionBuffer.type = "MCQ";
          continue;
        }

        // IF MULTILINE OPTION TEXT
        if (optionIndex >= 0 && questionBuffer.options[optionIndex]) {
          questionBuffer.options[optionIndex] += " " + cleanLine;
          continue;
        }

        // CONTINUATION OF QUESTION TEXT
        if (questionBuffer.text) {
          questionBuffer.text += " " + cleanLine;
        }
      }

      // Add the last question if exists
      if (questionBuffer.text) {
        processAndAddQuestion();
      }

      // Helper function to process and add a question
      function processAndAddQuestion() {
        // If this is a main question with subquestions, distribute marks
        if (questionBuffer.subQuestions.length > 0 && questionBuffer.marks) {
          const marksPerSub = Math.floor(
            questionBuffer.marks / questionBuffer.subQuestions.length
          );
          questionBuffer.subQuestions.forEach((sub) => {
            questions.push({
              "Question ID": `${questionBuffer.id}${sub.id}`,
              Section: questionBuffer.section,
              "Question No.": questionBuffer.questionNo,
              "Sub Question": sub.id,
              Question: sub.text,
              Type: sub.type || questionBuffer.type,
              Marks: marksPerSub,
              Options: sub.options ? sub.options.join("; ") : "",
              Answer: "", // Left empty as per requirements
              Instructions: questionBuffer.instructions,
              Difficulty: assessDifficulty(marksPerSub, sub.text),
              "Topic/Unit": questionBuffer.topic,
              "Parent Question": questionBuffer.text,
            });
          });
        } else {
          questions.push({
            "Question ID": questionBuffer.id,
            Section: questionBuffer.section,
            "Question No.": questionBuffer.questionNo,
            "Sub Question": "",
            Question: questionBuffer.text,
            Type: questionBuffer.type,
            Marks: questionBuffer.marks,
            Options: questionBuffer.options.join("; "),
            Answer: "", // Left empty as per requirements
            Instructions: questionBuffer.instructions,
            Difficulty: questionBuffer.difficulty,
            "Topic/Unit": questionBuffer.topic,
            "Parent Question": "",
          });
        }
      }

      // Helper function to assess difficulty
      function assessDifficulty(marks, questionText) {
        if (marks >= 6) return "Hard";
        if (marks >= 3) return "Medium";
        return "Easy";
      }

      // Helper function to determine question type
      function determineQuestionType(text, fullLine) {
        const lowerText = text.toLowerCase();
        if (/(fill in|fill up|complete with|fill the)/i.test(lowerText))
          return "Fill in the blanks";
        if (
          /(choose|pick|select) the (correct|right|appropriate)/i.test(
            lowerText
          )
        )
          return "MCQ";
        if (/true or false/i.test(lowerText)) return "True/False";
        if (/(match|matching)/i.test(lowerText)) return "Match the Following";
        if (
          /\b(explain|describe|elaborate|discuss|analyze|analyse|comment|examine)\b/i.test(
            lowerText
          )
        )
          return "Long Answer";
        if (/\b(what|who|when|where|why|how)\b.*\?/i.test(lowerText))
          return "Short Answer";
        if (/(write|answer|state) (briefly|in brief|in short)/i.test(lowerText))
          return "Short Answer";
        return "Long Answer";
      }

      // Create Excel workbook
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(questions);
      XLSX.utils.book_append_sheet(wb, ws, "Questions");

      // Save Excel file
      const excelFileName = req.file.filename.replace(".pdf", ".XLSX");
      const excelFilePath = path.join(uploadsDir, excelFileName);
      XLSX.writeFile(wb, excelFilePath);

      // Send response
      res.status(200).json({
        success: true,
        message: "File processed successfully",
        file: {
          originalName: req.file.originalname,
          processedFile: excelFileName,
          questionCount: questions.length,
          format: "XLSX",
        },
        summary: {
          totalQuestions: questions.length,
          sections: [...new Set(questions.map((q) => q.Section))],
          questionTypes: [...new Set(questions.map((q) => q.Type))],
        },
      });
    } catch (error) {
      console.error("Error processing question paper:", error);
      sendError(res, error.status || 500, error.message);
    }
  }
);

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
        console.log(stream.uuid, degree.uuid, year.uuid);
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
crudRoutes(app, "qp", QP);

// Server start
const PORT = process.env.NODE_PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
