import User from "../Models/UserSchmea.js";
import Consultation from "../Models/ConsultationSchema.js";
import Event from "../Models/EventSchema.js";
import AuditLog from "../Models/AuditLogSchema.js";

/**
 * Converts an array of objects to a CSV string
 */
function toCSV(data, columns) {
    if (!data || data.length === 0) return columns.join(",") + "\n(no data)";
    const header = columns.join(",");
    const rows = data.map((row) =>
        columns
            .map((col) => {
                const val = col.split(".").reduce((obj, key) => obj?.[key], row);
                const str = val === null || val === undefined ? "" : String(val);
                // Escape commas and quotes
                return `"${str.replace(/"/g, '""')}"`;
            })
            .join(",")
    );
    return [header, ...rows].join("\n");
}

/* ================= EXPORT USERS CSV ================= */
export const exportUsersCSV = async (req, res) => {
    try {
        const users = await User.find().sort({ createdAt: -1 }).lean();
        const columns = ["name", "email", "phone", "role", "isVerified", "createdAt"];
        const csv = toCSV(users, columns);

        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", `attachment; filename="eventify_users_${Date.now()}.csv"`);
        res.send(csv);
    } catch (error) {
        console.error("Export users CSV error:", error);
        res.status(500).json({ success: false, message: "Export failed" });
    }
};

/* ================= EXPORT CONSULTATIONS CSV ================= */
export const exportConsultationsCSV = async (req, res) => {
    try {
        const { status } = req.query;
        const query = status && status !== "All" ? { status } : {};
        const consultations = await Consultation.find(query).sort({ createdAt: -1 }).lean();
        const columns = ["name", "email", "phone", "eventType", "eventDate", "status", "message", "adminNotes", "createdAt"];
        const csv = toCSV(consultations, columns);

        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", `attachment; filename="eventify_consultations_${Date.now()}.csv"`);
        res.send(csv);
    } catch (error) {
        console.error("Export consultations CSV error:", error);
        res.status(500).json({ success: false, message: "Export failed" });
    }
};

/* ================= EXPORT EVENTS CSV ================= */
export const exportEventsCSV = async (req, res) => {
    try {
        const events = await Event.find().sort({ createdAt: -1 }).lean();
        const columns = ["title", "category", "date", "location", "guests", "status", "featured", "price", "viewCount", "createdAt"];
        const csv = toCSV(events, columns);

        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", `attachment; filename="eventify_events_${Date.now()}.csv"`);
        res.send(csv);
    } catch (error) {
        console.error("Export events CSV error:", error);
        res.status(500).json({ success: false, message: "Export failed" });
    }
};

/* ================= EXPORT AUDIT LOG CSV ================= */
export const exportAuditLogCSV = async (req, res) => {
    try {
        const { action } = req.query;
        const query = action ? { action: { $regex: action, $options: "i" } } : {};
        const logs = await AuditLog.find(query).sort({ createdAt: -1 }).lean();
        const columns = ["adminName", "action", "targetType", "targetId", "details", "createdAt"];
        const csv = toCSV(logs, columns);

        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", `attachment; filename="eventify_audit_log_${Date.now()}.csv"`);
        res.send(csv);
    } catch (error) {
        console.error("Export audit log CSV error:", error);
        res.status(500).json({ success: false, message: "Export failed" });
    }
};
