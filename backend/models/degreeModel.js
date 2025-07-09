const mongoose = require('mongoose')

const degreeSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  stream: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  uuid: { type: String, required: true, unique: true }
}, { timestamps: true })

module.exports = mongoose.model('Degree', degreeSchema)
