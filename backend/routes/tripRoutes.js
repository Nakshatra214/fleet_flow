const router = require("express").Router();
const Trip = require("../models/Trip");
const Vehicle = require("../models/Vehicle");
const Driver = require("../models/Driver");
const { authMiddleware } = require("../middleware/auth");

// GET all trips (with populated vehicle & driver)
router.get("/", authMiddleware, async (req, res) => {
    try {
        const trips = await Trip.find()
            .populate("vehicleId", "name licensePlate capacity status")
            .populate("driverId", "name licenseExpiry status")
            .sort({ createdAt: -1 });
        res.json(trips);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET single trip
router.get("/:id", authMiddleware, async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.id)
            .populate("vehicleId")
            .populate("driverId");
        if (!trip) return res.status(404).json({ message: "Trip not found" });
        res.json(trip);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST create trip (with capacity + license validations)
router.post("/", authMiddleware, async (req, res) => {
    try {
        const { vehicleId, driverId } = req.body;
        // Ensure cargoWeight is a number (strings from JSON can fail comparison)
        const cargoWeight = Number(req.body.cargoWeight);

        if (!vehicleId || !driverId || isNaN(cargoWeight)) {
            return res.status(400).json({ message: "vehicleId, driverId and cargoWeight are required" });
        }

        // Validate vehicle
        const vehicle = await Vehicle.findById(vehicleId);
        if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });
        if (vehicle.status !== "Available") {
            return res.status(400).json({ message: `Vehicle is currently '${vehicle.status}', not available for dispatch` });
        }
        if (cargoWeight > vehicle.capacity) {
            return res.status(400).json({
                message: `Cargo weight (${cargoWeight}kg) exceeds vehicle capacity (${vehicle.capacity}kg)`,
            });
        }

        // Validate driver
        const driver = await Driver.findById(driverId);
        if (!driver) return res.status(404).json({ message: "Driver not found" });
        if (new Date(driver.licenseExpiry) < new Date()) {
            return res.status(400).json({
                message: `Driver license expired on ${new Date(driver.licenseExpiry).toDateString()}. Cannot assign expired license.`,
            });
        }

        // Create trip with coerced numeric cargoWeight
        const tripData = { ...req.body, cargoWeight };
        const trip = new Trip(tripData);
        await trip.save();

        // Auto-update vehicle and driver status
        vehicle.status = "On Trip";
        await vehicle.save();
        driver.status = "On Duty";
        await driver.save();

        const populated = await Trip.findById(trip._id)
            .populate("vehicleId", "name licensePlate capacity status")
            .populate("driverId", "name licenseExpiry status");

        res.status(201).json(populated);
    } catch (err) {
        console.error("Trip creation error:", err);
        res.status(400).json({ message: err.message });
    }
});

// PUT update trip status
router.put("/:id", authMiddleware, async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.id);
        if (!trip) return res.status(404).json({ message: "Trip not found" });

        const newStatus = req.body.status;

        // Auto-update vehicle status when trip Completed or Cancelled
        if (newStatus === "Completed" || newStatus === "Cancelled") {
            const vehicle = await Vehicle.findById(trip.vehicleId);
            if (vehicle) {
                vehicle.status = "Available";
                if (req.body.distanceKm) vehicle.odometer += Number(req.body.distanceKm);
                await vehicle.save();
            }
            const driver = await Driver.findById(trip.driverId);
            if (driver) {
                driver.status = "Off Duty";
                if (newStatus === "Completed") {
                    const totalTrips = await Trip.countDocuments({ driverId: trip.driverId });
                    const completedTrips = await Trip.countDocuments({ driverId: trip.driverId, status: "Completed" }) + 1;
                    driver.tripCompletionRate = Math.round((completedTrips / totalTrips) * 100);
                }
                await driver.save();
            }
            if (newStatus === "Completed") {
                req.body.completedAt = new Date();
            }
        }

        const updated = await Trip.findByIdAndUpdate(req.params.id, req.body, { new: true })
            .populate("vehicleId", "name licensePlate capacity status")
            .populate("driverId", "name licenseExpiry status");

        res.json(updated);
    } catch (err) {
        console.error("Trip update error:", err);
        res.status(400).json({ message: err.message });
    }
});

// DELETE trip
router.delete("/:id", authMiddleware, async (req, res) => {
    try {
        const trip = await Trip.findByIdAndDelete(req.params.id);
        if (!trip) return res.status(404).json({ message: "Trip not found" });
        res.json({ message: "Trip deleted" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
