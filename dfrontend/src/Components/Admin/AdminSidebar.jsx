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
  X,
  ExternalLink,
  Sparkles,
  Star,
  FileText
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import '../../Pages/AdminDashboard.css';

const AdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = [
    { title: 'Dashboard', icon: <LayoutDashboard size={19} />, path: '/admin' },
    { title: 'Manage Events', icon: <Calendar size={19} />, path: '/admin/events' },
    { title: 'Categories', icon: <Layers size={19} />, path: '/admin/categories' },
    { title: 'Users Directory', icon: <Users size={19} />, path: '/admin/users' },
    { title: 'Consultations', icon: <MessageCircle size={19} />, path: '/admin/consultations' },
    { title: 'Reviews', icon: <Star size={19} />, path: '/admin/reviews' },
    { title: 'Live Chat', icon: <MessageCircle size={19} />, path: '/admin/chat' },
    { title: 'Audit Log', icon: <FileText size={19} />, path: '/admin/audit-log' },
  ];

  return (
    <>
      {/* Mobile Header Bar with Hamburger */}
      <div className="admin-mobile-topbar">
        <button
          type="button"
          className="admin-mobile-toggle"
          onClick={toggleSidebar}
          aria-label="Open sidebar"
        >
          <Menu size={22} />
        </button>
        <div className="admin-mobile-brand">
          <Sparkles size={16} className="text-amber" />
          <span>Eventify Command</span>
        </div>
        <Link to="/" className="admin-mobile-site-link" title="Visit Live Site">
          <ExternalLink size={18} />
        </Link>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div className="admin-sidebar-overlay" onClick={toggleSidebar}></div>
      )}

      {/* Main Admin Sidebar */}
      <aside className={`admin-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <Link to="/admin" className="sidebar-logo">
            <div className="admin-logo-badge">
              <Sparkles size={18} />
            </div>
            <div className="admin-logo-text">
              <strong>Eventify</strong>
              <span className="admin-tag-pill">ADMIN</span>
            </div>
          </Link>
          <button
            type="button"
            className="close-sidebar-btn"
            onClick={toggleSidebar}
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-group-title">MAIN NAVIGATION</div>
          {menuItems.map((item) => {
            const isItemActive =
              item.path === '/admin'
                ? location.pathname === '/admin'
                : location.pathname.startsWith(item.path);

            return (
              <Link
                to={item.path}
                key={item.title}
                className="nav-link-wrapper"
                onClick={() => setIsOpen(false)}
              >
                <div className={`nav-item ${isItemActive ? 'active' : ''}`}>
                  <span className="nav-icon-wrap">{item.icon}</span>
                  <span className="nav-title-text">{item.title}</span>
                  {isItemActive && <span className="active-pill-dot"></span>}
                </div>
              </Link>
            );
          })}

          <div className="nav-group-title">QUICK ACCESS</div>
          <Link to="/" className="nav-link-wrapper" onClick={() => setIsOpen(false)}>
            <div className="nav-item external-site-nav">
              <span className="nav-icon-wrap">
                <ExternalLink size={18} />
              </span>
              <span className="nav-title-text">View Public Website</span>
            </div>
          </Link>
        </nav>

        <div className="sidebar-footer">
          <button type="button" className="admin-logout-btn" onClick={handleLogout}>
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
