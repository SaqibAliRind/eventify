import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import AdminSidebar from '../Components/Admin/AdminSidebar';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, X, Loader2, Search, Layers } from 'lucide-react';
import './CategoryList.css';

const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [modal, setModal] = useState({ open: false, type: 'add', data: null });
  const [categoryName, setCategoryName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('eventify_token');
      const response = await axios.get(`${API_URL}/admin/categories`, {
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
    setCategoryName(data ? data.categoryName || data.name : '');
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
      const url =
        modal.type === 'add'
          ? `${API_URL}/admin/categories`
          : `${API_URL}/admin/categories/${modal.data._id}`;
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
      const response = await axios.delete(`${API_URL}/admin/categories/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setCategories(categories.filter((c) => c._id !== id));
      }
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  const filteredCategories = categories.filter((cat) =>
    (cat.categoryName || cat.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <main className="admin-main">
        <div className="category-list-container">
          <div className="category-header">
            <div className="header-title">
              <h1>Categories Management</h1>
              <p>Configure event genres, wedding categories, and service types.</p>
            </div>
            <button className="add-category-btn" onClick={() => handleOpenModal('add')}>
              <Plus size={18} /> Add Category
            </button>
          </div>

          {/* Search field */}
          <div style={{ marginBottom: '1.25rem', maxWidth: '380px', position: 'relative' }}>
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94a3b8'
              }}
            />
            <input
              type="text"
              placeholder="Search category name..."
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
                <span style={{ marginTop: '0.75rem', fontSize: '0.9rem' }}>Loading categories...</span>
              </div>
            ) : (
              <div className="table-responsive-wrapper">
                <table className="categories-table">
                  <thead>
                    <tr>
                      <th>Icon</th>
                      <th>Category Name</th>
                      <th>Created Date</th>
                      <th style={{ textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence mode="popLayout">
                      {filteredCategories.map((category) => (
                        <motion.tr
                          key={category._id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          layout
                        >
                          <td style={{ width: '60px' }}>
                            <div
                              style={{
                                width: '38px',
                                height: '38px',
                                borderRadius: '8px',
                                background: 'rgba(59, 130, 246, 0.15)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#60a5fa'
                              }}
                            >
                              <Layers size={18} />
                            </div>
                          </td>
                          <td className="category-name-cell">
                            {category.categoryName || category.name}
                          </td>
                          <td className="date-cell">
                            {category.createdAt
                              ? new Date(category.createdAt).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })
                              : 'System Default'}
                          </td>
                          <td>
                            <div className="table-actions-cell">
                              <button
                                onClick={() => handleOpenModal('edit', category)}
                                className="btn-action-edit"
                                title="Edit Category"
                              >
                                <Pencil size={14} /> Edit
                              </button>
                              <button
                                onClick={() => handleDelete(category._id)}
                                className="btn-action-delete"
                                title="Delete Category"
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

      {/* Add / Edit Category Modal */}
      <AnimatePresence>
        {modal.open && (
          <div className="modal-overlay" onClick={handleCloseModal}>
            <motion.div
              className="modal-content"
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
                <h2>{modal.type === 'add' ? 'Add New Category' : 'Edit Category'}</h2>
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
                <div className="form-group">
                  <label>Category Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Wedding, Gala, Product Launch"
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
                    {submitting ? 'Saving...' : modal.type === 'add' ? 'Create Category' : 'Save Changes'}
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
