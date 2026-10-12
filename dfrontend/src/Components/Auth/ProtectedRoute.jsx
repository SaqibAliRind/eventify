import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';

export const ProtectedRoute = ({ children, requireAdmin = false }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', color: 'var(--accent-gold)' }}>
                Verifying authorization...
            </div>
        );
    }

    const token = localStorage.getItem('eventify_token');

    if (!user || !token) {
        // Redirect guest to auth page
        return <Navigate to="/auth" state={{ from: location }} replace />;
    }

    if (requireAdmin && user.role !== 'admin') {
        // Non-admin user attempting to access admin route
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
