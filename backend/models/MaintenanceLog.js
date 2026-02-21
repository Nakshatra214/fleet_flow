const mongoose = require("mongoose");

const maintenanceSchema = new mongoose.Schema({
    // Fix 4: ObjectId ref
    vehicleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Vehicle",
        required: true,
    },
    serviceType: { type: String, required: true }, // e.g. "Oil Change", "Tire Replacement"
    description: { type: String },
    cost: { type: Number, default: 0 },
    date: { type: Date, default: Date.now },
    status: {
        type: String,
        enum: ["Scheduled", "In Shop", "Completed"],
        default: "Scheduled",
    },
    completedAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model("MaintenanceLog", maintenanceSchema);
