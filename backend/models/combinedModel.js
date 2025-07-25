const mongoose = require('mongoose');

const combinedSchema = mongoose.Schema({
    name: { type: String, required: true },
    uuid: { type: String, required: true },
    course: { type: String, required: true },
    stream: { type: String },
    degree: { type: String },
    year: { type: String },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

const Combined = mongoose.models.Combined || mongoose.model('Combined', combinedSchema);
module.exports = Combined;