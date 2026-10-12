import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, User, Star } from 'lucide-react';
import { io } from 'socket.io-client';
import axios from 'axios';
import { useAuth } from '../../Context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../Context/NotificationContext';
import './ChatWidget.css';

const socket = io(`http://${window.location.hostname}:9000`, {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000
});

const ChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
    const { user, isAuthenticated } = useAuth();
    const { showNotification } = useNotification();
    const chatEndRef = useRef(null);
    const navigate = useNavigate();

    const getGuestId = () => {
        let gid = localStorage.getItem('chat_guest_id');
        if (!gid) {
            gid = 'guest_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('chat_guest_id', gid);
        }
        return gid;
    };

    // Stable Room ID: User ID or Guest ID
    const [roomId, setRoomId] = useState(getGuestId());

    useEffect(() => {
        const uid = user?.id || user?._id;
        if (isAuthenticated && uid) {
            setRoomId(uid);
        } else {
            setRoomId(getGuestId());
        }
    }, [isAuthenticated, user]);

    // Handle Socket Connection & Room Joining
    useEffect(() => {
        if (!isOpen) return;

        console.log("[CHAT] Window opened. Room:", roomId);
        socket.emit('join_room', roomId);

        const handleReceiveMessage = (data) => {
            console.log("[CHAT] Received from socket:", data);
            setChatHistory((prev) => {
                // Better duplicate check: sender + message + timestamp (within 2s)
                const isDuplicate = prev.some(msg => 
                    msg.senderId === data.senderId && 
                    msg.message === data.message && 
                    Math.abs(new Date(msg.timestamp) - new Date(data.timestamp)) < 2000
                );
                if (isDuplicate) return prev;
                return [...prev, data];
            });
        };

        socket.on('receive_message', handleReceiveMessage);

        // Fetch history immediately
        const fetchHistory = async () => {
            try {
                const res = await axios.get(`http://${window.location.hostname}:9000/user/chat/${roomId}`);
                if (res.data.success) {
                    const history = res.data.data;
                    setChatHistory((prev) => {
                        // Merge history with existing (optimistic) messages
                        const merged = [...history];
                        prev.forEach(pMsg => {
                            const exists = history.some(hMsg => 
                                hMsg.message === pMsg.message && 
                                Math.abs(new Date(hMsg.timestamp) - new Date(pMsg.timestamp)) < 2000
                            );
                            if (!exists) merged.push(pMsg);
                        });
                        return merged.sort((a,b) => new Date(a.timestamp) - new Date(b.timestamp));
                    });
                }
            } catch (err) {
                console.error('[CHAT] History fetch error:', err);
            }
        };

        fetchHistory();

        return () => {
            console.log("[CHAT] Closing window, removing listener");
            socket.off('receive_message', handleReceiveMessage);
        };
    }, [isOpen, roomId]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        const trimmedMsg = message.trim();
        if (!trimmedMsg) return;

        const currentUserId = isAuthenticated ? (user?.id || user?._id) : getGuestId();
        const currentUserName = isAuthenticated ? user?.name : 'Guest User';

        if (!roomId || !currentUserId || !trimmedMsg) {
            console.error("[CHAT] Refusing to send message due to missing data:", { roomId, currentUserId, trimmedMsg });
            return;
        }

        const messageData = {
            roomId,
            senderId: currentUserId,
            senderName: currentUserName,
            message: trimmedMsg,
            isAdmin: false,
            timestamp: new Date().toISOString(),
        };

        // Optimistic UI Update
        setChatHistory(prev => [...prev, messageData]);
        setMessage('');

        // Socket emit
        socket.emit('send_message', messageData);

        // DB Save
        try {
            await axios.post(`http://${window.location.hostname}:9000/user/chat`, messageData);
        } catch (err) {
            console.error('[CHAT] Save error:', err.response?.data || err.message);
        }
    };

    return (
        <div className="chat-widget-container">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="chat-window shadow-lg"
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                    >
                        <div className="chat-header">
                            <div className="chat-header-info">
                                <User size={20} />
                                <span>Support Chat</span>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="close-btn">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="chat-messages">
                            {!isAuthenticated ? (
                                <div className="login-prompt">
                                    <p>Please login first to start chatting with our support team.</p>
                                    <button className="btn-primary" onClick={() => navigate('/auth')}>Login Now</button>
                                </div>
                            ) : (
                                <>
                                    {chatHistory.map((msg, idx) => (
                                        <div key={idx} className={`message-wrapper ${msg.isAdmin ? 'admin' : 'user'}`}>
                                            <div className="message-bubble">
                                                {msg.message}
                                                <span className="message-time">
                                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                    <div ref={chatEndRef} />
                                </>
                            )}
                        </div>

                        <form className="chat-input-area" onSubmit={handleSendMessage}>
                            <input
                                type="text"
                                placeholder={isAuthenticated ? "Type a message..." : "Please login to chat"}
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                disabled={!isAuthenticated}
                            />
                            <button type="submit" disabled={!message.trim() || !isAuthenticated}>
                                <Send size={18} />
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                className="chat-trigger-btn shadow-lg"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                    if (!isAuthenticated) {
                        showNotification('Please login first to start chatting!', 'info');
                    }
                    setIsOpen(!isOpen);
                }}
            >
                {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
            </motion.button>

        </div>
    );
};

export default ChatWidget;
