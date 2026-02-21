const mongoose = require("mongoose");

const tripSchema = new mongoose.Schema({
    // Fix 4: ObjectId refs instead of plain String
    vehicleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Vehicle",
        required: true,
    },
    driverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Driver",
        required: true,
    },
    cargoWeight: { type: Number, required: true }, // kg
    origin: { type: String, required: true },
    destination: { type: String, required: true },
    status: {
        type: String,
        enum: ["Draft", "Dispatched", "Completed", "Cancelled"],
        default: "Draft",
    },
    revenue: { type: Number, default: 0 }, // for ROI
    driverPay: { type: Number, default: 0 }, // what the driver earns
    distanceKm: { type: Number, default: 0 },
    date: { type: Date, default: Date.now },
    completedAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model("Trip", tripSchema);
