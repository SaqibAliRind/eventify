import Consultation from "../Models/ConsultationSchema.js";
import User from "../Models/UserSchmea.js";
import jwt from "jsonwebtoken";
import { logAdminAction } from "../Utils/auditLogger.js";
import {
    sendConsultationConfirmationEmail,
    sendAdminConsultationAlertEmail,
    sendConsultationStatusUpdateEmail
} from "../Utils/SendMailer.js";

/* ================= CREATE CONSULTATION (PUBLIC OR AUTHENTICATED) ================= */
export const createConsultation = async (req, res) => {
    try {
        const { name, email, phone, eventDate, eventType, message } = req.body;

        if (!name || !email || !phone || !eventType || !message) {
            return res.status(400).json({ success: false, message: "All required fields must be filled" });
        }

        // Link consultation to user if authenticated or if token present or email matches an account
        let associatedUserId = req.user?._id || null;
        if (!associatedUserId && req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
            try {
                const token = req.headers.authorization.split(" ")[1];
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                if (decoded && decoded.id) {
                    associatedUserId = decoded.id;
                }
            } catch (tokErr) {
                // Ignore token error for public route
            }
        }

        if (!associatedUserId) {
            const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
            if (existingUser) {
                associatedUserId = existingUser._id;
            }
        }

        const newConsultation = new Consultation({
            name,
            email,
            phone,
            eventDate,
            eventType,
            message,
            userId: associatedUserId,
        });

        await newConsultation.save();

        // Phase 4: Email notifications (failures must never crash the request)
        sendConsultationConfirmationEmail({
            to: email,
            name,
            eventType,
            eventDate,
        }).catch((err) => console.error("Consultation user email failed:", err.message));

        sendAdminConsultationAlertEmail({
            name,
            email,
            phone,
            eventType,
            eventDate,
            message,
        }).catch((err) => console.error("Consultation admin email failed:", err.message));

        res.status(201).json({
            success: true,
            message: "Consultation request submitted successfully!",
            data: newConsultation,
        });
    } catch (error) {
        console.error("Create consultation error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

/* ================= GET MY CONSULTATIONS (LOGGED-IN USER) ================= */
export const getMyConsultations = async (req, res) => {
    try {
        const userId = req.user._id;
        const userEmail = req.user.email;

        const consultations = await Consultation.find({
            $or: [
                { userId: userId },
                { email: userEmail }
            ]
        }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: consultations,
        });
    } catch (error) {
        console.error("Get my consultations error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

/* ================= GET ALL CONSULTATIONS (ADMIN WITH FILTER & PAGINATION) ================= */
export const getConsultations = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            search = "",
            status = "",
            eventType = "",
            startDate = "",
            endDate = "",
        } = req.query;

        const query = {};

        // Search by client name, email, or message
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
                { message: { $regex: search, $options: "i" } },
            ];
        }

        // Filter by status
        if (status && status !== "All") {
            query.status = status;
        }

        // Filter by event type
        if (eventType && eventType !== "All") {
            query.eventType = eventType;
        }

        // Date range filter
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                query.createdAt.$lte = end;
            }
        }

        const skip = (Number(page) - 1) * Number(limit);

        const [consultations, total] = await Promise.all([
            Consultation.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit)),
            Consultation.countDocuments(query),
        ]);

        res.status(200).json({
            success: true,
            data: consultations,
            pagination: {
                total,
                page: Number(page),
                pages: Math.ceil(total / Number(limit)),
                limit: Number(limit),
            },
        });
    } catch (error) {
        console.error("Get consultations error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

/* ================= UPDATE CONSULTATION STATUS & NOTES (ADMIN) ================= */
export const updateConsultationStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, adminNotes } = req.body;

        const consultation = await Consultation.findById(id);
        if (!consultation) {
            return res.status(404).json({ success: false, message: "Consultation not found" });
        }

        const oldStatus = consultation.status;
        if (status) consultation.status = status;
        if (adminNotes !== undefined) consultation.adminNotes = adminNotes;

        await consultation.save();

        // Audit Log
        if (req.user) {
            await logAdminAction({
                adminId: req.user._id,
                adminName: req.user.name,
                action: "UPDATE_CONSULTATION",
                targetType: "Consultation",
                targetId: consultation._id,
                details: `Status changed from ${oldStatus} to ${consultation.status}. Notes updated: ${Boolean(adminNotes)}`,
            });
        }

        // Send notification to the user who submitted the consultation (if they have an account)
        if (status && status !== oldStatus && consultation.userId) {
            try {
                const { createNotification } = await import("./NotificationController.js");
                await createNotification({
                    userId: consultation.userId,
                    type: "CONSULTATION_STATUS",
                    title: `Inquiry Update: ${status}`,
                    message: `Your event inquiry has been updated to "${status}". ${adminNotes ? `Admin note: ${adminNotes}` : 'Our team will be in touch shortly.'}`,
                    link: "/my-inquiries",
                });
            } catch (notifErr) {
                console.error("Notification send error (non-fatal):", notifErr);
            }
        }

        // Phase 4: Email notification to user on status update
        if (status && status !== oldStatus && consultation.email) {
            sendConsultationStatusUpdateEmail({
                to: consultation.email,
                name: consultation.name,
                status: consultation.status,
                adminNotes: consultation.adminNotes,
            }).catch((err) => console.error("Consultation update email error (non-fatal):", err.message));
        }

        res.json({
            success: true,
            message: "Consultation inquiry updated successfully",
            data: consultation,
        });
    } catch (error) {
        console.error("Update consultation error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

/* ================= DELETE CONSULTATION (ADMIN) ================= */
export const deleteConsultation = async (req, res) => {
    try {
        const { id } = req.params;
        const consultation = await Consultation.findByIdAndDelete(id);

        if (!consultation) {
            return res.status(404).json({ success: false, message: "Consultation not found" });
        }

        // Audit Log
        if (req.user) {
            await logAdminAction({
                adminId: req.user._id,
                adminName: req.user.name,
                action: "DELETE_CONSULTATION",
                targetType: "Consultation",
                targetId: id,
                details: `Deleted consultation inquiry from ${consultation.name} (${consultation.email})`,
            });
        }

        res.json({
            success: true,
            message: "Consultation inquiry deleted successfully",
        });
    } catch (error) {
        console.error("Delete consultation error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

