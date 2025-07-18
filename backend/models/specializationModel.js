const mongoose = require('mongoose')

const specSchema = new mongoose.Schema({
  name: { type: String, required: true },
  course: { type: String, required: true },
  stream: { type: String, required: true },
  degree: { type: String, required: true },
  uuid: { type: String, required: true, unique: true },
}, { timestamps: true })

module.exports = mongoose.model('Specialization', specSchema)
