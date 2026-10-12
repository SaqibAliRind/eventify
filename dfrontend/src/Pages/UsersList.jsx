import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import AdminSidebar from '../Components/Admin/AdminSidebar';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronUp, ChevronDown, UserCheck, UserX, Loader2 } from 'lucide-react';
import './UsersList.css';

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [params, setParams] = useState({
    page: 1,
    limit: 10,
    search: '',
    role: '',
    status: '',
    sortField: 'createdAt',
    sortOrder: 'desc'
  });
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pages: 1
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('eventify_token');
      const response = await axios.get(`${API_URL}/admin/users`, {
        params,
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setUsers(response.data.data);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchUsers();
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [params]);

  const handleToggleStatus = async (id) => {
    try {
      const token = localStorage.getItem('eventify_token');
      const response = await axios.patch(
        `${API_URL}/admin/users/${id}/status`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        setUsers(
          users.map((u) =>
            u._id === id ? { ...u, active: response.data.data.active } : u
          )
        );
      }
    } catch (error) {
      console.error('Error toggling status:', error);
    }
  };

  const handleSort = (field) => {
    setParams((prev) => ({
      ...prev,
      sortField: field,
      sortOrder: prev.sortField === field && prev.sortOrder === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleParamChange = (name, value) => {
    setParams((prev) => ({ ...prev, [name]: value, page: 1 }));
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <main className="admin-main">
        <div className="users-list-container">
          <motion.div
            className="users-list-header"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="header-title">
              <h1>User Directory</h1>
              <p>Monitor, filter, and manage registered client and organizer accounts.</p>
            </div>
          </motion.div>

          <motion.div
            className="filters-section"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="search-box">
              <Search className="search-icon" size={18} />
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={params.search}
                onChange={(e) => handleParamChange('search', e.target.value)}
              />
            </div>

            <div className="filter-group">
              <select
                value={params.role}
                onChange={(e) => handleParamChange('role', e.target.value)}
              >
                <option value="">All Roles</option>
                <option value="admin">Admin</option>
                <option value="user">User</option>
              </select>

              <select
                value={params.status}
                onChange={(e) => handleParamChange('status', e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </motion.div>

          <div className="table-container">
            {loading ? (
              <div className="loading-spinner">
                <Loader2 className="animate-spin" size={40} />
                <span style={{ marginTop: '0.75rem', fontSize: '0.9rem' }}>Loading users directory...</span>
              </div>
            ) : (
              <>
                <div className="table-responsive-wrapper">
                  <table className="users-table">
                    <thead>
                      <tr>
                        <th onClick={() => handleSort('name')}>
                          User Info{' '}
                          {params.sortField === 'name' &&
                            (params.sortOrder === 'asc' ? (
                              <ChevronUp size={14} />
                            ) : (
                              <ChevronDown size={14} />
                            ))}
                        </th>
                        <th onClick={() => handleSort('role')}>
                          Role{' '}
                          {params.sortField === 'role' &&
                            (params.sortOrder === 'asc' ? (
                              <ChevronUp size={14} />
                            ) : (
                              <ChevronDown size={14} />
                            ))}
                        </th>
                        <th onClick={() => handleSort('phone')}>Contact Phone</th>
                        <th onClick={() => handleSort('verifyuser')}>Verification</th>
                        <th style={{ textAlign: 'center' }}>Account Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <AnimatePresence mode="popLayout">
                        {users.map((user) => (
                          <motion.tr
                            key={user._id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            layout
                          >
                            <td>
                              <div className="user-info">
                                <img
                                  src={
                                    user.image ||
                                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'
                                  }
                                  alt={user.name}
                                  className="user-avatar"
                                />
                                <div className="user-details">
                                  <span className="name">{user.name}</span>
                                  <span className="email">{user.email}</span>
                                </div>
                              </div>
                            </td>
                            <td>
                              <span className={`role-badge role-${user.role}`}>
                                {user.role || 'user'}
                              </span>
                            </td>
                            <td style={{ color: '#cbd5e1' }}>{user.phone || 'N/A'}</td>
                            <td>
                              <span
                                className={`admin-badge ${
                                  user.verifyuser ? 'admin-badge-green' : 'admin-badge-blue'
                                }`}
                              >
                                {user.verifyuser ? 'Verified' : 'Pending'}
                              </span>
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <button
                                type="button"
                                className={`status-toggle ${
                                  user.active ? 'status-active' : 'status-inactive'
                                }`}
                                onClick={() => handleToggleStatus(user._id)}
                              >
                                {user.active ? <UserCheck size={16} /> : <UserX size={16} />}
                                <span>{user.active ? 'Active' : 'Suspended'}</span>
                              </button>
                            </td>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </tbody>
                  </table>
                </div>

                <div className="pagination-section">
                  <div className="pagination-info">
                    Showing {users.length} of {pagination.total} registered users
                  </div>
                  <div className="pagination-controls">
                    <button
                      type="button"
                      className="page-btn"
                      disabled={params.page === 1}
                      onClick={() => setParams((prev) => ({ ...prev, page: prev.page - 1 }))}
                    >
                      Previous
                    </button>
                    {Array.from({ length: pagination.pages || 1 }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        type="button"
                        className={`page-btn ${params.page === p ? 'active' : ''}`}
                        onClick={() => setParams((prev) => ({ ...prev, page: p }))}
                      >
                        {p}
                      </button>
                    ))}
                    <button
                      type="button"
                      className="page-btn"
                      disabled={params.page === (pagination.pages || 1)}
                      onClick={() => setParams((prev) => ({ ...prev, page: prev.page + 1 }))}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default UsersList;
