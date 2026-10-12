import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, Users, ChevronLeft, ChevronRight, X, ArrowLeft } from 'lucide-react';
import './EventsPage.css'; // Reusing some base styles

const EventDetails = () => {
    const { id } = useParams();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeImage, setActiveImage] = useState(0);
    const [lightboxOpen, setLightboxOpen] = useState(false);

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const response = await axios.get(`http://localhost:9000/user/events/${id}`);
                if (response.data.success) {
                    setEvent(response.data.data);
                }
            } catch (error) {
                console.error('Error fetching event details:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchEvent();
    }, [id]);

    if (loading) {
        return (
            <div className="loading-container" style={{ height: '100vh' }}>
                <div className="premium-loader"></div>
                <p className="loading-text">Loading event details...</p>
            </div>
        );
    }

    if (!event) {
        return (
            <div className="error-container" style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <h2>Event not found</h2>
                <Link to="/events" className="btn-card-action">Back to Events</Link>
            </div>
        );
    }

    const nextImage = () => {
        setActiveImage((prev) => (prev + 1) % event.images.length);
    };

    const prevImage = () => {
        setActiveImage((prev) => (prev - 1 + event.images.length) % event.images.length);
    };

    return (
        <div className="event-details-page container" style={{ paddingTop: '100px', paddingBottom: '50px' }}>
            <Link to="/events" className="back-link" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', color: '#3b82f6', textDecoration: 'none', fontWeight: 'bold' }}>
                <ArrowLeft size={20} /> Back to Celebrations
            </Link>

            <div className="details-layout" style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '40px' }}>
                {/* Image Gallery Section */}
                <div className="gallery-section">
                    <motion.div
                        className="main-image-wrap"
                        style={{ position: 'relative', borderRadius: '15px', overflow: 'hidden', height: '500px', cursor: 'pointer', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                        onClick={() => setLightboxOpen(true)}
                    >
                        <AnimatePresence mode="wait">
                            <motion.img
                                key={activeImage}
                                src={event.images[activeImage]}
                                alt={event.title}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.5 }}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        </AnimatePresence>

                        <div className="gallery-nav" style={{ position: 'absolute', bottom: '20px', right: '20px', display: 'flex', gap: '10px' }}>
                            <button onClick={(e) => { e.stopPropagation(); prevImage(); }} className="btn-pagination" style={{ background: 'rgba(255,255,255,0.8)' }}><ChevronLeft /></button>
                            <button onClick={(e) => { e.stopPropagation(); nextImage(); }} className="btn-pagination" style={{ background: 'rgba(255,255,255,0.8)' }}><ChevronRight /></button>
                        </div>
                    </motion.div>

                    <div className="thumbnail-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '15px', marginTop: '20px' }}>
                        {event.images.map((img, index) => (
                            <motion.div
                                key={index}
                                className={`thumbnail-item ${activeImage === index ? 'active' : ''}`}
                                whileHover={{ scale: 1.05 }}
                                onClick={() => setActiveImage(index)}
                                style={{
                                    height: '80px',
                                    borderRadius: '10px',
                                    overflow: 'hidden',
                                    cursor: 'pointer',
                                    border: activeImage === index ? '3px solid #3b82f6' : '3px solid transparent'
                                }}
                            >
                                <img src={img} alt={`${event.title} ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Content Section */}
                <div className="content-section">
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <span className="card-tag" style={{ position: 'static', marginBottom: '15px', display: 'inline-block' }}>{event.tag}</span>
                        <h1 style={{ fontSize: '2.5rem', marginBottom: '15px', color: '#1e293b' }}>{event.title}</h1>

                        <div className="info-chips" style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginBottom: '25px' }}>
                            <div className="detail-item glass-card" style={{ padding: '10px 15px', borderRadius: '12px' }}>
                                <Calendar size={18} /> <span>{event.date}</span>
                            </div>
                            <div className="detail-item glass-card" style={{ padding: '10px 15px', borderRadius: '12px' }}>
                                <MapPin size={18} /> <span>{event.location}</span>
                            </div>
                            <div className="detail-item glass-card" style={{ padding: '10px 15px', borderRadius: '12px' }}>
                                <Users size={18} /> <span>{event.guests} Guests</span>
                            </div>
                        </div>

                        <div className="description-box" style={{ background: 'rgba(255,255,255,0.5)', padding: '25px', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.3)', backdropFilter: 'blur(10px)' }}>
                            <h3 style={{ marginBottom: '10px' }}>About the Event</h3>
                            <p style={{ lineHeight: '1.8', color: '#475569', fontSize: '1.1rem' }}>{event.description}</p>
                        </div>

                        <button className="btn-card-action" style={{ marginTop: '30px', width: '100%', padding: '15px', fontSize: '1.1rem' }}>
                            Book Your Event Like This
                        </button>
                    </motion.div>
                </div>
            </div>

            {/* Lightbox */}
            <AnimatePresence>
                {lightboxOpen && (
                    <motion.div
                        className="lightbox-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setLightboxOpen(false)}
                    >
                        <motion.div
                            className="lightbox-content"
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.8 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button className="lightbox-close" onClick={() => setLightboxOpen(false)}>
                                <X />
                            </button>
                            <img src={event.images[activeImage]} alt="Event Full Size" style={{ maxHeight: '90vh', maxWidth: '90vw' }} />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default EventDetails;
