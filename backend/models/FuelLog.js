const mongoose = require("mongoose");

const fuelLogSchema = new mongoose.Schema({
    // Fix 4: ObjectId ref
    vehicleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Vehicle",
        required: true,
    },
    liters: { type: Number, required: true },
    fuelCost: { type: Number, required: true },
    maintenanceCost: { type: Number, default: 0 },
    totalCost: { type: Number }, // auto-calculated
    kmDriven: { type: Number, default: 0 },
    fuelEfficiency: { type: Number }, // km/liter, auto-calculated
    date: { type: Date, default: Date.now },
    notes: { type: String },
}, { timestamps: true });

// Auto-calculate totalCost and fuelEfficiency before save (promise-based for mongoose 9)
fuelLogSchema.pre("save", function () {
    this.totalCost = this.fuelCost + this.maintenanceCost;
    if (this.liters > 0 && this.kmDriven > 0) {
        this.fuelEfficiency = parseFloat((this.kmDriven / this.liters).toFixed(2));
    }
});

module.exports = mongoose.model("FuelLog", fuelLogSchema);
