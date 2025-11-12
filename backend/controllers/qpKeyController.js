const QpKey = require("../models/qpKeyModel");
const generateCustomId = require("../lib/generate");
const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const QP = require("../models/qpModel");
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

const create = async (req, res) => {
  try {
    const { qp, key } = req.files;
    const { combined, course, semester, subject } = req.body;

    if (!qp || !key)
      return res.status(400).send("Question Paper PDF or Key missing!");
    if (!combined || !course || !semester || !subject)
      return res.status(400).send("Multiple data fields missing!");

    const assignmentId = generateCustomId();

    const uploadFile = (file, virtualPath) =>
      new Promise((resolve, reject) => {
        const randomName = `${uuidv4()}.pdf`;
        const uploadStream = bucket.openUploadStream(randomName, {
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
        uploadStream.on("finish", () =>
          resolve(`${virtualPath}/${randomName}`)
        );
        uploadStream.on("error", reject);
      });

    const qpPath = await uploadFile(
      qp[0],
      `${course}/${semester}/${subject}/qp`
    );
    const keyPath = await uploadFile(
      key[0],
      `${course}/${semester}/${subject}/key`
    );

    console.log("Question Paper Data: ", req.body.course.trim());

    const qpExist = await QP.findOne({ course, semester, subject });

    if (!qpExist) return res.status(500).send("Question Paper not found!");

    console.log("Question Paper ID: ", qpExist.name);

    const newQpKey = new QpKey({
      uuid: assignmentId,
      combined,
      course,
      semester,
      subject,
      qpPdfPath: qpPath,
      qpKeyPath: keyPath,
      qpPdfId: qpExist.name,
      iid: req.user?.IID,
    });

    await newQpKey.save();

    res.status(201).json({
      message: "Files uploaded successfully!",
      data: newQpKey,
    });
  } catch (error) {
    console.error("❌ Upload error:", error);
    res.status(500).send("Internal Server Error");
  }
};

const getAll = async (req, res) => {
  try {
    const keyData = await QpKey.find({ iid: req.user.IID });
    if (!keyData)
      return res.status(500).send("No Question Paper PDF or Keys found!");

    res.status(200).json({ success: true, data: keyData });
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
};

const getFile = async (req, res) => {
  try {
    const { type, filename } = req.params;
    if (!["qp", "key"].includes(type))
      return res.status(400).send("Invalid file type.");

    const file = await bucket.find({ filename }).toArray();
    if (!file || file.length === 0) {
      return res.status(404).send("File not found");
    }

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${filename}"`,
    });

    const downloadStream = bucket.openDownloadStreamByName(filename);
    downloadStream.pipe(res);
  } catch (err) {
    console.error("❌ Error streaming PDF:", err);
    res.status(500).send("Error retrieving file.");
  }
};

const getByName = async (req, res) => {
  try {
    const { name } = req.params;
    const qpKey = await QpKey.findOne({ qpPdfId: name });

    if (!qpKey)
      return res.status(500).send("Question Paper PDF / Key not found");

    res.status(200).json({ success: true, data: qpKey });
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
};

module.exports = { create, getAll, getFile, getByName };
