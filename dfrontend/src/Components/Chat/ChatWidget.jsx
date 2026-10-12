import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, User } from 'lucide-react';
import { io } from 'socket.io-client';
import axios from 'axios';
import { useAuth } from '../../Context/AuthContext';
import { API_URL, SOCKET_URL } from '../../config';
import './ChatWidget.css';

const getAuthToken = () => localStorage.getItem('eventify_token') || '';

const socket = io(SOCKET_URL, {
    auth: (cb) => {
        cb({ token: getAuthToken() });
    }
});

const ChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
    const [serverGuestId, setServerGuestId] = useState(() => localStorage.getItem('chat_guest_id') || '');
    const { user, isAuthenticated } = useAuth();
    const chatEndRef = useRef(null);

    const getGuestId = () => {
        if (serverGuestId) return serverGuestId;
        let gid = localStorage.getItem('chat_guest_id');
        if (!gid) {
            gid = 'guest_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('chat_guest_id', gid);
        }
        return gid;
    };

    const currentUserId = isAuthenticated ? (user?._id || user?.id) : null;
    const roomId = currentUserId || getGuestId();

    useEffect(() => {
        socket.on('session_info', (info) => {
            if (!info.isAuthenticated && info.sessionId) {
                setServerGuestId(info.sessionId);
                localStorage.setItem('chat_guest_id', info.sessionId);
            }
        });

        return () => {
            socket.off('session_info');
        };
    }, []);

    useEffect(() => {
        const joinCurrentRoom = () => {
            if (roomId) {
                socket.emit('join_room', roomId);
            }
        };

        if (socket.connected) {
            joinCurrentRoom();
        }
        socket.on('connect', joinCurrentRoom);

        return () => {
            socket.off('connect', joinCurrentRoom);
        };
    }, [roomId]);

    useEffect(() => {
        if (isOpen && roomId) {
            // Join room
            socket.emit('join_room', roomId);

            // Fetch history
            const fetchHistory = async () => {
                try {
                    const res = await axios.get(`${API_URL}/user/chat/${roomId}`);
                    if (res.data.success) {
                        setChatHistory(res.data.data);
                    }
                } catch (err) {
                    console.error('Error fetching chat history:', err);
                }
            };
            fetchHistory();
        }
    }, [isOpen, roomId]);

    useEffect(() => {
        const handleReceive = (data) => {
            if (data.roomId === roomId) {
                setChatHistory((prev) => {
                    const exists = prev.some(
                        (m) => m.message === data.message && m.senderName === data.senderName && Math.abs(new Date(m.timestamp) - new Date(data.timestamp)) < 2000
                    );
                    if (exists) return prev;
                    return [...prev, data];
                });
            }
        };

        socket.on('receive_message', handleReceive);
        return () => socket.off('receive_message', handleReceive);
    }, [roomId]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        const text = message.trim();
        if (!text) return;

        const senderId = currentUserId || getGuestId();
        const senderName = (isAuthenticated && user?.name) ? user.name : 'Guest Client';

        const messageData = {
            roomId,
            senderId,
            senderName,
            message: text,
            isAdmin: false,
            timestamp: new Date().toISOString(),
        };

        // Optimistically add to local history so message appears immediately
        setChatHistory((prev) => [...prev, messageData]);
        setMessage('');

        // Emit real-time to socket
        socket.emit('send_message', messageData);

        // Save to DB
        try {
            await axios.post(`${API_URL}/user/chat`, messageData);
        } catch (err) {
            console.error('Error saving message:', err);
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
                        </div>

                        <form className="chat-input-area" onSubmit={handleSendMessage}>
                            <input
                                type="text"
                                placeholder="Type a message..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                            />
                            <button type="submit" disabled={!message.trim()}>
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
                        alert('Please login first to chat with admin.');
                        return;
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
