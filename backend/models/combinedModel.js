const mongoose = require("mongoose");

const combinedSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    uuid: { type: String, required: true },
    course: [{ type: String }],
    stream: { type: String },
    degree: { type: String },
    year: { type: String },
    iid: { type: String, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Combined =
  mongoose.models.Combined || mongoose.model("Combined", combinedSchema);
module.exports = Combined;
