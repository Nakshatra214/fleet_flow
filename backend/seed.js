require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");
const Vehicle = require("./models/Vehicle");
const Driver = require("./models/Driver");

async function seed() {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB for seeding...");

    // Clear existing data
    await User.deleteMany({});
    await Vehicle.deleteMany({});
    await Driver.deleteMany({});

    // Create users
    await User.create([
        { name: "Admin Manager", email: "manager@fleetflow.com", password: "manager123", role: "Manager" },
        { name: "Rahul Dispatcher", email: "dispatcher@fleetflow.com", password: "dispatch123", role: "Dispatcher" },
        { name: "Alex Driver", email: "driver@fleetflow.com", password: "driver123", role: "Driver" },
    ]);

    // Create vehicles
    const vehicles = await Vehicle.create([
        { name: "Van-01", model: "Tata Ace", licensePlate: "GJ05AB1234", capacity: 800, odometer: 12500, status: "Available", fuelType: "Diesel" },
        { name: "Van-02", model: "Mahindra Bolero", licensePlate: "GJ05CD5678", capacity: 1000, odometer: 8300, status: "Available", fuelType: "Diesel" },
        { name: "Truck-01", model: "Ashok Leyland", licensePlate: "GJ07EF9012", capacity: 5000, odometer: 45200, status: "In Shop", fuelType: "Diesel" },
        { name: "Van-03", model: "Force Traveller", licensePlate: "GJ05GH3456", capacity: 1500, odometer: 22100, status: "On Trip", fuelType: "Diesel" },
        { name: "Van-04", model: "Eicher Pro", licensePlate: "GJ09IJ7890", capacity: 2000, odometer: 33400, status: "Available", fuelType: "Diesel" },
    ]);

    // Create drivers
    const futureExpiry = new Date();
    futureExpiry.setFullYear(futureExpiry.getFullYear() + 2);
    const expiredDate = new Date("2024-01-01");

    await Driver.create([
        { name: "Alex Kumar", licenseNumber: "DL-2356-2024", licenseExpiry: futureExpiry, status: "On Duty", safetyScore: 92, tripCompletionRate: 95 },
        { name: "Ravi Singh", licenseNumber: "MH-9871-2023", licenseExpiry: futureExpiry, status: "Off Duty", safetyScore: 85, tripCompletionRate: 88 },
        { name: "Priya Sharma", licenseNumber: "GJ-4521-2025", licenseExpiry: futureExpiry, status: "Off Duty", safetyScore: 98, tripCompletionRate: 100 },
        { name: "Expired Driver", licenseNumber: "GJ-0001-2020", licenseExpiry: expiredDate, status: "Off Duty", safetyScore: 70, tripCompletionRate: 60 },
    ]);

    console.log("✅ Seed data created successfully!");
    console.log("📧 Login credentials:");
    console.log("   Manager:    manager@fleetflow.com    / manager123");
    console.log("   Dispatcher: dispatcher@fleetflow.com / dispatch123");
    console.log("   Driver:     driver@fleetflow.com     / driver123");
    await mongoose.disconnect();
}

seed().catch(console.error);
