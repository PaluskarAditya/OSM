const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const instituteSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    logoUrl: { type: String },
    email: { type: String },
    password: { type: String },
    IID: { type: Number, unique: true },
    isActive: { type: Boolean, default: true },
    profile: {},
  },
  { timestamps: true }
);

instituteSchema.plugin(AutoIncrement, { inc_field: "IID" });

module.exports = mongoose.model("Institute", instituteSchema);
