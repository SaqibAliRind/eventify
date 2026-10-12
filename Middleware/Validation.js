import { z } from "zod";

// Password policy: min 8 chars, at least 1 uppercase, 1 lowercase, 1 number
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number");

// ===== Auth Schemas =====
export const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: z.string().trim().email("Invalid email address"),
  password: passwordSchema,
  cpassword: z.string().optional(),
  phone: z.string().trim().min(7, "Phone number is required"),
  role: z.enum(["user", "admin"]).optional(),
});

export const loginSchema = z.object({
  email: z.string().trim().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const verifyUserSchema = z.object({
  email: z.string().trim().email("Invalid email address"),
  code: z.coerce.number().int().positive("Verification code must be a valid number"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Invalid email address"),
});

export const resetPasswordSchema = z.object({
  email: z.string().trim().email("Invalid email address"),
  code: z.coerce.number().int().positive("Reset code must be a valid number"),
  newpassword: passwordSchema,
});

export const editPasswordSchema = z.object({
  currentpassword: z.string().min(1, "Current password is required"),
  newpassword: passwordSchema,
});

export const editProfileSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").optional(),
  phone: z.string().trim().min(7, "Valid phone number required").optional(),
});

// ===== Event Schemas =====
export const eventSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters"),
  category: z.string().trim().min(2, "Category is required"),
  description: z.string().trim().min(10, "Description must be at least 10 characters"),
  date: z.string().trim().min(1, "Date is required"),
  location: z.string().trim().min(2, "Location is required"),
  guests: z.string().trim().min(1, "Guests info is required"),
  tag: z.string().trim().optional(),
  tags: z.array(z.string().trim()).optional(),
  images: z.array(z.string().url("Each image must be a valid URL")).min(5, "At least 5 gallery images are required"),
  price: z.coerce.number().min(0, "Price cannot be negative").optional(),
  capacity: z.coerce.number().min(0, "Capacity cannot be negative").optional(),
  status: z.enum(["Active", "Draft", "Archived"]).optional(),
  featured: z.boolean().optional(),
});

// ===== Category Schemas =====
export const categorySchema = z.object({
  categoryName: z.string().trim().min(2, "Category name must be at least 2 characters"),
});

// ===== Consultation Schemas =====
export const consultationSchema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  email: z.string().trim().email("Valid email is required"),
  phone: z.string().trim().min(7, "Valid phone is required"),
  eventType: z.string().trim().min(2, "Event type is required"),
  eventDate: z.string().trim().optional(),
  message: z.string().trim().min(5, "Message must be at least 5 characters"),
  guests: z.string().trim().optional(),
});

// ===== Review Schemas =====
export const reviewSchema = z.object({
  rating: z.coerce.number().min(1, "Rating must be between 1 and 5").max(5, "Rating must be between 1 and 5"),
  comment: z.string().trim().min(3, "Review comment must be at least 3 characters"),
});

// ===== Chat Schemas =====
export const chatMessageSchema = z.object({
  roomId: z.string().trim().min(1, "Room ID is required"),
  senderId: z.string().trim().min(1, "Sender ID is required"),
  senderName: z.string().trim().min(1, "Sender name is required"),
  message: z.string().trim().min(1, "Message cannot be empty"),
  isAdmin: z.boolean().optional(),
  timestamp: z.string().optional(),
});

// Validation middleware generator
export const validateBody = (schema) => (req, res, next) => {
  try {
    const validated = schema.parse(req.body);
    req.body = validated;
    next();
  } catch (err) {
    if (err && (err.issues || err.errors)) {
      const issueList = err.issues || err.errors || [];
      const messages = issueList.map((e) => e.message);
      return res.status(400).json({
        success: false,
        message: messages[0] || "Validation failed",
        errors: messages,
      });
    }
    next(err);
  }
};
