const mongoose = require("mongoose");

const answerSheetSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    uuid: { type: String, required: true, unique: true },
    path: { type: String, required: true }, // secret
    combined: { type: String, required: true },
    course: { type: String, required: true },
    subject: { type: String, required: true },
    rollPRN: { type: String }, // secret
    attendance: { type: Boolean, default: false },
    candidateId: { type: String }, // secret
    sheetUploaded: { type: Boolean, default: false },
    assignmentId: { type: String, required: true },
    status: { type: String, default: "Pending" },
    totalMarks: { type: Number, required: true, default: 0 },
    isEvaluated: { type: Boolean, default: false },
    annotations: {},
    result: {},
  },
  { timestamps: true }
);

// // Hide sensitive fields automatically when converting to JSON
// answerSheetSchema.set("toJSON", {
//   transform: (doc, ret) => {
//     delete ret.path;
//     delete ret.rollPRN;
//     delete ret.candidateId;
//     return ret;
//   }
// });

const AnswerSheet =
  mongoose.models.AnswerSheet ||
  mongoose.model("AnswerSheet", answerSheetSchema);

module.exports = AnswerSheet;
