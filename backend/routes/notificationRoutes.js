const router = require("express").Router();
const Notification = require("../models/Notification");
const { authMiddleware } = require("../middleware/auth");

// GET — current user's notifications
router.get("/", authMiddleware, async (req, res) => {
    try {
        const notifications = await Notification.find({ userId: req.user.id })
            .sort({ createdAt: -1 })
            .limit(50);
        res.json(notifications);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET unread count
router.get("/unread-count", authMiddleware, async (req, res) => {
    try {
        const count = await Notification.countDocuments({ userId: req.user.id, read: false });
        res.json({ count });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PUT — mark one as read
router.put("/:id/read", authMiddleware, async (req, res) => {
    try {
        await Notification.findOneAndUpdate({ _id: req.params.id, userId: req.user.id }, { read: true });
        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PUT — mark ALL as read
router.put("/mark-all-read", authMiddleware, async (req, res) => {
    try {
        await Notification.updateMany({ userId: req.user.id, read: false }, { read: true });
        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
