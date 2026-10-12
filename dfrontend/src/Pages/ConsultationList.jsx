import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import AdminSidebar from '../Components/Admin/AdminSidebar';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Mail, Phone, Calendar, MessageSquare, Search, Eye, X, Download } from 'lucide-react';
import './CategoryList.css';

const handleCSVExport = (endpoint, filename) => {
  const token = localStorage.getItem('eventify_token');
  fetch(endpoint, { headers: { Authorization: `Bearer ${token}` } })
    .then((r) => r.blob())
    .then((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    })
    .catch(() => alert('Export failed'));
};

const ConsultationList = () => {
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInquiry, setSelectedInquiry] = useState(null);

  const fetchConsultations = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('eventify_token');
      const response = await axios.get(`${API_URL}/admin/consultations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setConsultations(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching consultations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConsultations();
  }, []);

  const filteredConsultations = consultations.filter((c) =>
    c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.eventType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.message?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <main className="admin-main">
        <div className="category-list-container">
          <div className="category-header">
            <div className="header-title">
              <h1>Consultation Inquiries</h1>
              <p>Review customer leads, wedding planning requests, and proposal requests.</p>
            </div>
            <button
              type="button"
              className="btn-outline-gold"
              onClick={() => handleCSVExport(`${API_URL}/admin/export/consultations`, 'consultations.csv')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '0.5rem 1.1rem', fontSize: '0.85rem' }}
            >
              <Download size={14} /> Export CSV
            </button>
          </div>

          {/* Search bar */}
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
              placeholder="Search leads by client name, email, or theme..."
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
                <span style={{ marginTop: '0.75rem', fontSize: '0.9rem' }}>
                  Loading client consultation inquiries...
                </span>
              </div>
            ) : (
              <div className="table-responsive-wrapper">
                <table className="categories-table">
                  <thead>
                    <tr>
                      <th>Client Name</th>
                      <th>Contact Information</th>
                      <th>Event Discipline</th>
                      <th>Inquiry Message</th>
                      <th>Date Received</th>
                      <th style={{ textAlign: 'center' }}>Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence mode="popLayout">
                      {filteredConsultations.map((consultation) => (
                        <motion.tr
                          key={consultation._id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          layout
                        >
                          <td style={{ fontWeight: 700, color: '#ffffff' }}>
                            {consultation.name}
                          </td>
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  fontSize: '0.88rem',
                                  color: '#cbd5e1'
                                }}
                              >
                                <Mail size={13} color="#60a5fa" /> {consultation.email}
                              </div>
                              {consultation.phone && (
                                <div
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    fontSize: '0.84rem',
                                    color: '#94a3b8'
                                  }}
                                >
                                  <Phone size={13} /> {consultation.phone}
                                </div>
                              )}
                            </div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <span className="admin-badge admin-badge-blue">
                                {consultation.eventType || 'Custom Event'}
                              </span>
                              {consultation.eventDate && (
                                <span
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    fontSize: '0.8rem',
                                    color: '#94a3b8'
                                  }}
                                >
                                  <Calendar size={12} /> {consultation.eventDate}
                                </span>
                              )}
                            </div>
                          </td>
                          <td style={{ maxWidth: '280px' }}>
                            <p
                              style={{
                                margin: 0,
                                fontSize: '0.88rem',
                                color: '#cbd5e1',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              {consultation.message}
                            </p>
                          </td>
                          <td className="date-cell">
                            {consultation.createdAt
                              ? new Date(consultation.createdAt).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })
                              : 'Recent'}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <button
                              type="button"
                              className="btn-action-edit"
                              onClick={() => setSelectedInquiry(consultation)}
                              title="Read full inquiry"
                            >
                              <Eye size={14} /> View
                            </button>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            )}

            {!loading && filteredConsultations.length === 0 && (
              <div style={{ padding: '3.5rem 1.5rem', textAlign: 'center', color: '#64748b' }}>
                <MessageSquare size={44} style={{ opacity: 0.3, marginBottom: '0.75rem' }} />
                <p>No consultation requests found matching your query.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Inquiry Detail Modal */}
      <AnimatePresence>
        {selectedInquiry && (
          <div className="modal-overlay" onClick={() => setSelectedInquiry(null)}>
            <motion.div
              className="modal-content"
              style={{ maxWidth: '520px' }}
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
                <h2>Consultation Inquiry</h2>
                <button
                  type="button"
                  onClick={() => setSelectedInquiry(null)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer'
                  }}
                >
                  <X size={20} />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ background: '#0f172a', padding: '1rem', borderRadius: '10px' }}>
                  <strong style={{ display: 'block', fontSize: '1.05rem', color: '#fff', marginBottom: '4px' }}>
                    {selectedInquiry.name}
                  </strong>
                  <div style={{ fontSize: '0.88rem', color: '#94a3b8' }}>{selectedInquiry.email}</div>
                  {selectedInquiry.phone && (
                    <div style={{ fontSize: '0.88rem', color: '#94a3b8' }}>Phone: {selectedInquiry.phone}</div>
                  )}
                  <div style={{ marginTop: '8px' }}>
                    <span className="admin-badge admin-badge-gold">
                      {selectedInquiry.eventType || 'General Consultation'}
                    </span>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>
                    CLIENT MESSAGE & VISION
                  </label>
                  <div
                    style={{
                      background: '#0f172a',
                      padding: '1rem',
                      borderRadius: '10px',
                      color: '#e2e8f0',
                      fontSize: '0.92rem',
                      lineHeight: '1.6',
                      whiteSpace: 'pre-wrap'
                    }}
                  >
                    {selectedInquiry.message}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                  <button
                    type="button"
                    className="btn-submit"
                    onClick={() => {
                      window.location.href = `mailto:${selectedInquiry.email}?subject=Regarding Your Eventify Consultation Inquiry`;
                    }}
                  >
                    Reply via Email
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ConsultationList;
