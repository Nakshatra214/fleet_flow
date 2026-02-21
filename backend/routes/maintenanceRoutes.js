const router = require("express").Router();
const MaintenanceLog = require("../models/MaintenanceLog");
const Vehicle = require("../models/Vehicle");
const { authMiddleware } = require("../middleware/auth");

// GET all maintenance logs
router.get("/", authMiddleware, async (req, res) => {
    try {
        const logs = await MaintenanceLog.find()
            .populate("vehicleId", "name licensePlate status")
            .sort({ createdAt: -1 });
        res.json(logs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST add maintenance log (auto-sets vehicle to In Shop)
router.post("/", authMiddleware, async (req, res) => {
    try {
        const log = new MaintenanceLog(req.body);
        if (log.status === "In Shop" || log.status === "Scheduled") {
            const vehicle = await Vehicle.findById(req.body.vehicleId);
            if (vehicle) {
                vehicle.status = "In Shop";
                await vehicle.save();
            }
        }
        await log.save();
        const populated = await MaintenanceLog.findById(log._id).populate("vehicleId", "name licensePlate status");
        res.status(201).json(populated);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// PUT update maintenance log
router.put("/:id", authMiddleware, async (req, res) => {
    try {
        const log = await MaintenanceLog.findById(req.params.id);
        if (!log) return res.status(404).json({ message: "Maintenance log not found" });

        // If status changes to Completed, free up the vehicle
        if (req.body.status === "Completed") {
            const vehicle = await Vehicle.findById(log.vehicleId);
            if (vehicle && vehicle.status === "In Shop") {
                vehicle.status = "Available";
                await vehicle.save();
            }
            req.body.completedAt = new Date();
        }

        const updated = await MaintenanceLog.findByIdAndUpdate(req.params.id, req.body, { new: true })
            .populate("vehicleId", "name licensePlate status");
        res.json(updated);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE maintenance log
router.delete("/:id", authMiddleware, async (req, res) => {
    try {
        const log = await MaintenanceLog.findByIdAndDelete(req.params.id);
        if (!log) return res.status(404).json({ message: "Maintenance log not found" });
        res.json({ message: "Maintenance log deleted" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
