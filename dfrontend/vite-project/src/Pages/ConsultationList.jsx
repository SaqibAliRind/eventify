import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminSidebar from '../Components/Admin/AdminSidebar';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Mail, Phone, Calendar, MessageSquare, Trash2 } from 'lucide-react';
import './CategoryList.css'; // Reusing the same CSS for consistent table styling

const ConsultationList = () => {
    const [consultations, setConsultations] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchConsultations = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('eventify_token');
            // Note: The router path is /admin/consultations, but verify full API URL
            // AdminRouter is usually mounted at /admin
            const response = await axios.get(`http://${window.location.hostname}:9000/admin/consultations`, {
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

    return (
        <div className="admin-layout">
            <AdminSidebar />

            <main className="admin-main">
                <div className="category-list-container">
                    <div className="category-header">
                        <div className="header-title">
                            <h1>Consultation Requests</h1>
                            <p>View inquiries from potential clients.</p>
                        </div>
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
                                        <th>Name</th>
                                        <th>Contact Info</th>
                                        <th>Event Details</th>
                                        <th>Message</th>
                                        <th>Date Received</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <AnimatePresence mode="popLayout">
                                        {consultations.map((consultation) => (
                                            <motion.tr
                                                key={consultation._id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                layout
                                            >
                                                <td style={{ fontWeight: 600, color: '#e2e8f0' }}>
                                                    {consultation.name}
                                                </td>
                                                <td>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', color: '#94a3b8' }}>
                                                            <Mail size={14} /> {consultation.email}
                                                        </div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', color: '#94a3b8' }}>
                                                            <Phone size={14} /> {consultation.phone}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                        <span style={{
                                                            display: 'inline-block',
                                                            padding: '2px 8px',
                                                            borderRadius: '4px',
                                                            background: 'rgba(59, 130, 246, 0.1)',
                                                            color: '#60a5fa',
                                                            fontSize: '0.85rem',
                                                            width: 'fit-content'
                                                        }}>
                                                            {consultation.eventType}
                                                        </span>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', color: '#94a3b8' }}>
                                                            <Calendar size={14} /> {consultation.eventDate ? new Date(consultation.eventDate).toLocaleDateString() : 'N/A'}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td style={{ maxWidth: '300px' }}>
                                                    <div style={{
                                                        display: 'flex',
                                                        gap: '8px',
                                                        alignItems: 'flex-start'
                                                    }}>
                                                        <MessageSquare size={16} color="#94a3b8" style={{ marginTop: '3px', flexShrink: 0 }} />
                                                        <p style={{
                                                            margin: 0,
                                                            fontSize: '0.9rem',
                                                            color: '#cbd5e1',
                                                            lineHeight: '1.4',
                                                            whiteSpace: 'pre-wrap'
                                                        }}>
                                                            {consultation.message}
                                                        </p>
                                                    </div>
                                                </td>
                                                <td className="date-cell">
                                                    {new Date(consultation.createdAt).toLocaleDateString()} <br />
                                                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                                        {new Date(consultation.createdAt).toLocaleTimeString()}
                                                    </span>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </AnimatePresence>
                                </tbody>
                            </table>
                        )}
                        {!loading && consultations.length === 0 && (
                            <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                                <MessageSquare size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                                <p>No consultation requests found.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ConsultationList;
