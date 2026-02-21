const router = require("express").Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Driver = require("../models/Driver");
const Notification = require("../models/Notification");
const { authMiddleware } = require("../middleware/auth");

// Register / Signup
router.post("/register", async (req, res) => {
    try {
        const { name, email, password, role, phone, licenseNumber, licenseExpiry } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: "Name, email and password are required" });
        }
        const existing = await User.findOne({ email: email.toLowerCase() });
        if (existing) return res.status(400).json({ message: "An account with this email already exists" });

        // Admins auto-approved (first admin)
        // Drivers, Dispatchers, Safety Officers, Financial Analysts auto-approved
        // Managers need Admin approval
        const isFirstAdmin = role === "Admin" && (await User.countDocuments({ role: "Admin" })) === 0;
        const needsApproval = role === "Manager";
        const userStatus = (isFirstAdmin || !needsApproval) ? "active" : "pending";

        const user = new User({ name, email, password, role: role || "Dispatcher", status: userStatus });
        await user.save();

        // If Driver, auto-create driver profile (pending status still)
        if (role === "Driver") {
            if (!licenseNumber || !licenseExpiry) {
                return res.status(400).json({ message: "Drivers must provide licenseNumber and licenseExpiry" });
            }
            await Driver.create({
                userId: user._id, name: user.name, email: user.email,
                phone: phone || "", licenseNumber, licenseExpiry: new Date(licenseExpiry),
                status: "Off Duty", safetyScore: 100,
            });
        }

        // Notify Admin only if a Manager signed up (needing approval)
        if (needsApproval) {
            const admins = await User.find({ role: "Admin", status: "active" });
            for (const admin of admins) {
                await Notification.create({
                    userId: admin._id,
                    type: "general",
                    title: `🔔 New Manager Registration`,
                    message: `${name} (${email}) has requested Manager access. Review in your Admin Dashboard.`,
                });
            }
        }

        res.status(201).json({
            message: isFirstAdmin
                ? "Admin account created! Please sign in."
                : needsApproval
                    ? `Account request sent! An Admin will review and approve your Manager access soon.`
                    : `Account created successfully! You can now sign in.`,
            status: user.status,
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Login
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) return res.status(400).json({ message: "No account found with this email" });
        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(400).json({ message: "Incorrect password" });

        // Check approval status
        if (user.status === "pending") {
            return res.status(403).json({ message: "⏳ Your account is pending manager approval. You'll be notified once approved.", code: "PENDING" });
        }
        if (user.status === "rejected") {
            return res.status(403).json({ message: "❌ Your account request was rejected by the administrator.", code: "REJECTED" });
        }

        const token = jwt.sign(
            { id: user._id, name: user.name, role: user.role, email: user.email, status: user.status },
            process.env.JWT_SECRET,
            { expiresIn: "24h" }
        );
        res.json({ token, user: { id: user._id, name: user.name, role: user.role, email: user.email } });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET all pending users (Admin only)
router.get("/pending-users", authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== "Admin") return res.status(403).json({ message: "Admin only" });
        const pending = await User.find({ status: "pending" }).select("-password").sort({ createdAt: -1 });
        res.json(pending);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PUT approve user (Admin only)
router.put("/approve/:id", authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== "Admin") return res.status(403).json({ message: "Admin only" });
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { status: "active", approvedBy: req.user.id, approvedAt: new Date() },
            { new: true }
        ).select("-password");
        if (!user) return res.status(404).json({ message: "User not found" });

        // Notify the approved user
        await Notification.create({
            userId: user._id,
            type: "general",
            title: "✅ Account Approved!",
            message: `Your ${user.role} account has been approved by the Admin. You can now sign in to FleetFlow.`,
        });
        res.json({ message: `${user.name} approved successfully`, user });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PUT reject user (Admin only)
router.put("/reject/:id", authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== "Admin") return res.status(403).json({ message: "Admin only" });
        const user = await User.findByIdAndUpdate(req.params.id, { status: "rejected" }, { new: true }).select("-password");
        if (!user) return res.status(404).json({ message: "User not found" });

        await Notification.create({
            userId: user._id,
            type: "general",
            title: "❌ Account Request Rejected",
            message: `Your account request has been reviewed and rejected. Contact the Admin for more information.`,
        });
        res.json({ message: `${user.name} rejected`, user });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET current user profile
router.get("/me", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
