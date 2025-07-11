const mongoose = require('mongoose')

const courseSchema = new mongoose.Schema({
  uuid: { type: String, required: true },
  name: { type: String, required: true },
  stream: { type: String, required: true },
  degree: { type: String, required: true },
  academicYear: { type: String, required: true },
  code: { type: String, required: true },
  semester: { type: String, required: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true })

module.exports = mongoose.model('Course', courseSchema)
