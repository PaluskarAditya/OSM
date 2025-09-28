const express = require("express");
const app = express();
const cors = require("cors");
const conn = require("./lib/db");
const authMiddleware = require("./middlewares/authMiddleware");
const Combined = require("./models/combinedModel");

//TEMP IMPORTS
const path = require("path");
const fs = require("fs");
const AnswerSheet = require("./models/answerSheetModel");

require("dotenv").config();

app.use(express.json());
app.use(cors());

// Connect to Mongo DB
conn();

// Test Route
app.get("/foo", (req, res) => res.send("Welcome"));

// Ins Route
app.post("/ins", (req, res) => res.send(req.body));

// Auth Routes
app.use("/api/v1/auth", require("./routes/authRoutes"));

// User Routes
app.use("/api/v1/users", authMiddleware, require("./routes/userRoutes"));

// Stream Routes
app.use("/api/v1/stream", authMiddleware, require("./routes/streamRoutes"));

// Degree Routes
app.use("/api/v1/degree", authMiddleware, require("./routes/degreeRoutes"));

// Academic Year Routes
app.use(
  "/api/v1/academic-years",
  authMiddleware,
  require("./routes/academicyearRoutes")
);

// Course Routes
app.use("/api/v1/course", authMiddleware, require("./routes/courseRoutes"));

// Subject Routes
app.use("/api/v1/subject", authMiddleware, require("./routes/subjectRoutes"));

// Question Paper Routes
app.use("/api/v1/qp", authMiddleware, require("./routes/qpRoutes"));

// Inward Routes
app.use("/api/v1/inward", authMiddleware, require("./routes/inwardRoutes"));

// Candidate Routes
app.use(
  "/api/v1/candidate",
  authMiddleware,
  require("./routes/candidateRoutes")
);

// Custom route to view sheets in iframe
app.get("/api/v1/answer-sheet/iframe/:filename", async (req, res) => {
  try {
    const { filename } = req.params;

    const filepath = path.join(__dirname, "uploads/", filename);

    res.sendFile(filepath, (err) => {
      if (err) {
        console.error(err);
        res.status(404).json({ err: "File not found" });
      }
    });
  } catch (error) {
    res.status(500).json({ err: "Internal Server Error" });
  }
});

// Answer Sheet Routes
app.use(
  "/api/v1/answer-sheet",
  authMiddleware,
  require("./routes/answerSheetRoutes")
);

// Evaluation Routes
app.use("/api/v1/eval", authMiddleware, require("./routes/evalRoutes"));

// Custom combined route
app.get("/api/v1/combined", async (req, res) => {
  const combineds = await Combined.find();

  if (!combineds) {
    return res.status(500).json({ err: "Combineds not found" });
  }

  res.status(200).json(combineds);
});

// Institute Routes
app.use("/api/v1/institute", require("./routes/instituteRoutes"));

app.listen(process.env.NODE_PORT, () =>
  console.log(`Server running on ${process.env.NODE_PORT}`)
);
