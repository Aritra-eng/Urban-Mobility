import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, Smartphone, Mail, MessageSquare, Zap, TrendingUp, AlertTriangle, Gift, Users, Volume2, Clock } from 'lucide-react';
import { useToast } from '../../components/Toast';
import './SettingsShared.css';

const Notifications = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [prefs, setPrefs] = useState({
    pushEnabled: true,
    emailEnabled: true,
    smsEnabled: false,
    newRideAlerts: true,
    surgeAlerts: true,
    earningsUpdates: true,
    weeklyReport: true,
    safetyAlerts: true,
    promotions: false,
    referralUpdates: true,
    riderMessages: true,
    quietHours: false,
    soundAlerts: true,
  });

  const labels = {
    pushEnabled: 'Push Notifications',
    emailEnabled: 'Email Notifications',
    smsEnabled: 'SMS Notifications',
    newRideAlerts: 'New Ride Requests',
    surgeAlerts: 'Surge Pricing Alerts',
    earningsUpdates: 'Earnings Updates',
    weeklyReport: 'Weekly Report',
    safetyAlerts: 'Safety Alerts',
    promotions: 'Promotions & Offers',
    referralUpdates: 'Referral Updates',
    riderMessages: 'Rider Messages',
    quietHours: 'Quiet Hours',
    soundAlerts: 'Sound Alerts',
  };

  const toggle = (key) => {
    const newVal = !prefs[key];
    setPrefs((p) => ({ ...p, [key]: newVal }));
    toast(`${labels[key]} ${newVal ? 'enabled' : 'disabled'}`, newVal ? 'success' : 'info');
  };

  return (
    <div className="settings-page">
      <div className="settings-page-header">
        <button className="back-btn" onClick={() => navigate('/profile')}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="page-heading">Notifications</h1>
          <p className="page-subheading">Control how and when you receive alerts</p>
        </div>
      </div>

      {/* ── Delivery Channels ────────────────────────── */}
      <div className="sp-section">
        <div className="sp-section-header">
          <div>
            <h3 className="sp-section-title"><Bell size={18} /> Delivery Channels</h3>
          </div>
        </div>
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="sp-row">
            <div className="sp-row-left">
              <div className="sp-row-icon blue"><Smartphone size={18} /></div>
              <div className="sp-row-info">
                <span className="sp-row-name">Push Notifications</span>
                <span className="sp-row-desc">Instant alerts on your device</span>
              </div>
            </div>
            <div className="sp-row-right">
              <label className="toggle-switch">
                <input type="checkbox" checked={prefs.pushEnabled} onChange={() => toggle('pushEnabled')} />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>

          <div className="sp-row">
            <div className="sp-row-left">
              <div className="sp-row-icon purple"><Mail size={18} /></div>
              <div className="sp-row-info">
                <span className="sp-row-name">Email Notifications</span>
                <span className="sp-row-desc">askk@email.com</span>
              </div>
            </div>
            <div className="sp-row-right">
              <label className="toggle-switch">
                <input type="checkbox" checked={prefs.emailEnabled} onChange={() => toggle('emailEnabled')} />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>

          <div className="sp-row">
            <div className="sp-row-left">
              <div className="sp-row-icon green"><MessageSquare size={18} /></div>
              <div className="sp-row-info">
                <span className="sp-row-name">SMS Notifications</span>
                <span className="sp-row-desc">+91 98765 43210 · Carrier charges may apply</span>
              </div>
            </div>
            <div className="sp-row-right">
              <label className="toggle-switch">
                <input type="checkbox" checked={prefs.smsEnabled} onChange={() => toggle('smsEnabled')} />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* ── Ride Alerts ──────────────────────────────── */}
      <div className="sp-section">
        <div className="sp-section-header">
          <div>
            <h3 className="sp-section-title"><Zap size={18} /> Ride Alerts</h3>
          </div>
        </div>
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="sp-row">
            <div className="sp-row-left">
              <div className="sp-row-icon blue"><Zap size={18} /></div>
              <div className="sp-row-info">
                <span className="sp-row-name">New Ride Requests</span>
                <span className="sp-row-desc">Alert when a new ride is available</span>
              </div>
            </div>
            <div className="sp-row-right">
              <label className="toggle-switch">
                <input type="checkbox" checked={prefs.newRideAlerts} onChange={() => toggle('newRideAlerts')} />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>

          <div className="sp-row">
            <div className="sp-row-left">
              <div className="sp-row-icon amber"><TrendingUp size={18} /></div>
              <div className="sp-row-info">
                <span className="sp-row-name">Surge Pricing Alerts</span>
                <span className="sp-row-desc">Notify when surge is active in your area</span>
              </div>
            </div>
            <div className="sp-row-right">
              <label className="toggle-switch">
                <input type="checkbox" checked={prefs.surgeAlerts} onChange={() => toggle('surgeAlerts')} />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>

          <div className="sp-row">
            <div className="sp-row-left">
              <div className="sp-row-icon cyan"><Users size={18} /></div>
              <div className="sp-row-info">
                <span className="sp-row-name">Rider Messages</span>
                <span className="sp-row-desc">In-app messages from riders</span>
              </div>
            </div>
            <div className="sp-row-right">
              <label className="toggle-switch">
                <input type="checkbox" checked={prefs.riderMessages} onChange={() => toggle('riderMessages')} />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* ── Earnings & Reports ───────────────────────── */}
      <div className="sp-section">
        <div className="sp-section-header">
          <div>
            <h3 className="sp-section-title"><TrendingUp size={18} /> Earnings & Reports</h3>
          </div>
        </div>
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="sp-row">
            <div className="sp-row-left">
              <div className="sp-row-icon green"><TrendingUp size={18} /></div>
              <div className="sp-row-info">
                <span className="sp-row-name">Earnings Updates</span>
                <span className="sp-row-desc">Daily earnings summaries</span>
              </div>
            </div>
            <div className="sp-row-right">
              <label className="toggle-switch">
                <input type="checkbox" checked={prefs.earningsUpdates} onChange={() => toggle('earningsUpdates')} />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>

          <div className="sp-row">
            <div className="sp-row-left">
              <div className="sp-row-icon blue"><Mail size={18} /></div>
              <div className="sp-row-info">
                <span className="sp-row-name">Weekly Report</span>
                <span className="sp-row-desc">Performance and earnings digest every Monday</span>
              </div>
            </div>
            <div className="sp-row-right">
              <label className="toggle-switch">
                <input type="checkbox" checked={prefs.weeklyReport} onChange={() => toggle('weeklyReport')} />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>

          <div className="sp-row">
            <div className="sp-row-left">
              <div className="sp-row-icon amber"><Gift size={18} /></div>
              <div className="sp-row-info">
                <span className="sp-row-name">Promotions & Offers</span>
                <span className="sp-row-desc">Bonuses, incentives, and rewards</span>
              </div>
            </div>
            <div className="sp-row-right">
              <label className="toggle-switch">
                <input type="checkbox" checked={prefs.promotions} onChange={() => toggle('promotions')} />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* ── Safety & Quiet Hours ─────────────────────── */}
      <div className="sp-section">
        <div className="sp-section-header">
          <div>
            <h3 className="sp-section-title"><AlertTriangle size={18} /> Safety & Schedule</h3>
          </div>
        </div>
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="sp-row">
            <div className="sp-row-left">
              <div className="sp-row-icon red"><AlertTriangle size={18} /></div>
              <div className="sp-row-info">
                <span className="sp-row-name">Safety Alerts</span>
                <span className="sp-row-desc">Emergency and safety notifications (always recommended)</span>
              </div>
            </div>
            <div className="sp-row-right">
              <label className="toggle-switch">
                <input type="checkbox" checked={prefs.safetyAlerts} onChange={() => toggle('safetyAlerts')} />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>

          <div className="sp-row">
            <div className="sp-row-left">
              <div className="sp-row-icon neutral"><Volume2 size={18} /></div>
              <div className="sp-row-info">
                <span className="sp-row-name">Sound Alerts</span>
                <span className="sp-row-desc">Play notification sounds</span>
              </div>
            </div>
            <div className="sp-row-right">
              <label className="toggle-switch">
                <input type="checkbox" checked={prefs.soundAlerts} onChange={() => toggle('soundAlerts')} />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>

          <div className="sp-row">
            <div className="sp-row-left">
              <div className="sp-row-icon purple"><Clock size={18} /></div>
              <div className="sp-row-info">
                <span className="sp-row-name">Quiet Hours</span>
                <span className="sp-row-desc">Mute non-critical notifications 10 PM – 7 AM</span>
              </div>
            </div>
            <div className="sp-row-right">
              <label className="toggle-switch">
                <input type="checkbox" checked={prefs.quietHours} onChange={() => toggle('quietHours')} />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
