import React from 'react';
import './Features.css';

const Features = () => {
    const mainFeatures = [
        {
            icon: "🎫",
            title: "Easy Ticket Booking",
            description: "Book tickets for any event in just a few clicks. Secure payment options and instant confirmation.",
            color: "#667eea"
        },
        {
            icon: "📅",
            title: "Event Management",
            description: "Create and manage your own events with our powerful dashboard. Track sales, attendees, and analytics.",
            color: "#f093fb"
        },
        {
            icon: "🔔",
            title: "Smart Notifications",
            description: "Never miss an event! Get personalized reminders and updates about events you're interested in.",
            color: "#4ecdc4"
        },
        {
            icon: "📍",
            title: "Location-Based Search",
            description: "Find events happening near you with our smart location-based discovery feature.",
            color: "#ff6b6b"
        },
        {
            icon: "💳",
            title: "Secure Payments",
            description: "Multiple payment options with bank-level security. Refunds processed instantly when needed.",
            color: "#45b7d1"
        },
        {
            icon: "📱",
            title: "Mobile App",
            description: "Access all features on the go with our beautifully designed iOS and Android apps.",
            color: "#f7dc6f"
        }
    ];

    const capabilities = [
        {
            title: "For Event Goers",
            icon: "🎉",
            items: [
                "Discover trending events nearby",
                "Save favorites and get reminders",
                "Share events with friends",
                "Leave reviews and ratings",
                "Access digital tickets offline"
            ]
        },
        {
            title: "For Organizers",
            icon: "🎯",
            items: [
                "Create unlimited events",
                "Customize ticket types",
                "Real-time sales dashboard",
                "Attendee management tools",
                "Promotional marketing features"
            ]
        },
        {
            title: "For Businesses",
            icon: "🏢",
            items: [
                "Corporate event solutions",
                "Team building packages",
                "Custom branding options",
                "Priority customer support",
                "Advanced analytics reports"
            ]
        }
    ];

    return (
        <div className="features-page">
            {/* Hero Section */}
            <section className="features-hero">
                <div className="hero-bg-shapes">
                    <div className="shape shape-1"></div>
                    <div className="shape shape-2"></div>
                    <div className="shape shape-3"></div>
                </div>
                <div className="features-hero-content">
                    <span className="hero-badge">✨ Powerful Features</span>
                    <h1>Everything You Need to <span className="gradient-text">Manage Events</span></h1>
                    <p>From discovery to booking, we've got every aspect of event management covered with intuitive tools and smart features.</p>
                </div>
            </section>

            {/* Main Features Grid */}
            <section className="main-features">
                <div className="features-grid">
                    {mainFeatures.map((feature, index) => (
                        <div
                            key={index}
                            className="feature-card"
                            style={{ '--accent-color': feature.color }}
                        >
                            <div className="feature-icon-wrapper">
                                <span className="feature-icon">{feature.icon}</span>
                            </div>
                            <h3>{feature.title}</h3>
                            <p>{feature.description}</p>
                            <div className="feature-glow"></div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Capabilities Section */}
            <section className="capabilities-section">
                <div className="section-header">
                    <h2>Built for <span className="gradient-text">Everyone</span></h2>
                    <p>Whether you're attending or organizing, we have features tailored just for you</p>
                </div>
                <div className="capabilities-grid">
                    {capabilities.map((cap, index) => (
                        <div key={index} className="capability-card">
                            <div className="capability-header">
                                <span className="capability-icon">{cap.icon}</span>
                                <h3>{cap.title}</h3>
                            </div>
                            <ul className="capability-list">
                                {cap.items.map((item, i) => (
                                    <li key={i}>
                                        <span className="check-icon">✓</span>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </section>

            {/* Stats Section */}
            <section className="features-stats">
                <div className="stat-item">
                    <h3>99.9%</h3>
                    <p>Uptime Guarantee</p>
                </div>
                <div className="stat-item">
                    <h3>24/7</h3>
                    <p>Customer Support</p>
                </div>
                <div className="stat-item">
                    <h3>50+</h3>
                    <p>Integrations</p>
                </div>
                <div className="stat-item">
                    <h3>256-bit</h3>
                    <p>SSL Encryption</p>
                </div>
            </section>

            {/* CTA Section */}
            <section className="features-cta">
                <div className="cta-content">
                    <h2>Ready to Get Started?</h2>
                    <p>Join thousands of event organizers and attendees who trust Eventify</p>
                    <div className="cta-buttons">
                        <button className="btn-primary">Start Free Trial</button>
                        <button className="btn-secondary">Watch Demo</button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Features;
