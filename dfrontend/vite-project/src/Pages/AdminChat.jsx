import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import AdminSidebar from '../Components/Admin/AdminSidebar';
import { Search, User, Send, Clock, MessageCircle } from 'lucide-react';
import { io } from 'socket.io-client';
import axios from 'axios';
import './AdminChat.css';
import './AdminDashboard.css';

const socket = io(`http://${window.location.hostname}:9000`, {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
});

socket.on('connect_error', (err) => {
    console.error("[SOCKET ADMIN] Connection Error:", err.message);
});

const AdminChat = () => {
    const [activeChats, setActiveChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [isConnected, setIsConnected] = useState(socket.connected);
    const chatEndRef = useRef(null);

    // Initial Fetch & Socket Listeners
    useEffect(() => {
        fetchActiveChats();

        const onConnect = () => {
            console.log("[SOCKET ADMIN] Connected!");
            setIsConnected(true);
            socket.emit('join_room', 'admins');
        };

        const onDisconnect = () => {
            console.log("[SOCKET ADMIN] Disconnected");
            setIsConnected(false);
        };

        const onReceiveMessage = (data) => {
            console.log("[SOCKET ADMIN] Raw message received:", data);
            
            // 1. Update Sidebar List
            setActiveChats((prev) => {
                const existingIndex = prev.findIndex(chat => chat._id === data.roomId);
                const updatedChat = {
                    _id: data.roomId,
                    senderName: data.senderName,
                    lastMessage: data.message,
                    timestamp: data.timestamp
                };

                if (existingIndex !== -1) {
                    const newList = [...prev];
                    newList[existingIndex] = updatedChat;
                    // Move to top
                    const item = newList.splice(existingIndex, 1)[0];
                    return [item, ...newList];
                } else {
                    // New chat from a new user
                    return [updatedChat, ...prev];
                }
            });

            // 2. Update current messages if it's the open chat
            if (selectedChat && selectedChat._id === data.roomId) {
                setMessages((prev) => {
                    // Duplicate check
                    const isDup = prev.some(m => 
                        m.senderId === data.senderId &&
                        m.message === data.message &&
                        Math.abs(new Date(m.timestamp) - new Date(data.timestamp)) < 2000
                    );
                    if (isDup) return prev;
                    return [...prev, data];
                });
            }
        };

        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);
        socket.on('receive_message', onReceiveMessage);

        if (socket.connected) onConnect();

        return () => {
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
            socket.off('receive_message', onReceiveMessage);
        };
    }, [selectedChat]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const fetchActiveChats = async () => {
        try {
            const res = await axios.get(`http://${window.location.hostname}:9000/admin/chat/active`);
            if (res.data.success) {
                setActiveChats(res.data.data);
            }
        } catch (err) {
            console.error('[ADMIN] Error fetching active chats:', err);
        }
    };

    const handleSelectChat = async (chat) => {
        setSelectedChat(chat);
        socket.emit('join_room', chat._id);
        try {
            const res = await axios.get(`http://${window.location.hostname}:9000/admin/chat/${chat._id}`);
            if (res.data.success) {
                setMessages(res.data.data);
            }
        } catch (err) {
            console.error('[ADMIN] Error fetching chat history:', err);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        const trimmedMsg = newMessage.trim();
        if (!trimmedMsg || !selectedChat) return;

        const messageData = {
            roomId: selectedChat._id,
            senderId: 'admin_support',
            senderName: 'Admin Support',
            message: trimmedMsg,
            isAdmin: true,
            timestamp: new Date().toISOString(),
        };

        // Optimistic update
        setMessages((prev) => [...prev, messageData]);
        setNewMessage('');

        // Socket emit
        socket.emit('send_message', messageData);

        // Update sidebar as well
        setActiveChats(prev => {
            const idx = prev.findIndex(c => c._id === selectedChat._id);
            if (idx !== -1) {
                const newList = [...prev];
                newList[idx] = { ...newList[idx], lastMessage: trimmedMsg, timestamp: messageData.timestamp };
                return newList;
            }
            return prev;
        });

        // Save to DB
        try {
            await axios.post(`http://${window.location.hostname}:9000/admin/chat`, messageData);
        } catch (err) {
            console.error('[ADMIN] Save error:', err);
        }
    };

    const filteredChats = activeChats.filter(chat =>
        chat.senderName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="admin-layout">
            <AdminSidebar />
            
            <main className="admin-main chat-main-container">
                <div className="admin-chat-layout-premium">
                    <aside className="chat-sidebar-premium">
                        <div className="sidebar-header-premium">
                            <h1>Messenger</h1>
                            <div className="search-container-premium">
                                <Search size={18} className="search-icon" />
                                <input
                                    type="text"
                                    placeholder="Search chats..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="chat-list-premium">
                            {filteredChats.length > 0 ? (
                                filteredChats.map((chat) => (
                                    <motion.div
                                        key={chat._id}
                                        className={`chat-card-premium ${selectedChat?._id === chat._id ? 'selected' : ''}`}
                                        onClick={() => handleSelectChat(chat)}
                                        whileHover={{ x: 5 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <div className="avatar-wrapper">
                                            <div className="avatar-small">
                                                <User size={20} />
                                            </div>
                                            <div className="online-indicator"></div>
                                        </div>
                                        <div className="card-content">
                                            <div className="card-top">
                                                <span className="username-text text-truncate">{chat.senderName}</span>
                                                <span className="time-text">
                                                    {new Date(chat.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <p className="latest-msg-text text-truncate">{chat.lastMessage}</p>
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <div style={{ padding: '2rem', textAlign: 'center', opacity: 0.5 }}>
                                    No active chats
                                </div>
                            )}
                        </div>
                    </aside>

                    <section className="chat-viewport-premium">
                        {selectedChat ? (
                            <div className="active-chat-container">
                                <header className="chat-view-header">
                                    <div className="current-user-info">
                                        <div className="avatar-medium">
                                            <User size={24} />
                                        </div>
                                        <div className="user-details">
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <h3>{selectedChat.senderName}</h3>
                                                <div 
                                                    style={{ 
                                                        width: '8px', 
                                                        height: '8px', 
                                                        borderRadius: '50%', 
                                                        background: isConnected ? '#10b981' : '#ef4444',
                                                        boxShadow: isConnected ? '0 0 10px #10b981' : 'none'
                                                    }} 
                                                    title={isConnected ? 'Connected' : 'Disconnected'}
                                                />
                                            </div>
                                            <p className="user-status">{isConnected ? 'Online' : 'Offline'} • ID: {selectedChat._id.slice(-6)}</p>
                                        </div>
                                    </div>
                                </header>

                                <div className="messages-flow-premium">
                                    {messages.map((msg, idx) => (
                                        <motion.div 
                                            key={idx} 
                                            className={`msg-row ${msg.isAdmin ? 'sent' : 'received'}`}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                        >
                                            <div className="msg-bubble-premium shadow-sm">
                                                <p>{msg.message}</p>
                                                <span className="msg-time-badge">
                                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </motion.div>
                                    ))}
                                    <div ref={chatEndRef} />
                                </div>

                                <footer className="chat-input-footer">
                                    <form className="input-bar-premium" onSubmit={handleSendMessage}>
                                        <input
                                            type="text"
                                            placeholder="Write a message..."
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                        />
                                        <button type="submit" className="send-btn-premium" disabled={!newMessage.trim()}>
                                            <Send size={20} />
                                        </button>
                                    </form>
                                </footer>
                            </div>
                        ) : (
                            <div className="chat-placeholder-state">
                                <div className="placeholder-inner">
                                    <div className="icon-circle">
                                        <MessageCircle size={48} />
                                    </div>
                                    <h2>Your Conversations</h2>
                                    <p>Select a message from the sidebar to view the full history and reply to your users.</p>
                                </div>
                            </div>
                        )}
                    </section>
                </div>
            </main>
        </div>
    );
};

export default AdminChat;
