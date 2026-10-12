import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './Context/AuthContext';
import Navbar from './Components/Navbar/Navbar';
import Footer from './Components/Footer/Footer';
import ChatWidget from './Components/Chat/ChatWidget';
import WhatsAppWidget from './Components/Chat/WhatsAppWidget';
import ProtectedRoute from './Components/Auth/ProtectedRoute';
import ErrorBoundary from './Components/ErrorBoundary';
import { ToastProvider } from './Context/ToastContext';
import './App.css';

// Lazy loaded client pages for optimal performance
const Home = lazy(() => import('./Pages/Home'));
const About = lazy(() => import('./Pages/About'));
const Contact = lazy(() => import('./Pages/Contact'));
const AuthPage = lazy(() => import('./Pages/AuthPage'));
const EventsPage = lazy(() => import('./Pages/EventsPage'));
const EventDetails = lazy(() => import('./Pages/EventDetails'));
const Profile = lazy(() => import('./Pages/Profile'));
const MyInquiries = lazy(() => import('./Pages/MyInquiries'));
const FAQ = lazy(() => import('./Pages/FAQ'));
const PrivacyPolicy = lazy(() => import('./Pages/PrivacyPolicy'));
const Terms = lazy(() => import('./Pages/Terms'));
const NotFound = lazy(() => import('./Pages/NotFound'));

// Lazy loaded heavy admin pages
const AdminDashboard = lazy(() => import('./Pages/AdminDashboard'));
const UsersList = lazy(() => import('./Pages/UsersList'));
const CategoryList = lazy(() => import('./Pages/CategoryList'));
const EventList = lazy(() => import('./Pages/EventList'));
const ConsultationList = lazy(() => import('./Pages/ConsultationList'));
const AdminChat = lazy(() => import('./Pages/AdminChat'));
const AdminReviews = lazy(() => import('./Pages/AdminReviews'));
const AdminAuditLog = lazy(() => import('./Pages/AdminAuditLog'));

const PageLoader = () => (
  <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <div style={{ width: '48px', height: '48px', border: '3px solid #e5e7eb', borderTop: '3px solid #4f46e5', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
  </div>
);

export default function App() {
  return (
    <ErrorBoundary message="A critical error occurred in the application.">
      <ToastProvider>
        <AuthProvider>
          <Router>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Admin Command Center */}
                <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>} />
                <Route path="/admin/users" element={<ProtectedRoute requireAdmin><UsersList /></ProtectedRoute>} />
                <Route path="/admin/categories" element={<ProtectedRoute requireAdmin><CategoryList /></ProtectedRoute>} />
                <Route path="/admin/events" element={<ProtectedRoute requireAdmin><EventList /></ProtectedRoute>} />
                <Route path="/admin/consultations" element={<ProtectedRoute requireAdmin><ConsultationList /></ProtectedRoute>} />
                <Route path="/admin/chat" element={<ProtectedRoute requireAdmin><AdminChat /></ProtectedRoute>} />
                <Route path="/admin/reviews" element={<ProtectedRoute requireAdmin><AdminReviews /></ProtectedRoute>} />
                <Route path="/admin/audit-log" element={<ProtectedRoute requireAdmin><AdminAuditLog /></ProtectedRoute>} />

                {/* Public & Client Portal */}
                <Route
                  path="*"
                  element={
                    <div className="app-container">
                      <Navbar />
                      <main className="main-content">
                        <Suspense fallback={<PageLoader />}>
                          <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/about" element={<About />} />
                            <Route path="/contact" element={<Contact />} />
                            <Route path="/auth" element={<AuthPage />} />
                            <Route path="/events" element={<EventsPage />} />
                            <Route path="/events/:id" element={<EventDetails />} />
                            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                            <Route path="/my-inquiries" element={<ProtectedRoute><MyInquiries /></ProtectedRoute>} />
                            <Route path="/faq" element={<FAQ />} />
                            <Route path="/privacy" element={<PrivacyPolicy />} />
                            <Route path="/terms" element={<Terms />} />
                            <Route path="*" element={<NotFound />} />
                          </Routes>
                        </Suspense>
                      </main>
                      <WhatsAppWidget />
                      <ChatWidget />
                      <Footer />
                    </div>
                  }
                />
              </Routes>
            </Suspense>
          </Router>
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}
