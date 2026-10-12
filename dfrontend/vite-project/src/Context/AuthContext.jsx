import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check for existing user session on load
    useEffect(() => {
        try {
            const savedUser = localStorage.getItem('eventify_user');
            if (savedUser) {
                setUser(JSON.parse(savedUser));
            }
        } catch (error) {
            console.error("Failed to parse user from localStorage", error);
            localStorage.removeItem('eventify_user');
        }
        setLoading(false);
    }, []);

    // Login function
    const login = (userData) => {
        const userInfo = {
            id: userData.id,
            name: userData.name,
            email: userData.email,
            phone: userData.phone,
            role: userData.role || 'user',
            image: userData.image || null
        };
        setUser(userInfo);
        localStorage.setItem('eventify_user', JSON.stringify(userInfo));
        if (userData.token) {
            localStorage.setItem('eventify_token', userData.token);
        }
        return true;
    };

    // Logout function
    const logout = () => {
        setUser(null);
        localStorage.removeItem('eventify_user');
        localStorage.removeItem('eventify_token');
    };

    // Register function (updates user state after successful login/verification)
    const register = (userData) => {
        return login(userData);
    };

    const value = {
        user,
        loading,
        login,
        logout,
        register,
        isAuthenticated: !!user
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;
