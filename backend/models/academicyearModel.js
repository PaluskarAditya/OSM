const mongoose = require("mongoose");

const yearSchema = new mongoose.Schema(
  {
    uuid: { type: String, unique: true, required: true },
    year: { type: String, required: true },
    iid: { type: String, required: true },
    streams: [{ type: String, required: true }], // Array of stream UUIDs
    degrees: [{ type: String, required: true }], // Array of degree UUIDs
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AcademicYear", yearSchema);
