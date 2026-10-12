import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config';
import {
  Search,
  MapPin,
  Layers,
  Calendar,
  CheckCircle2,
  ArrowRight,
  Eye,
  ThumbsUp,
  Clock,
  Star,
  Quote,
  Sparkles,
  Ticket
} from 'lucide-react';
import './Home.css';

const Home = () => {
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchEvent, setSearchEvent] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [searchCategory, setSearchCategory] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventsRes, catsRes, reviewsRes] = await Promise.all([
          axios.get(`${API_URL}/user/events`),
          axios.get(`${API_URL}/user/categories`),
          axios.get(`${API_URL}/user/reviews`)
        ]);

        if (eventsRes.data.success) setEvents(eventsRes.data.data);
        if (catsRes.data.success) setCategories(catsRes.data.data);
        if (reviewsRes.data.success) setReviews(reviewsRes.data.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    const params = new URLSearchParams();
    if (searchEvent.trim()) params.set('search', searchEvent.trim());
    if (searchCategory) params.set('category', searchCategory);
    navigate(`/events?${params.toString()}`);
  };

  const viewDetails = (id) => {
    if (id) navigate(`/events/${id}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Fri, 15 Sep 2026';
    const options = { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' };
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', options);
    } catch {
      return dateString;
    }
  };

  const defaultFeatures = [
    'Bespoke planning & coordination',
    'Curated venue selection & décor',
    'Gourmet catering management',
    'VIP guest concierge',
    'Signature audiovisual themes'
  ];

  const categoryFeatures = {
    Wedding: [
      'End-to-end luxury coordination',
      'Designer floral & lighting décor',
      'Master chef catering management',
      'Dedicated bridal concierge',
      'Customized wedding themes'
    ],
    'Corporate Event': [
      'Executive galas & summits',
      'Team-building experiences',
      'Keynote stage production',
      'VIP lounge setups',
      'Seamless attendee registration'
    ],
    'Birthday Party': [
      'Thematic immersive design',
      'Live entertainment & DJ',
      'Artisanal cake & dessert bar',
      'Cinematic photography',
      'Surprise reveal coordination'
    ],
    Concert: [
      'Arena sound & lighting rigs',
      'Artist & talent hospitality',
      'Fast-track digital ticketing',
      'Crowd safety & VIP zones',
      'Live stream broadcasting'
    ],
    'Product Launch': [
      'Brand reveal stages',
      'Interactive demo stations',
      'Press & influencer lounges',
      'Custom photo moments',
      'High-impact keynote visuals'
    ]
  };

  const getServiceImage = (catName) => {
    const match = events.find((e) => e.category === catName);
    return (
      match?.images?.[0] ||
      'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800'
    );
  };

  const categoryDescriptions = {
    Wedding: 'Bespoke ceremonies and majestic receptions crafted with timeless romance and style.',
    'Corporate Event': 'Prestige corporate summits, annual galas, and brand summits executed with precision.',
    'Birthday Party': 'Unforgettable birthday milestones packed with vibrant energy and personalized decor.',
    Concert: 'Electric live music experiences, state-of-the-art acoustic staging, and star-studded production.',
    'Product Launch': 'Captivate media and industry leaders with unforgettable, high-impact product experiences.'
  };

  const testimonials = [
    {
      name: 'Sarah & Alexander',
      role: 'Grand Royal Wedding',
      text: 'Every single moment exceeded our wildest dreams. The team handled all 450 guests effortlessly, and the floral installations took everyone’s breath away.',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop'
    },
    {
      name: 'Marcus Vance',
      role: 'VP Marketing, Apex Innovators',
      text: 'Our global annual summit was a roaring triumph. The audiovisual production, schedule precision, and concierge were truly world-class.',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop'
    },
    {
      name: 'Amina Al-Mansoor',
      role: 'Host — Sunset Jubilee',
      text: 'The ambiance, custom light mapping, and culinary curation were pure perfection. Our guests are still raving weeks later!',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop'
    }
  ];

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-backdrop-glow"></div>
        <div className="hero-backdrop-glow-secondary"></div>

        {/* Floating Avatars */}
        <motion.div
          className="floating-avatar avatar-1"
          animate={{ y: [0, -18, 0], rotate: [0, 4, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        >
          <img
            src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=400"
            alt="Celebration moment"
          />
        </motion.div>

        <motion.div
          className="floating-avatar avatar-2"
          animate={{ y: [0, 20, 0], rotate: [0, -4, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        >
          <img
            src="https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&q=80&w=400"
            alt="Luxury gala event"
          />
        </motion.div>

        {/* Hero Content */}
        <div className="container hero-container-inner">
          <div className="hero-content">
            <motion.div
              className="hero-badge"
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Sparkles size={14} className="hero-badge-icon" />
              <span>Premier Event Management & Concierge</span>
            </motion.div>

            <motion.h1
              className="hero-title"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
            >
              Crafting Moments That <br />
              <span className="hero-gradient-highlight">Echo For A Lifetime</span>
            </motion.h1>

            <motion.p
              className="hero-subtitle"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
            >
              From royal weddings and signature corporate summits to private milestone galas —
              discover iconic venues, seamless planning, and unforgettable celebrations.
            </motion.p>

            {/* Search Bar */}
            <motion.form
              className="hero-search-bar"
              onSubmit={handleSearch}
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.45 }}
            >
              <div className="search-input-group">
                <Search className="search-icon" size={18} />
                <input
                  type="text"
                  placeholder="Search by event title..."
                  value={searchEvent}
                  onChange={(e) => setSearchEvent(e.target.value)}
                  aria-label="Search events"
                />
              </div>

              <div className="search-divider"></div>

              <div className="search-input-group">
                <MapPin className="search-icon" size={18} />
                <input
                  type="text"
                  placeholder="City or location..."
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  aria-label="Location"
                />
              </div>

              <div className="search-divider"></div>

              <div className="search-input-group select-group">
                <Layers className="search-icon" size={18} />
                <select
                  value={searchCategory}
                  onChange={(e) => setSearchCategory(e.target.value)}
                  aria-label="Select Category"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat, idx) => (
                    <option key={cat._id || idx} value={cat.categoryName}>
                      {cat.categoryName}
                    </option>
                  ))}
                </select>
              </div>

              <button type="submit" className="search-btn-circle" aria-label="Perform search">
                <Search size={20} />
              </button>
            </motion.form>
          </div>
        </div>
      </section>

      {/* ====== SERVICES / CATEGORIES SECTION ====== */}
      <section className="services-section">
        <div className="container">
          <div className="section-header-centered">
            <span className="section-eyebrow">Exquisite Craftsmanship</span>
            <h2 className="section-heading">Our Event Disciplines</h2>
            <p className="section-subheading">
              Tailored orchestrations for life's most momentous occasions and corporate milestones.
            </p>
          </div>

          {loading ? (
            <div className="loading-spinner">Curating services catalog...</div>
          ) : (
            <div className="services-grid">
              {categories.map((cat, idx) => (
                <motion.div
                  className="service-card"
                  key={cat._id || idx}
                  initial={{ opacity: 0, y: 35 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.5, delay: idx * 0.08 }}
                  whileHover={{ y: -8 }}
                >
                  <div className="service-card-image">
                    <img
                      src={getServiceImage(cat.categoryName)}
                      alt={cat.categoryName}
                      loading="lazy"
                    />
                    <span className="service-category-tag">{cat.categoryName}</span>
                  </div>
                  <div className="service-card-body">
                    <h3 className="service-card-title">{cat.categoryName}</h3>
                    <p className="service-card-desc">
                      {categoryDescriptions[cat.categoryName] ||
                        `Signature ${cat.categoryName} experiences tailored to your distinctive vision.`}
                    </p>
                    <ul className="service-features">
                      {(categoryFeatures[cat.categoryName] || defaultFeatures).map((f, i) => (
                        <li key={i}>
                          <CheckCircle2 size={16} className="feature-check" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      className="service-learn-btn"
                      onClick={() =>
                        navigate(`/events?category=${encodeURIComponent(cat.categoryName)}`)
                      }
                    >
                      <span>Explore {cat.categoryName}</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ====== FEATURED UPCOMING EVENTS ====== */}
      <section className="featured-section">
        <div className="container">
          <div className="section-header-split">
            <div>
              <span className="section-eyebrow">Spotlight Celebrations</span>
              <h2 className="section-heading">Featured Events</h2>
            </div>
            <button
              type="button"
              className="view-all-events-btn"
              onClick={() => navigate('/events')}
            >
              <span>Explore All Events</span>
              <ArrowRight size={16} />
            </button>
          </div>

          {loading ? (
            <div className="loading-spinner">Loading premier events...</div>
          ) : (
            <div className="events-grid">
              {events.slice(0, 6).map((event) => (
                <motion.div
                  className="event-card"
                  key={event._id}
                  whileHover={{ y: -6 }}
                  transition={{ duration: 0.25 }}
                >
                  <div className="card-image-wrap" onClick={() => viewDetails(event._id)}>
                    <img
                      src={
                        event.images?.[0] ||
                        'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&q=80&w=800'
                      }
                      alt={event.title}
                      loading="lazy"
                    />
                    <span className="card-tag-pill">{event.tag || event.category || 'Featured'}</span>
                  </div>
                  <div className="card-body">
                    <div className="card-meta-line">
                      <div className="card-date-badge">
                        <Calendar size={14} />
                        <span>{formatDate(event.date)}</span>
                      </div>
                      {event.location && (
                        <div className="card-location-badge">
                          <MapPin size={14} />
                          <span>{event.location}</span>
                        </div>
                      )}
                    </div>

                    <h3 className="card-title" onClick={() => viewDetails(event._id)}>
                      {event.title}
                    </h3>

                    {event.description && (
                      <p className="card-description-snippet">
                        {event.description.length > 95
                          ? `${event.description.substring(0, 95)}...`
                          : event.description}
                      </p>
                    )}

                    <div className="card-footer">
                      <div className="card-guest-stat">
                        <span className="guest-label">Guest Capacity</span>
                        <strong className="guest-value">{event.guests || '350+'} Guests</strong>
                      </div>
                      <button
                        type="button"
                        className="book-now-action-btn"
                        onClick={() => viewDetails(event._id)}
                      >
                        <Ticket size={14} />
                        <span>View Details</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ====== GALLERY SHOWCASE SECTION ====== */}
      <section className="gallery-section">
        <div className="container">
          <div className="gallery-header-wrap">
            <span className="section-eyebrow text-gold">Visual Retrospective</span>
            <h2 className="section-heading text-white">Event Showcase Gallery</h2>
            <p className="gallery-subtitle">
              Glimpses of refined aesthetics, ambient lighting, and bespoke designs delivered across our signature productions.
            </p>
          </div>

          {loading ? (
            <div className="loading-spinner">Loading gallery...</div>
          ) : (
            <div className="gallery-grid">
              {events.slice(0, 6).map((event, idx) => (
                <motion.div
                  className="gallery-card"
                  key={event._id || idx}
                  initial={{ opacity: 0, scale: 0.96 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.4, delay: idx * 0.08 }}
                  onClick={() => viewDetails(event._id)}
                >
                  <div className="gallery-card-img-wrap">
                    <img
                      src={
                        event.images?.[0] ||
                        'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=800'
                      }
                      alt={event.title}
                      loading="lazy"
                    />
                    <div className="gallery-card-overlay">
                      <span className="gallery-view-chip">
                        <Eye size={16} /> View Event
                      </span>
                    </div>
                  </div>
                  <div className="gallery-card-info">
                    <h4 className="gallery-card-title">{event.title}</h4>
                    <p className="gallery-card-studio">
                      {event.category} &bull; {event.location || 'Signature Venue'}
                    </p>
                    <div className="gallery-card-stats">
                      <span>
                        <Clock size={13} /> {formatDate(event.date)}
                      </span>
                      <span>
                        <ThumbsUp size={13} /> {event.guests || '250'} Attended
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ====== TESTIMONIALS SECTION ====== */}
      <section className="testimonials-section">
        <div className="container">
          <div className="section-header-centered">
            <span className="section-eyebrow">Client Endorsements</span>
            <h2 className="section-heading">Words of Gratitude</h2>
            <p className="section-subheading">
              Trusted by couples, executives, and visionaries to turn momentous days into effortless art.
            </p>
          </div>

          <div className="testimonials-grid">
            {(reviews.length > 0 ? reviews : testimonials).map((t, idx) => (
              <motion.div
                className="testimonial-card"
                key={t._id || idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                whileHover={{ y: -6 }}
              >
                <div className="testimonial-quote-icon">
                  <Quote size={28} />
                </div>
                <p className="testimonial-text">"{t.comment || t.text}"</p>
                <div className="testimonial-stars">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={15}
                      className={i < t.rating ? 'star-filled' : 'star-empty'}
                      fill={i < t.rating ? '#d4af37' : 'none'}
                    />
                  ))}
                </div>
                <div className="testimonial-author">
                  <img
                    src={t.userImage || t.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop'}
                    alt={t.userName || t.name}
                    className="testimonial-avatar"
                  />
                  <div className="testimonial-author-info">
                    <strong className="testimonial-name">{t.userName || t.name}</strong>
                    <span className="testimonial-role">{t.role || 'Verified Client'}</span>
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

export default Home;
