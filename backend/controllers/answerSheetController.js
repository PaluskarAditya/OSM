const { v4: uuidv4 } = require("uuid");
const path = require("path");
const mongoose = require("mongoose");
const fs = require("fs");
const AnswerSheet = require("../models/answerSheetModel");
const Candidate = require("../models/candidateModel");
const QP = require("../models/qpModel");
const Subject = require("../models/subjectModel");
const generateCustomId = require("../lib/generate");
const syncEvaluation = require("../lib/sync");
const forwardToUploadServer = require("../lib/fileSaver");
require("dotenv").config();

let bucket;
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

mongoose.connection.once("open", () => {
  bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
    bucketName: "uploads",
  });
  console.log("GridFSBucket ready 🎯");
});

const upload = async (req, res) => {
  try {
    const files = req.files;
    const { combined, course, subject } = req.body;

    if (!files || files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    if (!combined || !course || !subject) {
      return res.status(400).json({
        error: "Missing required fields: combined, course, or subject",
      });
    }

    // 🧠 Get semester from subject
    const semesterDoc = await Subject.findOne({ uuid: subject }).select(
      "semester"
    );
    if (!semesterDoc) {
      return res.status(400).json({ error: "Invalid subject UUID" });
    }
    const semester = semesterDoc.semester;

    const savedFiles = [];

    // 🌀 Loop through uploaded files
    for (let file of files) {
      const roll = file.originalname.split(".")[0];
      const candidateFind = await Candidate.findOne({
        combined,
        course,
        subjects: { $in: subject },
        RollNo: roll,
      }).select("PRNNumber");

      if (!candidateFind) return res.status(500).send("Candidate not Found");

      const prn = candidateFind.PRNNumber;
      console.log("PRN Number: ", prn);
      const combinedKey = `${roll} [${prn}]`;

      // 🧩 Build virtual path + IDs
      const assignmentId = generateCustomId();
      const randomName = `${uuidv4()}.pdf`;
      const virtualPath = `${course}/${semester}/${subject}`;
      const filename = randomName;

      // 📂 Upload to GridFS
      const uploadStream = bucket.openUploadStream(filename, {
        contentType: file.mimetype,
        metadata: {
          course,
          semester,
          subject,
          originalName: file.originalname,
          path: virtualPath,
          uploadDate: new Date(),
        },
      });

      uploadStream.end(file.buffer);

      await new Promise((resolve, reject) => {
        uploadStream.on("finish", resolve);
        uploadStream.on("error", reject);
      });

      // 🧠 Candidate lookup with full composite key
      const existCandidate = await Candidate.findOne({
        RollNo: roll,
        PRNNumber: prn,
        course,
        sem: semester,
        combined,
      });

      console.log(existCandidate);

      let candidateLinked = false;
      let attendance = false;

      if (existCandidate) {
        candidateLinked = true;
        attendance = true;

        await Candidate.findOneAndUpdate(
          { _id: existCandidate._id },
          {
            $set: {
              sheetUploaded: true,
              attendance: "present",
              [`bookletNames.${subject}`]: assignmentId,
            },
            $addToSet: { subjects: subject },
            assignmentId,
          },
          { new: true }
        );
      } else {
        console.warn(`⚠️ No matching candidate found for ${roll} [${prn}]`);
      }

      // 📝 Save AnswerSheet
      const answerSheet = new AnswerSheet({
        name: existCandidate ? existCandidate.RollNo : "Unknown",
        uuid: generateCustomId(),
        assignmentId,
        path: filename,
        combined,
        course,
        subject,
        rollPRN: combinedKey,
        candidateId: combinedKey,
        sheetUploaded: true,
        attendance,
        iid: req.user.IID,
        originalName: file.originalname,
      });

      await answerSheet.save();

      // 🔄 Update QP with assignment IDs
      const ids = await AnswerSheet.find({ course, subject }).select(
        "assignmentId"
      );
      const assignmentIds = ids.map((el) => el.assignmentId);

      await QP.findOneAndUpdate(
        { course, subject },
        { $addToSet: { assignmentId: { $each: assignmentIds } } },
        { new: true }
      );

      savedFiles.push({
        assignmentId,
        originalName: file.originalname,
        size: file.size,
        candidateLinked,
      });
    }

    // ⚡ Sync evaluation after all uploads
    await syncEvaluation(course, subject, req.user?._id);

    res.status(200).json({
      success: true,
      message: `${files.length} file(s) uploaded successfully`,
      files: savedFiles,
    });
  } catch (error) {
    console.error("Upload error:", error);
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

    const filename = answerSheet.path; // this is the GridFS filename we stored

    // Stream file from GridFS
    const downloadStream = bucket.openDownloadStreamByName(filename);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${answerSheet.originalName}"`
    );

    downloadStream.pipe(res);

    downloadStream.on("error", (err) => {
      console.error("GridFS download error:", err);
      res.status(404).json({ error: "File not found in GridFS" });
    });
  } catch (error) {
    console.error("Fetch error:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getFullFile = async (req, res) => {
  try {
    const { assignmentId } = req.params;

    const answerSheet = await AnswerSheet.findOne({ assignmentId });
    if (!answerSheet) {
      return res.status(404).json({ error: "Answer sheet not found" });
    }

    res.status(200).json(answerSheet);
  } catch (error) {
    console.error("Fetch error:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getAll = async (req, res) => {
  try {
    const sheets = await AnswerSheet.find({ iid: req.user.IID });

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
    const { status } = req.body;
    console.log("Assignment ID:", assignmentId, "Status:", status);

    const sheet = await AnswerSheet.findOneAndUpdate(
      { assignmentId },
      { status },
      { new: true }
    );

    console.log("Sheet:", sheet);
    res.json(sheet);
  } catch (error) {
    console.error("Error updating sheet:", error);
    res.status(500).json({ error: error.message });
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
  getFullFile,
  getAll,
  status,
  eval,
};
