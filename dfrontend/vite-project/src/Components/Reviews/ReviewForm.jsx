import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, X, Send, Heart } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../Context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './ReviewForm.css';

const ReviewForm = ({ isOpen, onClose, onSuccess }) => {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [hover, setHover] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [showLoginMsg, setShowLoginMsg] = useState(false);

    React.useEffect(() => {
        let timer;
        if (showLoginMsg) {
            timer = setTimeout(() => {
                setShowLoginMsg(false);
            }, 5000);
        }
        return () => clearTimeout(timer);
    }, [showLoginMsg]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!isAuthenticated) {
            setShowLoginMsg(true);
            return;
        }

        setSubmitting(true);
        try {
            const token = localStorage.getItem('eventify_token');
            const res = await axios.post(`http://${window.location.hostname}:9000/user/reviews`, 
                { rating, comment },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (res.data.success) {
                onSuccess?.();
                onClose();
                setComment('');
                setRating(5);
            }
        } catch (err) {
            console.error('Error submitting review:', err);
            alert(err.response?.data?.message || 'Failed to submit review. Please login.');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="review-modal-overlay" onClick={onClose}>
                <motion.div 
                    className="review-modal-content"
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <button className="close-modal-btn" onClick={onClose}>
                        <X size={24} />
                    </button>

                    <div className="modal-header">
                        <Heart className="heart-icon" fill="#B76E79" color="#B76E79" />
                        <h2>Share Your Story</h2>
                        <p>How was your experience with EventifyPro?</p>
                        
                        <AnimatePresence>
                            {showLoginMsg && (
                                <motion.div 
                                    className="login-warning-banner"
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                >
                                    <p>Phele login kro review dene ke liye! <button onClick={() => navigate('/auth')}>Login</button></p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="rating-selector">
                            {[...Array(5)].map((_, index) => {
                                const starValue = index + 1;
                                return (
                                    <button
                                        type="button"
                                        key={starValue}
                                        className={`star-btn ${starValue <= (hover || rating) ? 'active' : ''}`}
                                        onClick={() => setRating(starValue)}
                                        onMouseEnter={() => setHover(starValue)}
                                        onMouseLeave={() => setHover(0)}
                                    >
                                        <Star size={32} fill={starValue <= (hover || rating) ? "#fbbf24" : "none"} />
                                    </button>
                                );
                            })}
                        </div>

                        <div className="input-group">
                            <label>Your Message</label>
                            <textarea
                                placeholder="Describe your special day..."
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                required
                            />
                        </div>

                        <button type="submit" className="submit-review-btn" disabled={submitting}>
                            {submitting ? 'Sending...' : 'Post Review'}
                            <Send size={18} />
                        </button>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ReviewForm;
