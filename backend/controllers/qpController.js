const QP = require("../models/qpModel");
const XLSX = require("xlsx");
const fs = require("fs");

function processQuestionPaper(jsonData) {
  const result = {};

  // First pass: Create main questions
  jsonData.forEach((row) => {
    if (row["Question Type"].trim() === "Main") {
      result[row["Question No"]] = {
        QuestionNo: row["Question No"],
        QuestionText: row["Question Text"],
        Marks: row["Marks"],
        QuestionType: row["Question Type"],
        QuestionFormat: row["Question Format"],
        Notes: row["Notes"],
        subQuestions: {},
        actualQuestions: {}, // Add direct actual questions container
      };
    }
  });

  // Second pass: Add sub questions
  jsonData.forEach((row) => {
    if (row["Question Type"].trim() === "Sub") {
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
    if (row["Question Type"].trim() === "Actual") {
      const parts = row["Question No"].split(".");
      if (parts.length === 2) {
        const mainQId = parts[0];
        const subPart = parts[1];

        const potentialSubQId = mainQId + "." + subPart.charAt(0);

        if (result[mainQId]?.subQuestions[potentialSubQId]) {
          // Case 1: Has sub-question (main→sub→actual)
          result[mainQId].subQuestions[potentialSubQId].actualQuestions[
            row["Question No"]
          ] = {
            QuestionNo: row["Question No"],
            QuestionText: row["Question Text"],
            Marks: row["Marks"],
            QuestionType: row["Question Type"],
            QuestionFormat: row["Question Format"],
            Notes: row["Notes"],
          };
        } else {
          // Case 2: No sub-question (main→actual)
          result[mainQId].actualQuestions[row["Question No"]] = {
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

const create = async (req, res) => {
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
    console.log("Data:", jsonData);

    // Calculate total marks (include both Main and Sub Questions)
    const totalMarks = jsonData.reduce((sum, question) => {
      if (question["Question Type"] === "Main") {
        return sum + (Number(question.Marks) || 0);
      }
      return sum;
    }, 0);

    // Count questions
    const mainQuestionsCount = jsonData.filter(
      (el) => el["Question Type"].trim() === "Main"
    ).length;

    const subQuestionsCount = jsonData.filter(
      (el) => el["Question Type"].trim() === "Sub"
    ).length;

    const actualQuestionsCount = jsonData.filter((el) => {
      console.log(
        "with trim:",
        el["Question Type"].trim(),
        "without trim:",
        el["Question Type"]
      );
      el["Question Type"].trim() === "Actual";
    }).length;

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
      iid: req.user.IID,
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
};

const getAll = async (req, res) => {
  try {
    const qps = await QP.find({ iid: req.user.IID });

    if (!qps) {
      return res.status(500).json({ err: "Question Papers not found" });
    }

    res.status(200).json(qps);
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
};

const getById = async (req, res) => {
  try {
    const { uuid } = req.params;
    const qp = await QP.findOne({ assignmentId: uuid });

    if (!qp) {
      return res.status(500).json({ err: "Question Paper not found" });
    }

    res.status(200).json(qp);
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
};

const verify = async (req, res) => {
  try {
    const { uuid } = req.params;
    const { validated } = req.body;

    const qp = await QP.findByIdAndUpdate(uuid, { validated }, { new: true });

    if (!qp) return res.status(500).json({ err: "Internal Server Error" });

    res.status(200).json(qp);
  } catch (error) {
    res.status(500).json({ err: "Internal Server Error" });
  }
};

module.exports = {
  create,
  getAll,
  getById,
  verify,
};
