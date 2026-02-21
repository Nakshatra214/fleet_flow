const router = require("express").Router();
const Trip = require("../models/Trip");
const Vehicle = require("../models/Vehicle");
const Driver = require("../models/Driver");
const Notification = require("../models/Notification");
const { authMiddleware } = require("../middleware/auth");

// Helper: find user linked to a driver and send notification
async function notifyDriver(driverId, type, title, message, tripId) {
    try {
        const driver = await Driver.findById(driverId);
        if (driver && driver.userId) {
            await Notification.create({ userId: driver.userId, type, title, message, tripId });
        }
    } catch (e) {
        console.warn("Notification creation failed:", e.message);
    }
}

// GET all trips
router.get("/", authMiddleware, async (req, res) => {
    try {
        // Role filtering: drivers only see their own trips
        let filter = {};
        if (req.user.role === "Driver") {
            const driver = await Driver.findOne({ userId: req.user.id });
            if (driver) filter.driverId = driver._id;
            else return res.json([]);
        }
        const trips = await Trip.find(filter)
            .populate("vehicleId", "name licensePlate capacity status")
            .populate("driverId", "name licenseExpiry status userId")
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

// POST create trip
router.post("/", authMiddleware, async (req, res) => {
    try {
        // Role check — only Manager and Dispatcher can create trips
        if (req.user.role === "Driver") {
            return res.status(403).json({ message: "Drivers cannot create trips" });
        }

        const { vehicleId, driverId } = req.body;
        const cargoWeight = Number(req.body.cargoWeight);

        if (!vehicleId || !driverId || isNaN(cargoWeight)) {
            return res.status(400).json({ message: "vehicleId, driverId, and cargoWeight are required" });
        }

        const vehicle = await Vehicle.findById(vehicleId);
        if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });
        if (vehicle.status !== "Available") {
            return res.status(400).json({ message: `Vehicle is '${vehicle.status}', not available` });
        }
        if (cargoWeight > vehicle.capacity) {
            return res.status(400).json({
                message: `Cargo (${cargoWeight}kg) exceeds vehicle capacity (${vehicle.capacity}kg)`,
            });
        }

        const driver = await Driver.findById(driverId);
        if (!driver) return res.status(404).json({ message: "Driver not found" });
        if (new Date(driver.licenseExpiry) < new Date()) {
            return res.status(400).json({
                message: `Driver license expired on ${new Date(driver.licenseExpiry).toDateString()}`,
            });
        }

        const trip = new Trip({ ...req.body, cargoWeight });
        await trip.save();

        vehicle.status = "On Trip";
        await vehicle.save();
        driver.status = "On Duty";
        await driver.save();

        // ✉️ Notify driver of new assignment
        await notifyDriver(
            driverId,
            "trip_assigned",
            "🚛 New Trip Assigned",
            `You have been assigned a trip from ${req.body.origin} to ${req.body.destination} with vehicle ${vehicle.name}.`,
            trip._id
        );

        const populated = await Trip.findById(trip._id)
            .populate("vehicleId", "name licensePlate capacity status")
            .populate("driverId", "name licenseExpiry status userId");

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
        const updateBody = { ...req.body };

        // Handle status transitions
        if (newStatus === "Cancelled") {
            // Role check — only Manager/Dispatcher can cancel
            if (req.user.role === "Driver") {
                return res.status(403).json({ message: "Drivers cannot cancel trips" });
            }

            // Free up vehicle and driver
            if (trip.vehicleId) {
                await Vehicle.findByIdAndUpdate(trip.vehicleId, { status: "Available" });
            }
            if (trip.driverId) {
                await Driver.findByIdAndUpdate(trip.driverId, { status: "Off Duty" });
                await notifyDriver(
                    trip.driverId,
                    "general",
                    "❌ Trip Cancelled",
                    `Your trip from ${trip.origin} to ${trip.destination} has been cancelled by management.`,
                    trip._id
                );
            }
        }

        if (newStatus === "Dispatched") {
            // ✉️ Notify driver trip is dispatched
            if (trip.driverId) {
                await notifyDriver(
                    trip.driverId,
                    "trip_dispatched",
                    "🚦 Trip Dispatched",
                    `Your trip from ${trip.origin} to ${trip.destination} is now underway. Safe driving!`,
                    trip._id
                );
            }
        }

        if (newStatus === "Completed") {
            updateBody.completedAt = new Date();

            if (trip.vehicleId) {
                await Vehicle.findByIdAndUpdate(trip.vehicleId, { status: "Available" });
            }
            if (trip.driverId) {
                await Driver.findByIdAndUpdate(trip.driverId, { status: "Off Duty" });

                // Update completion rate
                const totalTrips = await Trip.countDocuments({ driverId: trip.driverId });
                const completedTrips = await Trip.countDocuments({ driverId: trip.driverId, status: "Completed" }) + 1;
                await Driver.findByIdAndUpdate(trip.driverId, {
                    tripCompletionRate: Math.round((completedTrips / totalTrips) * 100),
                });

                await notifyDriver(
                    trip.driverId,
                    "trip_completed",
                    "✅ Trip Completed",
                    `Great work! Trip from ${trip.origin} to ${trip.destination} has been completed.`,
                    trip._id
                );
            }
        }

        const updated = await Trip.findByIdAndUpdate(req.params.id, updateBody, { new: true })
            .populate("vehicleId", "name licensePlate capacity status")
            .populate("driverId", "name licenseExpiry status userId");

        res.json(updated);
    } catch (err) {
        console.error("Trip update error:", err);
        res.status(400).json({ message: err.message });
    }
});

// DELETE trip
router.delete("/:id", authMiddleware, async (req, res) => {
    try {
        if (req.user.role === "Driver") {
            return res.status(403).json({ message: "Drivers cannot delete trips" });
        }
        const trip = await Trip.findByIdAndDelete(req.params.id);
        if (!trip) return res.status(404).json({ message: "Trip not found" });
        res.json({ message: "Trip deleted" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
