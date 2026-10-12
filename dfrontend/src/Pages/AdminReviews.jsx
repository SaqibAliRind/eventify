import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import AdminSidebar from '../Components/Admin/AdminSidebar';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Star, Trash2, Check, X, Loader2, MessageSquare, ThumbsUp } from 'lucide-react';
import './CategoryList.css';

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All'); // 'All', 'Approved', 'Pending'

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('eventify_token');
      const res = await axios.get(`${API_URL}/admin/reviews`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setReviews(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching admin reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleToggleApproval = async (id) => {
    try {
      const token = localStorage.getItem('eventify_token');
      const res = await axios.patch(`${API_URL}/admin/reviews/${id}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setReviews((prev) =>
          prev.map((r) => (r._id === id ? { ...r, isApproved: res.data.data.isApproved } : r))
        );
      }
    } catch (err) {
      console.error('Error toggling approval:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this testimonial?')) return;
    try {
      const token = localStorage.getItem('eventify_token');
      const res = await axios.delete(`${API_URL}/admin/reviews/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setReviews((prev) => prev.filter((r) => r._id !== id));
      }
    } catch (err) {
      console.error('Error deleting review:', err);
    }
  };

  const filteredReviews = reviews.filter((r) => {
    const matchesSearch =
      r.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.comment?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      filterStatus === 'All'
        ? true
        : filterStatus === 'Approved'
        ? r.isApproved === true
        : r.isApproved === false;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <main className="admin-main">
        <div className="category-list-wrapper">
          <div className="page-header">
            <div>
              <h1 className="page-title">Reviews & Testimonials Moderation</h1>
              <p className="page-subtitle">Approve, verify ratings, or remove client experience feedback.</p>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="controls-bar" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div className="search-box" style={{ flex: 1, minWidth: '260px' }}>
              <Search size={18} />
              <input
                type="text"
                placeholder="Search reviews by client or comment..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {['All', 'Approved', 'Pending'].map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setFilterStatus(status)}
                  className={`btn-action-view ${filterStatus === status ? 'active' : ''}`}
                  style={{
                    padding: '0.55rem 1.1rem',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    background: filterStatus === status ? 'rgba(59, 130, 246, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                    color: filterStatus === status ? '#60a5fa' : '#94a3b8',
                    border: filterStatus === status ? '1px solid #3b82f6' : '1px solid rgba(255, 255, 255, 0.1)',
                    cursor: 'pointer'
                  }}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Reviews Table */}
          <div className="table-container">
            {loading ? (
              <div className="loading-spinner">
                <Loader2 className="animate-spin" size={40} />
                <span style={{ marginTop: '0.75rem', fontSize: '0.9rem' }}>Loading reviews...</span>
              </div>
            ) : filteredReviews.length === 0 ? (
              <div className="empty-state">
                <MessageSquare size={48} className="empty-icon" />
                <p>No reviews found matching your filter criteria.</p>
              </div>
            ) : (
              <div className="table-responsive-wrapper">
                <table className="categories-table">
                  <thead>
                    <tr>
                      <th>Client</th>
                      <th>Rating</th>
                      <th>Comment</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th style={{ textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence mode="popLayout">
                      {filteredReviews.map((r) => (
                        <motion.tr
                          key={r._id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          layout
                        >
                          <td style={{ fontWeight: 600 }}>{r.userName}</td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#f59e0b' }}>
                              {Array.from({ length: 5 }).map((_, idx) => (
                                <Star
                                  key={idx}
                                  size={14}
                                  fill={idx < r.rating ? '#f59e0b' : 'transparent'}
                                  color={idx < r.rating ? '#f59e0b' : '#64748b'}
                                />
                              ))}
                              <span style={{ marginLeft: '4px', color: '#f8fafc', fontSize: '0.85rem' }}>
                                ({r.rating})
                              </span>
                            </div>
                          </td>
                          <td style={{ maxWidth: '300px', fontSize: '0.88rem', color: '#cbd5e1' }}>
                            "{r.comment}"
                          </td>
                          <td>
                            <span
                              style={{
                                display: 'inline-block',
                                padding: '0.25rem 0.65rem',
                                borderRadius: '9999px',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                background: r.isApproved ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                                color: r.isApproved ? '#34d399' : '#f87171',
                                border: r.isApproved ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)'
                              }}
                            >
                              {r.isApproved ? 'Approved' : 'Pending'}
                            </span>
                          </td>
                          <td className="date-cell">
                            {new Date(r.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </td>
                          <td>
                            <div className="table-actions-cell" style={{ justifyContent: 'center' }}>
                              <button
                                type="button"
                                onClick={() => handleToggleApproval(r._id)}
                                className={r.isApproved ? 'btn-action-delete' : 'btn-action-edit'}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  fontSize: '0.8rem',
                                  padding: '0.35rem 0.75rem'
                                }}
                                title={r.isApproved ? 'Unapprove review' : 'Approve review'}
                              >
                                {r.isApproved ? <X size={13} /> : <Check size={13} />}
                                {r.isApproved ? 'Unapprove' : 'Approve'}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(r._id)}
                                className="btn-action-delete"
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  fontSize: '0.8rem',
                                  padding: '0.35rem 0.75rem'
                                }}
                                title="Delete review"
                              >
                                <Trash2 size={13} /> Delete
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminReviews;
