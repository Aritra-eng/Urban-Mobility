import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, Lock, Fingerprint, Eye, EyeOff, Smartphone, Key, Trash2, Download, History, CheckCircle, Info } from 'lucide-react';
import { useToast } from '../../components/Toast';
import ConfirmModal from '../../components/ConfirmModal';
import './SettingsShared.css';

const initialSessions = [
  { device: 'Samsung Galaxy S24', location: 'Bangalore, India', time: 'Active now', current: true },
  { device: 'Chrome on Windows', location: 'Bangalore, India', time: '2 hours ago', current: false },
  { device: 'iPhone 15 Pro', location: 'Bangalore, India', time: '3 days ago', current: false },
];

const Security = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [settings, setSettings] = useState({
    twoFactor: true,
    biometric: true,
    loginAlerts: true,
    dataSharing: false,
    locationHistory: true,
    analyticsTracking: true,
  });

  const [sessions, setSessions] = useState(initialSessions);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRevokeModal, setShowRevokeModal] = useState(null);
  const [downloadingData, setDownloadingData] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    current: '',
    newPassword: '',
    confirm: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  const toggle = (key) => {
    setSettings((s) => ({ ...s, [key]: !s[key] }));
    const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase());
    const newVal = !settings[key];
    toast(`${label} ${newVal ? 'enabled' : 'disabled'}`, newVal ? 'success' : 'info');
  };

  const handlePasswordChange = () => {
    if (!passwordForm.current || !passwordForm.newPassword || !passwordForm.confirm) {
      toast('Please fill in all password fields', 'error');
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      toast('New password must be at least 8 characters', 'error');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirm) {
      toast('New passwords do not match', 'error');
      return;
    }
    setShowPasswordModal(false);
    setPasswordForm({ current: '', newPassword: '', confirm: '' });
    toast('Password updated successfully!', 'success');
  };

  const handleRevokeSession = (index) => {
    setSessions((prev) => prev.filter((_, i) => i !== index));
    setShowRevokeModal(null);
    toast('Session revoked successfully', 'success');
  };

  const handleDownloadData = () => {
    setDownloadingData(true);
    setTimeout(() => {
      setDownloadingData(false);
      toast('Data export request submitted! You\'ll receive an email within 24 hours.', 'success');
    }, 2000);
  };

  const handleDeleteAccount = () => {
    setShowDeleteModal(false);
    toast('Account deletion request submitted. You\'ll receive a confirmation email.', 'warning');
    setTimeout(() => navigate('/'), 2000);
  };

  return (
    <div className="settings-page">
      <div className="settings-page-header">
        <button className="back-btn" onClick={() => navigate('/profile')}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="page-heading">Security & Privacy</h1>
          <p className="page-subheading">Manage your password, 2FA, and data privacy settings</p>
        </div>
      </div>

      {/* ── Info Banner ──────────────────────────────── */}
      <div className="sp-banner info">
        <div className="sp-banner-icon">
          <Shield size={20} />
        </div>
        <div className="sp-banner-text">
          <strong>Your account is well secured</strong>
          <span>Two-factor authentication and biometric login are enabled</span>
        </div>
      </div>

      {/* ── Authentication ───────────────────────────── */}
      <div className="sp-section">
        <div className="sp-section-header">
          <div>
            <h3 className="sp-section-title"><Lock size={18} /> Authentication</h3>
          </div>
        </div>
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="sp-row">
            <div className="sp-row-left">
              <div className="sp-row-icon blue"><Key size={18} /></div>
              <div className="sp-row-info">
                <span className="sp-row-name">Change Password</span>
                <span className="sp-row-desc">Last changed 45 days ago</span>
              </div>
            </div>
            <div className="sp-row-right">
              <button className="doc-btn outline" onClick={() => setShowPasswordModal(true)}>
                <Key size={14} />
                Update
              </button>
            </div>
          </div>

          <div className="sp-row">
            <div className="sp-row-left">
              <div className="sp-row-icon green"><Smartphone size={18} /></div>
              <div className="sp-row-info">
                <span className="sp-row-name">Two-Factor Authentication</span>
                <span className="sp-row-desc">SMS verification on login</span>
              </div>
            </div>
            <div className="sp-row-right">
              <span className="sp-badge green"><CheckCircle size={12} /> Active</span>
              <label className="toggle-switch">
                <input type="checkbox" checked={settings.twoFactor} onChange={() => toggle('twoFactor')} />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>

          <div className="sp-row">
            <div className="sp-row-left">
              <div className="sp-row-icon purple"><Fingerprint size={18} /></div>
              <div className="sp-row-info">
                <span className="sp-row-name">Biometric Login</span>
                <span className="sp-row-desc">Fingerprint or face recognition</span>
              </div>
            </div>
            <div className="sp-row-right">
              <label className="toggle-switch">
                <input type="checkbox" checked={settings.biometric} onChange={() => toggle('biometric')} />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>

          <div className="sp-row">
            <div className="sp-row-left">
              <div className="sp-row-icon amber"><Shield size={18} /></div>
              <div className="sp-row-info">
                <span className="sp-row-name">Login Alerts</span>
                <span className="sp-row-desc">Get notified of new sign-ins</span>
              </div>
            </div>
            <div className="sp-row-right">
              <label className="toggle-switch">
                <input type="checkbox" checked={settings.loginAlerts} onChange={() => toggle('loginAlerts')} />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* ── Active Sessions ──────────────────────────── */}
      <div className="sp-section">
        <div className="sp-section-header">
          <div>
            <h3 className="sp-section-title"><History size={18} /> Active Sessions</h3>
          </div>
        </div>
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
          {sessions.map((session, i) => (
            <div key={i} className="sp-row">
              <div className="sp-row-left">
                <div className={`sp-row-icon ${session.current ? 'green' : 'neutral'}`}>
                  <Smartphone size={18} />
                </div>
                <div className="sp-row-info">
                  <span className="sp-row-name">
                    {session.device}
                    {session.current && <span className="sp-badge green" style={{ marginLeft: '0.5rem', fontSize: '0.65rem' }}>Current</span>}
                  </span>
                  <span className="sp-row-desc">{session.location} · {session.time}</span>
                </div>
              </div>
              {!session.current && (
                <div className="sp-row-right">
                  <button
                    className="doc-btn outline"
                    style={{ color: 'var(--danger)', borderColor: 'rgba(239,68,68,0.2)' }}
                    onClick={() => setShowRevokeModal(i)}
                  >
                    Revoke
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Privacy & Data ───────────────────────────── */}
      <div className="sp-section">
        <div className="sp-section-header">
          <div>
            <h3 className="sp-section-title"><Eye size={18} /> Privacy & Data</h3>
          </div>
        </div>
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="sp-row">
            <div className="sp-row-left">
              <div className="sp-row-icon blue"><Info size={18} /></div>
              <div className="sp-row-info">
                <span className="sp-row-name">Data Sharing with Partners</span>
                <span className="sp-row-desc">Share anonymized data for service improvement</span>
              </div>
            </div>
            <div className="sp-row-right">
              <label className="toggle-switch">
                <input type="checkbox" checked={settings.dataSharing} onChange={() => toggle('dataSharing')} />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>

          <div className="sp-row">
            <div className="sp-row-left">
              <div className="sp-row-icon green"><History size={18} /></div>
              <div className="sp-row-info">
                <span className="sp-row-name">Location History</span>
                <span className="sp-row-desc">Store trip routes for records</span>
              </div>
            </div>
            <div className="sp-row-right">
              <label className="toggle-switch">
                <input type="checkbox" checked={settings.locationHistory} onChange={() => toggle('locationHistory')} />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>

          <div className="sp-row">
            <div className="sp-row-left">
              <div className="sp-row-icon neutral"><Eye size={18} /></div>
              <div className="sp-row-info">
                <span className="sp-row-name">Analytics & Tracking</span>
                <span className="sp-row-desc">Help improve app with usage analytics</span>
              </div>
            </div>
            <div className="sp-row-right">
              <label className="toggle-switch">
                <input type="checkbox" checked={settings.analyticsTracking} onChange={() => toggle('analyticsTracking')} />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* ── Data Actions ─────────────────────────────── */}
      <div className="sp-section">
        <div className="sp-section-header">
          <div>
            <h3 className="sp-section-title"><Download size={18} /> Data Management</h3>
          </div>
        </div>
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="sp-row">
            <div className="sp-row-left">
              <div className="sp-row-icon blue"><Download size={18} /></div>
              <div className="sp-row-info">
                <span className="sp-row-name">Download My Data</span>
                <span className="sp-row-desc">Get a copy of all your personal data</span>
              </div>
            </div>
            <div className="sp-row-right">
              <button
                className="doc-btn primary"
                onClick={handleDownloadData}
                disabled={downloadingData}
              >
                <Download size={14} /> {downloadingData ? 'Processing...' : 'Request'}
              </button>
            </div>
          </div>

          <div className="sp-row">
            <div className="sp-row-left">
              <div className="sp-row-icon red"><Trash2 size={18} /></div>
              <div className="sp-row-info">
                <span className="sp-row-name">Delete Account</span>
                <span className="sp-row-desc">Permanently delete your account and all data</span>
              </div>
            </div>
            <div className="sp-row-right">
              <button
                className="doc-btn outline"
                style={{ color: 'var(--danger)', borderColor: 'rgba(239,68,68,0.25)' }}
                onClick={() => setShowDeleteModal(true)}
              >
                <Trash2 size={14} /> Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Password Change Modal ─────────────────── */}
      {showPasswordModal && (
        <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon-wrap info">
              <Key size={28} />
            </div>
            <h3 className="modal-title">Change Password</h3>
            <p className="modal-desc">Enter your current password and choose a new one</p>
            <div className="password-form">
              <div className="password-field">
                <label>Current Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter current password"
                  value={passwordForm.current}
                  onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                />
              </div>
              <div className="password-field">
                <label>New Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Minimum 8 characters"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                />
              </div>
              <div className="password-field">
                <label>Confirm New Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Re-enter new password"
                  value={passwordForm.confirm}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                />
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#64748b', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={showPassword}
                  onChange={() => setShowPassword(!showPassword)}
                  style={{ width: '16px', height: '16px' }}
                />
                Show passwords
              </label>
            </div>
            <div className="modal-actions">
              <button className="modal-btn cancel" onClick={() => setShowPasswordModal(false)}>Cancel</button>
              <button className="modal-btn primary" onClick={handlePasswordChange}>Update Password</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Account Confirmation ───────────── */}
      <ConfirmModal
        isOpen={showDeleteModal}
        icon={<Trash2 size={28} />}
        iconType="danger"
        title="Delete Your Account?"
        description="This action is permanent and cannot be undone. All your data including ride history, earnings, and documents will be permanently deleted."
        confirmText="Delete Account"
        cancelText="Keep Account"
        confirmStyle="danger"
        onConfirm={handleDeleteAccount}
        onCancel={() => setShowDeleteModal(false)}
      />

      {/* ── Revoke Session Confirmation ──────────── */}
      <ConfirmModal
        isOpen={showRevokeModal !== null}
        icon={<Shield size={28} />}
        iconType="warning"
        title="Revoke Session?"
        description={showRevokeModal !== null && sessions[showRevokeModal] ? `This will sign out "${sessions[showRevokeModal]?.device}" from your account immediately.` : ''}
        confirmText="Revoke Access"
        cancelText="Cancel"
        confirmStyle="danger"
        onConfirm={() => handleRevokeSession(showRevokeModal)}
        onCancel={() => setShowRevokeModal(null)}
      />
    </div>
  );
};

export default Security;
