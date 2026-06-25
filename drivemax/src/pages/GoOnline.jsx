import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation, Power, MapPin, Clock, TrendingUp, Zap, Users, Signal, ArrowLeft, Radio, ShieldCheck, Gauge } from 'lucide-react';
import './GoOnline.css';

const hotZones = [
  { id: 1, name: 'Koramangala', demand: 'Very High', surge: '1.8x', riders: 24, color: 'red' },
  { id: 2, name: 'Indiranagar', demand: 'High', surge: '1.5x', riders: 18, color: 'amber' },
  { id: 3, name: 'HSR Layout', demand: 'High', surge: '1.3x', riders: 15, color: 'amber' },
  { id: 4, name: 'Whitefield', demand: 'Medium', surge: '1.1x', riders: 9, color: 'green' },
];

const recentRequests = [
  { id: 1, pickup: 'MG Road Metro', drop: 'Airport', fare: '₹1,350', time: '2 min ago', distance: '35 km' },
  { id: 2, pickup: 'Koramangala 5th Block', drop: 'Electronic City', fare: '₹620', time: '5 min ago', distance: '18 km' },
  { id: 3, pickup: 'Indiranagar 12th Main', drop: 'Whitefield IT Park', fare: '₹480', time: '8 min ago', distance: '14 km' },
];

const GoOnline = () => {
  const navigate = useNavigate();
  const [isOnline, setIsOnline] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    let interval;
    if (isOnline) {
      interval = setInterval(() => setElapsed((e) => e + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isOnline]);

  const formatTime = (secs) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const toggleOnline = () => {
    setIsOnline((prev) => !prev);
    if (isOnline) setElapsed(0);
  };

  return (
    <div className="go-online-page">
      <div className="go-online-header">
        <button className="back-btn" onClick={() => navigate('/dashboard')}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="page-heading">Driver Mode</h1>
          <p className="page-subheading">Manage your availability and accept ride requests</p>
        </div>
        <div className={`connection-badge ${isOnline ? 'online' : ''}`}>
          <Signal size={14} />
          <span>{isOnline ? 'Connected' : 'Offline'}</span>
        </div>
      </div>

      {/* ── Toggle Section ───────────────────────────── */}
      <section className="toggle-section">
        <div className={`toggle-card ${isOnline ? 'active' : ''}`}>
          <div className="toggle-bg-pattern"></div>
          <div className="toggle-content">
            <div className="toggle-left">
              <div className={`status-indicator ${isOnline ? 'online' : ''}`}>
                <Radio size={20} />
              </div>
              <div className="status-text">
                <h2>{isOnline ? "You're Online" : "You're Offline"}</h2>
                <p>{isOnline ? 'Accepting ride requests in your area' : 'Go online to start accepting rides'}</p>
              </div>
            </div>

            <div className="toggle-right">
              {isOnline && (
                <div className="live-timer">
                  <Clock size={16} />
                  <span className="timer-value">{formatTime(elapsed)}</span>
                </div>
              )}
              <button className={`power-btn ${isOnline ? 'active' : ''}`} onClick={toggleOnline}>
                <div className="power-ring"></div>
                <Power size={28} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Live Stats ───────────────────────────────── */}
      <section className="live-stats">
        <div className="live-stat-card glass-card">
          <div className="live-stat-icon green">
            <TrendingUp size={20} />
          </div>
          <div className="live-stat-info">
            <span className="live-stat-value">₹2,450</span>
            <span className="live-stat-label">Today's Earnings</span>
          </div>
        </div>

        <div className="live-stat-card glass-card">
          <div className="live-stat-icon blue">
            <Navigation size={20} />
          </div>
          <div className="live-stat-info">
            <span className="live-stat-value">14</span>
            <span className="live-stat-label">Rides Today</span>
          </div>
        </div>

        <div className="live-stat-card glass-card">
          <div className="live-stat-icon purple">
            <Gauge size={20} />
          </div>
          <div className="live-stat-info">
            <span className="live-stat-value">92%</span>
            <span className="live-stat-label">Acceptance Rate</span>
          </div>
        </div>

        <div className="live-stat-card glass-card">
          <div className="live-stat-icon amber">
            <ShieldCheck size={20} />
          </div>
          <div className="live-stat-info">
            <span className="live-stat-value">4.95</span>
            <span className="live-stat-label">Driver Rating</span>
          </div>
        </div>
      </section>

      <div className="go-online-columns">
        {/* ── Demand Heatmap ──────────────────────────── */}
        <section className="demand-section">
          <div className="section-head">
            <h3 className="section-title">
              <Zap size={18} />
              Live Demand Zones
            </h3>
            <span className="live-dot-badge">
              <span className="live-dot"></span> Live
            </span>
          </div>
          <div className="zones-list">
            {hotZones.map((zone, i) => (
              <div
                key={zone.id}
                className={`zone-card glass-card`}
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <div className="zone-left">
                  <div className={`zone-heat ${zone.color}`}>
                    <MapPin size={16} />
                  </div>
                  <div className="zone-info">
                    <span className="zone-name">{zone.name}</span>
                    <span className={`zone-demand ${zone.color}`}>{zone.demand}</span>
                  </div>
                </div>
                <div className="zone-right">
                  <div className="zone-meta">
                    <span className="zone-surge">
                      <Zap size={12} /> {zone.surge}
                    </span>
                    <span className="zone-riders">
                      <Users size={12} /> {zone.riders} riders
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Recent Requests ─────────────────────────── */}
        <section className="requests-section">
          <h3 className="section-title">Recent Ride Requests</h3>
          <div className="requests-list">
            {recentRequests.map((req, i) => (
              <div
                key={req.id}
                className="request-card glass-card"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <div className="request-route">
                  <div className="request-markers">
                    <div className="req-marker pickup"></div>
                    <div className="req-dash"></div>
                    <div className="req-marker drop"></div>
                  </div>
                  <div className="request-labels">
                    <span className="req-location">{req.pickup}</span>
                    <span className="req-location drop">{req.drop}</span>
                  </div>
                </div>
                <div className="request-details">
                  <span className="req-fare">{req.fare}</span>
                  <span className="req-distance">{req.distance}</span>
                  <span className="req-time">{req.time}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default GoOnline;
