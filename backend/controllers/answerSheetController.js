const { v4: uuidv4 } = require("uuid");
const path = require("path");
const fs = require("fs");
const AnswerSheet = require("../models/answerSheetModel");
const Candidate = require("../models/candidateModel");
const QP = require("../models/qpModel");
const generateCustomId = require("../lib/generate");
const syncEvaluation = require("../lib/sync");

const upload = async (req, res) => {
  try {
    console.log("Files:", req.files, "Body:", req.body);

    const files = req.files;
    const { combined, course, subject } = req.body;

    if (!files || files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    if (!combined || !course || !subject) {
      return res.status(400).json({
        error: "Missing required fields: combined, course or subject",
      });
    }

    const savedFiles = await Promise.all(
      files.map(async (file) => {
        // ✅ Generate assignmentId
        const assignmentId = generateCustomId();

        // ✅ Extract Roll & PRN from original filename
        const match = file.originalname.match(
          /^([\w-]+)\s*\[([^\]]+)\]\.pdf$/i
        );
        if (!match) {
          throw new Error(`Invalid filename format: ${file.originalname}`);
        }
        const roll = match[1];
        const prn = match[2];
        const combinedKey = `${roll} [${prn}]`;

        // ✅ Rename file to hide Roll/PRN
        const randomName = `${uuidv4()}.pdf`;
        const newPath = path.join("uploads", randomName);

        // Move file
        fs.renameSync(file.path, newPath);

        // ✅ Link to candidate if exists
        const existCandidate = await Candidate.findOne({ RollNo: roll });
        let candidateLinked = false;
        let attendance = false;

        if (existCandidate) {
          if (existCandidate.course !== course) {
            throw new Error(
              `Candidate ${roll} is not enrolled in course ${course} for file ${file.originalname}`
            );
          }
          candidateLinked = true;
          attendance = true;

          await Candidate.findOneAndUpdate(
            { RollNo: roll },
            {
              $set: { sheetUploaded: true },
              $addToSet: { subjects: subject },
              $set: { [`bookletNames.${subject}`]: assignmentId },
              assignmentId,
            },
            { new: true }
          );
        }

        // ✅ Save AnswerSheet with assignmentId + random file
        const answerSheet = new AnswerSheet({
          name: existCandidate ? existCandidate.RollNo : "Unknown",
          uuid: generateCustomId(),
          assignmentId,
          path: newPath,
          combined,
          course,
          subject,
          rollPRN: combinedKey, // keep only internally
          candidateId: combinedKey,
          sheetUploaded: true,
          attendance,
          originalName: file.originalname, // safe reference
        });

        await answerSheet.save();

        const ids = await AnswerSheet.find({ course, subject }).select(
          "assignmentId"
        );

        const assignmentIds = ids.map((el) => el.assignmentId);

        // Update QP and add all assignmentIds (deduplicated automatically)
        await QP.findOneAndUpdate(
          { course, subject },
          { $addToSet: { assignmentId: { $each: assignmentIds } } },
          { new: true }
        );

        return {
          assignmentId,
          originalName: file.originalname,
          size: file.size,
          candidateLinked,
        };
      })
    );

    await syncEvaluation(course, subject, req.user?._id);

    res.status(200).json({
      success: true,
      message: `${files.length} file(s) uploaded successfully`,
      files: savedFiles,
    });
  } catch (error) {
    console.error("Upload error:", error.message);
    res.status(500).json({ error: `Upload failed: ${error.message}` });
  }
};

const getFile = async (req, res) => {
  try {
    const { assignmentId } = req.params;

    const answerSheet = await AnswerSheet.findOne({ assignmentId });
    if (!answerSheet) {
      return res.status(404).json({ error: "Answer sheet not found" });
    }

    // build file path
    const filePath = path.resolve(answerSheet.path); // normalize, prevent traversal attacks

    // send file securely
    res.setHeader("Content-Type", "application/pdf");
    res.sendFile(filePath, (err) => {
      if (err) {
        console.error("File sending error:", err);
        res.status(404).json({ error: "File not found" });
      }
    });
  } catch (error) {
    console.error("Fetch error:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getAll = async (req, res) => {
  try {
    const sheets = await AnswerSheet.find();

    if (!sheets) {
      return res.status(500).json({ err: "No Answer Sheet found" });
    }

    res.status(200).json(sheets);
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
};

const status = async (req, res) => {
  try {
    const { assignmentId } = req.params;

    const sheet = await AnswerSheet.findOneAndUpdate(
      { assignmentId },
      { status: req.body.status },
      { new: true }
    );

    res.status(200).json(sheet);
  } catch (error) {
    res.status(500).json({ err: "Internal Server Error" });
  }
};

const eval = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const sheet = await AnswerSheet.findOneAndUpdate(
      { assignmentId },
      {
        ...req.body,
      }
    );

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ err: "Internal server error" });
  }
};

module.exports = {
  upload,
  getFile,
  getAll,
  status,
  eval,
};
