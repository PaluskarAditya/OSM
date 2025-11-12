const mongoose = require("mongoose");

const qpKeySchema = mongoose.Schema({
  uuid: {
    type: String,
    required: true,
    unique: true,
  },
  iid: {
    type: String,
    required: true,
  },
  combined: {
    type: String,
    required: true,
  },
  course: {
    type: String,
    required: true,
  },
  semester: {
    type: String,
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  qpPdfPath: {
    type: String,
    required: true,
  },
  qpPdfId: {
    type: String,
    required: true,
  },
  qpKeyPath: {
    type: String,
    required: true,
  },
});

const QpKey = mongoose.models.QpKey || mongoose.model("QpKey", qpKeySchema);
module.exports = QpKey;
