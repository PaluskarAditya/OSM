const Candidate = require("../models/candidateModel");
const AnswerSheet = require("../models/answerSheetModel");
const generateCustomId = require("../lib/generate");
const syncEvaluation = require("../lib/sync");

const upload = async (req, res) => {
  try {
    const candidatesData = req.body.data;

    if (!Array.isArray(candidatesData)) {
      return res
        .status(400)
        .json({ message: "Input must be an array of candidates" });
    }

    const formatted = [];
    const processedCombinedKeys = new Set();

    for (const candidate of candidatesData) {
      // Skip invalid rows
      if (!candidate?.RollNo || !candidate?.PRNNumber) {
        console.warn("Skipping invalid candidate:", candidate);
        continue;
      }

      const combinedKey = `${candidate.RollNo} [${candidate.PRNNumber}]`;

      if (processedCombinedKeys.has(combinedKey)) continue;
      processedCombinedKeys.add(combinedKey);

      // Skip if candidate already exists
      const existingCandidate = await Candidate.findOne({
        $or: [{ RollNo: candidate.RollNo }, { PRNNumber: candidate.PRNNumber }],
      });
      if (existingCandidate) continue;

      // ✅ Find matching answer sheets
      const answerSheets = await AnswerSheet.find({
        candidateId: combinedKey,
      });

      let sheetUploaded = false;
      if (answerSheets.length > 0) {
        sheetUploaded = true;
        await AnswerSheet.updateMany(
          { candidateId: combinedKey },
          { $set: { attendance: true } }
        );
      }

      // ✅ Add subjects UUIDs in array
      formatted.push({
        ...candidate,
        course: req.body.course,
        combined: req.body.combined,
        sem: req.body.sem,
        subjects: candidate.subjects,
        sheetUploaded,
        uuid: generateCustomId(),
        bookletNames: candidate.subjects.reduce((acc, subj) => {
          acc[subj] = ""; // empty booklet name initially
          return acc;
        }, {}),
        assignmentId: generateCustomId(),
      });
    }

    if (formatted.length > 0) {
      await Candidate.insertMany(formatted);

      for (const subj of formatted[0].subjects) {
        await syncEvaluation(req.body.course, subj, req.user?._id);
      }
    }

    const allCandidates = await Candidate.find();
    res.status(201).json(allCandidates);
  } catch (error) {
    console.error("Error saving candidates:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

const update = async (req, res) => {
  try {
    const { ids, isActive } = req.body;
    await Candidate.updateMany({ _id: { $in: ids } }, { $set: { isActive } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
};

const attendance = async (req, res) => {
  try {
    const { ids, mark } = req.body;
    await Candidate.updateMany(
      { _id: { $in: ids } },
      { $set: { attendance: mark } }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
};

const subjects = async (req, res) => {
  try {
    const { ids, subjects } = req.body;
    await Candidate.updateMany({ _id: { $in: ids } }, { $set: { subjects } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
};

const getAll = async (req, res) => {
  try {
    const candidates = await Candidate.find();

    if (!candidates) {
      return res.status(500).json({ err: "Candidates not found" });
    }

    res.status(200).json(candidates);
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
};

module.exports = {
  getAll,
  upload,
  update,
  attendance,
  subjects,
};
