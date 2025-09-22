const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    uuid: { type: String, required: true },
    name: { type: String },
    stream: { type: String, required: true },
    degree: { type: String, required: true },
    year: { type: String, required: true },
    code: { type: String, required: true },
    semCount: { type: String, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Course", courseSchema);
