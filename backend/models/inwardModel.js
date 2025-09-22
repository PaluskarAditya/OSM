const mongoose = require("mongoose");

const inwardSchema = mongoose.Schema({
  mainCount: { type: Number, required: true },
  supplementCount: { type: Number, required: true },
  mainBarcode: { type: Number, required: true },
  supplementBarcode: { type: Number, required: true },
  degree: { type: String, required: true },
  course: { type: String, required: true },
  subject: { type: String, required: true },
  examDate: { type: String, required: true },
  uuid: { type: String, required: true },
  examiner: { type: String, required: true },
});

inwardSchema.index(
  { degree: 1, course: 1, subject: 1, examDate: 1 },
  { unique: true }
);

const Inward = mongoose.models.Inward || mongoose.model("Inward", inwardSchema);
module.exports = Inward;
