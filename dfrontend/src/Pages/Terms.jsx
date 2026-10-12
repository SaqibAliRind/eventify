import React from 'react';
import { Scale, CheckCircle2, AlertTriangle, FileCheck } from 'lucide-react';

const Terms = () => {
    return (
        <div style={{ maxWidth: '850px', margin: '40px auto', padding: '0 24px', minHeight: '75vh', color: '#374151', lineHeight: 1.8 }}>
            <div style={{ marginBottom: '32px' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '9999px', background: 'rgba(79, 70, 229, 0.1)', color: '#4f46e5', fontWeight: 600, fontSize: '0.85rem', marginBottom: '10px' }}>
                    <Scale size={14} /> Terms of Service
                </span>
                <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: '#111827', margin: '0 0 10px 0' }}>Terms & Conditions</h1>
                <p style={{ color: '#6b7280', margin: 0, fontSize: '0.95rem' }}>Effective date: October 2026</p>
            </div>

            <div style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid #e5e7eb', padding: '36px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                <section style={{ marginBottom: '28px' }}>
                    <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#111827', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <CheckCircle2 size={20} color="#4f46e5" /> 1. Acceptance of Terms
                    </h2>
                    <p>
                        By visiting, registering, or requesting event consultations through Eventify, you agree to comply with and be bound by these Terms of Service. If you do not agree, please discontinue using the platform.
                    </p>
                </section>

                <section style={{ marginBottom: '28px' }}>
                    <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#111827', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FileCheck size={20} color="#4f46e5" /> 2. Consultation & Booking Terms
                    </h2>
                    <p>
                        Submitting an inquiry through Eventify constitutes an expression of interest and does not guarantee venue or date exclusivity until a formal agreement is executed with our event management desk.
                    </p>
                </section>

                <section style={{ marginBottom: '28px' }}>
                    <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#111827', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <AlertTriangle size={20} color="#4f46e5" /> 3. User Conduct & Security
                    </h2>
                    <p>
                        Users are responsible for safeguarding their login credentials. Any malicious activity, injection attempts, unauthorized access, or abusive messaging on our live support channels will result in immediate account termination.
                    </p>
                </section>

                <section>
                    <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#111827', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Scale size={20} color="#4f46e5" /> 4. Intellectual Property
                    </h2>
                    <p>
                        All showcase photography, branding, logo marks, and curated catalogues presented on Eventify are protected by applicable intellectual property laws.
                    </p>
                </section>
            </div>
        </div>
    );
};

export default Terms;
