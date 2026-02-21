const router = require("express").Router();
const Vehicle = require("../models/Vehicle");
const { authMiddleware } = require("../middleware/auth");

// Fix 3: All routes protected with authMiddleware

// GET all vehicles
router.get("/", authMiddleware, async (req, res) => {
    try {
        const vehicles = await Vehicle.find().sort({ createdAt: -1 });
        res.json(vehicles);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET single vehicle
router.get("/:id", authMiddleware, async (req, res) => {
    try {
        const vehicle = await Vehicle.findById(req.params.id);
        if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });
        res.json(vehicle);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST add vehicle
router.post("/", authMiddleware, async (req, res) => {
    try {
        const vehicle = new Vehicle(req.body);
        await vehicle.save();
        res.status(201).json(vehicle);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// PUT update vehicle
router.put("/:id", authMiddleware, async (req, res) => {
    try {
        const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, {
            new: true, runValidators: true,
        });
        if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });
        res.json(vehicle);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE vehicle
router.delete("/:id", authMiddleware, async (req, res) => {
    try {
        const vehicle = await Vehicle.findByIdAndDelete(req.params.id);
        if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });
        res.json({ message: "Vehicle deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
