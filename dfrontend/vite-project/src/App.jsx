import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './Context/AuthContext';
import Navbar from './Components/Navbar/Navbar';
import Footer from './Components/Footer/Footer';
import Home from './Pages/Home';
import About from './Pages/About';
import ReviewsPage from './Pages/ReviewsPage';
import Contact from './Pages/Contact';
import AuthPage from './Pages/AuthPage';
import EventsPage from './Pages/EventsPage';
import Profile from './Pages/Profile';
import AdminDashboard from './Pages/AdminDashboard';
import AdminReviews from './Pages/AdminReviews';
import UsersList from './Pages/UsersList';
import CategoryList from './Pages/CategoryList';
import EventList from './Pages/EventList';
import ConsultationList from './Pages/ConsultationList';
import EventDetails from './Pages/EventDetails';
import AdminChat from './Pages/AdminChat';
import ChatWidget from './Components/Chat/ChatWidget';
import WhatsAppWidget from './Components/Chat/WhatsAppWidget';
import ProtectedRoute from './Components/Auth/ProtectedRoute';
import { NotificationProvider } from './Context/NotificationContext';
import TopNotification from './Components/Utils/TopNotification';
import './App.css';

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <TopNotification />
          <Routes>
          {/* Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute adminOnly={true}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/reviews" element={<ProtectedRoute adminOnly={true}><AdminReviews /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute adminOnly={true}><UsersList /></ProtectedRoute>} />
          <Route path="/admin/categories" element={<ProtectedRoute adminOnly={true}><CategoryList /></ProtectedRoute>} />
          <Route path="/admin/events" element={<ProtectedRoute adminOnly={true}><EventList /></ProtectedRoute>} />
          <Route path="/admin/consultations" element={<ProtectedRoute adminOnly={true}><ConsultationList /></ProtectedRoute>} />
          <Route path="/admin/chat" element={<ProtectedRoute adminOnly={true}><AdminChat /></ProtectedRoute>} />
          
          <Route
            path="*"
            element={
              <div className="app-container">
                <Navbar />
                <main className="main-content">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/reviews" element={<ReviewsPage />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/auth" element={
                      <ProtectedRoute inverse={true}>
                        <AuthPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/login" element={
                      <ProtectedRoute inverse={true}>
                        <AuthPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/events" element={<EventsPage />} />
                    <Route path="/events/:id" element={<EventDetails />} />
                    <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                  </Routes>
                </main>
                <WhatsAppWidget />
                <ChatWidget />
                <Footer />
              </div>
            }
          />
        </Routes>
      </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}
