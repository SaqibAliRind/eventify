import express from "express";
import { getAllUsers, toggleUserStatus, updateUserRole, deleteUser } from "../Controllers/AdminController.js";
import { createCategory, getCategories, updateCategory, deleteCategory, toggleCategoryHome } from "../Controllers/CategoryController.js";
import { createEvent, getEvents, updateEvent, deleteEvent, getRelatedEvents } from "../Controllers/EventController.js";
import { saveMessage, getChatHistory, getActiveChats, deleteChatRoom } from "../Controllers/ChatController.js";
import { getConsultations, updateConsultationStatus, deleteConsultation } from "../Controllers/ConsultationController.js";
import { getAllReviewsAdmin, toggleReviewApproval, deleteReview } from "../Controllers/ReviewController.js";
import { getAuditLogs, getDashboardAnalytics } from "../Controllers/AdminDashboardController.js";
import { sendBulkNotification } from "../Controllers/NotificationController.js";
import { exportUsersCSV, exportConsultationsCSV, exportEventsCSV, exportAuditLogCSV } from "../Controllers/ExportController.js";
import authUser from "../Middleware/Authuser.js";
import adminAuth from "../Middleware/AdminMiddleware.js";

const AdminRouter = express.Router();

import {
  eventSchema,
  categorySchema,
  chatMessageSchema,
  validateBody,
} from "../Middleware/Validation.js";

// Enable protection for all admin routes
AdminRouter.use(authUser, adminAuth);

// Dashboard Analytics & Audit Logs
AdminRouter.get("/analytics", getDashboardAnalytics);
AdminRouter.get("/audit-logs", getAuditLogs);

// User Management Routes
AdminRouter.get("/users", getAllUsers);
AdminRouter.patch("/users/:id/status", toggleUserStatus);
AdminRouter.patch("/users/:id/role", updateUserRole);
AdminRouter.delete("/users/:id", deleteUser);

// Category Management Routes
AdminRouter.post("/categories", validateBody(categorySchema), createCategory);
AdminRouter.get("/categories", getCategories);
AdminRouter.put("/categories/:id", validateBody(categorySchema), updateCategory);
AdminRouter.delete("/categories/:id", deleteCategory);
AdminRouter.patch("/categories/:id/home", toggleCategoryHome);

// Event Management Routes
AdminRouter.post("/events", validateBody(eventSchema), createEvent);
AdminRouter.get("/events", getEvents);
AdminRouter.put("/events/:id", validateBody(eventSchema), updateEvent);
AdminRouter.delete("/events/:id", deleteEvent);
AdminRouter.get("/events/:id/related", getRelatedEvents);

// Chat Management Routes
AdminRouter.get("/chat/active", getActiveChats);
AdminRouter.get("/chat/:roomId", getChatHistory);
AdminRouter.post("/chat", validateBody(chatMessageSchema), saveMessage);
AdminRouter.delete("/chat/:roomId", deleteChatRoom);

// Consultation Management Routes
AdminRouter.get("/consultations", getConsultations);
AdminRouter.patch("/consultations/:id", updateConsultationStatus);
AdminRouter.patch("/consultations/:id/status", updateConsultationStatus);
AdminRouter.delete("/consultations/:id", deleteConsultation);

// Review Management Routes
AdminRouter.get("/reviews", getAllReviewsAdmin);
AdminRouter.patch("/reviews/:id/approve", toggleReviewApproval);
AdminRouter.delete("/reviews/:id", deleteReview);

// Notification Management Routes
AdminRouter.post("/notifications/send", sendBulkNotification);

// CSV Export Routes
AdminRouter.get("/export/users", exportUsersCSV);
AdminRouter.get("/export/consultations", exportConsultationsCSV);
AdminRouter.get("/export/events", exportEventsCSV);
AdminRouter.get("/export/audit-log", exportAuditLogCSV);

export default AdminRouter;
