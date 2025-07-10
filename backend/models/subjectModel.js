const mongoose = require('mongoose')

const subjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true },
  stream: { type: mongoose.Schema.Types.ObjectId, ref: 'Stream' },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  specialization: { type: mongoose.Schema.Types.ObjectId, ref: 'Specialization' },
}, { timestamps: true })

module.exports = mongoose.model('Subject', subjectSchema)
