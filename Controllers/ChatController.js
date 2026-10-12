import Chat from "../Models/ChatSchema.js";

/* ================= SAVE MESSAGE ================= */
export const saveMessage = async (req, res) => {
    try {
        const { roomId, senderId, senderName, message, isAdmin } = req.body;

        if (!roomId || !senderId || !message) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        const newMessage = await Chat.create({
            roomId,
            senderId,
            senderName,
            message,
            isAdmin,
        });

        res.status(201).json({
            success: true,
            data: newMessage,
        });
    } catch (error) {
        console.error("Save message error:", error);
        res.status(500).json({ success: false, message: error.message || "Server error" });
    }
};

/* ================= GET CHAT HISTORY ================= */
export const getChatHistory = async (req, res) => {
    try {
        const { roomId } = req.params;

        // If authenticated user, verify they own the room or are admin
        if (req.user) {
            const isOwner = req.user._id.toString() === roomId;
            const isAdmin = req.user.role === 'admin';
            if (!isOwner && !isAdmin) {
                return res.status(403).json({
                    success: false,
                    message: "Forbidden: You are not authorized to view this chat history"
                });
            }
        } else {
            // For unauthenticated requests, require guest session token or matching guest header
            const guestHeader = req.headers['x-guest-id'];
            if (!guestHeader || guestHeader !== roomId) {
                return res.status(403).json({
                    success: false,
                    message: "Forbidden: Unauthorized access to conversation history"
                });
            }
        }

        const messages = await Chat.find({ roomId }).sort({ timestamp: 1 });

        res.json({
            success: true,
            data: messages,
        });
    } catch (error) {
        console.error("Get chat history error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

/* ================= GET ALL ACTIVE CHATS (ADMIN) ================= */
export const getActiveChats = async (req, res) => {
    try {
        const activeChats = await Chat.aggregate([
            { $sort: { timestamp: -1 } },
            {
                $group: {
                    _id: "$roomId",
                    lastMessage: { $first: "$message" },
                    senderName: { $first: "$senderName" },
                    timestamp: { $first: "$timestamp" },
                },
            },
            { $sort: { timestamp: -1 } },
        ]);

        res.json({
            success: true,
            data: activeChats,
        });
    } catch (error) {
        console.error("Get active chats error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

/* ================= DELETE / CLOSE CHAT ROOM (ADMIN) ================= */
export const deleteChatRoom = async (req, res) => {
    try {
        const { roomId } = req.params;
        await Chat.deleteMany({ roomId });

        res.json({
            success: true,
            message: `Conversation room ${roomId} deleted successfully`
        });
    } catch (error) {
        console.error("Delete chat room error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
