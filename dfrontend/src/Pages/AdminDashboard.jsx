import React from 'react';
import AdminSidebar from '../Components/Admin/AdminSidebar';
import DashboardCharts from '../Components/Admin/DashboardCharts';
import { motion } from 'framer-motion';
import './AdminDashboard.css';

const AdminDashboard = () => {
    return (
        <div className="admin-layout">
            <AdminSidebar />

            <main className="admin-main">
                <motion.div
                    className="dashboard-header"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <h1>Admin Command Center</h1>
                    <p>Welcome back, Administrator. Here's what's happening today.</p>
                </motion.div>

                <DashboardCharts />
            </main>
        </div>
    );
};

export default AdminDashboard;
