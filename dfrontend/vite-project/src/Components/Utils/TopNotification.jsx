import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotification } from '../../Context/NotificationContext';
import { X, Info, AlertCircle } from 'lucide-react';
import './TopNotification.css';

const TopNotification = () => {
    const { notification, hideNotification } = useNotification();

    return (
        <AnimatePresence>
            {notification && (
                <motion.div
                    className={`top-notification-bar ${notification.type}`}
                    initial={{ y: -100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -100, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 100, damping: 15 }}
                >
                    <div className="notification-content">
                        {notification.type === 'error' ? <AlertCircle size={20} /> : <Info size={20} />}
                        <span>{notification.message}</span>
                    </div>
                    <button className="close-notification" onClick={hideNotification}>
                        <X size={18} />
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default TopNotification;
