import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../config';
import { AuthContext } from '../context/AuthContext';
import { Lock, Mail, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);
  const [resetStep, setResetStep] = useState(1); // 1: Email, 2: OTP & New Password
  const [newPassword, setNewPassword] = useState('');

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      if (resetStep === 1) {
        await axios.post(`${API_BASE_URL}/api/auth/forgot-password`, { email });
        setResetStep(2);
        setMessage('Reset OTP sent to your email.');
      } else {
        await axios.post(`${API_BASE_URL}/api/auth/reset-password`, { email, otp, newPassword });
        setForgotPasswordMode(false);
        setResetStep(1);
        setMessage('Password reset successful! You can now login.');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Action failed');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      if (!otpSent) {
        // Step 1: Login with credentials
        const res = await axios.post(`${API_BASE_URL}/api/auth/login`, { email, password });
        if (res.data.otpRequired) {
          setOtpSent(true);
          setMessage('OTP has been sent to your email. Please check your inbox.');
        } else {
          login(res.data.token, res.data.user);
          if (res.data.user.role === 'admin') navigate('/admin');
          else navigate('/dashboard');
        }
      } else {
        // Step 2: Verify OTP
        const res = await axios.post(`${API_BASE_URL}/api/auth/verify-otp`, { email, otp });
        login(res.data.token, res.data.user);
        if (res.data.user.role === 'admin') navigate('/admin');
        else navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed');
    }
  };

  if (forgotPasswordMode) {
    return (
      <div className="center-wrapper animate-fade-in">
        <div className="glass-panel auth-card">
          <h2 className="text-center" style={{ marginBottom: '2rem' }}>Reset Password</h2>
          {error && <p className="text-danger text-center mb-4">{error}</p>}
          {message && <p className="text-success text-center mb-4" style={{ color: 'var(--success-color)' }}>{message}</p>}
          
          <form onSubmit={handleForgotPassword}>
            {resetStep === 1 ? (
              <div className="form-group">
                <label>Enter Registered Email</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                  <input 
                    type="email" 
                    className="form-input" 
                    style={{ width: '100%', paddingLeft: '2.5rem' }}
                    value={email} onChange={(e) => setEmail(e.target.value)} required 
                  />
                </div>
              </div>
            ) : (
              <>
                <div className="form-group">
                  <label>Enter 6-Digit OTP</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    style={{ width: '100%', textAlign: 'center', letterSpacing: '0.5rem', fontSize: '1.5rem' }}
                    maxLength="6"
                    value={otp} onChange={(e) => setOtp(e.target.value)} required 
                    placeholder="000000"
                  />
                </div>
                <div className="form-group">
                  <label>New Password</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                    <input 
                      type={showPassword ? "text" : "password"} 
                      className="form-input" 
                      style={{ width: '100%', paddingLeft: '2.5rem' }}
                      value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required 
                    />
                  </div>
                </div>
              </>
            )}
            
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
              {resetStep === 1 ? 'Send Reset OTP' : 'Reset Password'}
            </button>
            <button 
              type="button" 
              className="btn mt-2" 
              style={{ width: '100%', background: 'transparent', border: 'none', color: 'var(--text-secondary)' }}
              onClick={() => { setForgotPasswordMode(false); setResetStep(1); }}
            >
              Back to Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="center-wrapper animate-fade-in">
      <div className="glass-panel auth-card">
        <h2 className="text-center" style={{ marginBottom: '2rem' }}>
          {otpSent ? 'Enter OTP' : 'Welcome Back'}
        </h2>
        {error && <p className="text-danger text-center mb-4">{error}</p>}
        {message && <p className="text-success text-center mb-4" style={{ color: 'var(--success-color)' }}>{message}</p>}
        
        <form onSubmit={handleSubmit}>
          {!otpSent ? (
            <>
              <div className="form-group">
                <label>Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                  <input 
                    type="email" 
                    className="form-input" 
                    style={{ width: '100%', paddingLeft: '2.5rem' }}
                    value={email} onChange={(e) => setEmail(e.target.value)} required 
                  />
                </div>
              </div>
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <label>Password</label>
                  <span 
                    onClick={() => setForgotPasswordMode(true)}
                    style={{ fontSize: '0.8rem', color: 'var(--primary-color)', cursor: 'pointer' }}
                  >
                    Forgot Password?
                  </span>
                </div>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    className="form-input" 
                    style={{ width: '100%', paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                    value={password} onChange={(e) => setPassword(e.target.value)} required 
                  />
                  <div 
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ 
                      position: 'absolute', 
                      right: '1rem', 
                      top: '50%', 
                      transform: 'translateY(-50%)', 
                      cursor: 'pointer',
                      color: 'var(--text-secondary)',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="form-group">
              <label>Enter 6-Digit OTP</label>
              <input 
                type="text" 
                className="form-input" 
                style={{ width: '100%', textAlign: 'center', letterSpacing: '0.5rem', fontSize: '1.5rem' }}
                maxLength="6"
                value={otp} onChange={(e) => setOtp(e.target.value)} required 
                placeholder="000000"
              />
            </div>
          )}
          
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
            {otpSent ? 'Verify & Login' : 'Login to Account'}
          </button>

          {otpSent && (
            <button 
              type="button" 
              className="btn mt-2" 
              style={{ width: '100%', background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: '0.8rem' }}
              onClick={() => { setOtpSent(false); setOtp(''); }}
            >
              Back to Password
            </button>
          )}
        </form>
        <p className="text-center mt-4" style={{ fontSize: '0.9rem' }}>
          Don't have an account? <Link to="/register" style={{ color: 'var(--primary-color)' }}>Register</Link>
        </p>
      </div>
    </div>
  );
}
