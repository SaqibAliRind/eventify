import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminSidebar from '../Components/Admin/AdminSidebar';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, X, Loader2, Image as ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import './CategoryList.css'; // Reusing some base styles

const EventList = () => {
    const [events, setEvents] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState({ open: false, type: 'add', data: null });
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;
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
                axios.get(`http://${window.location.hostname}:9000/admin/events`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get('http://localhost:9000/admin/categories', {
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
                images: (data.images && Array.isArray(data.images) && data.images.length >= 5) 
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
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (index, value) => {
        const newImages = [...formData.images];
        newImages[index] = value;
        setFormData(prev => ({ ...prev, images: newImages }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Basic validation for images
        if (formData.images.some(img => !img.trim())) {
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
            const url = modal.type === 'add'
                ? `http://${window.location.hostname}:9000/admin/events`
                : `http://localhost:9000/admin/events/${modal.data._id}`;
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
        if (!window.confirm('Are you sure you want to delete this event?')) return;
        try {
            const token = localStorage.getItem('eventify_token');
            const response = await axios.delete(`http://localhost:9000/admin/events/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setEvents(events.filter(e => e._id !== id));
            }
        } catch (error) {
            console.error('Error deleting event:', error);
        }
    };

    return (
        <div className="admin-layout">
            <AdminSidebar />

            <main className="admin-main">
                <div className="category-list-container">
                    <div className="category-header">
                        <div className="header-title">
                            <h1>Events Management</h1>
                            <p>Create and manage dynamic events for your platform.</p>
                        </div>
                        <button className="add-category-btn" onClick={() => handleOpenModal('add')}>
                            <Plus size={20} /> Add Event
                        </button>
                    </div>

                    <div className="table-container">
                        {loading ? (
                            <div className="loading-spinner">
                                <Loader2 className="animate-spin" size={48} />
                            </div>
                        ) : (
                            <>
                                <table className="categories-table">
                                    <thead>
                                        <tr>
                                            <th>Image</th>
                                            <th>Title</th>
                                            <th>Category</th>
                                            <th>Date</th>
                                            <th>Location</th>
                                            <th style={{ textAlign: 'center' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <AnimatePresence mode="popLayout">
                                            {events.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((event) => (
                                                <motion.tr
                                                    key={event._id}
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    layout
                                                >
                                                    <td>
                                                        <img
                                                            src={(event.images && event.images[0]) || 'https://via.placeholder.com/50'}
                                                            alt={event.title}
                                                            style={{ width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover' }}
                                                        />
                                                    </td>
                                                    <td className="category-name-cell">
                                                        {event.title}
                                                    </td>
                                                    <td>
                                                        <span style={{
                                                            backgroundColor: '#f1f5f9',
                                                            padding: '4px 8px',
                                                            borderRadius: '6px',
                                                            fontSize: '0.85rem',
                                                            color: '#475569',
                                                            fontWeight: '500'
                                                        }}>
                                                            {event.category || 'Uncategorized'}
                                                        </span>
                                                    </td>
                                                    <td className="date-cell">
                                                        {event.date}
                                                    </td>
                                                    <td>
                                                        {event.location}
                                                    </td>
                                                    <td>
                                                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                                                            <button
                                                                onClick={() => handleOpenModal('edit', event)}
                                                                className="edit-btn"
                                                                style={{
                                                                    backgroundColor: '#3b82f6',
                                                                    border: 'none',
                                                                    borderRadius: '8px',
                                                                    padding: '6px 12px',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '8px',
                                                                    cursor: 'pointer',
                                                                    color: 'white',
                                                                    fontWeight: '600',
                                                                    fontSize: '0.9rem'
                                                                }}
                                                            >
                                                                <Pencil size={16} color="white" strokeWidth={2.5} /> Edit
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(event._id)}
                                                                className="delete-btn"
                                                                style={{
                                                                    backgroundColor: '#ef4444',
                                                                    border: 'none',
                                                                    borderRadius: '8px',
                                                                    padding: '6px 12px',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '8px',
                                                                    cursor: 'pointer',
                                                                    color: 'white',
                                                                    fontWeight: '600',
                                                                    fontSize: '0.9rem'
                                                                }}
                                                            >
                                                                <Trash2 size={16} color="white" strokeWidth={2.5} /> Delete
                                                            </button>
                                                        </div>
                                                    </td>
                                                </motion.tr>
                                            ))}
                                        </AnimatePresence>
                                    </tbody>
                                </table>

                                {events.length > itemsPerPage && (
                                    <div className="pagination-section" style={{ 
                                        display: 'flex', 
                                        justifyContent: 'center', 
                                        alignItems: 'center',
                                        gap: '15px', 
                                        marginTop: '30px',
                                        padding: '20px',
                                        borderTop: '1px solid #f1f5f9'
                                    }}>
                                        <button
                                            className="page-btn"
                                            disabled={currentPage === 1}
                                            onClick={() => setCurrentPage(prev => prev - 1)}
                                            style={{
                                                padding: '8px 20px',
                                                borderRadius: '8px',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                background: currentPage === 1 ? 'rgba(255,255,255,0.05)' : 'rgba(59, 130, 246, 0.1)',
                                                color: currentPage === 1 ? '#4b5563' : '#3b82f6',
                                                fontWeight: '600',
                                                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                                                transition: '0.2s',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px'
                                            }}
                                        >
                                            <ChevronLeft size={18} /> Previous
                                        </button>
                                        
                                        <div style={{ 
                                            padding: '8px 20px', 
                                            background: 'rgba(255,255,255,0.05)', 
                                            borderRadius: '8px',
                                            fontWeight: '600',
                                            color: '#94a3b8',
                                            fontSize: '0.9rem',
                                            border: '1px solid rgba(255,255,255,0.05)'
                                        }}>
                                            Page {currentPage} of {Math.ceil(events.length / itemsPerPage)}
                                        </div>

                                        <button
                                            className="page-btn"
                                            disabled={currentPage >= Math.ceil(events.length / itemsPerPage)}
                                            onClick={() => setCurrentPage(prev => prev + 1)}
                                            style={{
                                                padding: '8px 20px',
                                                borderRadius: '8px',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                background: currentPage >= Math.ceil(events.length / itemsPerPage) ? 'rgba(255,255,255,0.05)' : 'rgba(59, 130, 246, 0.1)',
                                                color: currentPage >= Math.ceil(events.length / itemsPerPage) ? '#4b5563' : '#3b82f6',
                                                fontWeight: '600',
                                                cursor: currentPage >= Math.ceil(events.length / itemsPerPage) ? 'not-allowed' : 'pointer',
                                                transition: '0.2s',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px'
                                            }}
                                        >
                                            Next <ChevronRight size={18} />
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </main>

            {/* Modal */}
            <AnimatePresence>
                {modal.open && (
                    <div className="modal-overlay">
                        <motion.div
                            className="modal-content"
                            style={{
                                maxWidth: '650px',
                                width: '95%',
                                maxHeight: '90vh',
                                overflowY: 'auto',
                                padding: '25px'
                            }}
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 50 }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h2 style={{ fontSize: '1.5rem' }}>{modal.type === 'add' ? 'Add New Event' : 'Edit Event'}</h2>
                                <button onClick={handleCloseModal} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                                    <X size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="admin-form">
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                    <div className="form-group">
                                        <label style={{ fontSize: '0.9rem', marginBottom: '4px' }}>Event Title</label>
                                        <input
                                            type="text"
                                            name="title"
                                            value={formData.title}
                                            onChange={handleInputChange}
                                            required
                                            style={{ padding: '8px' }}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label style={{ fontSize: '0.9rem', marginBottom: '4px' }}>Category</label>
                                        <select
                                            name="category"
                                            value={formData.category}
                                            onChange={handleInputChange}
                                            required
                                            style={{ padding: '8px' }}
                                        >
                                            <option value="" disabled>Select Category</option>
                                            {categories.map(cat => (
                                                <option key={cat._id} value={cat.categoryName}>
                                                    {cat.categoryName}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label style={{ fontSize: '0.9rem', marginBottom: '4px' }}>Tag</label>
                                        <select name="tag" value={formData.tag} onChange={handleInputChange} style={{ padding: '8px' }}>
                                            <option value="Classic">Classic</option>
                                            <option value="Premium">Premium</option>
                                            <option value="Featured">Featured</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label style={{ fontSize: '0.9rem', marginBottom: '4px' }}>Date</label>
                                        <input
                                            type="text"
                                            name="date"
                                            placeholder="e.g. Oct 25, 2026"
                                            value={formData.date}
                                            onChange={handleInputChange}
                                            required
                                            style={{ padding: '8px' }}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label style={{ fontSize: '0.9rem', marginBottom: '4px' }}>Location</label>
                                        <input
                                            type="text"
                                            name="location"
                                            value={formData.location}
                                            onChange={handleInputChange}
                                            required
                                            style={{ padding: '8px' }}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label style={{ fontSize: '0.9rem', marginBottom: '4px' }}>Guests</label>
                                        <input
                                            type="text"
                                            name="guests"
                                            placeholder="e.g. 200+"
                                            value={formData.guests}
                                            onChange={handleInputChange}
                                            required
                                            style={{ padding: '8px' }}
                                        />
                                    </div>
                                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                        <label style={{ fontSize: '0.9rem', marginBottom: '4px' }}>Description</label>
                                        <textarea
                                            name="description"
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            required
                                            style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0', minHeight: '80px' }}
                                        />
                                    </div>
                                </div>

                                <div style={{ marginTop: '15px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '0.95rem' }}>Images (5 URLs required)</label>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                        {formData.images.map((img, index) => (
                                            <div key={index} style={{ display: 'flex', gap: '8px', alignItems: 'center', gridColumn: index === 4 ? 'span 2' : 'auto' }}>
                                                <ImageIcon size={18} color="#94a3b8" />
                                                <input
                                                    type="text"
                                                    placeholder={`URL ${index + 1}`}
                                                    value={img}
                                                    onChange={(e) => handleImageChange(index, e.target.value)}
                                                    required
                                                    style={{ flex: 1, padding: '6px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.85rem' }}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="modal-actions" style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                    <button type="button" className="btn-cancel" onClick={handleCloseModal} style={{ padding: '8px 16px' }}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn-submit" disabled={submitting} style={{ padding: '8px 16px' }}>
                                        {submitting ? 'Saving...' : (modal.type === 'add' ? 'Create' : 'Save')}
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
