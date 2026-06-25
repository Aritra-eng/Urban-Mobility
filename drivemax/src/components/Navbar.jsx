import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Menu, ChevronDown, Smartphone, Monitor } from 'lucide-react';
import askkAvatar from '../assets/askk_avatar.png';
import './Navbar.css';

const Navbar = ({ toggleSidebar, isOnline, setOnline, viewMode, setViewMode }) => {
  const navigate = useNavigate();

  const toggleView = () => {
    setViewMode(viewMode === 'desktop' ? 'mobile' : 'desktop');
  };

  return (
    <header className="navbar">
      <div className="navbar-left">
        <button className="menu-btn" onClick={toggleSidebar}>
          <Menu size={22} />
        </button>
        <div className="page-title-area">
          {/* Could be dynamic based on route */}
        </div>
      </div>

      <div className="navbar-right">
        <button 
          className={`view-toggle-btn ${viewMode === 'mobile' ? 'active' : ''}`}
          onClick={toggleView}
          data-tooltip={viewMode === 'desktop' ? 'Mobile View' : 'Desktop View'}
        >
          {viewMode === 'desktop' ? <Smartphone size={18} /> : <Monitor size={18} />}
        </button>

        <div className="status-pill" onClick={() => setOnline(!isOnline)}>
          <div className={`status-dot ${isOnline ? 'online' : 'offline'}`}></div>
          <span className={`status-label ${isOnline ? 'online' : ''}`}>
            {isOnline ? 'Online' : 'Offline'}
          </span>
        </div>

        <button className="nav-icon-btn" onClick={() => navigate('/notifications')}>
          <Bell size={20} />
          <span className="notif-dot"></span>
        </button>

        <button className="profile-pill" onClick={() => navigate('/profile')}>
          <div className="profile-avatar-sm">
            <img src={askkAvatar} alt="Askk" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
          </div>
          <span className="profile-name">Askk</span>
          <ChevronDown size={14} className="chevron" />
        </button>
      </div>
    </header>
  );
};

export default Navbar;
