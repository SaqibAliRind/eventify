import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Mail,
  Phone,
  MapPin,
  Instagram,
  Facebook,
  Twitter,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import './Footer.css';

const Footer = () => {
  const [subscribed, setSubscribed] = useState(false);
  const [email, setEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="footer-wrapper" id="site-footer">
      <div className="container footer-content-grid">
        {/* Brand Column */}
        <div className="footer-brand-col">
          <Link to="/" className="footer-logo">
            <span className="footer-logo-icon">
              <Sparkles size={18} />
            </span>
            <span className="footer-logo-text">
              Eventify<span className="footer-logo-dot">.</span>
            </span>
          </Link>
          <p className="footer-tagline">
            Curating luxury weddings, landmark corporate galas, and bespoke private celebrations worldwide.
          </p>
          <div className="footer-social-strip">
            <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram">
              <Instagram size={18} />
            </a>
            <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook">
              <Facebook size={18} />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="Twitter">
              <Twitter size={18} />
            </a>
            <a href="mailto:concierge@eventify.com" aria-label="Email Us">
              <Mail size={18} />
            </a>
          </div>
        </div>

        {/* Quick Links Column */}
        <div className="footer-links-col">
          <h4>Navigation</h4>
          <ul className="footer-nav-list">
            <li><Link to="/">Home Overview</Link></li>
            <li><Link to="/events">Events Catalog</Link></li>
            <li><Link to="/about">About Eventify</Link></li>
            <li><Link to="/contact">Schedule Consultation</Link></li>
            <li><Link to="/profile">Client Portal</Link></li>
          </ul>
        </div>

        {/* Disciplines Column */}
        <div className="footer-links-col">
          <h4>Disciplines</h4>
          <ul className="footer-nav-list">
            <li><Link to="/events?category=Wedding">Royal Weddings</Link></li>
            <li><Link to="/events?category=Corporate%20Event">Corporate Summits</Link></li>
            <li><Link to="/events?category=Birthday%20Party">Private Celebrations</Link></li>
            <li><Link to="/events?category=Concert">Live Music & Productions</Link></li>
            <li><Link to="/admin">Admin Management</Link></li>
          </ul>
        </div>

        {/* Newsletter & Concierge Column */}
        <div className="footer-newsletter-col">
          <h4>Private Newsletter</h4>
          <p className="newsletter-desc">
            Receive exclusive invitations, seasonal event showcases, and event decor inspiration.
          </p>
          {subscribed ? (
            <div className="newsletter-success-tag">
              <ShieldCheck size={16} />
              <span>Thank you for subscribing!</span>
            </div>
          ) : (
            <form className="footer-subscribe-form" onSubmit={handleSubscribe}>
              <input
                type="email"
                placeholder="Enter your email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-label="Newsletter email input"
              />
              <button type="submit" aria-label="Subscribe to newsletter">
                <ArrowRight size={16} />
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Footer Bottom Bar */}
      <div className="container footer-bottom-bar">
        <p>&copy; {new Date().getFullYear()} Eventify Experiences Inc. All rights reserved.</p>
        <div className="footer-bottom-links">
          <Link to="/faq">FAQ</Link>
          <span>&bull;</span>
          <Link to="/privacy">Privacy Policy</Link>
          <span>&bull;</span>
          <Link to="/terms">Terms of Service</Link>
          <span>&bull;</span>
          <Link to="/my-inquiries">My Inquiries</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
