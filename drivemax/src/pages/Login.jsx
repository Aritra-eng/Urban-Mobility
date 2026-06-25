import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowRight, User, Lock, Zap, TrendingUp, Star, Users } from 'lucide-react';
import { useToast } from '../components/Toast';
import { apiRequest } from '../services/api';
import './Login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const data = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });

      localStorage.setItem('token', data.token);
      localStorage.setItem('driverId', data.driverId);
      toast('Login successful', 'success');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      toast(err.message || 'Login failed. Please check your credentials.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-bg-effects">
        <div className="bg-orb orb-1"></div>
        <div className="bg-orb orb-2"></div>
        <div className="bg-orb orb-3"></div>
        <div className="bg-grid"></div>
      </div>

      <div className="login-container">
        <div className="login-left">
          <div className="login-brand-header">
            <div className="brand-logo">
              <div className="logo-icon">
                <Zap size={28} />
              </div>
              <span className="logo-text">DriveMax</span>
            </div>
          </div>

          <div className="login-hero">
            <h1 className="hero-title">
              Earn More.<br />
              <span className="gradient-text">Drive Smarter.</span>
            </h1>
            <p className="hero-subtitle">
              Join thousands of drivers maximizing their earnings with AI-powered ride suggestions, real-time fuel savings, and transparent fare breakdowns.
            </p>
          </div>

          <div className="social-proof">
            <div className="proof-stat">
              <div className="proof-icon-wrap gradient-green">
                <TrendingUp size={20} />
              </div>
              <div>
                <span className="proof-number">Rs.2.4L+</span>
                <span className="proof-label">Avg. Monthly Earnings</span>
              </div>
            </div>
            <div className="proof-stat">
              <div className="proof-icon-wrap gradient-blue">
                <Users size={20} />
              </div>
              <div>
                <span className="proof-number">50K+</span>
                <span className="proof-label">Active Drivers</span>
              </div>
            </div>
            <div className="proof-stat">
              <div className="proof-icon-wrap gradient-warm">
                <Star size={20} />
              </div>
              <div>
                <span className="proof-number">4.9</span>
                <span className="proof-label">App Rating</span>
              </div>
            </div>
          </div>

          <div className="trust-row">
            <div className="trust-item">
              <ShieldCheck size={18} />
              <span>Bank-Grade Security</span>
            </div>
            <div className="trust-item">
              <Lock size={18} />
              <span>Instant Payouts</span>
            </div>
          </div>
        </div>

        <div className="login-right">
          <div className="login-form-card">
            <div className="form-header">
              <h2>Welcome Back</h2>
              <p>Sign in to start driving and earning.</p>
            </div>

            <form onSubmit={handleLoginSubmit} className="login-form">
              <div className="input-group">
                <label>Username</label>
                <div className="input-field">
                  <User size={20} className="field-icon" />
                  <input
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Password</label>
                <div className="input-field">
                  <Lock size={20} className="field-icon" />
                  <input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn-primary w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Signing in...' : <>Login <ArrowRight size={18} /></>}
              </button>
            </form>

            <div className="form-divider">
              <span>secure driver access</span>
            </div>

            <p className="terms-text">
              By continuing, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
