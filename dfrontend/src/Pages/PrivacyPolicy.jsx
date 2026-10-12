import React from 'react';
import { Shield, Lock, Eye, FileText } from 'lucide-react';

const PrivacyPolicy = () => {
    return (
        <div style={{ maxWidth: '850px', margin: '40px auto', padding: '0 24px', minHeight: '75vh', color: '#374151', lineHeight: 1.8 }}>
            <div style={{ marginBottom: '32px' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '9999px', background: 'rgba(79, 70, 229, 0.1)', color: '#4f46e5', fontWeight: 600, fontSize: '0.85rem', marginBottom: '10px' }}>
                    <Shield size={14} /> Legal & Compliance
                </span>
                <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: '#111827', margin: '0 0 10px 0' }}>Privacy Policy</h1>
                <p style={{ color: '#6b7280', margin: 0, fontSize: '0.95rem' }}>Last updated: October 2026</p>
            </div>

            <div style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid #e5e7eb', padding: '36px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                <section style={{ marginBottom: '28px' }}>
                    <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#111827', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Lock size={20} color="#4f46e5" /> 1. Information We Collect
                    </h2>
                    <p>
                        We collect personal identification information including your name, email address, phone number, and event details when you register, book a consultation, or submit an inquiry on Eventify.
                    </p>
                </section>

                <section style={{ marginBottom: '28px' }}>
                    <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#111827', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Eye size={20} color="#4f46e5" /> 2. How We Use Your Data
                    </h2>
                    <p>
                        Your information is utilized solely to provide bespoke event management, confirm consultations, communicate operational updates, and maintain secure communication through our live concierge chat system. We never sell or lease your personal information to third parties.
                    </p>
                </section>

                <section style={{ marginBottom: '28px' }}>
                    <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#111827', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Shield size={20} color="#4f46e5" /> 3. Data Protection & Security
                    </h2>
                    <p>
                        All passwords are encrypted with industry-standard bcrypt hashing. Communications with our servers are secured via SSL/TLS encryption. Sensitive administrative actions are recorded in a tamper-resistant audit log.
                    </p>
                </section>

                <section>
                    <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#111827', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FileText size={20} color="#4f46e5" /> 4. Your Rights
                    </h2>
                    <p>
                        You have the right to request access to your personal data, request corrections, or ask for account deletion by contacting our privacy compliance desk at <a href="mailto:privacy@eventify.com" style={{ color: '#4f46e5' }}>privacy@eventify.com</a>.
                    </p>
                </section>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
