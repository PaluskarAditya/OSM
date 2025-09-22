const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema(
  {
    RollNo: { type: String, required: true, unique: true },
    PRNNumber: { type: String, required: true, unique: true },
    Gender: { type: String, required: false },
    Email: { type: String, required: false },
    FirstName: { type: String, required: true },
    MiddleName: { type: String },
    LastName: { type: String, required: false },
    MobileNo: { type: String, required: false },
    IsPHCandidate: {
      type: String,
      default: "Yes",
      enum: ["No", "Yes"],
      required: true,
    },
    CampusName: { type: String, required: false },
    sheetUploaded: { type: Boolean, default: false },
    subjects: [{ type: String }], // subject UUIDs
    bookletNames: {
      type: Map,
      of: String, // subjectUUID -> booklet name
      default: {},
    },
    combined: { type: String, required: true },
    course: { type: String, required: true },
    sem: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    uuid: { type: String, required: true },
    attendance: { type: String, default: "absent" },
    assignmentId: { type: String, required: true },
  },
  { timestamps: true }
);

const Candidate =
  mongoose.models.Candidate || mongoose.model("Candidate", candidateSchema);
module.exports = Candidate;
