import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare } from 'lucide-react'; 
import { useAuth } from '../../Context/AuthContext';
import './WhatsAppWidget.css';

const WhatsAppWidget = () => {
    const { isAuthenticated } = useAuth();
    const [showPrompt, setShowPrompt] = React.useState(false);

    React.useEffect(() => {
        let timer;
        if (showPrompt) {
            timer = setTimeout(() => {
                setShowPrompt(false);
            }, 5000);
        }
        return () => clearTimeout(timer);
    }, [showPrompt]);

    const handleClick = (e) => {
        if (!isAuthenticated) {
            e.preventDefault();
            setShowPrompt(!showPrompt);
        }
    };

    return (
        <div className="whatsapp-widget-wrapper">
            <AnimatePresence>
                {showPrompt && !isAuthenticated && (
                    <motion.div
                        className="login-prompt-bubble top-prompt shadow-lg"
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 20 }}
                        exit={{ opacity: 0, y: -50 }}
                    >
                        <div className="prompt-content">
                            <div className="prompt-header">
                                <MessageSquare size={20} className="prompt-icon" />
                                <h4>WhatsApp Support</h4>
                            </div>
                            <p>Please login to contact us via WhatsApp.</p>
                            <div className="prompt-actions">
                                <button onClick={() => window.location.href = '/login'} className="prompt-login-btn">
                                    Login Now
                                </button>
                                <button onClick={() => setShowPrompt(false)} className="prompt-close-text">
                                    Close
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            <motion.a
                href="https://wa.me/1234567890" 
                className="whatsapp-widget-container shadow-lg"
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleClick}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1 }}
            >
                <div className="whatsapp-tooltip">WhatsApp Us</div>
                <MessageSquare size={28} />
            </motion.a>
        </div>
    );
};

export default WhatsAppWidget;
