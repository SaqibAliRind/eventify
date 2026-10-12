import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import AdminSidebar from '../Components/Admin/AdminSidebar';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, FileText, Loader2, ShieldCheck, Clock, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import './CategoryList.css';

const AdminAuditLog = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, pages: 1 });

  const fetchLogs = async (page = 1) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('eventify_token');
      const res = await axios.get(`${API_URL}/admin/audit-logs`, {
        params: {
          page,
          limit: pagination.limit,
          action: actionFilter
        },
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setLogs(res.data.data);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error('Error fetching audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(pagination.page);
  }, [actionFilter, pagination.page]);

  const handleExportCSV = () => {
    const token = localStorage.getItem('eventify_token');
    const params = new URLSearchParams();
    if (actionFilter) params.set('action', actionFilter);
    const url = `${API_URL}/admin/export/audit-log?${params.toString()}`;
    const a = document.createElement('a');
    a.href = url;
    a.setAttribute('download', '');
    // Pass token via query for download (server reads Authorization header)
    // Use fetch to get the file with auth header then trigger download
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.blob())
      .then((blob) => {
        const blobUrl = URL.createObjectURL(blob);
        a.href = blobUrl;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
      })
      .catch(() => alert('Export failed. Please try again.'));
  };

  const getActionBadgeColor = (action) => {
    if (action.includes('DELETE')) return '#ef4444';
    if (action.includes('CREATE') || action.includes('ACTIVATE') || action.includes('APPROVE')) return '#10b981';
    if (action.includes('UPDATE') || action.includes('CHANGE')) return '#3b82f6';
    return '#f59e0b';
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <main className="admin-main">
        <div className="category-list-wrapper">
          <div className="page-header">
            <div>
              <h1 className="page-title">Administrative Audit Trail</h1>
              <p className="page-subtitle">Chronological ledger of security and moderation actions performed by admins.</p>
            </div>
            <button
              type="button"
              className="btn-outline-gold"
              onClick={handleExportCSV}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '0.5rem 1.1rem' }}
            >
              <Download size={15} /> Export CSV
            </button>
          </div>

          {/* Controls Bar */}
          <div className="controls-bar" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div className="search-box" style={{ flex: 1, minWidth: '260px' }}>
              <Search size={18} />
              <input
                type="text"
                placeholder="Filter by action name (e.g. DELETE, STATUS, ROLE)..."
                value={actionFilter}
                onChange={(e) => {
                  setActionFilter(e.target.value);
                  setPagination((p) => ({ ...p, page: 1 }));
                }}
              />
            </div>
          </div>

          {/* Audit Logs Table */}
          <div className="table-container">
            {loading ? (
              <div className="loading-spinner">
                <Loader2 className="animate-spin" size={40} />
                <span style={{ marginTop: '0.75rem', fontSize: '0.9rem' }}>Loading audit logs...</span>
              </div>
            ) : logs.length === 0 ? (
              <div className="empty-state">
                <ShieldCheck size={48} className="empty-icon" />
                <p>No recorded audit events match your query.</p>
              </div>
            ) : (
              <>
                <div className="table-responsive-wrapper">
                  <table className="categories-table">
                    <thead>
                      <tr>
                        <th>Administrator</th>
                        <th>Action</th>
                        <th>Target Entity</th>
                        <th>Details</th>
                        <th>Timestamp</th>
                      </tr>
                    </thead>
                    <tbody>
                      <AnimatePresence mode="popLayout">
                        {logs.map((log) => (
                          <motion.tr
                            key={log._id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            layout
                          >
                            <td style={{ fontWeight: 600 }}>{log.adminName}</td>
                            <td>
                              <span
                                style={{
                                  display: 'inline-block',
                                  padding: '0.2rem 0.6rem',
                                  borderRadius: '6px',
                                  fontSize: '0.75rem',
                                  fontWeight: 800,
                                  background: `${getActionBadgeColor(log.action)}20`,
                                  color: getActionBadgeColor(log.action),
                                  border: `1px solid ${getActionBadgeColor(log.action)}40`
                                }}
                              >
                                {log.action}
                              </span>
                            </td>
                            <td style={{ color: '#94a3b8' }}>
                              {log.targetType} {log.targetId && `(#${log.targetId.substring(0, 6)})`}
                            </td>
                            <td style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>{log.details || '—'}</td>
                            <td className="date-cell" style={{ whiteSpace: 'nowrap' }}>
                              <Clock size={13} style={{ display: 'inline', marginRight: 4 }} />
                              {new Date(log.createdAt).toLocaleString()}
                            </td>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.25rem', padding: '0 0.5rem' }}>
                  <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                    Showing page {pagination.page} of {pagination.pages} ({pagination.total} events)
                  </span>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      type="button"
                      disabled={pagination.page <= 1}
                      onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
                      className="btn-action-view"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', opacity: pagination.page <= 1 ? 0.4 : 1 }}
                    >
                      <ChevronLeft size={16} /> Prev
                    </button>
                    <button
                      type="button"
                      disabled={pagination.page >= pagination.pages}
                      onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
                      className="btn-action-view"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', opacity: pagination.page >= pagination.pages ? 0.4 : 1 }}
                    >
                      Next <ChevronRight size={16} />
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

export default AdminAuditLog;
