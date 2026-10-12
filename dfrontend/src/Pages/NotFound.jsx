import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Home, ArrowLeft } from 'lucide-react';

const NotFound = () => {
    return (
        <div style={{
            minHeight: '75vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px 20px',
            textAlign: 'center',
            background: 'linear-gradient(180deg, rgba(249, 250, 251, 0.5) 0%, rgba(243, 244, 246, 0.8) 100%)',
        }}>
            <div style={{
                maxWidth: '520px',
                background: '#ffffff',
                padding: '48px 36px',
                borderRadius: '24px',
                border: '1px solid #e5e7eb',
                boxShadow: '0 20px 40px rgba(0,0,0,0.06)'
            }}>
                <div style={{
                    width: '84px',
                    height: '84px',
                    borderRadius: '50%',
                    background: 'rgba(79, 70, 229, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 24px',
                    color: '#4f46e5'
                }}>
                    <Compass size={44} />
                </div>

                <span style={{
                    fontSize: '4.5rem',
                    fontWeight: 900,
                    lineHeight: 1,
                    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    display: 'block',
                    marginBottom: '12px'
                }}>
                    404
                </span>

                <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#111827', margin: '0 0 12px' }}>
                    Page Not Found
                </h2>

                <p style={{ color: '#6b7280', fontSize: '1rem', lineHeight: 1.6, margin: '0 0 32px' }}>
                    The page or celebration experience you are searching for might have been moved, archived, or is currently inaccessible.
                </p>

                <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button
                        onClick={() => window.history.back()}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '12px 20px',
                            borderRadius: '12px',
                            background: '#f3f4f6',
                            color: '#374151',
                            border: '1px solid #e5e7eb',
                            fontWeight: 600,
                            cursor: 'pointer',
                            fontSize: '0.95rem'
                        }}
                    >
                        <ArrowLeft size={18} /> Go Back
                    </button>
                    <Link
                        to="/"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '12px 24px',
                            borderRadius: '12px',
                            background: '#4f46e5',
                            color: '#ffffff',
                            textDecoration: 'none',
                            fontWeight: 600,
                            boxShadow: '0 4px 14px rgba(79, 70, 229, 0.35)',
                            fontSize: '0.95rem'
                        }}
                    >
                        <Home size={18} /> Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default NotFound;
