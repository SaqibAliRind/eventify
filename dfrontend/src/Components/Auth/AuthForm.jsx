import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import api from '../../Utils/api';
import './AuthForm.css';

const AuthForm = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    // Form states: 'login', 'register', 'forgot', 'reset', 'verify'
    const [formState, setFormState] = useState('login');
    console.log("AuthForm rendering, state:", formState);
    const [imageFile, setImageFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        role: 'user',
        otp: '',
        newPassword: '',
        confirmNewPassword: ''
    });
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleFileChange = (e) => {
        setImageFile(e.target.files[0]);
    };

    const validate = () => {
        let tempErrors = {};

        if (formState === 'login') {
            if (!formData.email) tempErrors.email = "Email is required";
            if (!formData.password) tempErrors.password = "Password is required";
        }

        if (formState === 'register') {
            if (!formData.name) tempErrors.name = "Name is required";
            if (!formData.email) tempErrors.email = "Email is required";
            if (!formData.password) tempErrors.password = "Password is required";
            if (formData.password !== formData.confirmPassword) tempErrors.confirmPassword = "Passwords do not match";
            if (!formData.phone) tempErrors.phone = "Phone number is required";
        }

        if (formState === 'forgot') {
            if (!formData.email) tempErrors.email = "Email is required";
        }

        if (formState === 'reset') {
            if (!formData.otp) tempErrors.otp = "OTP is required";
            if (!formData.newPassword) tempErrors.newPassword = "New password is required";
            if (formData.newPassword !== formData.confirmNewPassword) tempErrors.confirmNewPassword = "Passwords do not match";
        }

        if (formState === 'verify') {
            if (!formData.otp) tempErrors.otp = "Verification code is required";
        }

        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validate()) {
            setLoading(true);
            try {
                // Handle Login
                if (formState === 'login') {
                    const res = await api.post('/login', {
                        email: formData.email,
                        password: formData.password
                    });
                    if (res.data.success) {
                        localStorage.setItem('eventify_token', res.data.token);
                        login(res.data.data);
                        navigate('/');
                    }
                    return;
                }

                // Handle Register
                if (formState === 'register') {
                    const data = new FormData();
                    data.append('name', formData.name);
                    data.append('email', formData.email);
                    data.append('password', formData.password);
                    data.append('cpassword', formData.confirmPassword);
                    data.append('phone', formData.phone);
                    if (imageFile) {
                        data.append('image', imageFile);
                    }

                    const res = await api.post('/register', data, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    });

                    if (res.data.success) {
                        setFormState('verify');
                        setErrors({});
                    }
                    return;
                }

                // Handle Verification
                if (formState === 'verify') {
                    const res = await api.post('/verify', {
                        email: formData.email,
                        code: formData.otp
                    });

                    if (res.data.success) {
                        // After verify, user might need to login manually or we can auto-login if backend returns token
                        // For now, let's go to login screen
                        setFormState('login');
                        alert("Verified successfully! Please login.");
                    }
                    return;
                }

                // After forgot password, show reset form
                if (formState === 'forgot') {
                    const res = await api.post('/forgot-password', { email: formData.email });
                    if (res.data.success) {
                        setFormState('reset');
                        setErrors({});
                    }
                    return;
                }

                // After successful reset, go back to login
                if (formState === 'reset') {
                    const res = await api.post('/reset-password', {
                        email: formData.email,
                        code: formData.otp,
                        password: formData.newPassword
                    });
                    if (res.data.success) {
                        setFormState('login');
                        setErrors({});
                    }
                    return;
                }
            } catch (error) {
                console.error('API Error:', error);
                setErrors({ server: error.response?.data?.message || "Something went wrong" });
            } finally {
                setLoading(false);
            }
        }
    };

    const switchToLogin = () => {
        setFormState('login');
        setErrors({});
    };

    const switchToRegister = () => {
        setFormState('register');
        setErrors({});
    };

    const switchToForgot = () => {
        setFormState('forgot');
        setErrors({});
    };

    const getFormTitle = () => {
        switch (formState) {
            case 'login': return 'Welcome Back';
            case 'register': return 'Create Account';
            case 'forgot': return 'Forgot Password';
            case 'reset': return 'Reset Password';
            case 'verify': return 'Verify Email';
            default: return 'Welcome';
        }
    };

    const getSubmitText = () => {
        switch (formState) {
            case 'login': return 'Login';
            case 'register': return 'Sign Up';
            case 'forgot': return 'Send OTP';
            case 'reset': return 'Reset Password';
            case 'verify': return 'Verify';
            default: return 'Submit';
        }
    };

    const isWideContainer = formState === 'register';

    return (
        <div className={`auth-container ${isWideContainer ? 'wide-container' : ''}`}>
            {/* Toggle buttons only for login/register */}
            {(formState === 'login' || formState === 'register') && (
                <div className="auth-toggle">
                    <button
                        className={`toggle-btn ${formState === 'login' ? 'active' : ''}`}
                        onClick={switchToLogin}
                    >
                        Login
                    </button>
                    <button
                        className={`toggle-btn ${formState === 'register' ? 'active' : ''}`}
                        onClick={switchToRegister}
                    >
                        Register
                    </button>
                </div>
            )}

            <form className={`auth-form ${isWideContainer ? 'register-form' : ''}`} onSubmit={handleSubmit}>
                <h2>{getFormTitle()}</h2>

                {errors.server && <div className="error-alert">{errors.server}</div>}

                {/* LOGIN FORM */}
                {formState === 'login' && (
                    <>
                        <div className="form-group">
                            <label>Email Address</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="john@example.com"
                            />
                            {errors.email && <span className="error">{errors.email}</span>}
                        </div>

                        <div className="form-group">
                            <label>Password</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="********"
                            />
                            {errors.password && <span className="error">{errors.password}</span>}
                        </div>

                        <div className="forgot-link">
                            <span onClick={switchToForgot} className="link">Forgot Password?</span>
                        </div>
                    </>
                )}

                {/* REGISTER FORM */}
                {formState === 'register' && (
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Full Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="John Doe"
                            />
                            {errors.name && <span className="error">{errors.name}</span>}
                        </div>

                        <div className="form-group">
                            <label>Email Address</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="john@example.com"
                            />
                            {errors.email && <span className="error">{errors.email}</span>}
                        </div>

                        <div className="form-group">
                            <label>Phone Number</label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="+1 234 567 8900"
                            />
                            {errors.phone && <span className="error">{errors.phone}</span>}
                        </div>


                        <div className="form-group">
                            <label>Password</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="********"
                            />
                            {errors.password && <span className="error">{errors.password}</span>}
                        </div>

                        <div className="form-group">
                            <label>Confirm Password</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="********"
                            />
                            {errors.confirmPassword && <span className="error">{errors.confirmPassword}</span>}
                        </div>

                        <div className="form-group">
                            <label>Profile Image</label>
                            <input
                                type="file"
                                name="image"
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                        </div>
                    </div>
                )}

                {/* FORGOT PASSWORD FORM */}
                {formState === 'forgot' && (
                    <>
                        <p className="form-description">Enter your email address and we'll send you an OTP to reset your password.</p>
                        <div className="form-group">
                            <label>Email Address</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="john@example.com"
                            />
                            {errors.email && <span className="error">{errors.email}</span>}
                        </div>
                    </>
                )}

                {/* RESET PASSWORD FORM */}
                {formState === 'reset' && (
                    <>
                        <p className="form-description">Enter the OTP sent to your email and set a new password.</p>
                        <div className="form-group">
                            <label>OTP Code</label>
                            <input
                                type="text"
                                name="otp"
                                value={formData.otp}
                                onChange={handleChange}
                                placeholder="Enter 6-digit OTP"
                            />
                            {errors.otp && <span className="error">{errors.otp}</span>}
                        </div>

                        <div className="form-group">
                            <label>New Password</label>
                            <input
                                type="password"
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleChange}
                                placeholder="********"
                            />
                            {errors.newPassword && <span className="error">{errors.newPassword}</span>}
                        </div>

                        <div className="form-group">
                            <label>Confirm New Password</label>
                            <input
                                type="password"
                                name="confirmNewPassword"
                                value={formData.confirmNewPassword}
                                onChange={handleChange}
                                placeholder="********"
                            />
                            {errors.confirmNewPassword && <span className="error">{errors.confirmNewPassword}</span>}
                        </div>
                    </>
                )}

                {/* VERIFY EMAIL FORM */}
                {formState === 'verify' && (
                    <>
                        <p className="form-description">We've sent a verification code to your email. Please enter it below.</p>
                        <div className="form-group">
                            <label>Verification Code</label>
                            <input
                                type="text"
                                name="otp"
                                value={formData.otp}
                                onChange={handleChange}
                                placeholder="Enter 6-digit code"
                            />
                            {errors.otp && <span className="error">{errors.otp}</span>}
                        </div>
                    </>
                )}

                <button type="submit" className="submit-btn" disabled={loading}>
                    {loading ? 'Processing...' : getSubmitText()}
                </button>

                {/* Footer links */}
                {formState === 'login' && (
                    <p className="auth-footer">
                        Don't have an account?
                        <span onClick={switchToRegister} className="link">Register</span>
                    </p>
                )}

                {formState === 'register' && (
                    <p className="auth-footer">
                        Already have an account?
                        <span onClick={switchToLogin} className="link">Login</span>
                    </p>
                )}

                {(formState === 'forgot' || formState === 'reset') && (
                    <p className="auth-footer">
                        Remember your password?
                        <span onClick={switchToLogin} className="link">Back to Login</span>
                    </p>
                )}

                {formState === 'verify' && (
                    <p className="auth-footer">
                        Didn't receive code?
                        <span className="link">Resend</span>
                    </p>
                )}
            </form>
        </div>
    );
};

export default AuthForm;
