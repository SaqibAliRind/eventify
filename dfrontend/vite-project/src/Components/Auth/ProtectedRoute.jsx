import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';

const ProtectedRoute = ({ children, adminOnly = false, inverse = false }) => {
    const { user, isAuthenticated, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="loading-container" style={{ height: '50vh' }}>
                <div className="premium-loader"></div>
            </div>
        );
    }

    if (inverse) {
        // If authenticated and trying to access an public-only page (like login)
        if (isAuthenticated) {
            return <Navigate to="/" replace />;
        }
        return children;
    }

    if (!isAuthenticated) {
        // Redirect to login if not authenticated
        return <Navigate to="/auth" state={{ from: location }} replace />;
    }

    if (adminOnly && user?.role !== 'admin') {
        // Redirect to home if admin access is required but user is not an admin
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
