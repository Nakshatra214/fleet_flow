const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["trip_assigned", "trip_dispatched", "trip_completed", "general"], default: "general" },
    title: { type: String, required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    tripId: { type: mongoose.Schema.Types.ObjectId, ref: "Trip" },
    vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle" },
}, { timestamps: true });

module.exports = mongoose.model("Notification", notificationSchema);
