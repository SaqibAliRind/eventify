import AuditLog from "../Models/AuditLogSchema.js";

export const logAdminAction = async ({ adminId, adminName, action, targetType, targetId = "", details = "" }) => {
    try {
        await AuditLog.create({
            adminId,
            adminName,
            action,
            targetType,
            targetId: targetId ? targetId.toString() : "",
            details,
        });
    } catch (err) {
        console.error("Failed to write audit log:", err.message);
    }
};
