const router = require("express").Router();
const FuelLog = require("../models/FuelLog");
const { authMiddleware } = require("../middleware/auth");

// GET all fuel logs
router.get("/", authMiddleware, async (req, res) => {
    try {
        const logs = await FuelLog.find()
            .populate("vehicleId", "name licensePlate")
            .sort({ createdAt: -1 });
        res.json(logs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST add fuel log
router.post("/", authMiddleware, async (req, res) => {
    try {
        const log = new FuelLog(req.body);
        await log.save();
        const populated = await FuelLog.findById(log._id).populate("vehicleId", "name licensePlate");
        res.status(201).json(populated);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// PUT update fuel log
router.put("/:id", authMiddleware, async (req, res) => {
    try {
        // Recalculate before updating
        if (req.body.fuelCost !== undefined || req.body.maintenanceCost !== undefined) {
            const existing = await FuelLog.findById(req.params.id);
            req.body.totalCost = (req.body.fuelCost ?? existing.fuelCost) + (req.body.maintenanceCost ?? existing.maintenanceCost);
        }
        const log = await FuelLog.findByIdAndUpdate(req.params.id, req.body, { new: true })
            .populate("vehicleId", "name licensePlate");
        if (!log) return res.status(404).json({ message: "Fuel log not found" });
        res.json(log);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE fuel log
router.delete("/:id", authMiddleware, async (req, res) => {
    try {
        const log = await FuelLog.findByIdAndDelete(req.params.id);
        if (!log) return res.status(404).json({ message: "Fuel log not found" });
        res.json({ message: "Fuel log deleted" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
