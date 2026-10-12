import express from "express";
import {
  registerUser,
  verifyuer,
  login,
  forgotpassword,
  resetpassword,
  editprofile,
  editpassword,
  resendCode,
} from "../Controllers/UserController.js";
import { createConsultation, getMyConsultations } from "../Controllers/ConsultationController.js";
import { getEvents, getEventById, getRelatedEvents } from "../Controllers/EventController.js";
import { getCategories } from "../Controllers/CategoryController.js";
import { saveMessage, getChatHistory } from "../Controllers/ChatController.js";
import { createReview, getReviews } from "../Controllers/ReviewController.js";
import { getNotifications, markAsRead, markAllAsRead, deleteNotification } from "../Controllers/NotificationController.js";

import authUser, { optionalAuth } from "../Middleware/Authuser.js";

import upload, { validateUploadedImage } from "../Middleware/Multer.js";

import {
  registerSchema,
  loginSchema,
  verifyUserSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  editPasswordSchema,
  editProfileSchema,
  consultationSchema,
  reviewSchema,
  chatMessageSchema,
  validateBody,
} from "../Middleware/Validation.js";

const UserRouter = express.Router();

/* ===== PUBLIC ROUTES ===== */
UserRouter.post("/register", upload.single("image"), validateUploadedImage, validateBody(registerSchema), registerUser);
UserRouter.post("/verify", validateBody(verifyUserSchema), verifyuer);
UserRouter.post("/login", validateBody(loginSchema), login);
UserRouter.post("/forgot-password", validateBody(forgotPasswordSchema), forgotpassword);
UserRouter.post("/reset-password", validateBody(resetPasswordSchema), resetpassword);
UserRouter.post("/resend-code", resendCode);
UserRouter.post("/consultation", validateBody(consultationSchema), createConsultation);

/* ===== EVENT ROUTES ===== */
UserRouter.get("/events", getEvents);
UserRouter.get("/events/:id", getEventById);
UserRouter.get("/events/:id/related", getRelatedEvents);
UserRouter.get("/categories", getCategories);
UserRouter.get("/reviews", getReviews);

/* ===== CHAT ROUTES ===== */
UserRouter.post("/chat", validateBody(chatMessageSchema), saveMessage);
UserRouter.get("/chat/:roomId", optionalAuth, getChatHistory);

/* ===== PROTECTED ROUTES ===== */
UserRouter.get("/consultations/me", authUser, getMyConsultations);
UserRouter.get("/my-consultations", authUser, getMyConsultations);
UserRouter.put("/edit-profile", authUser, upload.single("image"), validateUploadedImage, validateBody(editProfileSchema), editprofile);
UserRouter.put("/edit-password", authUser, validateBody(editPasswordSchema), editpassword);
UserRouter.post("/reviews", authUser, validateBody(reviewSchema), createReview);

/* ===== NOTIFICATION ROUTES (Protected) ===== */
UserRouter.get("/notifications", authUser, getNotifications);
UserRouter.patch("/notifications/read-all", authUser, markAllAsRead);
UserRouter.patch("/notifications/:id/read", authUser, markAsRead);
UserRouter.delete("/notifications/:id", authUser, deleteNotification);

export default UserRouter;
