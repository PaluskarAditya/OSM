const mongoose = require('mongoose')

const yearSchema = new mongoose.Schema({
  yearRange: { type: String, required: true }, // e.g. "2025-2026"
}, { timestamps: true })

module.exports = mongoose.model('AcademicYear', yearSchema)
