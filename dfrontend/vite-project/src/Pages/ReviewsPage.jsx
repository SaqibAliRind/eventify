import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, Quote, ChevronLeft } from 'lucide-react';
import axios from 'axios';
import './ReviewsPage.css';

const ReviewsPage = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        window.scrollTo(0, 0);
        const fetchReviews = async () => {
            try {
                const res = await axios.get('http://localhost:9000/user/reviews');
                if (res.data.success) {
                    setReviews(res.data.data);
                }
            } catch (error) {
                console.error('Error fetching reviews:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchReviews();
    }, []);

    if (loading) return (
        <div className="loading-state">
            <div className="loader"></div>
            <p>Loading wonderful stories...</p>
        </div>
    );

    return (
        <div className="reviews-page">
            <header className="reviews-hero">
                <div className="container">
                    <motion.button 
                        className="back-btn"
                        onClick={() => window.history.back()}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <ChevronLeft size={20} /> Back
                    </motion.button>
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        Real Stories from <span className="gradient-text">Happy Couples</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        Read the experiences of couples who celebrated their dream events with us.
                    </motion.p>
                </div>
            </header>

            <section className="all-reviews-grid">
                <div className="container">
                    <div className="grid">
                        {reviews.map((review, idx) => (
                            <motion.div 
                                key={review._id} 
                                className="full-review-card glass-card"
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                            >
                                <div className="quote-icon"><Quote size={40} /></div>
                                <div className="rating">
                                    {[...Array(5)].map((_, i) => (
                                        <Star 
                                            key={i} 
                                            size={18} 
                                            fill={i < review.rating ? "#B76E79" : "none"} 
                                            stroke={i < review.rating ? "#B76E79" : "#cbd5e1"} 
                                        />
                                    ))}
                                </div>
                                <p className="review-text">"{review.comment}"</p>
                                <div className="review-footer">
                                    <div className="user-profile">
                                        {review.userImage ? (
                                            <img src={review.userImage} alt={review.userName} />
                                        ) : (
                                            <div className="avatar-placeholder">{review.userName.charAt(0)}</div>
                                        )}
                                        <div className="user-meta">
                                            <h3>{review.userName}</h3>
                                            <p>{new Date(review.date).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ReviewsPage;
