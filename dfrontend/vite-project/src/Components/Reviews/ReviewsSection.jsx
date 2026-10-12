import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, MessageCircle, Quote } from 'lucide-react';
import axios from 'axios';
import './ReviewsSection.css';

const ReviewsSection = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const res = await axios.get('http://localhost:9000/user/reviews');
                if (res.data.success) {
                    // Get only first 5 for marquee on home
                    setReviews(res.data.data.slice(0, 5));
                }
            } catch (error) {
                console.error('Error fetching reviews:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchReviews();
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.2 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0 }
    };

    if (loading) return null;

    return (
        <section className="reviews-section">
            <div className="container">
                <div className="section-header">
                    <h2>What Our <span className="gradient-text">Clients Say</span></h2>
                    <p>Real stories from wonderful couples we've had the pleasure to work with.</p>
                </div>

                <div className="marquee-container">
                    <motion.div 
                        className="marquee-content"
                        animate={{ x: ["0%", "-50%"] }}
                        transition={{ 
                            duration: 25, 
                            repeat: Infinity, 
                            ease: "linear" 
                        }}
                    >
                        {[...reviews, ...reviews].map((review, idx) => (
                            <div key={`${review._id}-${idx}`} className="review-card glass-card marquee-item">
                                <div className="quote-icon"><Quote size={36} /></div>
                                <div className="rating">
                                    {[...Array(5)].map((_, i) => (
                                        <Star 
                                            key={i} 
                                            size={14} 
                                            fill={i < review.rating ? "#B76E79" : "none"} 
                                            stroke={i < review.rating ? "#B76E79" : "#cbd5e1"} 
                                        />
                                    ))}
                                </div>
                                <p className="review-comment">"{review.comment}"</p>
                                <div className="review-user">
                                    {review.userImage ? (
                                        <img src={review.userImage} alt={review.userName} className="user-avatar" />
                                    ) : (
                                        <div className="user-avatar placeholder">
                                            {review.userName.charAt(0)}
                                        </div>
                                    )}
                                    <div className="user-info">
                                        <h4>{review.userName}</h4>
                                        <span>Verified Client</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </motion.div>
                </div>

                <div className="view-all-reviews">
                    <button onClick={() => window.location.href = '/reviews'} className="btn-secondary">
                        View All Stories <Star size={16} />
                    </button>
                </div>
            </div>
        </section>
    );
};

export default ReviewsSection;
