import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
    {
        adminId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        adminName: {
            type: String,
            required: true,
        },
        action: {
            type: String,
            required: true, // e.g. "CREATE_EVENT", "DELETE_USER", "UPDATE_CONSULTATION_STATUS"
        },
        targetType: {
            type: String,
            required: true, // "Event", "Category", "User", "Review", "Consultation"
        },
        targetId: {
            type: String,
            default: "",
        },
        details: {
            type: String,
            default: "",
        },
    },
    {
        timestamps: true,
    }
);

auditLogSchema.index({ createdAt: -1 });

const AuditLog = mongoose.model("AuditLog", auditLogSchema);
export default AuditLog;
