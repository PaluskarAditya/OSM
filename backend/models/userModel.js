const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    RollNo: {
      type: String,
      required: [true, 'Roll number is required'],
      unique: true,
      trim: true,
    },
    PRNNumber: {
      type: String,
      unique: true,
      trim: true,
      sparse: true, // Allows null/undefined values while enforcing uniqueness
    },
    Gender: {
      type: String,
      enum: ['Male', 'Female', 'Other', ''],
      default: '',
    },
    Email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    FirstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },
    MiddleName: {
      type: String,
      trim: true,
      default: '',
    },
    LastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
    },
    MobileNo: {
      type: String,
      trim: true,
      default: '',
      match: [/^\+?\d{10,15}$/, 'Please provide a valid mobile number'], // Optional validation
    },
    IsPHCandidate: {
      type: String,
      enum: ['Yes', 'No'],
      default: 'No',
    },
    CampusName: {
      type: String,
      trim: true,
      default: '',
    },
    subjects: {
      type: [String],
      default: [],
    },
    course: {
      type: String,
      trim: true,
      default: '',
    },
    combined: {
      type: String,
      trim: true,
      default: '',
    },
    role: {
      type: String,
      enum: ['Candidate', 'Examiner', 'Admin', 'Observer'],
      default: 'Candidate',
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
    },
    sessionToken: {
      type: String,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: false, // Active only when sessionToken is present
    },
  },
  { timestamps: true }
);

// Index for efficient querying
userSchema.index({ RollNo: 1 });
userSchema.index({ Email: 1 });
userSchema.index({ PRNNumber: 1 });

module.exports = mongoose.model('User', userSchema);