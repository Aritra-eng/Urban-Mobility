import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Star, FileText, Settings, Bell, Shield, ChevronRight, Award, MapPin, Car, Calendar, CheckCircle, AlertTriangle, LogOut, Edit2, Save, X } from 'lucide-react';
import { useToast } from '../components/Toast';
import ConfirmModal from '../components/ConfirmModal';
import { apiRequest, clearSession, getDriverId } from '../services/api';
import askkAvatar from '../assets/askk_avatar.png';
import './Profile.css';

const valueOf = (obj, keys, fallback = '') => keys.map((k) => obj?.[k]).find((v) => v !== undefined && v !== null) ?? fallback;
const getJoinedYear = (driver) => {
  const joined = valueOf(driver, ['joined_at', 'joined_date', 'created_at', 'join_date'], '');
  if (!joined) return 'N/A';
  const date = new Date(joined);
  return Number.isNaN(date.getTime()) ? String(joined).slice(0, 4) : date.getFullYear();
};

const Profile = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const fileInputRef = useRef(null);

  const [avatarSrc, setAvatarSrc] = useState(askkAvatar);
  const [isEditing, setIsEditing] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [driverInfo, setDriverInfo] = useState({
    name: 'Askk',
    tier: 'Premium Driver Partner',
  });
  const [editInfo, setEditInfo] = useState({ ...driverInfo });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDriver = async () => {
      setLoading(true);
      setError('');

      try {
        const data = await apiRequest(`/drivers/${getDriverId()}`);
        const mapped = {
          ...data,
          name: valueOf(data, ['name', 'driver_name', 'full_name', 'username'], 'Driver'),
          tier: valueOf(data, ['tier', 'driver_tier'], 'Driver Partner'),
        };
        setDriverInfo(mapped);
        setEditInfo(mapped);
      } catch (err) {
        setError(err.message || 'Unable to load profile.');
        toast(err.message || 'Unable to load profile.', 'error');
      } finally {
        setLoading(false);
      }
    };

    loadDriver();
  }, [toast]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast('Image must be under 5MB', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        setAvatarSrc(ev.target.result);
        toast('Profile photo updated!', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Save
      setDriverInfo({ ...editInfo });
      setIsEditing(false);
      toast('Profile saved successfully!', 'success');
    } else {
      setEditInfo({ ...driverInfo });
      setIsEditing(true);
    }
  };

  const handleCancelEdit = () => {
    setEditInfo({ ...driverInfo });
    setIsEditing(false);
  };

  const handleLogout = () => {
    setShowLogoutModal(false);
    clearSession();
    toast('Logged out successfully', 'info');
    setTimeout(() => navigate('/'), 500);
  };

  if (loading) {
    return <div className="profile-page"><div className="glass-card">Loading profile...</div></div>;
  }

  if (error) {
    return <div className="profile-page"><div className="glass-card">{error}</div></div>;
  }

  return (
    <div className="profile-page">
      <h1 className="page-heading">Driver Profile</h1>

      <div className="profile-layout">
        {/* ── Left Column ────────────────────────── */}
        <div className="profile-left">
          {/* Profile Card */}
          <div className="profile-card glass-card">
            <div className="profile-cover">
              <div className="cover-pattern"></div>
              <button
                className="edit-profile-btn"
                onClick={handleEditToggle}
                title={isEditing ? 'Save Changes' : 'Edit Profile'}
              >
                {isEditing ? <Save size={14} /> : <Edit2 size={14} />}
              </button>
              {isEditing && (
                <button className="cancel-edit-btn" onClick={handleCancelEdit} title="Cancel">
                  <X size={14} />
                </button>
              )}
            </div>
            <div className="profile-body">
              <div className="avatar-container">
                <img
                  src={avatarSrc}
                  alt="Askk"
                  className="avatar-img"
                />
                <button className="avatar-edit" onClick={handleAvatarClick}>
                  <Camera size={14} />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleAvatarChange}
                />
              </div>

              {isEditing ? (
                <>
                  <input
                    className="edit-name-input"
                    value={editInfo.name}
                    onChange={(e) => setEditInfo({ ...editInfo, name: e.target.value })}
                    placeholder="Driver Name"
                  />
                  <input
                    className="edit-tier-input"
                    value={editInfo.tier}
                    onChange={(e) => setEditInfo({ ...editInfo, tier: e.target.value })}
                    placeholder="Title / Tier"
                  />
                </>
              ) : (
                <>
                  <h2 className="driver-name">{driverInfo.name}</h2>
                  <p className="driver-tier">{driverInfo.tier}</p>
                </>
              )}

              <div className="rating-row">
                <div className="rating-pill">
                  <Star size={15} className="star-filled" />
                  <span className="rating-number">{valueOf(driverInfo, ['rating', 'driver_score'], 'N/A')}</span>
                </div>
                <span className="rating-rides">{valueOf(driverInfo, ['total_rides', 'totalRides', 'rides_completed'], 0)} rides</span>
              </div>

              <div className="driver-badges">
                <div className="badge-item">
                  <Award size={16} />
                  <span>{driverInfo.tier}</span>
                </div>
                <div className="badge-item">
                  <MapPin size={16} />
                  <span>{valueOf(driverInfo, ['city', 'location'], 'N/A')}</span>
                </div>
                <div className="badge-item">
                  <Calendar size={16} />
                  <span>Since {getJoinedYear(driverInfo)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Vehicle Card */}
          <div className="vehicle-card glass-card">
            <div className="vehicle-header">
              <Car size={20} className="text-primary" />
              <h3>Current Vehicle</h3>
            </div>
            <div className="vehicle-details">
              <div className="vehicle-main">
                <span className="vehicle-name">Toyota Camry Hybrid</span>
                <span className="vehicle-year">2023</span>
              </div>
              <div className="vehicle-meta">
                <span className="plate-number">KA-01-AB-1234</span>
                <span className="vehicle-color">
                  <span className="color-dot blue"></span> Blue
                </span>
              </div>
            </div>
          </div>

          {/* Verification Status */}
          <div className="verification-card glass-card">
            <h3 className="card-title">Account Status</h3>
            <div className="verify-list">
              <div className="verify-item">
                <div className="verify-left">
                  <CheckCircle size={18} className="text-success" />
                  <span>Background Check</span>
                </div>
                <span className="verify-status passed">Passed</span>
              </div>
              <div className="verify-item">
                <div className="verify-left">
                  <CheckCircle size={18} className="text-success" />
                  <span>Insurance</span>
                </div>
                <span className="verify-status passed">Valid till Dec 2026</span>
              </div>
              <div className="verify-item">
                <div className="verify-left">
                  <CheckCircle size={18} className="text-success" />
                  <span>Identity Verified</span>
                </div>
                <span className="verify-status passed">Verified</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right Column ───────────────────────── */}
        <div className="profile-right">
          {/* Documents */}
          <div className="section-card glass-card">
            <div className="section-header">
              <h3>Documents & Compliance</h3>
              <p>Manage your driving licenses and vehicle documents</p>
            </div>
            <div className="settings-list">
              <button className="settings-row" onClick={() => navigate('/documents')}>
                <div className="settings-left">
                  <div className="settings-icon green">
                    <FileText size={18} />
                  </div>
                  <div>
                    <span className="settings-name">Driver's License</span>
                    <span className="settings-sub verified">Verified</span>
                  </div>
                </div>
                <ChevronRight size={18} className="chevron-icon" />
              </button>

              <button className="settings-row" onClick={() => navigate('/documents')}>
                <div className="settings-left">
                  <div className="settings-icon green">
                    <FileText size={18} />
                  </div>
                  <div>
                    <span className="settings-name">Vehicle Registration (RC)</span>
                    <span className="settings-sub verified">Verified</span>
                  </div>
                </div>
                <ChevronRight size={18} className="chevron-icon" />
              </button>

              <button className="settings-row" onClick={() => navigate('/documents')}>
                <div className="settings-left">
                  <div className="settings-icon amber">
                    <AlertTriangle size={18} />
                  </div>
                  <div>
                    <span className="settings-name">Vehicle Inspection</span>
                    <span className="settings-sub expiring">Expires in 14 days</span>
                  </div>
                </div>
                <ChevronRight size={18} className="chevron-icon" />
              </button>

              <button className="settings-row" onClick={() => navigate('/documents')}>
                <div className="settings-left">
                  <div className="settings-icon green">
                    <Shield size={18} />
                  </div>
                  <div>
                    <span className="settings-name">Insurance Policy</span>
                    <span className="settings-sub verified">Active</span>
                  </div>
                </div>
                <ChevronRight size={18} className="chevron-icon" />
              </button>
            </div>
          </div>

          {/* Preferences */}
          <div className="section-card glass-card">
            <div className="section-header">
              <h3>Preferences & Settings</h3>
              <p>Customize your app experience</p>
            </div>
            <div className="settings-list">
              <button className="settings-row" onClick={() => navigate('/app-settings')}>
                <div className="settings-left">
                  <div className="settings-icon neutral">
                    <Settings size={18} />
                  </div>
                  <div>
                    <span className="settings-name">App Settings</span>
                    <span className="settings-sub">Language, theme, units</span>
                  </div>
                </div>
                <ChevronRight size={18} className="chevron-icon" />
              </button>

              <button className="settings-row" onClick={() => navigate('/notifications')}>
                <div className="settings-left">
                  <div className="settings-icon neutral">
                    <Bell size={18} />
                  </div>
                  <div>
                    <span className="settings-name">Notifications</span>
                    <span className="settings-sub">Push, email, SMS</span>
                  </div>
                </div>
                <ChevronRight size={18} className="chevron-icon" />
              </button>

              <button className="settings-row" onClick={() => navigate('/security')}>
                <div className="settings-left">
                  <div className="settings-icon neutral">
                    <Shield size={18} />
                  </div>
                  <div>
                    <span className="settings-name">Security & Privacy</span>
                    <span className="settings-sub">Password, 2FA, data</span>
                  </div>
                </div>
                <ChevronRight size={18} className="chevron-icon" />
              </button>
            </div>
          </div>

          <button className="logout-btn" onClick={() => setShowLogoutModal(true)}>
            <LogOut size={18} /> Log Out
          </button>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      <ConfirmModal
        isOpen={showLogoutModal}
        icon={<LogOut size={28} />}
        iconType="warning"
        title="Log Out?"
        description="You'll need to sign in again to access your account. Any unsaved changes will be lost."
        confirmText="Log Out"
        cancelText="Stay"
        confirmStyle="danger"
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutModal(false)}
      />
    </div>
  );
};

export default Profile;
