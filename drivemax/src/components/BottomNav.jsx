import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Wallet, Navigation, User } from 'lucide-react';
import './BottomNav.css';

const BottomNav = () => {
  return (
    <nav className="bottom-nav">
      <NavLink to="/dashboard" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
        <div className="icon-wrapper">
          <LayoutDashboard size={22} />
        </div>
        <span>Home</span>
      </NavLink>

      <NavLink to="/wallet" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
        <div className="icon-wrapper">
          <Wallet size={22} />
        </div>
        <span>Earnings</span>
      </NavLink>

      <NavLink to="/go-online" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
        <div className="icon-wrapper">
          <Navigation size={22} />
        </div>
        <span>Drive</span>
      </NavLink>

      <NavLink to="/profile" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
        <div className="icon-wrapper">
          <User size={22} />
          <span className="bottom-nav-badge"></span>
        </div>
        <span>Account</span>
      </NavLink>
    </nav>
  );
};

export default BottomNav;
