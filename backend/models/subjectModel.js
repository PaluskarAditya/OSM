const mongoose = require('mongoose')

const subjectSchema = new mongoose.Schema({
  uuid: { type: String, unique: true },
  name: { type: String, required: true },
  code: { type: String, required: true },
  combined: { type: String, required: true },
  course: { type: String, required: true },
  exam: { type: String, required: true },
  semester: { type: String, required: true },
  type: { type: String, required: true, enum: ['Compulsory', 'Elective / Optional'] },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Subject', subjectSchema)
