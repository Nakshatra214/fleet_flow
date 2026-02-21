const router = require("express").Router();
const Vehicle = require("../models/Vehicle");
const Driver = require("../models/Driver");
const Trip = require("../models/Trip");
const FuelLog = require("../models/FuelLog");
const MaintenanceLog = require("../models/MaintenanceLog");
const { authMiddleware } = require("../middleware/auth");

// GET Dashboard stats
router.get("/dashboard", authMiddleware, async (req, res) => {
    try {
        const [totalVehicles, availableVehicles, onTripVehicles, inShopVehicles,
            totalDrivers, onDutyDrivers,
            pendingTrips, completedTrips, totalTrips,
            totalFuelCost, totalMaintenanceCost, totalDriverPay] = await Promise.all([
                Vehicle.countDocuments(),
                Vehicle.countDocuments({ status: "Available" }),
                Vehicle.countDocuments({ status: "On Trip" }),
                Vehicle.countDocuments({ status: "In Shop" }),
                Driver.countDocuments(),
                Driver.countDocuments({ status: "On Duty" }),
                Trip.countDocuments({ status: { $in: ["Draft", "Dispatched"] } }),
                Trip.countDocuments({ status: "Completed" }),
                Trip.countDocuments(),
                FuelLog.aggregate([{ $group: { _id: null, total: { $sum: "$totalCost" } } }]),
                MaintenanceLog.aggregate([{ $group: { _id: null, total: { $sum: "$cost" } } }]),
                Trip.aggregate([{ $match: { status: "Completed" } }, { $group: { _id: null, total: { $sum: "$driverPay" } } }]),
            ]);

        const utilizationRate = totalVehicles > 0
            ? Math.round(((onTripVehicles) / totalVehicles) * 100)
            : 0;

        res.json({
            vehicles: { total: totalVehicles, available: availableVehicles, onTrip: onTripVehicles, inShop: inShopVehicles },
            drivers: { total: totalDrivers, onDuty: onDutyDrivers },
            trips: { pending: pendingTrips, completed: completedTrips, total: totalTrips },
            finances: {
                totalFuelCost: totalFuelCost[0]?.total || 0,
                totalMaintenanceCost: totalMaintenanceCost[0]?.total || 0,
                totalDriverPay: totalDriverPay[0]?.total || 0,
            },
            utilizationRate,
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET Vehicle ROI (revenue - expenses per vehicle)
router.get("/roi", authMiddleware, async (req, res) => {
    try {
        const vehicles = await Vehicle.find({}, "name licensePlate");

        const roiData = await Promise.all(vehicles.map(async (v) => {
            const revenueAgg = await Trip.aggregate([
                { $match: { vehicleId: v._id, status: "Completed" } },
                { $group: { _id: null, total: { $sum: "$revenue" } } },
            ]);
            const fuelAgg = await FuelLog.aggregate([
                { $match: { vehicleId: v._id } },
                { $group: { _id: null, total: { $sum: "$totalCost" } } },
            ]);
            const maintenance = await MaintenanceLog.aggregate([
                { $match: { vehicleId: v._id } },
                { $group: { _id: null, total: { $sum: "$cost" } } },
            ]);
            const revenue = revenueAgg[0]?.total || 0;
            const expenses = (fuelAgg[0]?.total || 0) + (maintenance[0]?.total || 0);
            return { vehicle: v.name, licensePlate: v.licensePlate, revenue, expenses, roi: revenue - expenses };
        }));

        res.json(roiData);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET Fuel efficiency per vehicle (km/liter)
router.get("/fuel-efficiency", authMiddleware, async (req, res) => {
    try {
        const efficiency = await FuelLog.aggregate([
            {
                $group: {
                    _id: "$vehicleId",
                    totalKm: { $sum: "$kmDriven" },
                    totalLiters: { $sum: "$liters" },
                },
            },
            { $lookup: { from: "vehicles", localField: "_id", foreignField: "_id", as: "vehicle" } },
            { $unwind: "$vehicle" },
            {
                $project: {
                    vehicleName: "$vehicle.name",
                    licensePlate: "$vehicle.licensePlate",
                    totalKm: 1,
                    totalLiters: 1,
                    efficiency: {
                        $cond: [{ $gt: ["$totalLiters", 0] },
                        { $round: [{ $divide: ["$totalKm", "$totalLiters"] }, 2] }, 0],
                    },
                },
            },
        ]);
        res.json(efficiency);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET Trips over last 7 days (for line chart)
router.get("/trips-trend", authMiddleware, async (req, res) => {
    try {
        const days = 7;
        const result = [];
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const start = new Date(date.setHours(0, 0, 0, 0));
            const end = new Date(date.setHours(23, 59, 59, 999));
            const count = await Trip.countDocuments({ createdAt: { $gte: start, $lte: end } });
            result.push({ date: start.toLocaleDateString("en-IN", { day: "2-digit", month: "short" }), count });
        }
        res.json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET Profit trend — last 30 days (revenue vs expenses)
router.get("/profit-trend", authMiddleware, async (req, res) => {
    try {
        const days = 30;
        const result = [];
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const start = new Date(new Date(date).setHours(0, 0, 0, 0));
            const end = new Date(new Date(date).setHours(23, 59, 59, 999));

            const [revenueAgg, fuelAgg, maintAgg, driverPayAgg] = await Promise.all([
                Trip.aggregate([
                    { $match: { status: "Completed", completedAt: { $gte: start, $lte: end } } },
                    { $group: { _id: null, total: { $sum: "$revenue" } } },
                ]),
                FuelLog.aggregate([
                    { $match: { date: { $gte: start, $lte: end } } },
                    { $group: { _id: null, total: { $sum: "$totalCost" } } },
                ]),
                MaintenanceLog.aggregate([
                    { $match: { date: { $gte: start, $lte: end } } },
                    { $group: { _id: null, total: { $sum: "$cost" } } },
                ]),
                Trip.aggregate([
                    { $match: { status: "Completed", completedAt: { $gte: start, $lte: end } } },
                    { $group: { _id: null, total: { $sum: "$driverPay" } } },
                ]),
            ]);

            const revenue = revenueAgg[0]?.total || 0;
            const expenses = (fuelAgg[0]?.total || 0) + (maintAgg[0]?.total || 0) + (driverPayAgg[0]?.total || 0);
            result.push({
                date: start.toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
                revenue,
                expenses,
                profit: revenue - expenses,
            });
        }
        res.json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET Driver-specific stats (for the logged-in driver's personal dashboard)
router.get("/driver-stats", authMiddleware, async (req, res) => {
    try {
        const driver = await Driver.findOne({ userId: req.user.id });
        if (!driver) return res.status(404).json({ message: "Driver profile not found" });

        const [total, completed, active, cancelled, earningsAgg] = await Promise.all([
            Trip.countDocuments({ driverId: driver._id }),
            Trip.countDocuments({ driverId: driver._id, status: "Completed" }),
            Trip.countDocuments({ driverId: driver._id, status: { $in: ["Draft", "Dispatched"] } }),
            Trip.countDocuments({ driverId: driver._id, status: "Cancelled" }),
            Trip.aggregate([
                { $match: { driverId: driver._id, status: "Completed" } },
                { $group: { _id: null, total: { $sum: "$driverPay" } } },
            ]),
        ]);

        // Last 7 days trips
        const days = 7;
        const weeklyTrips = [];
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const start = new Date(new Date(date).setHours(0, 0, 0, 0));
            const end = new Date(new Date(date).setHours(23, 59, 59, 999));
            const dayCount = await Trip.countDocuments({
                driverId: driver._id,
                createdAt: { $gte: start, $lte: end },
            });
            const dayEarnings = await Trip.aggregate([
                { $match: { driverId: driver._id, status: "Completed", completedAt: { $gte: start, $lte: end } } },
                { $group: { _id: null, total: { $sum: "$driverPay" } } },
            ]);
            weeklyTrips.push({
                date: start.toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
                trips: dayCount,
                earnings: dayEarnings[0]?.total || 0,
            });
        }

        // Current active trip
        const activeTrip = await Trip.findOne({ driverId: driver._id, status: { $in: ["Draft", "Dispatched"] } })
            .populate("vehicleId", "name licensePlate");

        res.json({
            driver: { name: driver.name, safetyScore: driver.safetyScore, tripCompletionRate: driver.tripCompletionRate, status: driver.status },
            trips: { total, completed, active, cancelled },
            totalEarnings: earningsAgg[0]?.total || 0,
            weeklyTrips,
            activeTrip,
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET Dispatcher dashboard stats
router.get("/dispatcher-stats", authMiddleware, async (req, res) => {
    try {
        const [totalVehicles, availableVehicles, onTripVehicles, inShopVehicles,
            totalDrivers, onDutyDrivers, draftTrips, dispatchedTrips, completedToday] = await Promise.all([
                Vehicle.countDocuments(),
                Vehicle.countDocuments({ status: "Available" }),
                Vehicle.countDocuments({ status: "On Trip" }),
                Vehicle.countDocuments({ status: "In Shop" }),
                Driver.countDocuments(),
                Driver.countDocuments({ status: "On Duty" }),
                Trip.countDocuments({ status: "Draft" }),
                Trip.countDocuments({ status: "Dispatched" }),
                Trip.countDocuments({ status: "Completed", completedAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) } }),
            ]);

        const activeTrips = await Trip.find({ status: { $in: ["Draft", "Dispatched"] } })
            .populate("vehicleId", "name licensePlate")
            .populate("driverId", "name status")
            .sort({ createdAt: -1 }).limit(5);

        res.json({
            vehicles: { total: totalVehicles, available: availableVehicles, onTrip: onTripVehicles, inShop: inShopVehicles },
            drivers: { total: totalDrivers, onDuty: onDutyDrivers },
            trips: { draft: draftTrips, dispatched: dispatchedTrips, completedToday },
            activeTrips,
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;

