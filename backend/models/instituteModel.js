const mongoose = require("mongoose");

const instituteSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    logoUrl: {
      type: String,
    },
    email: {
      type: String,
    },
    password: {
      type: String,
    },
    IID: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    profile: {},
  },
  { timestamps: true }
);

module.exports = mongoose.model("Institute", instituteSchema);
