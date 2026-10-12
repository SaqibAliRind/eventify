import app from "./app.js";
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { Server } from "socket.io";
import http from "http";
import jwt from "jsonwebtoken";
import User from "./Models/UserSchmea.js";
import Chat from "./Models/ChatSchema.js";
import { sendAdminOfflineChatNotification } from "./Utils/SendMailer.js";
import { validateEnv } from "./Utils/validateEnv.js";

dotenv.config({ quiet: true });

// ─── 1. Startup Validation: Refuse to start if required vars missing ───────────
validateEnv();

const DB = process.env.DATABASE;

try {
    await mongoose.connect(DB);
    console.log("connected to MongoDB");
} catch (err) {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
}

const port = process.env.PORT || 9000;
const server = http.createServer(app);

const ALLOWED_ORIGIN = process.env.CLIENT_URL || 'http://localhost:5173';

const io = new Server(server, {
    cors: {
        origin: ALLOWED_ORIGIN,
        methods: ["GET", "POST"]
    }
});

// ─── 2. Socket.io Authentication Middleware ────────────────────────────────────
io.use(async (socket, next) => {
    try {
        const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];
        
        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                const user = await User.findById(decoded.id).select('name email role active');
                
                if (user && user.active !== false) {
                    socket.user = {
                        id: user._id.toString(),
                        name: user.name,
                        role: user.role,
                        isAuthenticated: true
                    };
                    return next();
                } else {
                    return next(new Error("Authentication error: User account inactive or not found"));
                }
            } catch (err) {
                console.warn(`[SOCKET] Token verification failed on socket ${socket.id}: ${err.message}`);
                // Strictly reject connection when invalid or expired token is provided
                return next(new Error(`Authentication error: ${err.message}`));
            }
        }

        // Unauthenticated visitor (no token provided) -> Assign server-generated guest session ID
        const guestId = 'guest_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now().toString(36);
        socket.user = {
            id: guestId,
            name: 'Guest Client',
            role: 'guest',
            isAuthenticated: false
        };
        next();
    } catch (error) {
        next(new Error('Socket authentication error'));
    }
});

// ─── 3. Socket Connection & Guarded Rooms ──────────────────────────────────────
io.on("connection", (socket) => {
    const { id: userId, role, isAuthenticated } = socket.user;
    console.log(`[SOCKET] CONNECTED: ${socket.id} (User: ${userId}, Role: ${role}, Auth: ${isAuthenticated})`);

    // Emit session details back to client so client knows assigned guestId or confirmed user
    socket.emit("session_info", {
        sessionId: userId,
        role,
        isAuthenticated
    });

    socket.on("join_room", (roomId) => {
        if (!roomId || typeof roomId !== 'string') return;

        // Security check: Only verified admins may join the 'admins' room
        if (roomId === "admins") {
            if (role !== "admin") {
                console.warn(`[SOCKET SECURITY] Unauthorized attempt by ${userId} (${role}) to join 'admins' room`);
                socket.emit("error_message", "Forbidden: Admin privilege required to join admins channel");
                return;
            }
        } else {
            // Non-admins can only join their own room, admins can inspect any client room
            if (role !== "admin" && roomId !== userId) {
                console.warn(`[SOCKET SECURITY] Unauthorized attempt by ${userId} to join room ${roomId}`);
                socket.emit("error_message", "Forbidden: You may only join your own conversation");
                return;
            }
        }

        socket.join(roomId);
        console.log(`[SOCKET] ROOM_JOIN: Socket ${socket.id} (${role}) joined => ${roomId}`);
    });

    socket.on("send_message", (data) => {
        if (!data || typeof data !== 'object') return;
        const { roomId, message } = data;

        // Validate payload structure
        if (!roomId || typeof roomId !== 'string' || !message || typeof message !== 'string') {
            socket.emit("error_message", "Invalid message payload structure");
            return;
        }

        // Prevent non-admins from impersonating admins
        const isActuallyAdmin = role === 'admin';
        const senderName = socket.user.name;
        const senderId = socket.user.id;

        const sanitizedPayload = {
            roomId: roomId.trim(),
            senderId,
            senderName,
            message: message.trim().substring(0, 2000), // Enforce length limit
            isAdmin: isActuallyAdmin,
            timestamp: new Date().toISOString()
        };

        // Persist message to database
        Chat.create({
            roomId: sanitizedPayload.roomId,
            senderId: sanitizedPayload.senderId,
            senderName: sanitizedPayload.senderName,
            message: sanitizedPayload.message,
            isAdmin: sanitizedPayload.isAdmin,
        }).catch((err) => console.error("Chat persistence error:", err.message));

        // Broadcast to specific conversation room
        io.to(roomId).emit("receive_message", sanitizedPayload);

        // If from user, broadcast to admins room and check if any admin is online
        if (!isActuallyAdmin) {
            io.to("admins").emit("receive_message", sanitizedPayload);

            // Phase 4 item 3: If no admin is online in 'admins' room, email the admin notification
            const adminRoom = io.sockets.adapter.rooms.get("admins");
            const adminCount = adminRoom ? adminRoom.size : 0;
            if (adminCount === 0) {
                sendAdminOfflineChatNotification({
                    sender: `${senderName} (${senderId})`,
                    message: sanitizedPayload.message,
                }).catch((err) => console.error("Offline chat email alert failed:", err.message));
            }
        }
    });

    // Typing indicator
    socket.on("typing", (data) => {
        if (!data || !data.roomId) return;
        const targetRoom = data.roomId;
        socket.to(targetRoom).emit("user_typing", {
            roomId: targetRoom,
            senderName: socket.user.name,
            isTyping: Boolean(data.isTyping),
        });
    });

    // Close conversation notification
    socket.on("close_conversation", (data) => {
        if (role !== "admin" || !data || !data.roomId) return;
        io.to(data.roomId).emit("conversation_closed", {
            roomId: data.roomId,
            message: "This consultation chat has been marked resolved and closed by Concierge Support."
        });
    });

    socket.on("disconnect", (reason) => {
        console.log(`[SOCKET] DISCONNECTED: ${socket.id} (Reason: ${reason})`);
    });

    socket.on("error", (error) => {
        console.error(`[SOCKET] ERROR on ${socket.id}:`, error);
    });
});

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});



