const QP = require("../models/qpModel");
const XLSX = require("xlsx");
const fs = require("fs");
const Candidate = require("../models/candidateModel");
const AnswerSheet = require("../models/answerSheetModel");

function processQuestionPaper(jsonData) {
  const result = {};

  jsonData.forEach((row) => {
    const qType = row["Question Type"]?.trim();
    const qNo = row["Question No"]?.trim();

    if (!qType || !qNo) return;

    // Split like Q1.1.a -> ["Q1", "1", "a"]
    const parts = qNo.split(".");

    // Case 1: MAIN QUESTION
    if (qType === "Main" && parts.length === 1) {
      result[qNo] = {
        QuestionNo: qNo,
        QuestionText: row["Question Text"],
        Marks: row["Marks"],
        QuestionType: qType,
        QuestionFormat: row["Question Format"],
        Notes: row["Notes"],
        subQuestions: {},
        actualQuestions: {},
      };
      return;
    }

    // Case 2: SUB QUESTION
    if (qType === "Sub" && parts.length >= 2) {
      const mainQId = parts[0];
      if (!result[mainQId]) return;

      result[mainQId].subQuestions[qNo] = {
        QuestionNo: qNo,
        QuestionText: row["Question Text"],
        Marks: row["Marks"],
        QuestionType: qType,
        QuestionFormat: row["Question Format"],
        Notes: row["Notes"],
        Optional: row["Optional"],
        TotalQuestions: row["Total Questions"],
        actualQuestions: {},
      };
      return;
    }

    // Case 3: ACTUAL QUESTION
    if (qType === "Actual") {
      const mainQId = parts[0];
      if (!result[mainQId]) return;

      // Find nearest sub-question parent (if exists)
      let parentSub = null;
      for (const subQId in result[mainQId].subQuestions) {
        if (qNo.startsWith(subQId)) {
          parentSub = subQId;
          break;
        }
      }

      const questionObj = {
        QuestionNo: qNo,
        QuestionText: row["Question Text"],
        Marks: row["Marks"],
        QuestionType: qType,
        QuestionFormat: row["Question Format"],
        Notes: row["Notes"],
      };

      if (parentSub) {
        // Nested under sub-question
        result[mainQId].subQuestions[parentSub].actualQuestions[qNo] =
          questionObj;
      } else {
        // Belongs directly under main question
        result[mainQId].actualQuestions[qNo] = questionObj;
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

    const qpExists = await QP.findOne({
      name: examName,
      subject,
    });

    console.log("QP Exists:", qpExists);

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

    console.log("Question Data:", questionData);

    const sheets = await AnswerSheet.find({
      combined,
      subject,
      course,
    });

    const sheetIds = sheets.map((c) => c.assignmentId);

    if (qpExists) {
      qpExists.data = questionData;
      await qpExists.save();
      return res.status(200).json({
        success: true,
        data: qpExists,
        message: "Question paper updated successfully",
      });
    }

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
      assignmentId: sheetIds,
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
