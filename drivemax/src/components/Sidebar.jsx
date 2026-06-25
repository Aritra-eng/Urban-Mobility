import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, MapPin, Wallet, User, Settings, X, Zap, LogOut, Power, Fuel } from 'lucide-react';
import { clearSession } from '../services/api';
import './Sidebar.css';

const Sidebar = ({ isOpen, closeSidebar }) => {
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Go Online', path: '/go-online', icon: <Power size={20} /> },
    { name: 'Ride Suggestions', path: '/suggestions', icon: <MapPin size={20} /> },
    { name: 'Fuel Stations', path: '/fuel-stations', icon: <Fuel size={20} /> },
    { name: 'Wallet', path: '/wallet', icon: <Wallet size={20} /> },
    { name: 'Profile', path: '/profile', icon: <User size={20} /> },
  ];

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={closeSidebar}></div>}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="sidebar-logo-icon">
              <Zap size={20} />
            </div>
            <span className="sidebar-logo-text">DriveMax</span>
          </div>
          <button className="close-btn" onClick={closeSidebar}>
            <X size={22} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <span className="nav-section-label">MENU</span>
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={closeSidebar}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.name}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <span className="nav-section-label">ACCOUNT</span>
          <NavLink to="/profile" className="nav-item" onClick={closeSidebar}>
            <span className="nav-icon"><Settings size={20} /></span>
            <span className="nav-label">Settings</span>
          </NavLink>
          <NavLink to="/" className="nav-item logout-item" onClick={() => { clearSession(); closeSidebar(); }}>
            <span className="nav-icon"><LogOut size={20} /></span>
            <span className="nav-label">Log Out</span>
          </NavLink>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
