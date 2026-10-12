import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Heart,
  Calendar,
  Users,
  MapPin,
  Star,
  Sparkles,
  ArrowRight,
  X,
  Info
} from 'lucide-react';
import ReviewsSection from '../Components/Reviews/ReviewsSection';
import { useAuth } from '../Context/AuthContext';
import { useNotification } from '../Context/NotificationContext';
import ReviewForm from '../Components/Reviews/ReviewForm';
import './Home.css';

const Home = () => {
  const { isAuthenticated } = useAuth();
  const { showNotification } = useNotification();
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState('');
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventsRes, catsRes] = await Promise.all([
          axios.get(`http://${window.location.hostname}:9000/user/events`),
          axios.get(`http://${window.location.hostname}:9000/user/categories`)
        ]);

        if (eventsRes.data.success) setEvents(eventsRes.data.data);
        if (catsRes.data.success) setCategories(catsRes.data.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Framer Motion Variants for Staggering
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: 'spring', damping: 15, stiffness: 100 }
    }
  };

  const headerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  const openLightbox = (imageUrl) => {
    setLightboxImage(imageUrl);
    setLightboxOpen(true);
  };

  const viewDetails = (id) => {
    if (id) navigate(`/events/${id}`);
  };

  const viewAllByCategory = (categoryName) => {
    navigate(`/events?category=${encodeURIComponent(categoryName)}`);
  };

  const EventSection = ({ title, subtitle, events, bgColor, categoryName }) => {
    if (events.length === 0) return null;
    return (
      <section className={`event-collection ${bgColor}`}>
        <div className="container">
          <motion.div
            className="section-header"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={headerVariants}
          >
            <div className="header-with-action">
              <div>
                <h2>{title}</h2>
                <p>{subtitle}</p>
              </div>
              <motion.button 
                className="view-more-link"
                whileHover={{ x: 5 }}
                onClick={() => viewAllByCategory(categoryName)}
              >
                View More <ArrowRight size={18} />
              </motion.button>
            </div>
          </motion.div>

          <motion.div
            className="collection-grid"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          >
            {events.slice(0, 3).map((event, index) => (
              <motion.div
                key={event._id || index}
                className="collection-card glass-card"
                variants={itemVariants}
                whileHover={{
                  y: -15,
                  transition: { type: 'spring', stiffness: 300, damping: 10 }
                }}
              >
                <div className="card-img-wrap" onClick={() => openLightbox(event.images?.[0] || 'https://via.placeholder.com/600x400')}>
                  <motion.img
                    src={event.images?.[0] || 'https://via.placeholder.com/600x400'}
                    alt={event.title}
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                  />
                  <motion.span
                    className="card-tag"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    {event.tag || 'Classic'}
                  </motion.span>
                </div>
                <div className="card-info">
                  <h3 className="card-title">{event.title}</h3>
                  <p className="card-description">{event.description}</p>
                  <div className="card-details-grid">
                    <div className="detail-item">
                      <Calendar size={16} />
                      <div className="detail-text">
                        <span className="detail-label">Date</span>
                        <span className="detail-value">{event.date}</span>
                      </div>
                    </div>
                    <div className="detail-item">
                      <MapPin size={16} />
                      <div className="detail-text">
                        <span className="detail-label">Place</span>
                        <span className="detail-value">{event.location || event.place || 'TBD'}</span>
                      </div>
                    </div>
                    <div className="detail-item">
                      <Users size={16} />
                      <div className="detail-text">
                        <span className="detail-label">Guests</span>
                        <span className="detail-value">{event.guests || event.guest || '0'}</span>
                      </div>
                    </div>
                  </div>
                  <motion.button
                    className="btn-card-action"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => viewDetails(event._id)}
                  >
                    View Details <Info size={16} />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    );
  };

  return (
    <div className="wedding-home">
      {/* Hero Section */}
      <section className="hero-wedding">
        <div className="hero-background">
          <motion.img
            src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=2069&auto=format&fit=crop"
            alt="Romantic Wedding Couple"
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
          {loading && (
            <div className="loading-container">
              <div className="premium-loader"></div>
              <p className="loading-text">Preparing your dream experience...</p>
            </div>
          )}
          <div className="hero-overlay"></div>
        </div>

        <motion.div
          className="hero-content"
          initial={{ opacity: 0, x: -200 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.2, ease: "backOut", delay: 0.5 }}
        >
          <motion.div
            className="hero-buttons"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
          >
            <motion.button
              className="btn-primary main-hero-btn"
              whileHover={{
                scale: 1.05,
                boxShadow: "0 10px 30px rgba(183, 110, 121, 0.4)"
              }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/events')}
            >
              Plan Your Dream Event <ArrowRight size={20} />
              <motion.div
                className="btn-shimmer"
                animate={{ x: ["-100%", "200%"] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
            </motion.button>
          </motion.div>
        </motion.div>

        <motion.div
          className="hero-scroll-indicator"
          animate={{ y: [0, 10, 0], opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          ↓
        </motion.div>
      </section>

      {/* Dynamic Category Sections - Show categories enabled by admin */}
      {categories
        .filter(cat => cat.showOnHome)
        .slice(0, 3)
        .map((cat, idx) => (
        <React.Fragment key={cat._id || idx}>
          <EventSection
            title={<>{cat.categoryName?.split(' ')[0]} <span className="gradient-text">{cat.categoryName?.split(' ').slice(1).join(' ') || 'Event'}</span></>}
            subtitle={`Breathtaking ${cat.categoryName} celebrations curated for you.`}
            events={events.filter(e => 
              e.category === cat.categoryName || 
              e.category === cat._id ||
              e.category?.toLowerCase() === cat.categoryName?.toLowerCase()
            )}
            bgColor={idx % 2 === 0 ? "bg-white" : "bg-light"}
            categoryName={cat.categoryName}
          />
          {idx === 1 && (
            <section className="dynamic-banner">
              <motion.div
                className="banner-inner"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 1 }}
              >
                <motion.h2
                  initial={{ scale: 0.5, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 100 }}
                >
                  Crafting <Sparkles className="inline-icon" /> Pure Magic
                </motion.h2>
              </motion.div>
            </section>
          )}
        </React.Fragment>
      ))}

      {/* View All Events Button */}
      <section className="all-events-cta bg-white">
        <div className="container" style={{ textAlign: 'center' }}>
          <motion.button 
            className="btn-primary"
            style={{ padding: '1.2rem 3rem', fontSize: '1.1rem' }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/events')}
          >
            View All Events <ArrowRight size={22} />
          </motion.button>
        </div>
      </section>

      {/* Reviews Section */}
      <ReviewsSection />

      {/* CTA Section with Entrance Animation */}
      <section className="cta-section">
        <div className="container">
          <motion.div
            className="cta-card glass-card"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", duration: 1 }}
          >
            <motion.h2
              animate={{ color: ["#1A1A2E", "#B76E79", "#1A1A2E"] }}
              transition={{ duration: 5, repeat: Infinity }}
            >
              Let's Plan Your <span className="gradient-text">Perfect Event</span> Today
            </motion.h2>
            <p>Ready to create something unforgettable? Our planners are just a click away.</p>
            <div className="cta-btns">
              <motion.button 
                className="btn-primary" 
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/contact#consultation-form')}
              >
                Book Consultation <Calendar size={18} />
              </motion.button>
              <motion.button 
                className="btn-secondary" 
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  if (!isAuthenticated) {
                    showNotification('Please login first to write a review!', 'info');
                  } else {
                    setIsReviewModalOpen(true);
                  }
                }}
              >
                Write a Review <Star size={18} />
              </motion.button>
            </div>
          </motion.div>
        </div>

        <ReviewForm 
          isOpen={isReviewModalOpen} 
          onClose={() => setIsReviewModalOpen(false)} 
          onSuccess={() => {
            // Optionally refresh reviews or show success toast
            console.log('Review submitted successfully');
          }}
        />
      </section>


      {/* Lightbox with Smooth Reveal */}
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
              initial={{ opacity: 0, scale: 0.5, rotate: -5 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ type: "spring", damping: 15 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="lightbox-close" onClick={() => setLightboxOpen(false)}>
                <X />
              </button>
              <img src={lightboxImage} alt="Event" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Home;
