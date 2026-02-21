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
            totalFuelCost, totalMaintenanceCost] = await Promise.all([
                Vehicle.countDocuments(),
                Vehicle.countDocuments({ status: "Available" }),
                Vehicle.countDocuments({ status: "On Trip" }),
                Vehicle.countDocuments({ status: "In Shop" }),
                Driver.countDocuments(),
                Driver.countDocuments({ status: "On Duty" }),
                Trip.countDocuments({ status: { $in: ["Draft", "Dispatched"] } }),
                Trip.countDocuments({ status: "Completed" }),
                Trip.countDocuments(),
                FuelLog.aggregate([{ $group: { _id: null, total: { $sum: "$fuelCost" } } }]),
                MaintenanceLog.aggregate([{ $group: { _id: null, total: { $sum: "$cost" } } }]),
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

            const [revenueAgg, fuelAgg, maintAgg] = await Promise.all([
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
            ]);

            const revenue = revenueAgg[0]?.total || 0;
            const expenses = (fuelAgg[0]?.total || 0) + (maintAgg[0]?.total || 0);
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

module.exports = router;

