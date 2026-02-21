const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema({
    name: { type: String, required: true },
    model: { type: String, required: true },
    licensePlate: { type: String, required: true, unique: true },
    capacity: { type: Number, required: true }, // kg
    odometer: { type: Number, default: 0 },     // km
    status: {
        type: String,
        enum: ["Available", "On Trip", "In Shop"],
        default: "Available",
    },
    year: { type: Number },
    fuelType: { type: String, enum: ["Diesel", "Petrol", "Electric", "CNG"], default: "Diesel" },
}, { timestamps: true });

module.exports = mongoose.model("Vehicle", vehicleSchema);
