import React, { useState } from 'react';
import { API_URL } from '../config';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Phone,
    Mail,
    MapPin,
    Send,
    Facebook,
    Twitter,
    Instagram,
    MessageCircle,
    Clock,
    Calendar
} from 'lucide-react';
import './Contact.css';

const Contact = () => {
    const formRef = React.useRef(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        eventDate: '',
        eventType: '',
        message: ''
    });

    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const handleFormChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleScrollToForm = () => {
        formRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_URL}/user/consultation`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (data.success) {
                setShowSuccessModal(true);
                setFormData({
                    name: '',
                    email: '',
                    phone: '',
                    eventDate: '',
                    eventType: '',
                    message: ''
                });
            } else {
                alert(data.message || 'Something went wrong. Please try again.');
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            alert('Failed to send message. Please try again later.');
        }
    };

    return (
        <div className="contact-page">
            {/* Hero Section */}
            <section className="contact-hero">
                <div className="contact-hero-background">
                    <img
                        src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=2069&auto=format&fit=crop"
                        alt="Contact Us"
                    />
                </div>
                <motion.div
                    className="contact-hero-content"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <h1>Get In <span className="gradient-text">Touch</span></h1>
                    <p>Let's start planning your dream event together</p>
                </motion.div>
            </section>

            {/* Contact Information & Form Section */}
            <section className="contact-main-section">
                <div className="container">
                    <div className="contact-grid">
                        {/* Contact Information */}
                        <motion.div
                            className="contact-info-card glass-card"
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <h2>Contact <span className="gradient-text">Information</span></h2>
                            <p className="contact-intro">
                                We'd love to hear about your wedding plans. Reach out to us and
                                let's create something magical together.
                            </p>

                            <div className="contact-details">
                                <div className="contact-detail-item">
                                    <div className="contact-icon">
                                        <Phone />
                                    </div>
                                    <div className="contact-text">
                                        <h4>Phone</h4>
                                        <p>+1 (555) 123-4567</p>
                                        <p>+1 (555) 987-6543</p>
                                    </div>
                                </div>

                                <div className="contact-detail-item">
                                    <div className="contact-icon">
                                        <Mail />
                                    </div>
                                    <div className="contact-text">
                                        <h4>Email</h4>
                                        <p>hello@weddingplanner.com</p>
                                        <p>info@weddingplanner.com</p>
                                    </div>
                                </div>

                                <div className="contact-detail-item">
                                    <div className="contact-icon">
                                        <MapPin />
                                    </div>
                                    <div className="contact-text">
                                        <h4>Office Address</h4>
                                        <p>123 Wedding Lane</p>
                                        <p>Love City, LC 12345</p>
                                    </div>
                                </div>

                                <div className="contact-detail-item">
                                    <div className="contact-icon">
                                        <Clock />
                                    </div>
                                    <div className="contact-text">
                                        <h4>Business Hours</h4>
                                        <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
                                        <p>Saturday: 10:00 AM - 4:00 PM</p>
                                        <p>Sunday: By Appointment</p>
                                    </div>
                                </div>
                            </div>

                            <div className="contact-social">
                                <h4>Follow Us</h4>
                                <div className="social-links">
                                    <a href="#" aria-label="Facebook">
                                        <Facebook />
                                    </a>
                                    <a href="#" aria-label="Instagram">
                                        <Instagram />
                                    </a>
                                    <a href="#" aria-label="Twitter">
                                        <Twitter />
                                    </a>
                                    <a href="https://wa.me/1234567890" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
                                        <MessageCircle />
                                    </a>
                                </div>
                            </div>
                        </motion.div>

                        {/* Contact Form */}
                        <motion.form
                            ref={formRef}
                            className="contact-form-card glass-card"
                            onSubmit={handleFormSubmit}
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <h2>Send Us a <span className="gradient-text">Message</span></h2>
                            <p className="form-intro">
                                Fill out the form below and we'll get back to you within 24 hours.
                            </p>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="name">Your Name *</label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        placeholder="John & Jane Doe"
                                        value={formData.name}
                                        onChange={handleFormChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="email">Email Address *</label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        placeholder="your@email.com"
                                        value={formData.email}
                                        onChange={handleFormChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="phone">Phone Number *</label>
                                    <input
                                        type="tel"
                                        id="phone"
                                        name="phone"
                                        placeholder="+1 (555) 000-0000"
                                        value={formData.phone}
                                        onChange={handleFormChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="eventDate">Event Date</label>
                                    <input
                                        type="date"
                                        id="eventDate"
                                        name="eventDate"
                                        value={formData.eventDate}
                                        onChange={handleFormChange}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="eventType">Event Type *</label>
                                <select
                                    id="eventType"
                                    name="eventType"
                                    value={formData.eventType}
                                    onChange={handleFormChange}
                                    required
                                >
                                    <option value="">Select Event Type</option>
                                    <option value="wedding">Wedding</option>
                                    <option value="mehndi">Mehndi</option>
                                    <option value="nikkah">Nikkah</option>
                                    <option value="engagement">Engagement</option>
                                    <option value="birthday">Birthday</option>
                                    <option value="corporate">Corporate Event</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="message">Tell Us About Your Event *</label>
                                <textarea
                                    id="message"
                                    name="message"
                                    placeholder="Share your vision, ideas, and any specific requirements..."
                                    value={formData.message}
                                    onChange={handleFormChange}
                                    rows="6"
                                    required
                                ></textarea>
                            </div>

                            <button type="submit" className="btn-primary">
                                Send Message <Send size={18} />
                            </button>
                        </motion.form>
                    </div>
                </div>
            </section>

            {/* Map Section (Optional) */}
            <section className="map-section">
                <div className="map-placeholder">
                    <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.1841374555814!2d-73.98784368459395!3d40.74844097932847!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c259a9b3117469%3A0xd134e199a405a163!2sEmpire%20State%20Building!5e0!3m2!1sen!2sus!4v1234567890123!5m2!1sen!2sus"
                        width="100%"
                        height="450"
                        style={{ border: 0 }}
                        allowFullScreen=""
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title="Office Location"
                    ></iframe>
                </div>
            </section>

            {/* Success Modal */}
            <AnimatePresence>
                {showSuccessModal && (
                    <div className="modal-overlay" style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 1000,
                        backdropFilter: 'blur(5px)'
                    }}>
                        <motion.div
                            className="success-modal glass-card"
                            initial={{ opacity: 0, scale: 0.8, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.8, y: 20 }}
                            style={{
                                background: 'rgba(26, 26, 26, 0.95)',
                                padding: '3rem',
                                borderRadius: '20px',
                                textAlign: 'center',
                                maxWidth: '450px',
                                width: '90%',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)'
                            }}
                        >
                            <div style={{
                                width: '80px',
                                height: '80px',
                                background: 'linear-gradient(135deg, #ff8a00, #e52e71)',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 1.5rem',
                                boxShadow: '0 10px 20px rgba(229, 46, 113, 0.3)'
                            }}>
                                <Send size={40} color="white" style={{ marginLeft: '4px', marginTop: '4px' }} />
                            </div>

                            <h2 style={{
                                color: 'white',
                                fontSize: '2rem',
                                marginBottom: '1rem',
                                fontFamily: "'Playfair Display', serif"
                            }}>Message Sent!</h2>

                            <p style={{
                                color: '#a0a0a0',
                                marginBottom: '2rem',
                                lineHeight: '1.6',
                                fontSize: '1.1rem'
                            }}>
                                Thank you for reaching out. We've received your inquiry and will get back to you shortly to discuss your dream event.
                            </p>

                            <button
                                onClick={() => setShowSuccessModal(false)}
                                style={{
                                    background: 'linear-gradient(90deg, #ff8a00, #e52e71)',
                                    color: 'white',
                                    border: 'none',
                                    padding: '1rem 2.5rem',
                                    fontSize: '1.1rem',
                                    borderRadius: '50px',
                                    cursor: 'pointer',
                                    fontWeight: '600',
                                    transition: 'transform 0.2s ease',
                                    boxShadow: '0 5px 15px rgba(229, 46, 113, 0.4)'
                                }}
                                onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
                                onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                            >
                                Close
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
};

export default Contact;
