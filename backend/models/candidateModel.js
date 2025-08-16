const mongoose = require("mongoose");

const candidateSchema = new mongoose.Schema(
  {
    RollNo: { type: String, required: true, unique: true },
    PRNNumber: { type: String, required: true, unique: true },
    Gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
    Email: { type: String, required: true },
    FirstName: { type: String, required: true },
    MiddleName: { type: String },
    LastName: { type: String, required: true },
    MobileNo: { type: String, required: true },
    IsPHCandidate: { type: String, default: "Yes", enum: ["No", "Yes"] },
    CampusName: { type: String, required: true },
    sheetUploaded: { type: Boolean, default: false },
    subjects: [{ type: String }],
    combined: { type: String, required: true },
    course: { type: String, required: true },
    BookletName: { type: String },
    sem: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    uuid: { type: String, required: true }
  },
  {
    timestamps: true,
  }
);

const Candidate =
  mongoose.models.Candidate || mongoose.model("Candidate", candidateSchema);
module.exports = Candidate;
