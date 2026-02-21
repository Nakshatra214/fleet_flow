const router = require("express").Router();
const Driver = require("../models/Driver");
const { authMiddleware } = require("../middleware/auth");

// GET all drivers
router.get("/", authMiddleware, async (req, res) => {
    try {
        const drivers = await Driver.find().sort({ createdAt: -1 });
        res.json(drivers);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET single driver
router.get("/:id", authMiddleware, async (req, res) => {
    try {
        const driver = await Driver.findById(req.params.id);
        if (!driver) return res.status(404).json({ message: "Driver not found" });
        res.json(driver);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST add driver
router.post("/", authMiddleware, async (req, res) => {
    try {
        const driver = new Driver(req.body);
        await driver.save();
        res.status(201).json(driver);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// PUT update driver
router.put("/:id", authMiddleware, async (req, res) => {
    try {
        const driver = await Driver.findByIdAndUpdate(req.params.id, req.body, {
            new: true, runValidators: true,
        });
        if (!driver) return res.status(404).json({ message: "Driver not found" });
        res.json(driver);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE driver
router.delete("/:id", authMiddleware, async (req, res) => {
    try {
        const driver = await Driver.findByIdAndDelete(req.params.id);
        if (!driver) return res.status(404).json({ message: "Driver not found" });
        res.json({ message: "Driver deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
