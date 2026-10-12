import Notification from "../Models/NotificationSchema.js";

/* ================= GET USER NOTIFICATIONS ================= */
export const getNotifications = async (req, res) => {
    try {
        const userId = req.user._id;
        const { page = 1, limit = 20 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);

        const [notifications, total, unreadCount] = await Promise.all([
            Notification.find({ userId })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit)),
            Notification.countDocuments({ userId }),
            Notification.countDocuments({ userId, isRead: false }),
        ]);

        res.json({
            success: true,
            data: notifications,
            unreadCount,
            pagination: {
                total,
                page: Number(page),
                pages: Math.ceil(total / Number(limit)),
                limit: Number(limit),
            },
        });
    } catch (error) {
        console.error("Get notifications error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

/* ================= MARK NOTIFICATION AS READ ================= */
export const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const notification = await Notification.findOneAndUpdate(
            { _id: id, userId },
            { isRead: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ success: false, message: "Notification not found" });
        }

        res.json({ success: true, data: notification });
    } catch (error) {
        console.error("Mark as read error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

/* ================= MARK ALL AS READ ================= */
export const markAllAsRead = async (req, res) => {
    try {
        const userId = req.user._id;
        await Notification.updateMany({ userId, isRead: false }, { isRead: true });
        res.json({ success: true, message: "All notifications marked as read" });
    } catch (error) {
        console.error("Mark all as read error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

/* ================= DELETE NOTIFICATION ================= */
export const deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const notification = await Notification.findOneAndDelete({ _id: id, userId });
        if (!notification) {
            return res.status(404).json({ success: false, message: "Notification not found" });
        }

        res.json({ success: true, message: "Notification deleted" });
    } catch (error) {
        console.error("Delete notification error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

/* ================= SEND BULK NOTIFICATION (ADMIN) ================= */
export const sendBulkNotification = async (req, res) => {
    try {
        const { userIds, title, message, type = "SYSTEM_ANNOUNCEMENT", link } = req.body;

        if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
            return res.status(400).json({ success: false, message: "userIds array is required" });
        }
        if (!title || !message) {
            return res.status(400).json({ success: false, message: "title and message are required" });
        }

        const notifications = userIds.map((userId) => ({
            userId,
            type,
            title,
            message,
            link: link || null,
        }));

        await Notification.insertMany(notifications);

        res.status(201).json({
            success: true,
            message: `Sent ${notifications.length} notifications`,
        });
    } catch (error) {
        console.error("Send bulk notification error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

/* ================= UTILITY: Create single notification ================= */
export const createNotification = async ({ userId, type, title, message, link = null }) => {
    try {
        await Notification.create({ userId, type, title, message, link });
    } catch (err) {
        console.error("createNotification utility error:", err);
    }
};
