import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        type: {
            type: String,
            enum: [
                "CONSULTATION_STATUS",
                "REVIEW_APPROVED",
                "SYSTEM_ANNOUNCEMENT",
                "NEW_EVENT",
                "ACCOUNT_UPDATE",
            ],
            required: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        message: {
            type: String,
            required: true,
            trim: true,
        },
        isRead: {
            type: Boolean,
            default: false,
        },
        link: {
            type: String,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

// Auto-expire notifications after 30 days
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 });

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
