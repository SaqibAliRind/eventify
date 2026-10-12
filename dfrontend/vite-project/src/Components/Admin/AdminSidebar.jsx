import React, { useState } from 'react';
import {
    LayoutDashboard,
    Users,
    BarChart3,
    Settings,
    LogOut,
    ShieldCheck,
    Calendar,
    Layers,
    Menu,
    MessageCircle,
    Star,
    X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import '../../Pages/AdminDashboard.css'; // Corrected import path

const AdminSidebar = () => {
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    const menuItems = [
        { title: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/admin' },
        { title: 'Users', icon: <Users size={20} />, path: '/admin/users' },
        { title: 'Categories', icon: <Layers size={20} />, path: '/admin/categories' },
        { title: 'Consultations', icon: <MessageCircle size={20} />, path: '/admin/consultations' },
        { title: 'Analytics', icon: <BarChart3 size={20} />, path: '/admin/analytics' },
        { title: 'Events', icon: <Calendar size={20} />, path: '/admin/events' },
        { title: 'Security', icon: <ShieldCheck size={20} />, path: '/admin/security' },
        { title: 'Chat', icon: <MessageCircle size={20} />, path: '/admin/chat' },
        { title: 'Reviews', icon: <Star size={20} />, path: '/admin/reviews' },
        { title: 'Settings', icon: <Settings size={20} />, path: '/admin/settings' },
    ];

    return (
        <>
            {/* Mobile Toggle Button */}
            <button className="mobile-menu-btn" onClick={toggleSidebar}>
                <Menu size={24} color="#fff" />
            </button>

            {/* Overlay for mobile */}
            {isOpen && <div className="sidebar-overlay" onClick={toggleSidebar}></div>}

            <div className={`admin-sidebar ${isOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <motion.div
                        className="sidebar-logo"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <LayoutDashboard size={28} className="text-blue-500" />
                        <span>EventifyPro</span>
                    </motion.div>
                    <button className="close-sidebar-btn" onClick={toggleSidebar}>
                        <X size={24} color="#94a3b8" />
                    </button>
                </div>

                <nav className="sidebar-nav">
                    {menuItems.map((item, index) => (
                        <Link
                            to={item.path}
                            key={item.title}
                            style={{ textDecoration: 'none' }}
                            onClick={() => setIsOpen(false)} // Close on click (mobile)
                        >
                            <motion.div
                                className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ x: 5, backgroundColor: 'rgba(59, 130, 246, 0.15)' }}
                            >
                                {item.icon}
                                <span>{item.title}</span>
                            </motion.div>
                        </Link>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <motion.div
                        className="nav-item"
                        whileHover={{ x: 5, color: '#ef4444' }}
                    >
                        <LogOut size={20} />
                        <span>Logout</span>
                    </motion.div>
                </div>
            </div>
        </>
    );
};

export default AdminSidebar;
