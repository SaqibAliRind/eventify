import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { API_URL } from '../../config';
import { Bell, X, CheckCheck, Trash2, MessageSquare, Star, Megaphone, Calendar, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../Context/AuthContext';

const TYPE_ICONS = {
  CONSULTATION_STATUS: <MessageSquare size={14} />,
  REVIEW_APPROVED: <Star size={14} />,
  SYSTEM_ANNOUNCEMENT: <Megaphone size={14} />,
  NEW_EVENT: <Calendar size={14} />,
  ACCOUNT_UPDATE: <Shield size={14} />,
};

const TYPE_COLORS = {
  CONSULTATION_STATUS: '#3b82f6',
  REVIEW_APPROVED: '#f59e0b',
  SYSTEM_ANNOUNCEMENT: '#a855f7',
  NEW_EVENT: '#d4af37',
  ACCOUNT_UPDATE: '#10b981',
};

const NotificationBell = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef(null);

  const token = localStorage.getItem('eventify_token');
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const fetchNotifications = useCallback(async () => {
    if (!user || !token) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/user/notifications`, { headers });
      if (res.data.success) {
        setNotifications(res.data.data);
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch {
      // Silent fail – non-critical
    } finally {
      setLoading(false);
    }
  }, [user, token]);

  // Fetch on mount and every 60s
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Close panel when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [open]);

  const handleMarkRead = async (id) => {
    try {
      await axios.patch(`${API_URL}/user/notifications/${id}/read`, {}, { headers });
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {}
  };

  const handleMarkAllRead = async () => {
    try {
      await axios.patch(`${API_URL}/user/notifications/read-all`, {}, { headers });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {}
  };

  const handleDelete = async (id) => {
    const wasUnread = notifications.find((n) => n._id === id)?.isRead === false;
    try {
      await axios.delete(`${API_URL}/user/notifications/${id}`, { headers });
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      if (wasUnread) setUnreadCount((c) => Math.max(0, c - 1));
    } catch {}
  };

  if (!user) return null;

  return (
    <div style={{ position: 'relative' }} ref={panelRef}>
      {/* Bell Button */}
      <button
        type="button"
        id="notification-bell-btn"
        onClick={() => { setOpen((o) => !o); if (!open) fetchNotifications(); }}
        style={{
          position: 'relative',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--text-secondary, #94a3b8)',
          padding: '0.4rem',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          transition: 'color 0.2s',
        }}
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
        title="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '-2px',
            right: '-3px',
            background: '#ef4444',
            color: '#fff',
            fontSize: '0.65rem',
            fontWeight: 800,
            minWidth: '16px',
            height: '16px',
            borderRadius: '9999px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 3px',
            lineHeight: 1,
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            id="notification-panel"
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute',
              top: 'calc(100% + 10px)',
              right: 0,
              width: '340px',
              maxWidth: '95vw',
              background: '#0e1117',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '14px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
              zIndex: 9999,
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '0.85rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.08)'
            }}>
              <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#f8fafc' }}>
                Notifications
                {unreadCount > 0 && (
                  <span style={{ marginLeft: 6, fontSize: '0.75rem', color: '#ef4444', fontWeight: 800 }}>
                    ({unreadCount} new)
                  </span>
                )}
              </span>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllRead}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: '#3b82f6', fontSize: '0.78rem', fontWeight: 600,
                      display: 'flex', alignItems: 'center', gap: 4,
                    }}
                    title="Mark all as read"
                  >
                    <CheckCheck size={13} /> All read
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: 2 }}
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Notification List */}
            <div style={{ maxHeight: '380px', overflowY: 'auto' }}>
              {loading && notifications.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
                  Loading…
                </div>
              ) : notifications.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
                  <Bell size={32} style={{ opacity: 0.3, marginBottom: 8 }} />
                  <p>No notifications yet</p>
                </div>
              ) : (
                <AnimatePresence>
                  {notifications.map((n) => (
                    <motion.div
                      key={n._id}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      style={{
                        display: 'flex',
                        gap: '0.65rem',
                        padding: '0.85rem 1rem',
                        borderBottom: '1px solid rgba(255,255,255,0.05)',
                        background: n.isRead ? 'transparent' : 'rgba(59,130,246,0.06)',
                        cursor: n.link ? 'pointer' : 'default',
                        transition: 'background 0.2s',
                      }}
                      onClick={() => {
                        if (!n.isRead) handleMarkRead(n._id);
                      }}
                    >
                      {/* Type Icon */}
                      <div style={{
                        flexShrink: 0,
                        width: 28, height: 28,
                        borderRadius: '50%',
                        background: `${TYPE_COLORS[n.type] || '#d4af37'}20`,
                        color: TYPE_COLORS[n.type] || '#d4af37',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        marginTop: 2,
                      }}>
                        {TYPE_ICONS[n.type] || <Bell size={13} />}
                      </div>

                      {/* Content */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: n.isRead ? 500 : 700, fontSize: '0.85rem', color: '#f1f5f9', margin: 0, lineHeight: 1.35 }}>
                          {n.title}
                        </p>
                        <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '3px 0 4px', lineHeight: 1.4 }}>
                          {n.message}
                        </p>
                        <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                          {new Date(n.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      {/* Unread dot + delete */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                        {!n.isRead && (
                          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#3b82f6', display: 'block' }} />
                        )}
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleDelete(n._id); }}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', padding: 0 }}
                          title="Remove notification"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
