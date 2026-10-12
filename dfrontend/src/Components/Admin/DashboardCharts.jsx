import React, { useState, useEffect } from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Cell
} from 'recharts';
import { motion } from 'framer-motion';
import { Users, Calendar, Layers, MessageSquare, CheckCircle, RefreshCw } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../../config';

const DashboardCharts = () => {
    const [loading, setLoading] = useState(true);
    const [statsData, setStatsData] = useState({
        totalUsers: 0,
        activeUsers: 0,
        totalEvents: 0,
        totalCategories: 0,
        totalConsultations: 0,
        resolvedConsultations: 0,
    });
    const [monthlyEvents, setMonthlyEvents] = useState([]);
    const [categoryDistribution, setCategoryDistribution] = useState([]);

    const fetchDashboardData = async () => {
        setLoading(true);
        const token = localStorage.getItem('eventify_token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        try {
            const [usersRes, eventsRes, catsRes, consultRes] = await Promise.all([
                axios.get(`${API_URL}/admin/users`, { headers }),
                axios.get(`${API_URL}/admin/events`, { headers }),
                axios.get(`${API_URL}/admin/categories`, { headers }),
                axios.get(`${API_URL}/admin/consultations`, { headers }),
            ]);

            const users = usersRes.data.data || [];
            const events = eventsRes.data.data || [];
            const categories = catsRes.data.data || [];
            const consultations = consultRes.data.data || [];

            const activeCount = users.filter((u) => u.active !== false).length;
            const resolvedCount = consultations.filter((c) => c.status === 'Resolved').length;

            setStatsData({
                totalUsers: users.length,
                activeUsers: activeCount,
                totalEvents: events.length,
                totalCategories: categories.length,
                totalConsultations: consultations.length,
                resolvedConsultations: resolvedCount,
            });

            // Group events by category
            const catMap = {};
            events.forEach((ev) => {
                const cat = ev.category || 'Other';
                catMap[cat] = (catMap[cat] || 0) + 1;
            });
            const catDist = Object.keys(catMap).map((k) => ({
                name: k,
                events: catMap[k],
            }));
            setCategoryDistribution(catDist);

            // Group events by Month
            const monthMap = {};
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            events.forEach((ev) => {
                try {
                    const d = new Date(ev.date);
                    if (!isNaN(d.getTime())) {
                        const m = months[d.getMonth()];
                        monthMap[m] = (monthMap[m] || 0) + 1;
                    }
                } catch {}
            });

            const monthData = months.map((m) => ({
                name: m,
                eventsCount: monthMap[m] || 0,
            }));
            setMonthlyEvents(monthData);

        } catch (error) {
            console.error('Error fetching dashboard stats from DB:', error);
            if (error.response?.status === 401) {
                // Stale or invalid token
                localStorage.removeItem('eventify_token');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const statCards = [
        {
            label: 'Total Events in DB',
            value: statsData.totalEvents,
            subtext: 'Catalog items live',
            icon: <Calendar size={22} />,
            color: '#d4af37',
        },
        {
            label: 'Active Users',
            value: `${statsData.activeUsers} / ${statsData.totalUsers}`,
            subtext: 'Verified accounts',
            icon: <Users size={22} />,
            color: '#3b82f6',
        },
        {
            label: 'Event Categories',
            value: statsData.totalCategories,
            subtext: 'Configured sectors',
            icon: <Layers size={22} />,
            color: '#10b981',
        },
        {
            label: 'Consultation Inquiries',
            value: statsData.totalConsultations,
            subtext: `${statsData.resolvedConsultations} resolved`,
            icon: <MessageSquare size={22} />,
            color: '#a855f7',
        },
    ];

    return (
        <div className="dashboard-content">
            {/* Header refresh button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                <button
                    className="btn-outline-gold"
                    onClick={fetchDashboardData}
                    disabled={loading}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.45rem 1rem', fontSize: '0.85rem' }}
                >
                    <RefreshCw size={14} className={loading ? 'spin' : ''} />
                    {loading ? 'Syncing DB...' : 'Sync Live DB Stats'}
                </button>
            </div>

            {/* Stats Cards with real DB counts */}
            <div className="stats-grid">
                {statCards.map((stat, index) => (
                    <motion.div
                        key={index}
                        className="stat-card"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.08 }}
                    >
                        <div className="stat-header">
                            <div
                                className="stat-icon"
                                style={{
                                    backgroundColor: `${stat.color}15`,
                                    color: stat.color,
                                    border: `1px solid ${stat.color}30`,
                                }}
                            >
                                {stat.icon}
                            </div>
                            <span style={{ color: '#10b981', fontSize: '0.8rem', fontWeight: 600 }}>
                                <CheckCircle size={13} style={{ display: 'inline', marginRight: 4 }} /> Live DB
                            </span>
                        </div>
                        <div className="stat-info">
                            <span className="value">{stat.value}</span>
                            <span className="label">{stat.label}</span>
                            <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '2px' }}>
                                {stat.subtext}
                            </small>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Live Visualizations from DB */}
            <div className="chart-grid">
                {/* Events Timeline */}
                <motion.div
                    className="chart-card"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    <h3>Live Event Distribution by Schedule</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '1rem' }}>
                        Monthly event timeline from seeded events table
                    </p>
                    <ResponsiveContainer width="100%" height={260}>
                        <AreaChart data={monthlyEvents}>
                            <defs>
                                <linearGradient id="colorEvents" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#d4af37" stopOpacity={0.4} />
                                    <stop offset="95%" stopColor="#d4af37" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#2a303c" />
                            <XAxis dataKey="name" stroke="#94a3b8" />
                            <YAxis stroke="#94a3b8" allowDecimals={false} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#13161c', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '8px' }}
                                itemStyle={{ color: '#f8fafc' }}
                            />
                            <Area type="monotone" dataKey="eventsCount" name="Events Scheduled" stroke="#d4af37" strokeWidth={2} fillOpacity={1} fill="url(#colorEvents)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </motion.div>

                {/* Events by Category Bar Chart */}
                <motion.div
                    className="chart-card"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    <h3>Events by Category (Database)</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '1rem' }}>
                        Distribution of catalog celebrations across category tags
                    </p>
                    <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={categoryDistribution}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#2a303c" />
                            <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                            <YAxis stroke="#94a3b8" allowDecimals={false} />
                            <Tooltip
                                cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                                contentStyle={{ backgroundColor: '#13161c', border: '1px solid #334155', borderRadius: '8px' }}
                                itemStyle={{ color: '#f8fafc' }}
                            />
                            <Bar dataKey="events" name="Total Events" radius={[4, 4, 0, 0]}>
                                {categoryDistribution.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#d4af37' : '#3b82f6'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </motion.div>
            </div>
        </div>
    );
};

export default DashboardCharts;
