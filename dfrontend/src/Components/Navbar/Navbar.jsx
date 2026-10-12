import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCategories } from '../../Features/CategorySlice';
import {
  Sparkles,
  ChevronDown,
  User as UserIcon,
  Calendar,
  LogOut,
  Settings,
  Shield,
  Menu,
  X,
  Compass,
  ArrowRight,
  MessageSquare
} from 'lucide-react';
import './Navbar.css';
import NotificationBell from './NotificationBell';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const profileRef = useRef(null);
  const categoriesRef = useRef(null);
  const categoryLeaveTimeoutRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const dispatch = useDispatch();
  const { categories, loading } = useSelector((state) => state.categories);

  // Fetch categories on mount
  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // Track scroll for sticky elevated glass navbar
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 25);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
      if (categoriesRef.current && !categoriesRef.current.contains(event.target)) {
        setCategoriesOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close mobile drawer on route change or Escape
  useEffect(() => {
    setMenuOpen(false);
    setProfileOpen(false);
    setCategoriesOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        setProfileOpen(false);
        setCategoriesOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (categoryLeaveTimeoutRef.current) {
        clearTimeout(categoryLeaveTimeoutRef.current);
      }
    };
  }, []);

  const handleProfileClick = () => {
    setProfileOpen((prev) => !prev);
  };

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    setMenuOpen(false);
    navigate('/');
  };

  const getUserInitials = () => {
    if (user?.name) {
      const parts = user.name.trim().split(' ');
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return parts[0].substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <header className={`navbar-wrapper ${scrolled ? 'scrolled' : ''}`}>
        <nav className="navbar-container" aria-label="Main navigation">
          {/* Logo */}
          <Link to="/" className="navbar-logo" aria-label="Eventify Home">
            <span className="logo-icon-wrap">
              <Sparkles size={20} className="logo-sparkle" />
            </span>
            <span className="logo-text">
              Eventify<span className="logo-dot">.</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="navbar-center">
            <ul className="nav-links-list">
              <li>
                <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
                  Home
                </Link>
              </li>

              {/* Events with Mega / Dropdown */}
              <li
                className="dropdown-wrapper"
                ref={categoriesRef}
                onMouseEnter={() => {
                  if (categoryLeaveTimeoutRef.current) {
                    clearTimeout(categoryLeaveTimeoutRef.current);
                  }
                  setCategoriesOpen(true);
                }}
                onMouseLeave={() => {
                  categoryLeaveTimeoutRef.current = setTimeout(() => {
                    setCategoriesOpen(false);
                  }, 300);
                }}
              >
                <button
                  type="button"
                  className={`nav-link dropdown-trigger ${isActive('/events') ? 'active' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (categoryLeaveTimeoutRef.current) {
                      clearTimeout(categoryLeaveTimeoutRef.current);
                    }
                    setCategoriesOpen((prev) => !prev);
                  }}
                  aria-expanded={categoriesOpen}
                  aria-haspopup="true"
                >
                  <span>Events</span>
                  <ChevronDown
                    size={15}
                    className={`dropdown-chevron ${categoriesOpen ? 'rotated' : ''}`}
                  />
                </button>

                {categoriesOpen && (
                  <div className="dropdown-panel animate-in">
                    <div className="dropdown-panel-header">
                      <Link
                        to="/events"
                        className="dropdown-panel-banner"
                        onClick={() => setCategoriesOpen(false)}
                      >
                        <div className="banner-content">
                          <span className="banner-badge">All Collections</span>
                          <strong>Explore All Celebrations</strong>
                        </div>
                        <ArrowRight size={16} />
                      </Link>
                    </div>

                    <div className="dropdown-items-grid">
                      {loading ? (
                        <div className="dropdown-loading">
                          <div className="dropdown-skeleton"></div>
                          <div className="dropdown-skeleton"></div>
                        </div>
                      ) : categories && categories.length > 0 ? (
                        categories.map((category) => (
                          <Link
                            key={category._id}
                            to={`/events?category=${encodeURIComponent(category.categoryName || category.name)}`}
                            className="dropdown-item"
                            onClick={() => setCategoriesOpen(false)}
                          >
                            <span className="item-bullet"></span>
                            <span className="item-name">{category.categoryName || category.name}</span>
                          </Link>
                        ))
                      ) : (
                        <div className="dropdown-empty">No categories available</div>
                      )}
                    </div>
                  </div>
                )}
              </li>

              <li>
                <Link to="/about" className={`nav-link ${isActive('/about') ? 'active' : ''}`}>
                  About
                </Link>
              </li>
              <li>
                <Link to="/contact" className={`nav-link ${isActive('/contact') ? 'active' : ''}`}>
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Right Actions: Admin link, Notifications & Auth/Profile */}
          <div className="navbar-right">
            {/* Admin Portal Shortcut */}
            <Link to="/admin" className="admin-chip" title="Admin Portal">
              <Shield size={14} />
              <span>Admin</span>
            </Link>

            {/* Notification Bell (only for authenticated users) */}
            <NotificationBell />

            {/* Profile Dropdown or Login CTA */}
            {isAuthenticated ? (
              <div className="profile-container" ref={profileRef}>
                <button
                  type="button"
                  className="profile-btn"
                  onClick={handleProfileClick}
                  aria-expanded={profileOpen}
                  aria-label="User menu"
                >
                  <div className="user-avatar-badge">
                    {user?.image ? (
                      <img src={user.image} alt={user.name || 'User'} className="avatar-img" />
                    ) : (
                      <span>{getUserInitials()}</span>
                    )}
                  </div>
                  <span className="profile-btn-name">{user?.name?.split(' ')[0] || 'Account'}</span>
                  <ChevronDown
                    size={14}
                    className={`profile-chevron ${profileOpen ? 'rotated' : ''}`}
                  />
                </button>

                {profileOpen && (
                  <div className="profile-dropdown-menu animate-in">
                    <div className="profile-card-header">
                      <div className="menu-avatar">
                        {user?.image ? (
                          <img src={user.image} alt={user.name} className="avatar-img" />
                        ) : (
                          <span>{getUserInitials()}</span>
                        )}
                      </div>
                      <div className="menu-user-meta">
                        <span className="menu-user-name">{user?.name || 'Valued User'}</span>
                        <span className="menu-user-email">{user?.email || ''}</span>
                        {user?.role && (
                          <span className="menu-role-tag">{user.role.toUpperCase()}</span>
                        )}
                      </div>
                    </div>

                    <div className="menu-divider"></div>

                    <Link
                      to="/profile"
                      className="profile-menu-item"
                      onClick={() => setProfileOpen(false)}
                    >
                      <UserIcon size={16} />
                      <span>My Profile</span>
                    </Link>

                    <Link
                      to="/my-inquiries"
                      className="profile-menu-item"
                      onClick={() => setProfileOpen(false)}
                    >
                      <MessageSquare size={16} />
                      <span>My Inquiries</span>
                    </Link>

                    <Link
                      to="/events"
                      className="profile-menu-item"
                      onClick={() => setProfileOpen(false)}
                    >
                      <Calendar size={16} />
                      <span>Discover Events</span>
                    </Link>

                    <div className="menu-divider"></div>

                    <button
                      type="button"
                      className="profile-menu-item logout-action"
                      onClick={handleLogout}
                    >
                      <LogOut size={16} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="auth-buttons-group">
                <Link to="/auth" className="login-text-btn">
                  Sign In
                </Link>
                <Link to="/auth" className="get-started-btn">
                  <span>Get Started</span>
                  <ArrowRight size={15} />
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              className="hamburger-btn"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? 'Close Navigation' : 'Open Navigation'}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Drawer Overlay */}
      {menuOpen && (
        <div className="mobile-drawer-backdrop" onClick={() => setMenuOpen(false)}></div>
      )}

      {/* Mobile Off-Canvas Drawer */}
      <aside className={`mobile-nav-drawer ${menuOpen ? 'open' : ''}`} aria-hidden={!menuOpen}>
        <div className="mobile-drawer-header">
          <Link to="/" className="navbar-logo" onClick={() => setMenuOpen(false)}>
            <span className="logo-icon-wrap">
              <Sparkles size={18} className="logo-sparkle" />
            </span>
            <span className="logo-text">
              Eventify<span className="logo-dot">.</span>
            </span>
          </Link>
          <button
            type="button"
            className="drawer-close-btn"
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
          >
            <X size={22} />
          </button>
        </div>

        <div className="mobile-drawer-content">
          <ul className="mobile-links-list">
            <li>
              <Link
                to="/"
                className={`mobile-link ${isActive('/') ? 'active' : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                <span>Home</span>
              </Link>
            </li>
            <li>
              <Link
                to="/events"
                className={`mobile-link ${isActive('/events') ? 'active' : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                <span>All Events</span>
              </Link>
            </li>
            <li>
              <Link
                to="/about"
                className={`mobile-link ${isActive('/about') ? 'active' : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                <span>About</span>
              </Link>
            </li>
            <li>
              <Link
                to="/contact"
                className={`mobile-link ${isActive('/contact') ? 'active' : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                <span>Contact</span>
              </Link>
            </li>
            <li>
              <Link
                to="/admin"
                className={`mobile-link admin-mobile-link ${isActive('/admin') ? 'active' : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                <Shield size={16} />
                <span>Admin Dashboard</span>
              </Link>
            </li>
          </ul>

          {/* Categories Quick List in Mobile */}
          {categories && categories.length > 0 && (
            <div className="mobile-categories-box">
              <span className="mobile-section-label">Popular Categories</span>
              <div className="mobile-categories-pills">
                {categories.slice(0, 5).map((cat) => (
                  <Link
                    key={cat._id}
                    to={`/events?category=${encodeURIComponent(cat.categoryName || cat.name)}`}
                    className="mobile-category-pill"
                    onClick={() => setMenuOpen(false)}
                  >
                    {cat.categoryName || cat.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Mobile Drawer Footer with Auth */}
        <div className="mobile-drawer-footer">
          {isAuthenticated ? (
            <div className="mobile-user-actions">
              <div className="mobile-user-summary">
                <div className="user-avatar-badge">
                  {user?.image ? (
                    <img src={user.image} alt={user.name} className="avatar-img" />
                  ) : (
                    <span>{getUserInitials()}</span>
                  )}
                </div>
                <div className="mobile-user-info">
                  <strong>{user?.name}</strong>
                  <span>{user?.email}</span>
                </div>
              </div>
              <div className="mobile-footer-buttons">
                <Link
                  to="/profile"
                  className="btn-secondary mobile-btn"
                  onClick={() => setMenuOpen(false)}
                >
                  <UserIcon size={16} /> Profile
                </Link>
                <Link
                  to="/my-inquiries"
                  className="btn-secondary mobile-btn"
                  onClick={() => setMenuOpen(false)}
                >
                  <MessageSquare size={16} /> Inquiries
                </Link>
                <button
                  type="button"
                  className="btn-primary mobile-btn logout-btn"
                  onClick={handleLogout}
                >
                  <LogOut size={16} /> Logout
                </button>
              </div>
            </div>
          ) : (
            <div className="mobile-guest-actions">
              <Link
                to="/auth"
                className="btn-secondary mobile-btn"
                onClick={() => setMenuOpen(false)}
              >
                Sign In
              </Link>
              <Link
                to="/auth"
                className="btn-primary mobile-btn"
                onClick={() => setMenuOpen(false)}
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Navbar;
