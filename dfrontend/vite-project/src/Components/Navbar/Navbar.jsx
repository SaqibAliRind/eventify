import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCategories } from '../../Features/CategorySlice';
import './Navbar.css';

const Navbar = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [categoriesOpen, setCategoriesOpen] = useState(false);
    const profileRef = useRef(null);
    const categoriesRef = useRef(null);
    const navigate = useNavigate();
    const { user, isAuthenticated, logout } = useAuth();
    const dispatch = useDispatch();
    const { categories, loading } = useSelector((state) => state.categories);

    // Fetch categories on mount
    useEffect(() => {
        dispatch(fetchCategories());
    }, [dispatch]);

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

    const handleProfileClick = () => {
        setProfileOpen(!profileOpen);
    };

    const handleDropdownLinkClick = () => {
        setProfileOpen(false);
    };

    const handleLogout = () => {
        logout();
        setProfileOpen(false);
        navigate('/');
    };

    // Get user initials for avatar
    const getUserInitials = () => {
        if (user?.name) {
            const names = user.name.split(' ');
            if (names.length >= 2) {
                return (names[0][0] + names[1][0]).toUpperCase();
            }
            return names[0].substring(0, 2).toUpperCase();
        }
        return 'U';
    };

    return (
        <nav className="navbar" aria-label="Main navigation">
            <div className="navbar-logo">
                <span className="logo-text">Eventify</span>
            </div>

            {/* Hamburger (Mobile) */}
            <div
                className={`hamburger ${menuOpen ? 'active' : ''}`}
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Toggle menu"
                role="button"
                tabIndex={0}
            >
                <span></span>
                <span></span>
                <span></span>
            </div>

            {/* Links */}
            <ul className={`navbar-links ${menuOpen ? 'show' : ''}`}>
                <li><Link to="/" className="nav-link" onClick={() => setMenuOpen(false)}>Home</Link></li>
                <li><Link to="/about" className="nav-link" onClick={() => setMenuOpen(false)}>About</Link></li>
                <li><Link to="/contact" className="nav-link" onClick={() => setMenuOpen(false)}>Contact</Link></li>

                {/* Events Dropdown */}
                <li className="categories-dropdown-container" ref={categoriesRef}>
                    <span
                        className="nav-link categories-trigger"
                        onClick={(e) => {
                            e.preventDefault();
                            setCategoriesOpen(!categoriesOpen);
                        }}
                        onMouseEnter={() => {
                            if (window.innerWidth > 768) setCategoriesOpen(true);
                        }}
                    >
                        Events
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            style={{ marginLeft: '4px', transition: 'transform 0.3s', transform: categoriesOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                        >
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </span>
                    {categoriesOpen && (
                        <div className="categories-dropdown" onMouseLeave={() => setCategoriesOpen(false)}>
                            <Link
                                to="/events"
                                className="dropdown-link view-all-link"
                                onClick={() => {
                                    setCategoriesOpen(false);
                                    setMenuOpen(false);
                                }}
                            >
                                <strong>View All Events</strong>
                            </Link>
                            <div className="dropdown-divider"></div>
                            {loading ? (
                                <div className="dropdown-link">Loading...</div>
                            ) : categories && categories.length > 0 ? (
                                categories.map((category) => (
                                    <Link
                                        key={category._id}
                                        to={`/events?category=${category.categoryName}`}
                                        className="dropdown-link"
                                        onClick={() => {
                                            setCategoriesOpen(false);
                                            setMenuOpen(false);
                                        }}
                                    >
                                        {category.categoryName || category.name}
                                    </Link>
                                ))
                            ) : (
                                <div className="dropdown-link">No categories</div>
                            )}
                        </div>
                    )}
                </li>

                {user?.role === 'admin' && (
                    <li><Link to="/admin" className="nav-link" onClick={() => setMenuOpen(false)}>Admin</Link></li>
                )}
            </ul>

            {/* Profile */}
            <div
                className="navbar-profile"
                ref={profileRef}
                role="button"
                aria-label="User profile"
                tabIndex={0}
            >
                <div className={`profile-icon ${isAuthenticated ? 'logged-in' : ''}`} onClick={handleProfileClick}>
                    {isAuthenticated ? (
                        <div className="user-avatar">
                            {user?.image ? (
                                <img src={user.image} alt={user.name} className="avatar-img" />
                            ) : (
                                getUserInitials()
                            )}
                        </div>
                    ) : (
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="22"
                            height="22"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                        </svg>
                    )}
                </div>

                {/* Dropdown Menu */}
                {profileOpen && (
                    <div className="profile-dropdown">
                        {isAuthenticated ? (
                            <>
                                <div className="dropdown-user-info">
                                    <div className="dropdown-avatar">
                                        {user?.image ? (
                                            <img src={user.image} alt={user.name} className="avatar-img" />
                                        ) : (
                                            getUserInitials()
                                        )}
                                    </div>
                                    <div className="dropdown-user-details">
                                        <span className="dropdown-user-name">{user?.name}</span>
                                        <span className="dropdown-user-email">{user?.email}</span>
                                        <span className="dropdown-user-role">{user?.role}</span>
                                    </div>
                                </div>
                                <div className="dropdown-divider"></div>
                                <Link to="/profile" className="dropdown-link" onClick={handleDropdownLinkClick}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                        <circle cx="12" cy="7" r="4" />
                                    </svg>
                                    My Profile
                                </Link>
                                <Link to="/my-events" className="dropdown-link" onClick={handleDropdownLinkClick}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                        <line x1="16" y1="2" x2="16" y2="6"></line>
                                        <line x1="8" y1="2" x2="8" y2="6"></line>
                                        <line x1="3" y1="10" x2="21" y2="10"></line>
                                    </svg>
                                    My Events
                                </Link>
                                <Link to="/settings" className="dropdown-link" onClick={handleDropdownLinkClick}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="3"></circle>
                                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                                    </svg>
                                    Settings
                                </Link>
                                <div className="dropdown-divider"></div>
                                <button className="dropdown-link logout-btn" onClick={handleLogout}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                        <polyline points="16 17 21 12 16 7"></polyline>
                                        <line x1="21" y1="12" x2="9" y2="12"></line>
                                    </svg>
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/auth" className="dropdown-link" onClick={handleDropdownLinkClick}>Login</Link>
                                <Link to="/auth" className="dropdown-link" onClick={handleDropdownLinkClick}>Sign Up</Link>
                            </>
                        )}
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
