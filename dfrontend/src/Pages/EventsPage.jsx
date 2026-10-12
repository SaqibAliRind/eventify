import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config';
import {
  Calendar,
  MapPin,
  Users,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  ArrowRight,
  X,
  Sparkles,
  Layers,
  RotateCcw
} from 'lucide-react';
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
  const [sortBy, setSortBy] = useState('newest');
  const itemsPerPage = 6;
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Read params on load
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    const searchParam = searchParams.get('search');
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    } else {
      setSelectedCategory('All');
    }
    if (searchParam) {
      setSearchQuery(searchParam);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [eventsRes, catsRes] = await Promise.all([
          axios.get(`${API_URL}/user/events`),
          axios.get(`${API_URL}/user/categories`).catch(() => ({ data: { success: false } }))
        ]);

        if (eventsRes.data.success) {
          setEvents(eventsRes.data.data);
        }
        if (catsRes?.data?.success) {
          setCategories(catsRes.data.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
    const newParams = new URLSearchParams(searchParams);
    if (category === 'All') {
      newParams.delete('category');
    } else {
      newParams.set('category', category);
    }
    setSearchParams(newParams);
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    setCurrentPage(1);
    const newParams = new URLSearchParams(searchParams);
    if (val.trim()) {
      newParams.set('search', val.trim());
    } else {
      newParams.delete('search');
    }
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSelectedCategory('All');
    setSearchQuery('');
    setCurrentPage(1);
    setSearchParams({});
  };

  const filteredEvents = events.filter((event) => {
    const matchesCategory =
      selectedCategory === 'All' ||
      event.category?.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch =
      !searchQuery.trim() ||
      event.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  }).sort((a, b) => {
    if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
    if (sortBy === 'most_viewed') return (b.viewCount || 0) - (a.viewCount || 0);
    if (sortBy === 'featured') return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    if (sortBy === 'price_asc') return (a.price || 0) - (b.price || 0);
    if (sortBy === 'price_desc') return (b.price || 0) - (a.price || 0);
    return new Date(b.createdAt) - new Date(a.createdAt); // newest
  });

  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentEvents = filteredEvents.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      window.scrollTo({ top: 320, behavior: 'smooth' });
    }
  };

  const viewDetails = (id) => {
    navigate(`/events/${id}`);
  };

  return (
    <div className="events-page">
      {/* Hero Header Area */}
      <section className="events-hero-section">
        <div className="events-hero-overlay"></div>
        <div className="container events-hero-content">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="events-hero-eyebrow">
              <Sparkles size={14} /> Curated Experiences
            </span>
            <h1 className="events-hero-title">
              Our Celebrations & <span className="events-hero-highlight">Events Catalog</span>
            </h1>
            <p className="events-hero-desc">
              Explore bespoke wedding ceremonies, high-profile corporate galas, and festive milestones planned with utmost luxury and care.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filter, Search & Category Tabs */}
      <div className="container events-controls-wrapper">
        <div className="events-controls-bar">
          <div className="events-search-field">
            <Search size={18} className="search-field-icon" />
            <input
              type="text"
              placeholder="Search by name, theme, or venue..."
              value={searchQuery}
              onChange={handleSearchChange}
              aria-label="Search events"
            />
            {searchQuery && (
              <button
                type="button"
                className="clear-search-btn"
                onClick={() => handleSearchChange({ target: { value: '' } })}
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="events-dropdown-filter">
            <Filter size={16} />
            <select
              value={selectedCategory}
              onChange={(e) => handleCategorySelect(e.target.value)}
              aria-label="Category select"
            >
              <option value="All">All Disciplines</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat.categoryName}>
                  {cat.categoryName}
                </option>
              ))}
            </select>
          </div>

          <div className="events-dropdown-filter">
            <Sparkles size={16} />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort events"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="most_viewed">Most Viewed</option>
              <option value="featured">Featured First</option>
              <option value="price_asc">Price: Low → High</option>
              <option value="price_desc">Price: High → Low</option>
            </select>
          </div>
        </div>

        {/* Scrollable Category Filter Pills */}
        <div className="category-pills-scroll">
          <button
            type="button"
            className={`category-pill ${selectedCategory === 'All' ? 'active' : ''}`}
            onClick={() => handleCategorySelect('All')}
          >
            All Events ({events.length})
          </button>
          {categories.map((cat) => {
            const count = events.filter(
              (e) => e.category?.toLowerCase() === cat.categoryName?.toLowerCase()
            ).length;
            return (
              <button
                key={cat._id}
                type="button"
                className={`category-pill ${selectedCategory === cat.categoryName ? 'active' : ''}`}
                onClick={() => handleCategorySelect(cat.categoryName)}
              >
                {cat.categoryName} {count > 0 && `(${count})`}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Events Grid */}
      <main className="container events-main-area">
        {loading ? (
          <div className="events-loading-box">
            <div className="loading-spinner">Loading curated celebrations...</div>
          </div>
        ) : currentEvents.length > 0 ? (
          <>
            <div className="events-grid-layout">
              {currentEvents.map((event, index) => (
                <motion.article
                  key={event._id}
                  className="event-card-item"
                  initial={{ opacity: 0, y: 25 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.06 }}
                  whileHover={{ y: -6 }}
                >
                  <div className="event-card-media" onClick={() => viewDetails(event._id)}>
                    <img
                      src={
                        event.images?.[0] ||
                        'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800'
                      }
                      alt={event.title}
                      loading="lazy"
                    />
                    <span className="event-badge-tag">{event.tag || event.category}</span>
                  </div>

                  <div className="event-card-details">
                    <div className="event-chips-row">
                      <span className="chip-item">
                        <Calendar size={13} />
                        <span>{event.date || 'TBA'}</span>
                      </span>
                      {event.location && (
                        <span className="chip-item">
                          <MapPin size={13} />
                          <span>{event.location}</span>
                        </span>
                      )}
                    </div>

                    <h2 className="event-item-title" onClick={() => viewDetails(event._id)}>
                      {event.title}
                    </h2>

                    <p className="event-item-desc">
                      {event.description?.length > 110
                        ? `${event.description.substring(0, 110)}...`
                        : event.description}
                    </p>

                    <div className="event-item-footer">
                      <div className="event-guests-info">
                        <Users size={15} />
                        <span>{event.guests || '250+'} Guests</span>
                      </div>
                      <button
                        type="button"
                        className="event-explore-btn"
                        onClick={() => viewDetails(event._id)}
                      >
                        <span>Details</span>
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <nav className="events-pagination-nav" aria-label="Pagination">
                <button
                  type="button"
                  className="page-nav-arrow"
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  aria-label="Previous page"
                >
                  <ChevronLeft size={18} />
                </button>

                <div className="page-numbers-group">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      type="button"
                      className={`page-num-btn ${currentPage === pageNum ? 'active' : ''}`}
                      onClick={() => paginate(pageNum)}
                    >
                      {pageNum}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  className="page-nav-arrow"
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  aria-label="Next page"
                >
                  <ChevronRight size={18} />
                </button>
              </nav>
            )}
          </>
        ) : (
          <div className="events-empty-state">
            <div className="empty-icon-circle">
              <Layers size={36} />
            </div>
            <h3>No events found</h3>
            <p>
              We couldn't find any events matching your selected criteria. Try adjusting your
              search term or category filter.
            </p>
            <button type="button" className="clear-filters-action" onClick={clearFilters}>
              <RotateCcw size={16} />
              <span>Reset Filters</span>
            </button>
          </div>
        )}
      </main>

      {/* Lightbox Modal */}
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
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className="lightbox-close-btn"
                onClick={() => setLightboxOpen(false)}
                aria-label="Close image modal"
              >
                <X size={20} />
              </button>
              <img src={lightboxImage} alt="Event full view" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EventsPage;
