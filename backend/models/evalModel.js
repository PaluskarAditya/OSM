const mongoose = require("mongoose");

const sheetSchema = new mongoose.Schema({
  assignmentId: { type: String, required: true },
  status: { type: String, default: "Pending" },
  isChecked: { type: String, default: "Not Evaluated" },
  marks: { type: Number, default: 0 },
  attendance: { type: String, default: "Present" },
});

const evalSchema = new mongoose.Schema(
  {
    uuid: { type: String, required: true, unique: true },
    name: { type: String, required: true }, // e.g., "Mid-Semester Evaluation"
    course: { type: String, required: true },
    subject: { type: String, required: true },
    semester: { type: String, required: true },
    endDate: { type: String, required: true },
    examiners: [{ type: String }],
    moderators: [{ type: String }],

    // 👇 Updated sheets structure
    sheets: [sheetSchema],

    progress: {
      uploaded: { type: Number, default: 0 },
      checked: { type: Number, default: 0 },
    },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Completed"],
      default: "Pending",
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.Evaluation || mongoose.model("Evaluation", evalSchema);
