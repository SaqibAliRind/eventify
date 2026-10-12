import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import {
    Calendar,
    MapPin,
    Users,
    ChevronLeft,
    ChevronRight,
    Search,
    Filter,
    Info,
    X
} from 'lucide-react';
import './Home.css';
import './EventsPage.css';

const EventsPage = () => {
    const [events, setEvents] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxImage, setLightboxImage] = useState('');
    const itemsPerPage = 8;
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const categoryParam = searchParams.get('category');

    useEffect(() => {
        if (categoryParam) {
            setSelectedCategory(categoryParam);
        } else {
            setSelectedCategory('All');
        }
    }, [categoryParam]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch events
                const eventsRes = await axios.get(`http://${window.location.hostname}:9000/user/events`);
                if (eventsRes.data.success) {
                    setEvents(eventsRes.data.data);
                }

                // Fetch categories separately
                try {
                    const categoriesRes = await axios.get(`http://${window.location.hostname}:9000/user/categories`);
                    if (categoriesRes.data.success) {
                        setCategories(categoriesRes.data.data);
                    }
                } catch (catError) {
                    console.error('Error fetching categories:', catError);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredEvents = events.filter(event => {
        const matchesCategory = !selectedCategory || selectedCategory === 'All' || event.category === selectedCategory;
        const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            event.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentEvents = filteredEvents.slice(indexOfFirstItem, indexOfLastItem);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const openLightbox = (imageUrl) => {
        setLightboxImage(imageUrl);
        setLightboxOpen(true);
    };

    const viewDetails = (id) => {
        navigate(`/events/${id}`);
    };

    return (
        <div className="events-page">
            {/* Hero Banner Area */}
            <section className="hero-wedding events-hero">
                <div className="hero-background">
                    <img
                        src="https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=2070&auto=format&fit=crop"
                        alt="Elegant Garden Reception in Sunlight"
                    />
                    <div className="hero-overlay"></div>
                </div>

                <motion.div
                    className="hero-content"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                >
                    <h1 className="hero-title">
                        Our <span className="gradient-text">Celebrations</span>
                    </h1>
                    <p className="hero-subtitle">
                        Discover the magic we've created for couples around the world.
                        Every photo tells a story of love, joy, and unforgettable moments.
                    </p>
                </motion.div>

                <div className="hero-scroll-indicator">
                    <motion.div
                        animate={{ y: [0, 10, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                    >
                        ↓
                    </motion.div>
                </div>
            </section>

            {/* Filter & Search Bar (Optional Visuals) */}
            <div className="events-controls container">
                <div className="search-box">
                    <Search size={20} />
                    <input
                        type="text"
                        placeholder="Search events..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setCurrentPage(1);
                        }}
                    />
                </div>
                <div className="filter-options">
                    <div className="filter-group">
                        <Filter size={18} />
                        <select
                            className="sort-select"
                            value={selectedCategory}
                            onChange={(e) => {
                                setSelectedCategory(e.target.value);
                                setCurrentPage(1);
                            }}
                        >
                            <option value="All">All Categories</option>
                            {categories.map(cat => (
                                <option key={cat._id} value={cat.categoryName}>
                                    {cat.categoryName}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Events Grid */}
            <section className="events-grid-section container">
                <div className="events-list-grid">
                    {loading ? (
                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '50px' }}>
                            <div className="loading-container">
                                <div className="premium-loader"></div>
                                <p className="loading-text">Finding spectacular events...</p>
                            </div>
                        </div>
                    ) : (
                        currentEvents.map((event, index) => (
                            <motion.div
                                key={event._id}
                                className="collection-card glass-card"
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: (index % 3) * 0.1 }}
                            >
                                <div className="card-img-wrap" onClick={() => viewDetails(event._id)}>
                                    <img src={event.images?.[0] || 'https://via.placeholder.com/600x400'} alt={event.title} />
                                    <span className="card-tag">{event.tag || 'Classic'}</span>
                                </div>
                                <div className="card-info">
                                    <h3 className="card-title">{event.title}</h3>
                                    <p className="card-description">{event.description.substring(0, 100)}...</p>
                                    <div className="card-details-grid">
                                        <div className="detail-item">
                                            <Calendar size={16} />
                                            <div className="detail-text">
                                                <span className="detail-label">Category</span>
                                                <span className="detail-value">{event.category}</span>
                                            </div>
                                        </div>
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
                                    <button className="btn-card-action" onClick={() => viewDetails(event._id)}>
                                        View Details <Info size={16} />
                                    </button>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>

                {totalPages > 1 && (
                    <div className="pagination">
                        <button
                            className="btn-pagination"
                            onClick={() => paginate(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            <ChevronLeft size={20} />
                        </button>

                        {Array.from({ length: totalPages }, (_, i) => (
                            <button
                                key={i + 1}
                                className={`btn-pagination ${currentPage === i + 1 ? 'active' : ''}`}
                                onClick={() => paginate(i + 1)}
                            >
                                {i + 1}
                            </button>
                        ))}

                        <button
                            className="btn-pagination"
                            onClick={() => paginate(currentPage + 1)}
                            disabled={currentPage >= totalPages}
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                )}
            </section>

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
                            <img src={lightboxImage} alt="Event Full Size" />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default EventsPage;
