const mongoose = require('mongoose')

const courseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  degree: { type: mongoose.Schema.Types.ObjectId, ref: 'Degree' },
  academicYear: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicYear' },
}, { timestamps: true })

module.exports = mongoose.model('Course', courseSchema)
