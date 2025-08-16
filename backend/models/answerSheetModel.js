const mongoose = require('mongoose')

const answerSheetSchema = new mongoose.Schema({
  name: { type: String, required: true },
  uuid: { type: String, required: true, unique: true },
  path: { type: String, required: true },
  combined: { type: String, required: true },
  course: { type: String, required: true },
  subject: { type: String, required: true },
  rollPRN: { type: String },
  attendance: { type: Boolean, default: false },
  candidateId: { type: String },
  sheetUploaded: { type: Boolean, default: false }
}, { timestamps: true });

const AnswerSheet = mongoose.models.AnswerSheet || mongoose.model("AnswerSheet", answerSheetSchema);
module.exports = AnswerSheet