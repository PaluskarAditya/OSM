const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // Personal Information
    FirstName: {
      type: String,
      // required: [true, 'First name is required'],
      trim: true,
    },
    LastName: {
      type: String,
      // required: [true, 'Last name is required'],
      trim: true,
    },
    Email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },
    MobileNo: {
      type: String,
      trim: true,
      default: "",
      match: [/^\+?\d{10,15}$/, "Please provide a valid mobile number"],
    },
    AadharNo: {
      type: String,
      trim: true,
      default: "",
    },
    PANNo: {
      type: String,
      trim: true,
      default: "",
    },
    Designation: {
      type: String,
      trim: true,
      default: "",
    },
    Address: {
      type: String,
      trim: true,
      default: "",
    },
    Username: {
      type: String,
      trim: true,
    },
    // Institute Information
    FacultyID: {
      type: String,
      trim: true,
      default: "",
    },
    CampusName: {
      type: String,
      trim: true,
      default: "",
    },
    Role: {
      type: String,
      default: "",
    },

    // Banking Information
    AccountHolderName: {
      type: String,
      trim: true,
      default: "",
    },
    BankName: {
      type: String,
      trim: true,
      default: "",
    },
    BranchName: {
      type: String,
      trim: true,
      default: "",
    },
    AccountNumber: {
      type: String,
      trim: true,
      default: "",
    },
    IFSC: {
      type: String,
      trim: true,
      default: "",
    },
    TIN: {
      type: String,
      trim: true,
      default: "",
    },
    IID: {
      type: String,
      trim: true,
      default: "",
    },
    // Account Security
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    sessionToken: {
      type: String,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isPasswordChanged: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
