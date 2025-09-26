const mongoose = require("mongoose");

const qpSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    iid: {
      type: String,
      required: true,
    },
    stream: {
      type: String,
      required: true,
    },
    degree: {
      type: String,
      required: true,
    },
    year: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    course: {
      type: String,
      required: true,
    },
    specialization: {
      type: String,
      default: "no specialization",
    },
    fileUrl: {
      type: String,
    },
    examDate: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    version: {
      type: Number,
      default: 1,
    },
    validated: {
      type: Boolean,
      default: false,
    },
    examinerAssigned: {
      type: Boolean,
      default: false,
    },
    examinerId: {
      type: String,
      default: "",
    },
    totalMarks: {
      type: String,
      required: true,
    },
    subQuestionsCount: {
      type: String,
      required: true,
    },
    questionsCount: {
      type: String,
      required: true,
    },
    semester: {
      type: String,
      required: true,
    },
    data: [{}],
    assignmentId: [{ type: String }],
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

module.exports = mongoose.models.QP || mongoose.model("QP", qpSchema);
