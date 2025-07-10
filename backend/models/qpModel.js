const mongoose = require('mongoose')

const qpSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    stream: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Stream',
      required: true,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
    },
    specialization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Specialization',
    },
    fileUrl: {
      type: String,
      required: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // assuming admin is stored in User model
      required: true,
    },
    examDate: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    version: {
      type: Number,
      default: 1,
    },
    examinerAssigned: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
)

module.exports = mongoose.models.QP || mongoose.model('QP', qpSchema);