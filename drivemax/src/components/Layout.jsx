import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import BottomNav from './BottomNav';
import './MobileFrame.css';

const Layout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [viewMode, setViewMode] = useState('desktop'); // 'desktop' | 'mobile'
  const location = useLocation();
  const mainRef = useRef(null);

  // Scroll to top on every route change
  useEffect(() => {
    // Scroll window for desktop mode
    window.scrollTo(0, 0);
    
    // Scroll the main container for mobile mode
    if (mainRef.current) {
      mainRef.current.scrollTop = 0;
    }
  }, [location.pathname, viewMode]);

  // Close sidebar when switching to mobile
  useEffect(() => {
    if (viewMode === 'mobile') {
      setSidebarOpen(false);
    }
  }, [viewMode]);

  // Don't show sidebar/navbar on login page
  if (location.pathname === '/') {
    return <Outlet />;
  }

  const appContent = (
    <div className={`app-container ${viewMode === 'mobile' ? 'mobile-mode' : ''}`}>
      <Sidebar isOpen={isSidebarOpen} closeSidebar={() => setSidebarOpen(false)} />
      
      <main className="main-content" ref={mainRef}>
        <Navbar 
          toggleSidebar={() => setSidebarOpen(!isSidebarOpen)} 
          isOnline={isOnline}
          setOnline={setIsOnline}
          viewMode={viewMode}
          setViewMode={setViewMode}
        />
        <div className="page-content animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );

  if (viewMode === 'mobile') {
    return (
      <div className="mobile-simulator-bg">
        <div className="phone-frame">
          <div className="phone-notch"></div>
          <div className="phone-frame-content">
            {appContent}
            <BottomNav />
          </div>
          <div className="phone-home-indicator"></div>
        </div>
      </div>
    );
  }

  return appContent;
};

export default Layout;
