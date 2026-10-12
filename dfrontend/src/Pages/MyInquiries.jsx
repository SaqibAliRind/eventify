import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, MessageSquare, CheckCircle, AlertCircle, RefreshCw, Sparkles, Phone, Mail, ArrowRight } from 'lucide-react';
import api from '../Utils/api';
import { useToast } from '../Context/ToastContext';

const MyInquiries = () => {
    const [inquiries, setInquiries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedInquiry, setSelectedInquiry] = useState(null);
    const toast = useToast();

    const fetchInquiries = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('eventify_token');
            const res = await api.get('/consultations/me', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setInquiries(res.data.data);
            }
        } catch (err) {
            console.error('Fetch inquiries error:', err);
            toast?.error?.('Unable to load your inquiries. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInquiries();
    }, []);

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Resolved':
                return (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '9999px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.25)', fontSize: '0.85rem', fontWeight: 600 }}>
                        <CheckCircle size={14} /> Confirmed / Resolved
                    </span>
                );
            case 'Contacted':
                return (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '9999px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.25)', fontSize: '0.85rem', fontWeight: 600 }}>
                        <Clock size={14} /> Concierge In Touch
                    </span>
                );
            default:
                return (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '9999px', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.25)', fontSize: '0.85rem', fontWeight: 600 }}>
                        <AlertCircle size={14} /> Under Review
                    </span>
                );
        }
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 24px', minHeight: '80vh' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1 style={{ fontSize: '2.2rem', fontWeight: 800, margin: 0, color: '#111827', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Sparkles color="#4f46e5" size={30} /> My Inquiries & Bookings
                    </h1>
                    <p style={{ color: '#6b7280', margin: '8px 0 0 0', fontSize: '1rem' }}>
                        Track the real-time concierge review status and notes for your celebration requests.
                    </p>
                </div>
                <button
                    onClick={fetchInquiries}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 18px', borderRadius: '10px', background: '#f3f4f6', border: '1px solid #e5e7eb', cursor: 'pointer', fontWeight: 600, color: '#374151', transition: 'all 0.2s' }}
                >
                    <RefreshCw size={16} className={loading ? 'spin' : ''} /> Refresh
                </button>
            </div>

            {loading ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
                    {[1, 2, 3].map(n => (
                        <div key={n} style={{ height: '220px', borderRadius: '16px', background: '#f3f4f6', animation: 'pulse 1.5s infinite' }} />
                    ))}
                </div>
            ) : inquiries.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', background: '#ffffff', borderRadius: '20px', border: '1px solid #f3f4f6', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                    <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'rgba(79, 70, 229, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                        <MessageSquare size={32} color="#4f46e5" />
                    </div>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '0 0 8px', color: '#1f2937' }}>No Inquiries Yet</h3>
                    <p style={{ color: '#6b7280', maxWidth: '460px', margin: '0 auto 24px', fontSize: '0.95rem' }}>
                        You haven't requested any custom consultations yet. Explore our luxury event catalogue and book a bespoke consultation.
                    </p>
                    <Link
                        to="/events"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', background: '#4f46e5', color: '#ffffff', textDecoration: 'none', borderRadius: '10px', fontWeight: 600 }}
                    >
                        Browse Curated Events <ArrowRight size={18} />
                    </Link>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '24px' }}>
                    {inquiries.map((inquiry) => (
                        <div
                            key={inquiry._id}
                            style={{
                                background: '#ffffff',
                                borderRadius: '18px',
                                border: '1px solid #e5e7eb',
                                padding: '24px',
                                boxShadow: '0 4px 15px rgba(0,0,0,0.04)',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                            }}
                        >
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                                    <span style={{ fontSize: '0.8rem', color: '#9ca3af', fontWeight: 500 }}>
                                        #{inquiry._id.slice(-6).toUpperCase()}
                                    </span>
                                    {getStatusBadge(inquiry.status)}
                                </div>

                                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827', margin: '0 0 8px 0' }}>
                                    {inquiry.eventType}
                                </h3>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px', fontSize: '0.9rem', color: '#4b5563' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Calendar size={16} color="#6366f1" />
                                        <span>Target Date: <strong>{inquiry.eventDate ? new Date(inquiry.eventDate).toLocaleDateString() : 'Flexible'}</strong></span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Phone size={16} color="#6366f1" />
                                        <span>{inquiry.phone}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Mail size={16} color="#6366f1" />
                                        <span>{inquiry.email}</span>
                                    </div>
                                </div>

                                <div style={{ background: '#f9fafb', padding: '12px 14px', borderRadius: '10px', fontSize: '0.9rem', color: '#374151', marginBottom: '14px', borderLeft: '3px solid #6366f1' }}>
                                    <strong style={{ display: 'block', fontSize: '0.8rem', textTransform: 'uppercase', color: '#6b7280', marginBottom: '4px' }}>Your Inquiry:</strong>
                                    "{inquiry.message}"
                                </div>

                                {inquiry.adminNotes && (
                                    <div style={{ background: 'rgba(79, 70, 229, 0.05)', padding: '12px 14px', borderRadius: '10px', fontSize: '0.9rem', color: '#4338ca', border: '1px solid rgba(79, 70, 229, 0.15)', marginBottom: '14px' }}>
                                        <strong style={{ display: 'block', fontSize: '0.8rem', textTransform: 'uppercase', color: '#4f46e5', marginBottom: '4px' }}>Concierge Team Note:</strong>
                                        {inquiry.adminNotes}
                                    </div>
                                )}
                            </div>

                            <div style={{ paddingTop: '16px', borderTop: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: '#9ca3af' }}>
                                <span>Submitted: {new Date(inquiry.createdAt).toLocaleDateString()}</span>
                                <span style={{ color: '#4f46e5', fontWeight: 600 }}>Active Inquiry</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyInquiries;
