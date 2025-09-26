const mongoose = require("mongoose");

const streamSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    isActive: { type: Boolean, default: true },
    uuid: { type: String, required: true, unique: true },
    iid: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Stream", streamSchema);
