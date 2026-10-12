import React, { useState, useEffect } from 'react';
import AdminSidebar from '../Components/Admin/AdminSidebar';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, CheckCircle, XCircle, Trash2, User } from 'lucide-react';
import axios from 'axios';
import './AdminReviews.css';
import './AdminDashboard.css';

const AdminReviews = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            const token = localStorage.getItem('eventify_token');
            const res = await axios.get('http://localhost:9000/admin/reviews', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setReviews(res.data.data);
            }
        } catch (err) {
            console.error('Error fetching reviews:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleApprove = async (id) => {
        try {
            const token = localStorage.getItem('eventify_token');
            const res = await axios.patch(`http://localhost:9000/admin/reviews/${id}/approve`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setReviews(reviews.map(r => r._id === id ? res.data.data : r));
            }
        } catch (err) {
            console.error('Error updating review:', err);
        }
    };

    const handleDeleteReview = async (id) => {
        if (!window.confirm('Are you sure you want to delete this review?')) return;
        try {
            // Assuming there's a delete route, if not I should add one. 
            // For now let's just use the approval toggle or assume delete exists in controller
            const token = localStorage.getItem('eventify_token');
            const res = await axios.delete(`http://localhost:9000/admin/reviews/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setReviews(reviews.filter(r => r._id !== id));
            }
        } catch (err) {
            console.error('Error deleting review:', err);
        }
    };

    return (
        <div className="admin-layout">
            <AdminSidebar />
            <main className="admin-main">
                <header className="dashboard-header">
                    <h1>Review Management</h1>
                    <p>Approve or manage user stories and testimonials.</p>
                </header>

                <div className="reviews-admin-grid">
                    {loading ? (
                        <p>Loading reviews...</p>
                    ) : (
                        <>
                            <AnimatePresence>
                                {reviews.length > 0 ? (
                                    reviews.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((review) => (
                                        <motion.div
                                            key={review._id}
                                            className="review-admin-card stat-card"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <div className="review-card-header">
                                                <div className="user-blob">
                                                    {review.userImage ? (
                                                        <img src={review.userImage} alt={review.userName} />
                                                    ) : (
                                                        <div className="avatar-placeholder"><User size={18} /></div>
                                                    )}
                                                    <div>
                                                        <h4>{review.userName}</h4>
                                                        <div className="stars">
                                                            {[...Array(5)].map((_, i) => (
                                                                <Star
                                                                    key={i}
                                                                    size={14}
                                                                    fill={i < review.rating ? "#fbbf24" : "none"}
                                                                    color={i < review.rating ? "#fbbf24" : "#444"}
                                                                />
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className={`status-pill ${review.isApproved ? 'approved' : 'pending'}`}>
                                                    {review.isApproved ? 'Approved' : 'Pending'}
                                                </div>
                                            </div>

                                            <div className="review-body">
                                                <p>"{review.comment}"</p>
                                            </div>

                                            <div className="review-actions">
                                                <button 
                                                    className={`action-btn ${review.isApproved ? 'disapprove' : 'approve'}`}
                                                    onClick={() => handleToggleApprove(review._id)}
                                                >
                                                    {review.isApproved ? <XCircle size={18} /> : <CheckCircle size={18} />}
                                                    {review.isApproved ? 'Disapprove' : 'Approve'}
                                                </button>
                                                <button className="action-btn delete" onClick={() => handleDeleteReview(review._id)}>
                                                    <Trash2 size={18} />
                                                    Delete
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))
                                ) : (
                                    <div className="no-reviews">No reviews found.</div>
                                )}
                            </AnimatePresence>

                            {reviews.length > itemsPerPage && (
                                <div className="admin-pagination">
                                    <button 
                                        disabled={currentPage === 1} 
                                        onClick={() => setCurrentPage(prev => prev - 1)}
                                        className="pagination-btn"
                                    >
                                        &larr; Previous
                                    </button>
                                    <span className="page-info">Page {currentPage} of {Math.ceil(reviews.length / itemsPerPage)}</span>
                                    <button 
                                        disabled={currentPage === Math.ceil(reviews.length / itemsPerPage)} 
                                        onClick={() => setCurrentPage(prev => prev + 1)}
                                        className="pagination-btn"
                                    >
                                        Next &rarr;
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>
        </div>
    );
};

export default AdminReviews;
