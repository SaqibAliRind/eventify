import React, { useEffect, useState, useRef } from 'react';
import { motion, useInView, animate } from 'framer-motion';
import {
    Heart,
    Users,
    Award,
    Sparkles,
    Target,
    Shield,
    TrendingUp,
    Zap,
    CheckCircle2,
    Star
} from 'lucide-react';
import './About.css';

const Counter = ({ value, duration = 2 }) => {
    const [count, setCount] = useState(0);
    const nodeRef = useRef(null);
    const isInView = useInView(nodeRef, { once: true, margin: "-50px" });

    useEffect(() => {
        if (isInView) {
            const controls = animate(0, value, {
                duration: duration,
                onUpdate: (latest) => setCount(Math.round(latest)),
                ease: "easeOut"
            });
            return () => controls.stop();
        }
    }, [isInView, value, duration]);

    return <span ref={nodeRef}>{count}</span>;
};

const About = () => {
    // Animation Variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
                delayChildren: 0.2
            }
        }
    };

    const itemVariantsLeft = {
        hidden: { opacity: 0, x: -50 },
        visible: { opacity: 1, x: 0, transition: { type: 'spring', damping: 20, stiffness: 100 } }
    };

    const itemVariantsScale = {
        hidden: { opacity: 0, scale: 0.8 },
        visible: { opacity: 1, scale: 1, transition: { type: 'spring', damping: 15, stiffness: 100 } }
    };

    const stats = [
        { value: 500, suffix: '+', label: 'Weddings Planned', icon: <Heart /> },
        { value: 10, suffix: '+', label: 'Years Experience', icon: <Award /> },
        { value: 98, suffix: '%', label: 'Happy Couples', icon: <Star /> },
        { value: 50, suffix: '+', label: 'Expert Team', icon: <Users /> }
    ];

    const values = [
        {
            icon: <Heart />,
            title: 'Passion for Perfection',
            description: 'We pour our hearts into every event, treating each celebration as if it were our own.'
        },
        {
            icon: <Shield />,
            title: 'Trust & Transparency',
            description: 'Honest communication and transparent pricing are the foundation of our relationships.'
        },
        {
            icon: <Sparkles />,
            title: 'Creative Excellence',
            description: 'We bring innovative ideas and artistic vision to create truly unique experiences.'
        },
        {
            icon: <Target />,
            title: 'Client-Focused Approach',
            description: 'Your vision, your style, your dream - we make it all about you.'
        }
    ];

    const team = [
        {
            name: 'Sarah Johnson',
            role: 'Founder & Lead Planner',
            image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop',
            description: 'With over 10 years of experience, Sarah brings passion and expertise to every wedding.'
        },
        {
            name: 'Michael Chen',
            role: 'Creative Director',
            image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
            description: 'Michael\'s artistic vision transforms venues into breathtaking spaces.'
        },
        {
            name: 'Aisha Patel',
            role: 'Event Coordinator',
            image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop',
            description: 'Aisha ensures every detail is executed flawlessly on your special day.'
        },
        {
            name: 'David Martinez',
            role: 'Vendor Relations Manager',
            image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop',
            description: 'David maintains relationships with the best vendors in the industry.'
        }
    ];

    const milestones = [
        { year: '2014', event: 'Company Founded', description: 'Started with a dream to create magical weddings' },
        { year: '2016', event: 'First Award', description: 'Best Wedding Planner - Regional Excellence' },
        { year: '2018', event: '100th Wedding', description: 'Celebrated our 100th successful wedding' },
        { year: '2020', event: 'Team Expansion', description: 'Grew to a team of 20+ professionals' },
        { year: '2023', event: 'National Recognition', description: 'Featured in top wedding magazines' },
        { year: '2026', event: '500+ Weddings', description: 'Milestone of 500+ beautiful celebrations' }
    ];

    return (
        <div className="about-page">
            {/* Hero Section */}
            <section className="about-hero">
                <div className="about-hero-background">
                    <motion.img
                        src="https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070&auto=format&fit=crop"
                        alt="Sunlit Garden About Us"
                        initial={{ scale: 1.2, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                    />
                    <div className="about-hero-overlay"></div>
                </div>
                <motion.div
                    className="about-hero-content"
                    initial={{ opacity: 0, x: -100 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 1, delay: 0.5, ease: "backOut" }}
                >
                    <h1>About <span className="gradient-text">Us</span></h1>
                    <p>Creating unforgettable moments since 2014</p>
                </motion.div>
            </section>

            {/* Our Story Section */}
            <section className="our-story-section">
                <div className="container">
                    <div className="story-grid">
                        <motion.div
                            className="story-image"
                            initial={{ opacity: 0, x: -100 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 1, ease: "circOut" }}
                        >
                            <img
                                src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=2069&auto=format&fit=crop"
                                alt="Our Story"
                            />
                        </motion.div>

                        <motion.div
                            className="story-content"
                            initial={{ opacity: 0, x: 100 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 1, ease: "circOut" }}
                        >
                            <h2 className="section-title-anim">Our <span className="gradient-text">Story</span></h2>
                            <p>
                                Founded in 2014, our journey began with a simple belief: every couple deserves
                                a wedding that perfectly reflects their unique love story. What started as a
                                passion project has grown into one of the most trusted names in wedding planning.
                            </p>
                            <p>
                                Over the years, we've had the privilege of planning over 500 weddings, each one
                                special and memorable in its own way. From intimate garden ceremonies to grand
                                ballroom celebrations, we've brought countless dreams to life.
                            </p>
                            <p>
                                Our team of dedicated professionals works tirelessly to ensure that every detail
                                is perfect, every moment is magical, and every couple feels supported throughout
                                their planning journey. We don't just plan weddings - we create experiences that
                                last a lifetime.
                            </p>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="about-stats-section">
                <div className="container">
                    <motion.div
                        className="stats-grid-about"
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-50px" }}
                    >
                        {stats.map((stat, index) => (
                            <motion.div
                                key={index}
                                className="stat-card glass-card"
                                variants={itemVariantsScale}
                                whileHover={{ y: -10, scale: 1.05 }}
                            >
                                <motion.div
                                    className="stat-icon"
                                    animate={{
                                        rotateY: [0, 360],
                                    }}
                                    transition={{
                                        duration: 4,
                                        repeat: Infinity,
                                        ease: "linear"
                                    }}
                                >
                                    {stat.icon}
                                </motion.div>
                                <h3 className="gradient-text">
                                    <Counter value={stat.value} />{stat.suffix}
                                </h3>
                                <p>{stat.label}</p>
                                <div className="stat-card-glow" />
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Our Values Section */}
            <section className="values-section">
                <div className="container">
                    <motion.div
                        className="section-header"
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                    >
                        <h2>Our <span className="gradient-text">Values</span></h2>
                        <p>The principles that guide everything we do</p>
                    </motion.div>

                    <motion.div
                        className="values-grid"
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                    >
                        {values.map((value, index) => (
                            <motion.div
                                key={index}
                                className="value-card glass-card"
                                variants={itemVariantsLeft}
                                whileHover={{ x: 10, backgroundColor: "rgba(255, 255, 255, 1)" }}
                            >
                                <div className="value-icon">{value.icon}</div>
                                <h3>{value.title}</h3>
                                <p>{value.description}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Our Team Section */}
            <section className="team-section">
                <div className="container">
                    <motion.div
                        className="section-header"
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                    >
                        <h2>Meet Our <span className="gradient-text">Team</span></h2>
                        <p>The talented people behind your perfect day</p>
                    </motion.div>

                    <motion.div
                        className="team-grid"
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                    >
                        {team.map((member, index) => (
                            <motion.div
                                key={index}
                                className="team-card glass-card"
                                variants={itemVariantsScale}
                                whileHover={{
                                    y: -15,
                                    rotateY: 10,
                                    transition: { type: 'spring', stiffness: 300 }
                                }}
                            >
                                <div className="team-image">
                                    <motion.img
                                        src={member.image}
                                        alt={member.name}
                                        whileHover={{ scale: 1.2 }}
                                        transition={{ duration: 0.5 }}
                                    />
                                </div>
                                <div className="team-info">
                                    <h3>{member.name}</h3>
                                    <p className="team-role">{member.role}</p>
                                    <p className="team-description">{member.description}</p>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Timeline Section */}
            <section className="timeline-section">
                <div className="container">
                    <motion.div
                        className="section-header"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2>Our <span className="gradient-text">Journey</span></h2>
                        <p>Milestones that shaped who we are today</p>
                    </motion.div>

                    <div className="timeline">
                        {milestones.map((milestone, index) => (
                            <motion.div
                                key={index}
                                className="timeline-item"
                                initial={{ opacity: 0, x: index % 2 === 0 ? -100 : 100 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{ duration: 0.8, ease: "backOut" }}
                            >
                                <motion.div
                                    className="timeline-content glass-card"
                                    whileHover={{ scale: 1.03, boxShadow: "var(--shadow-xl)" }}
                                >
                                    <span className="timeline-year">{milestone.year}</span>
                                    <h3>{milestone.event}</h3>
                                    <p>{milestone.description}</p>
                                </motion.div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Why Choose Us Section */}
            <section className="why-choose-section">
                <div className="container">
                    <motion.div
                        className="why-choose-content glass-card"
                        initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
                        whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                        viewport={{ once: true }}
                        transition={{ type: "spring", stiffness: 100 }}
                    >
                        <h2>Why Choose <span className="gradient-text">Us</span>?</h2>
                        <div className="why-choose-grid">
                            {['Personalized planning tailored to your vision',
                                'Extensive network of premium vendors',
                                'Transparent pricing with no hidden costs',
                                'Dedicated support from start to finish',
                                'Proven track record of 500+ successful events',
                                'Award-winning creative team'].map((item, idx) => (
                                    <motion.div
                                        className="why-item"
                                        key={idx}
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                    >
                                        <CheckCircle2 className="check-icon" />
                                        <span>{item}</span>
                                    </motion.div>
                                ))}
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};

export default About;
