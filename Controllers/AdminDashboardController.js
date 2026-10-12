import AuditLog from "../Models/AuditLogSchema.js";
import Consultation from "../Models/ConsultationSchema.js";
import Event from "../Models/EventSchema.js";
import User from "../Models/UserSchmea.js";

/* ================= GET AUDIT LOGS (ADMIN WITH PAGINATION) ================= */
export const getAuditLogs = async (req, res) => {
    try {
        const { page = 1, limit = 15, action = "" } = req.query;
        const query = {};
        if (action) {
            query.action = { $regex: action, $options: "i" };
        }

        const skip = (Number(page) - 1) * Number(limit);
        const [logs, total] = await Promise.all([
            AuditLog.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit)),
            AuditLog.countDocuments(query),
        ]);

        res.json({
            success: true,
            data: logs,
            pagination: {
                total,
                page: Number(page),
                pages: Math.ceil(total / Number(limit)),
                limit: Number(limit),
            },
        });
    } catch (error) {
        console.error("Get audit logs error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

/* ================= GET DASHBOARD STATS WITH DATE RANGE & BREAKDOWN ================= */
export const getDashboardAnalytics = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const dateFilter = {};
        if (startDate || endDate) {
            dateFilter.createdAt = {};
            if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                dateFilter.createdAt.$lte = end;
            }
        }

        // Parallel stats retrieval
        const [
            totalUsers,
            activeUsers,
            totalEvents,
            consultationsCount,
            pendingConsultations,
            contactedConsultations,
            resolvedConsultations,
            recentConsultations,
        ] = await Promise.all([
            User.countDocuments(dateFilter),
            User.countDocuments({ ...dateFilter, active: { $ne: false } }),
            Event.countDocuments(dateFilter),
            Consultation.countDocuments(dateFilter),
            Consultation.countDocuments({ ...dateFilter, status: "Pending" }),
            Consultation.countDocuments({ ...dateFilter, status: "Contacted" }),
            Consultation.countDocuments({ ...dateFilter, status: "Resolved" }),
            Consultation.find(dateFilter).sort({ createdAt: -1 }).limit(5),
        ]);

        res.json({
            success: true,
            data: {
                totalUsers,
                activeUsers,
                totalEvents,
                totalConsultations: consultationsCount,
                consultationBreakdown: {
                    pending: pendingConsultations,
                    contacted: contactedConsultations,
                    resolved: resolvedConsultations,
                },
                recentConsultations,
            },
        });
    } catch (error) {
        console.error("Get dashboard analytics error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
