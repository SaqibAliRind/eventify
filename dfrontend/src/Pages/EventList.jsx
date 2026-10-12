import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import AdminSidebar from '../Components/Admin/AdminSidebar';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, X, Loader2, Image as ImageIcon, Search } from 'lucide-react';
import './CategoryList.css';

const EventList = () => {
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [modal, setModal] = useState({ open: false, type: 'add', data: null });
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    date: '',
    location: '',
    guests: '',
    tag: 'Classic',
    images: ['', '', '', '', ''] // 5 images required
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('eventify_token');
      const [eventsRes, categoriesRes] = await Promise.all([
        axios.get(`${API_URL}/admin/events`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/admin/categories`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      if (eventsRes.data.success) {
        setEvents(eventsRes.data.data);
      }
      if (categoriesRes.data.success) {
        setCategories(categoriesRes.data.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (type, data = null) => {
    setModal({ open: true, type, data });
    if (data) {
      setFormData({
        title: data.title,
        category: data.category || '',
        description: data.description,
        date: data.date,
        location: data.location,
        guests: data.guests,
        tag: data.tag || 'Classic',
        images:
          data.images?.length >= 5
            ? data.images
            : [...(data.images || []), ...Array(5 - (data.images?.length || 0)).fill('')]
      });
    } else {
      setFormData({
        title: '',
        category: categories.length > 0 ? categories[0].categoryName : '',
        description: '',
        date: '',
        location: '',
        guests: '',
        tag: 'Classic',
        images: ['', '', '', '', '']
      });
    }
  };

  const handleCloseModal = () => {
    setModal({ open: false, type: 'add', data: null });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (index, value) => {
    const newImages = [...formData.images];
    newImages[index] = value;
    setFormData((prev) => ({ ...prev, images: newImages }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.images.some((img) => !img.trim())) {
      alert('Please provide all 5 image URLs');
      return;
    }

    if (!formData.category) {
      alert('Please select a category');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('eventify_token');
      const url =
        modal.type === 'add'
          ? `${API_URL}/admin/events`
          : `${API_URL}/admin/events/${modal.data._id}`;
      const method = modal.type === 'add' ? 'post' : 'put';

      const response = await axios({
        method,
        url,
        data: formData,
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        fetchData();
        handleCloseModal();
      }
    } catch (error) {
      console.error('Error detail:', error);
      alert(error.response?.data?.message || error.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return;
    }
    try {
      const token = localStorage.getItem('eventify_token');
      const response = await axios.delete(`${API_URL}/admin/events/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setEvents(events.filter((e) => e._id !== id));
      }
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  const filteredEvents = events.filter((e) =>
    e.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <main className="admin-main">
        <div className="category-list-container">
          <div className="category-header">
            <div className="header-title">
              <h1>Events Management</h1>
              <p>Create, update, and manage luxury events and exhibitions.</p>
            </div>
            <button className="add-category-btn" onClick={() => handleOpenModal('add')}>
              <Plus size={18} /> Add New Event
            </button>
          </div>

          {/* Search Bar for Events */}
          <div style={{ marginBottom: '1.25rem', maxWidth: '380px', position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search events by title or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 1rem 0.65rem 2.4rem',
                borderRadius: '8px',
                background: '#131c31',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#fff',
                fontSize: '0.88rem'
              }}
            />
          </div>

          <div className="table-container">
            {loading ? (
              <div className="loading-spinner">
                <Loader2 className="animate-spin" size={40} />
                <span style={{ marginTop: '0.75rem', fontSize: '0.9rem' }}>Loading events data...</span>
              </div>
            ) : (
              <div className="table-responsive-wrapper">
                <table className="categories-table">
                  <thead>
                    <tr>
                      <th>Cover</th>
                      <th>Event Title</th>
                      <th>Category</th>
                      <th>Tag</th>
                      <th>Date</th>
                      <th>Location</th>
                      <th style={{ textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence mode="popLayout">
                      {filteredEvents.map((event) => (
                        <motion.tr
                          key={event._id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          layout
                        >
                          <td>
                            <img
                              src={event.images?.[0] || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=200'}
                              alt={event.title}
                              style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '8px',
                                objectFit: 'cover',
                                border: '1px solid rgba(255,255,255,0.1)'
                              }}
                            />
                          </td>
                          <td className="category-name-cell">{event.title}</td>
                          <td>
                            <span className="admin-badge admin-badge-blue">
                              {event.category || 'Standard'}
                            </span>
                          </td>
                          <td>
                            <span className="admin-badge admin-badge-gold">
                              {event.tag || 'Classic'}
                            </span>
                          </td>
                          <td className="date-cell">{event.date}</td>
                          <td style={{ color: '#cbd5e1' }}>{event.location}</td>
                          <td>
                            <div className="table-actions-cell">
                              <button
                                onClick={() => handleOpenModal('edit', event)}
                                className="btn-action-edit"
                              >
                                <Pencil size={14} /> Edit
                              </button>
                              <button
                                onClick={() => handleDelete(event._id)}
                                className="btn-action-delete"
                              >
                                <Trash2 size={14} /> Delete
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Add / Edit Event Modal */}
      <AnimatePresence>
        {modal.open && (
          <div className="modal-overlay" onClick={handleCloseModal}>
            <motion.div
              className="modal-content"
              style={{ maxWidth: '680px', maxHeight: '90vh', overflowY: 'auto' }}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1.25rem'
                }}
              >
                <h2>{modal.type === 'add' ? 'Create New Event' : 'Update Event'}</h2>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer'
                  }}
                >
                  <X size={22} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="admin-form">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                  <div className="form-group">
                    <label>Event Title</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g. Royal Autumn Wedding"
                    />
                  </div>

                  <div className="form-group">
                    <label>Category</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="" disabled>
                        Select Category
                      </option>
                      {categories.map((cat) => (
                        <option key={cat._id} value={cat.categoryName}>
                          {cat.categoryName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Tier Tag</label>
                    <select name="tag" value={formData.tag} onChange={handleInputChange}>
                      <option value="Classic">Classic</option>
                      <option value="Premium">Premium</option>
                      <option value="Featured">Featured</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Date</label>
                    <input
                      type="text"
                      name="date"
                      placeholder="e.g. Oct 25, 2026"
                      value={formData.date}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Location</label>
                    <input
                      type="text"
                      name="location"
                      placeholder="e.g. The Grand Hotel, Dubai"
                      value={formData.location}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Guest Capacity</label>
                    <input
                      type="text"
                      name="guests"
                      placeholder="e.g. 350+ Guests"
                      value={formData.guests}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Event Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows={3}
                    placeholder="Provide a comprehensive summary of the event concept and styling..."
                  />
                </div>

                <div style={{ marginTop: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.65rem', fontWeight: 600, fontSize: '0.88rem', color: '#cbd5e1' }}>
                    Gallery Imagery (5 Image URLs required)
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                    {formData.images.map((img, index) => (
                      <div key={index} style={{ display: 'flex', gap: '0.65rem', alignItems: 'center' }}>
                        <ImageIcon size={18} color="#60a5fa" style={{ flexShrink: 0 }} />
                        <input
                          type="text"
                          placeholder={`Image URL #${index + 1}`}
                          value={img}
                          onChange={(e) => handleImageChange(index, e.target.value)}
                          required
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="modal-actions">
                  <button type="button" className="btn-cancel" onClick={handleCloseModal}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-submit" disabled={submitting}>
                    {submitting ? 'Saving...' : modal.type === 'add' ? 'Create Event' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EventList;
