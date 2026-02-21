const mongoose = require("mongoose");

const driverSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String },
    phone: { type: String },
    licenseNumber: { type: String, required: true },
    licenseExpiry: { type: Date, required: true },
    status: { type: String, enum: ["On Duty", "Off Duty"], default: "Off Duty" },
    safetyScore: { type: Number, default: 100, min: 0, max: 100 },
    tripCompletionRate: { type: Number, default: 0 }, // percentage
}, { timestamps: true });

module.exports = mongoose.model("Driver", driverSchema);
