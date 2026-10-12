import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Search, User, Send, Clock, MessageSquare, ArrowLeft } from 'lucide-react';
import { io } from 'socket.io-client';
import axios from 'axios';
import AdminSidebar from '../Components/Admin/AdminSidebar';
import { API_URL, SOCKET_URL } from '../config';
import './AdminChat.css';

const getAdminToken = () => localStorage.getItem('eventify_token') || '';

const socket = io(SOCKET_URL, {
  auth: (cb) => {
    cb({ token: getAdminToken() });
  }
});

const AdminChat = () => {
  const [activeChats, setActiveChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileChat, setShowMobileChat] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    const handleConnect = () => {
      socket.emit('join_room', 'admins');
      if (selectedChat) {
        socket.emit('join_room', selectedChat._id);
      }
    };

    if (socket.connected) {
      handleConnect();
    }
    socket.on('connect', handleConnect);

    fetchActiveChats();

    // Poll every 5s to catch new chats and sync state
    const pollInterval = setInterval(fetchActiveChats, 5000);

    const handleReceiveMessage = (data) => {
      // 1. Update the chat list sidebar (bring chat to top with latest message)
      setActiveChats((prev) => {
        const existing = prev.find((chat) => chat._id === data.roomId);
        if (existing) {
          return [
            { ...existing, lastMessage: data.message, timestamp: data.timestamp || new Date() },
            ...prev.filter((chat) => chat._id !== data.roomId)
          ];
        }
        // Brand-new chat room — add it
        return [
          {
            _id: data.roomId,
            senderName: data.senderName || 'Client',
            lastMessage: data.message,
            timestamp: data.timestamp || new Date()
          },
          ...prev
        ];
      });

      // 2. If this room is currently open, push the message into the view
      if (selectedChat && selectedChat._id === data.roomId) {
        setMessages((prev) => {
          const isDuplicate = prev.some(
            (m) => m.message === data.message &&
                   m.senderName === data.senderName &&
                   Math.abs(new Date(m.timestamp) - new Date(data.timestamp)) < 2000
          );
          if (isDuplicate) return prev;
          return [...prev, data];
        });
      }
    };

    socket.on('receive_message', handleReceiveMessage);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('receive_message', handleReceiveMessage);
      clearInterval(pollInterval);
    };
  }, [selectedChat]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchActiveChats = async () => {
    try {
      const token = localStorage.getItem('eventify_token');
      if (!token) return;
      const res = await axios.get(`${API_URL}/admin/chat/active`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setActiveChats(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching active chats:', err);
    }
  };

  const handleSelectChat = async (chat) => {
    setSelectedChat(chat);
    setShowMobileChat(true);
    socket.emit('join_room', chat._id);
    try {
      const token = localStorage.getItem('eventify_token');
      const res = await axios.get(`${API_URL}/admin/chat/${chat._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setMessages(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching chat history:', err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const text = newMessage.trim();
    if (!text || !selectedChat) return;

    const messageData = {
      roomId: selectedChat._id,
      senderId: 'admin_id',
      senderName: 'Concierge Support',
      message: text,
      isAdmin: true,
      timestamp: new Date().toISOString()
    };

    // Optimistically update message stream and sidebar
    setMessages((prev) => [...prev, messageData]);
    setActiveChats((prev) => {
      const existing = prev.find((chat) => chat._id === selectedChat._id);
      if (existing) {
        return [
          { ...existing, lastMessage: text, timestamp: messageData.timestamp },
          ...prev.filter((chat) => chat._id !== selectedChat._id)
        ];
      }
      return prev;
    });
    setNewMessage('');

    // Emit real-time to the client's room
    socket.emit('send_message', messageData);

    try {
      const token = localStorage.getItem('eventify_token');
      await axios.post(`${API_URL}/admin/chat`, messageData, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.error('Error saving message:', err);
    }
  };

  const filteredChats = activeChats.filter((chat) =>
    chat.senderName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <main className="admin-main admin-chat-main-wrapper">
        <div className="admin-chat-container">
          {/* Chat List Sidebar */}
          <div className={`chat-sidebar ${showMobileChat ? 'mobile-hidden' : ''}`}>
            <div className="sidebar-header">
              <div className="chat-title-row">
                <h2>Client Inquiries</h2>
                <span className="active-count-tag">{activeChats.length} active</span>
              </div>
              <div className="search-box">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="chat-list">
              {filteredChats.map((chat) => (
                <div
                  key={chat._id}
                  className={`chat-item ${selectedChat?._id === chat._id ? 'active' : ''}`}
                  onClick={() => handleSelectChat(chat)}
                >
                  <div className="chat-item-avatar">
                    <User size={18} />
                  </div>
                  <div className="chat-item-info">
                    <div className="chat-item-top">
                      <span className="user-name">{chat.senderName || 'Anonymous Client'}</span>
                      <span className="chat-time">
                        {chat.timestamp
                          ? new Date(chat.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          : ''}
                      </span>
                    </div>
                    <p className="last-message">{chat.lastMessage || 'New inquiry conversation'}</p>
                  </div>
                </div>
              ))}

              {filteredChats.length === 0 && (
                <div className="empty-chats-placeholder">
                  <MessageSquare size={32} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
                  <p>No active chat conversations</p>
                </div>
              )}
            </div>
          </div>

          {/* Active Conversation Pane */}
          <div className={`chat-main ${!showMobileChat ? 'mobile-hidden' : ''}`}>
            {selectedChat ? (
              <>
                <div className="chat-main-header">
                  <div className="header-user-info">
                    <button
                      type="button"
                      className="mobile-back-chat-btn"
                      onClick={() => setShowMobileChat(false)}
                      aria-label="Back to conversations list"
                    >
                      <ArrowLeft size={18} />
                    </button>
                    <div className="user-avatar-circle">
                      <User size={20} />
                    </div>
                    <div>
                      <h3>{selectedChat.senderName || 'Client Conversation'}</h3>
                      <span className="status-badge online">Live Connection</span>
                    </div>
                  </div>
                </div>

                <div className="chat-messages-container">
                  {messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`message-wrapper ${msg.isAdmin ? 'admin' : 'user'}`}
                    >
                      <div className="message-bubble">
                        <p>{msg.message}</p>
                        <span className="message-time">
                          {msg.timestamp
                            ? new Date(msg.timestamp).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                            : ''}
                        </span>
                      </div>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>

                <form className="chat-input-wrapper" onSubmit={handleSendMessage}>
                  <input
                    type="text"
                    placeholder="Type your response to the client..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                  />
                  <button type="submit" disabled={!newMessage.trim()}>
                    <Send size={18} />
                    <span>Send</span>
                  </button>
                </form>
              </>
            ) : (
              <div className="empty-chat-state">
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                  <Clock size={52} color="#64748b" style={{ margin: '0 auto 1rem' }} />
                  <h3>Select a conversation</h3>
                  <p>Choose an ongoing client message thread from the sidebar to begin chatting.</p>
                </motion.div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminChat;
