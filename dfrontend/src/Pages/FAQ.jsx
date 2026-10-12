import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Sparkles, MessageCircle } from 'lucide-react';

const faqs = [
    {
        q: "What types of events does Eventify specialize in?",
        a: "Eventify curates luxury weddings, corporate summits, galas, private destination anniversaries, and high-profile product showcases. Every experience is customized to the client's exact aesthetic and spatial vision."
    },
    {
        q: "How does the bespoke consultation process work?",
        a: "You can submit an inquiry through our platform specifying your event date, estimated guests, and vision. Our concierge team reviews your brief within 24 hours and coordinates a dedicated video or in-person consultation."
    },
    {
        q: "Can I manage multiple bookings or consultations simultaneously?",
        a: "Yes! Logged-in clients have access to the 'My Inquiries' dashboard where you can track the status of all active inquiries, review concierge team notes, and communicate in real-time."
    },
    {
        q: "Is live concierge support available 24/7?",
        a: "Our concierge team is active during standard operational hours. If you message outside active hours, our automated system securely logs your conversation and notifies the concierge team via email immediately."
    },
    {
        q: "What is your rescheduling and cancellation policy?",
        a: "Rescheduling windows depend on specific vendor contracts and venue commitments. Inquiries marked 'Contacted' can be adjusted directly with your assigned senior event director."
    }
];

const FAQ = () => {
    const [openIndex, setOpenIndex] = useState(0);

    return (
        <div style={{ maxWidth: '900px', margin: '40px auto', padding: '0 24px', minHeight: '75vh' }}>
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '9999px', background: 'rgba(79, 70, 229, 0.1)', color: '#4f46e5', fontWeight: 600, fontSize: '0.85rem', marginBottom: '12px' }}>
                    <Sparkles size={14} /> Frequently Asked Questions
                </span>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#111827', margin: '0 0 12px' }}>
                    Everything You Need to Know
                </h1>
                <p style={{ color: '#6b7280', fontSize: '1.05rem', margin: 0 }}>
                    Transparent answers about our luxury event production, bespoke consultations, and concierge services.
                </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {faqs.map((faq, i) => {
                    const isOpen = openIndex === i;
                    return (
                        <div
                            key={i}
                            style={{
                                border: '1px solid #e5e7eb',
                                borderRadius: '16px',
                                background: '#ffffff',
                                overflow: 'hidden',
                                transition: 'all 0.2s',
                                boxShadow: isOpen ? '0 8px 24px rgba(0,0,0,0.05)' : 'none'
                            }}
                        >
                            <button
                                onClick={() => setOpenIndex(isOpen ? null : i)}
                                style={{
                                    width: '100%',
                                    padding: '20px 24px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    fontSize: '1.1rem',
                                    fontWeight: 700,
                                    color: isOpen ? '#4f46e5' : '#1f2937'
                                }}
                            >
                                <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <HelpCircle size={20} color={isOpen ? '#4f46e5' : '#9ca3af'} />
                                    {faq.q}
                                </span>
                                {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                            </button>
                            {isOpen && (
                                <div style={{ padding: '0 24px 20px 56px', color: '#4b5563', fontSize: '1rem', lineHeight: 1.7 }}>
                                    {faq.a}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div style={{ marginTop: '50px', padding: '30px', borderRadius: '20px', background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.08) 0%, rgba(124, 58, 237, 0.05) 100%)', textAlign: 'center', border: '1px solid rgba(79, 70, 229, 0.15)' }}>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#111827', margin: '0 0 8px' }}>Have a question not listed here?</h3>
                <p style={{ color: '#6b7280', margin: '0 0 18px', fontSize: '0.95rem' }}>Our live concierge team is ready to answer your inquiries in real-time.</p>
                <button
                    onClick={() => {
                        const widget = document.querySelector('.floating-chat-trigger') || document.querySelector('[aria-label="Open Chat"]');
                        if (widget) widget.click();
                    }}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '10px', background: '#4f46e5', color: '#ffffff', border: 'none', fontWeight: 600, cursor: 'pointer' }}
                >
                    <MessageCircle size={18} /> Open Live Support
                </button>
            </div>
        </div>
    );
};

export default FAQ;
