import React, { useState } from 'react';
import { useAuth } from '../Context/AuthContext';
import api from '../Utils/api';
import './Profile.css';

const Profile = () => {
    const { user, login } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const [formData, setFormData] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
    });
    const [imageFile, setImageFile] = useState(null);

    const [passwordData, setPasswordData] = useState({
        oldpassword: '',
        newpassword: '',
        confirmPassword: ''
    });

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setImageFile(e.target.files[0]);
    };

    const handlePasswordChange = (e) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const data = new FormData();
            data.append('name', formData.name);
            data.append('phone', formData.phone);
            if (imageFile) {
                data.append('image', imageFile);
            }

            const token = localStorage.getItem('eventify_token');
            const res = await api.put('/edit-profile', data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (res.data.success) {
                login(res.data.data);
                setMessage({ type: 'success', text: 'Profile updated successfully!' });
                setIsEditing(false);
            }
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Update failed' });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        if (passwordData.newpassword !== passwordData.confirmPassword) {
            setMessage({ type: 'error', text: 'Passwords do not match' });
            return;
        }

        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const token = localStorage.getItem('eventify_token');
            const res = await api.put('/edit-password', {
                oldpassword: passwordData.oldpassword,
                newpassword: passwordData.newpassword
            }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.data.success) {
                setMessage({ type: 'success', text: 'Password updated successfully!' });
                setIsChangingPassword(false);
                setPasswordData({ oldpassword: '', newpassword: '', confirmPassword: '' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Password update failed' });
        } finally {
            setLoading(false);
        }
    };

    if (!user) return <div className="profile-loading">Please login to view profile.</div>;

    return (
        <div className="profile-page">
            <div className="profile-card">
                <div className="profile-header">
                    <div className="profile-image-container">
                        {user.image ? (
                            <img src={user.image} alt={user.name} className="main-profile-img" />
                        ) : (
                            <div className="profile-initials">{user.name?.substring(0, 2).toUpperCase()}</div>
                        )}
                    </div>
                    <h1>{user.name}</h1>
                    <p className="profile-role">{user.role}</p>
                </div>

                {message.text && (
                    <div className={`message-alert ${message.type}`}>
                        {message.text}
                    </div>
                )}

                {!isEditing && !isChangingPassword ? (
                    <div className="profile-info">
                        <div className="info-item">
                            <label>Email</label>
                            <span>{user.email}</span>
                        </div>
                        <div className="info-item">
                            <label>Phone</label>
                            <span>{user.phone}</span>
                        </div>
                        <div className="profile-actions">
                            <button className="edit-btn" onClick={() => setIsEditing(true)}>Edit Profile</button>
                            <button className="password-btn" onClick={() => setIsChangingPassword(true)}>Change Password</button>
                        </div>
                    </div>
                ) : isEditing ? (
                    <form className="profile-form" onSubmit={handleUpdateProfile}>
                        <div className="form-group">
                            <label>Full Name</label>
                            <input type="text" name="name" value={formData.name} onChange={handleInputChange} required />
                        </div>
                        <div className="form-group">
                            <label>Phone Number</label>
                            <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} required />
                        </div>
                        <div className="form-group">
                            <label>Update Profile Image</label>
                            <input type="file" accept="image/*" onChange={handleFileChange} />
                        </div>
                        <div className="form-actions">
                            <button type="submit" className="save-btn" disabled={loading}>
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                            <button type="button" className="cancel-btn" onClick={() => setIsEditing(false)}>Cancel</button>
                        </div>
                    </form>
                ) : (
                    <form className="profile-form" onSubmit={handleUpdatePassword}>
                        <div className="form-group">
                            <label>Old Password</label>
                            <input type="password" name="oldpassword" value={passwordData.oldpassword} onChange={handlePasswordChange} required />
                        </div>
                        <div className="form-group">
                            <label>New Password</label>
                            <input type="password" name="newpassword" value={passwordData.newpassword} onChange={handlePasswordChange} required />
                        </div>
                        <div className="form-group">
                            <label>Confirm New Password</label>
                            <input type="password" name="confirmPassword" value={passwordData.confirmPassword} onChange={handlePasswordChange} required />
                        </div>
                        <div className="form-actions">
                            <button type="submit" className="save-btn" disabled={loading}>
                                {loading ? 'Updating...' : 'Update Password'}
                            </button>
                            <button type="button" className="cancel-btn" onClick={() => setIsChangingPassword(false)}>Cancel</button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default Profile;
