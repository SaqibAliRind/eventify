import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminSidebar from '../Components/Admin/AdminSidebar';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, X, Loader2 } from 'lucide-react';
import './CategoryList.css';

const CategoryList = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState({ open: false, type: 'add', data: null });
    const [categoryName, setCategoryName] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('eventify_token');
            const response = await axios.get(`http://${window.location.hostname}:9000/admin/categories`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setCategories(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleOpenModal = (type, data = null) => {
        setModal({ open: true, type, data });
        setCategoryName(data ? data.categoryName : '');
    };

    const handleCloseModal = () => {
        setModal({ open: false, type: 'add', data: null });
        setCategoryName('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const token = localStorage.getItem('eventify_token');
            const url = modal.type === 'add'
                ? `http://${window.location.hostname}:9000/admin/categories`
                : `http://localhost:9000/admin/categories/${modal.data._id}`;
            const method = modal.type === 'add' ? 'post' : 'put';

            const response = await axios({
                method,
                url,
                data: { categoryName },
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                fetchCategories();
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
        if (!window.confirm('Are you sure you want to delete this category?')) return;
        try {
            const token = localStorage.getItem('eventify_token');
            const response = await axios.delete(`http://localhost:9000/admin/categories/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setCategories(categories.filter(c => c._id !== id));
            }
        } catch (error) {
            console.error('Error deleting category:', error);
        }
    };

    const handleToggleHome = async (id) => {
        try {
            const token = localStorage.getItem('eventify_token');
            const response = await axios.patch(`http://localhost:9000/admin/categories/${id}/home`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setCategories(categories.map(c => c._id === id ? response.data.data : c));
            }
        } catch (error) {
            console.error('Error toggling home visibility:', error);
        }
    };

    return (
        <div className="admin-layout">
            <AdminSidebar />

            <main className="admin-main">
                <div className="category-list-container">
                    <div className="category-header">
                        <div className="header-title">
                            <h1>Categories Management</h1>
                            <p>Manage all your event and property categories here.</p>
                        </div>
                        <button className="add-category-btn" onClick={() => handleOpenModal('add')}>
                            <Plus size={20} /> Add Category
                        </button>
                    </div>

                    <div className="table-container">
                        {loading ? (
                            <div className="loading-spinner">
                                <Loader2 className="animate-spin" size={48} />
                            </div>
                        ) : (
                            <table className="categories-table">
                                <thead>
                                    <tr>
                                        <th>Category Name</th>
                                        <th>Home Page</th>
                                        <th>Created At</th>
                                        <th style={{ textAlign: 'center' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <AnimatePresence mode="popLayout">
                                        {categories.map((category) => (
                                            <motion.tr
                                                key={category._id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                layout
                                            >
                                                <td className="category-name-cell">
                                                    {category.categoryName || category.name}
                                                </td>
                                                <td>
                                                    <button 
                                                        onClick={() => handleToggleHome(category._id)}
                                                        className={`home-toggle-btn ${category.showOnHome ? 'active' : ''}`}
                                                    >
                                                        {category.showOnHome ? 'Enabled' : 'Disabled'}
                                                    </button>
                                                </td>
                                                <td className="date-cell">
                                                    {new Date(category.createdAt).toLocaleDateString()}
                                                </td>
                                                <td>
                                                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                                                        <button
                                                            onClick={() => handleOpenModal('edit', category)}
                                                            title="Edit"
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
                                                            onClick={() => handleDelete(category._id)}
                                                            title="Delete"
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
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 50 }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h2>{modal.type === 'add' ? 'Add New Category' : 'Edit Category'}</h2>
                                <button onClick={handleCloseModal} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                                    <X size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label>Category Name</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Wedding, Property, Concert"
                                        value={categoryName}
                                        onChange={(e) => setCategoryName(e.target.value)}
                                        required
                                        autoFocus
                                    />
                                </div>
                                <div className="modal-actions">
                                    <button type="button" className="btn-cancel" onClick={handleCloseModal}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn-submit" disabled={submitting}>
                                        {submitting ? 'Saving...' : (modal.type === 'add' ? 'Create Category' : 'Save Changes')}
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

export default CategoryList;
