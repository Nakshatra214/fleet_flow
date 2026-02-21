const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
require("dotenv").config();

async function seedAdmin() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        const existingAdmin = await User.findOne({ email: "admin@fleetflow.com" });
        if (existingAdmin) {
            console.log("Admin already exists!");
            if (existingAdmin.status !== "active") {
                existingAdmin.status = "active";
                await existingAdmin.save();
                console.log("Admin status set to active.");
            }
        } else {
            console.log("Creating new admin user...");
            const user = new User({
                name: "System Admin",
                email: "admin@fleetflow.com",
                password: "admin",
                role: "Admin",
                status: "active"
            });
            await user.save();
            console.log("Admin user created successfully!");
        }
    } catch (err) {
        console.error("Error seeding admin:", err);
    } finally {
        mongoose.connection.close();
    }
}

seedAdmin();
