import React from 'react';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer" id="contact">
            <div className="footer-content">
                <div className="footer-section">
                    <h3>Explore</h3>
                    <ul>
                        <li><a href="#link1">Marketplace</a></li>
                        <li><a href="#link2">New Arrivals</a></li>
                        <li><a href="#link3">Trending</a></li>
                        <li><a href="#link4">Guides</a></li>
                    </ul>
                </div>
                <div className="footer-section">
                    <h3>Company</h3>
                    <ul>
                        <li><a href="#link5">About Us</a></li>
                        <li><a href="#link6">Careers</a></li>
                        <li><a href="#link7">Press</a></li>
                        <li><a href="#link8">Contact</a></li>
                    </ul>
                </div>
                <div className="footer-section">
                    <h3>Resources</h3>
                    <ul>
                        <li><a href="#link9">Support Center</a></li>
                        <li><a href="#link10">Terms of Service</a></li>
                        <li><a href="#link11">Privacy Policy</a></li>
                        <li><a href="#link12">Community</a></li>
                    </ul>
                </div>
                <div className="footer-section">
                    <h3>Stay Connected</h3>
                    <p>Subscribe to our newsletter for updates.</p>
                    <div className="newsletter-form">
                        <input type="email" placeholder="Your email" />
                        <button>Subscribe</button>
                    </div>
                </div>
            </div>
            <div className="footer-bottom">
                <p>&copy; {(new Date().getFullYear())} Your Brand. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;
