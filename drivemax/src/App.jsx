import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import RideSuggestions from './pages/RideSuggestions';
import Wallet from './pages/Wallet';
import Profile from './pages/Profile';
import GoOnline from './pages/GoOnline';
import FuelStations from './pages/FuelStations';
import Documents from './pages/settings/Documents';
import AppSettings from './pages/settings/AppSettings';
import Notifications from './pages/settings/Notifications';
import Security from './pages/settings/Security';

function App() {
  const isDemoMode =
    new URLSearchParams(window.location.search).get("demo") === "true";

  if (isDemoMode) {
    localStorage.setItem("driverId", "DRV001");
    localStorage.setItem("token", "demo-token");
  }
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            isDemoMode
              ? <Navigate to="/dashboard" replace />
              : <Login />
          }
        />
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/suggestions" element={<RideSuggestions />} />
            <Route path="/wallet" element={<Wallet />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/go-online" element={<GoOnline />} />
            <Route path="/fuel-stations" element={<FuelStations />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/app-settings" element={<AppSettings />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/security" element={<Security />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
