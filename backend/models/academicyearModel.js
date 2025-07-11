const mongoose = require("mongoose");

const yearSchema = new mongoose.Schema(
  {
    uuid: { type: String, unique: true, required: true },
    year: { type: String, required: true },
    stream: { type: String, required: true },
    degree: { type: String, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AcademicYear", yearSchema);
