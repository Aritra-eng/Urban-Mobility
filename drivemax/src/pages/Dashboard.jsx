import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Clock, Target, Star, Route, Navigation, Fuel, Wallet, ArrowUpRight, Sparkles } from 'lucide-react';
import { apiRequest, getDriverId } from '../services/api';
import { useToast } from '../components/Toast';
import './Dashboard.css';

const fallbackEarningsData = [
  { time: '6am', earnings: 0 },
  { time: '8am', earnings: 0 },
  { time: '10am', earnings: 0 },
  { time: '12pm', earnings: 0 },
  { time: '2pm', earnings: 0 },
  { time: '4pm', earnings: 0 },
  { time: '6pm', earnings: 0 },
  { time: '8pm', earnings: 0 },
];

const fallbackWeeklyData = [
  { day: 'Mon', earnings: 0, fuel: 0 },
  { day: 'Tue', earnings: 0, fuel: 0 },
  { day: 'Wed', earnings: 0, fuel: 0 },
  { day: 'Thu', earnings: 0, fuel: 0 },
  { day: 'Fri', earnings: 0, fuel: 0 },
  { day: 'Sat', earnings: 0, fuel: 0 },
  { day: 'Sun', earnings: 0, fuel: 0 },
];

const currency = (value) => `Rs.${Number(value || 0).toLocaleString()}`;
const valueOf = (obj, keys, fallback = 0) => keys.map((k) => obj?.[k]).find((v) => v !== undefined && v !== null) ?? fallback;

const getDriverName = (driver) => valueOf(driver, ['name', 'driver_name', 'full_name', 'username'], 'Driver');

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <p className="tooltip-label">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }} className="tooltip-value">
            {p.name}: {currency(p.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const Dashboard = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const driverId = getDriverId();
  const [dashboard, setDashboard] = useState(null);
  const [earningsHistory, setEarningsHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      setError('');

      try {
        const [dashboardData, earningsData] = await Promise.all([
          apiRequest(`/dashboard/${driverId}`),
          apiRequest(`/earnings/${driverId}`).catch(() => []),
        ]);
        setDashboard(dashboardData);
        setEarningsHistory(Array.isArray(earningsData) ? earningsData : []);
      } catch (err) {
        setError(err.message || 'Unable to load dashboard.');
        toast(err.message || 'Unable to load dashboard.', 'error');
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [driverId, toast]);

  const latest = dashboard?.latest_earning || {};
  const driver = dashboard?.driver || {};
  const todayEarnings = valueOf(latest, ['earnings', 'amount', 'total_earnings'], 0);
  const fuelCost = valueOf(latest, ['fuel_cost', 'fuelCost'], 0);
  const netProfit = valueOf(latest, ['net_profit', 'profit'], Number(todayEarnings) - Number(fuelCost));

  const earningsData = useMemo(() => {
    if (!earningsHistory.length) return fallbackEarningsData;

    return earningsHistory.slice(0, 8).reverse().map((row, index) => ({
      time: row.earning_date ? new Date(row.earning_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : `Ride ${index + 1}`,
      earnings: Number(valueOf(row, ['earnings', 'amount', 'total_earnings'], 0)),
    }));
  }, [earningsHistory]);

  const weeklyData = useMemo(() => {
    if (!earningsHistory.length) return fallbackWeeklyData;

    return earningsHistory.slice(0, 7).reverse().map((row) => ({
      day: row.earning_date ? new Date(row.earning_date).toLocaleDateString(undefined, { weekday: 'short' }) : 'Day',
      earnings: Number(valueOf(row, ['earnings', 'amount', 'total_earnings'], 0)),
      fuel: Number(valueOf(row, ['fuel_cost', 'fuelCost'], 0)),
    }));
  }, [earningsHistory]);

  if (loading) {
    return <div className="glass-card">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="glass-card">{error}</div>;
  }

  return (
    <div className="dashboard">
      <section className="dash-hero">
        <div className="hero-bg-pattern"></div>
        <div className="hero-content">
          <div className="hero-text">
            <p className="hero-greeting">Good Morning</p>
            <h1 className="hero-name">Welcome back, {getDriverName(driver)}</h1>
            <p className="hero-sub">Here's your driving performance today</p>
          </div>
          <div className="hero-earnings">
            <div className="earning-block">
              <span className="earning-label">Today's Earnings</span>
              <span className="earning-amount">{currency(todayEarnings)}</span>
              <span className="earning-trend positive">
                <ArrowUpRight size={14} /> Live dashboard data
              </span>
            </div>
            <div className="earning-divider"></div>
            <div className="earning-block">
              <span className="earning-label">Net Profit</span>
              <span className="earning-amount green">{currency(netProfit)}</span>
              <span className="earning-sub">After {currency(fuelCost)} fuel cost</span>
            </div>
          </div>
        </div>
      </section>

      <section className="stats-section">
        <div className="stat-card">
          <div className="stat-icon-wrap blue">
            <Route size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{valueOf(driver, ['total_rides', 'totalRides', 'rides_completed'], 0)}</span>
            <span className="stat-label">Rides Completed</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrap green">
            <Target size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{valueOf(driver, ['acceptance_rate', 'acceptanceRate'], 'N/A')}</span>
            <span className="stat-label">Acceptance Rate</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrap amber">
            <Star size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{valueOf(driver, ['rating', 'driver_score'], 'N/A')}</span>
            <span className="stat-label">Driver Score</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrap purple">
            <Clock size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{valueOf(driver, ['hours_online', 'online_hours'], 'N/A')}</span>
            <span className="stat-label">Hours Online</span>
          </div>
        </div>
      </section>

      <section className="charts-row">
        <div className="chart-card glass-card">
          <div className="chart-header">
            <div>
              <h3 className="chart-title">Earnings Trend</h3>
              <p className="chart-subtitle">Latest earnings history</p>
            </div>
          </div>
          <div className="chart-body">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={earningsData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradientEarnings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563EB" stopOpacity={0.25}/>
                    <stop offset="100%" stopColor="#2563EB" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.04)" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={8} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={(v) => `Rs.${v}`} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="earnings"
                  name="Earnings"
                  stroke="#2563EB"
                  strokeWidth={2.5}
                  fill="url(#gradientEarnings)"
                  dot={false}
                  activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card glass-card">
          <div className="chart-header">
            <div>
              <h3 className="chart-title">Weekly Breakdown</h3>
              <p className="chart-subtitle">Earnings vs Fuel Cost</p>
            </div>
          </div>
          <div className="chart-body">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.04)" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={8} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={(v) => `Rs.${v}`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="earnings" name="Earnings" fill="#2563EB" radius={[6, 6, 0, 0]} barSize={20} />
                <Bar dataKey="fuel" name="Fuel" fill="#f97316" radius={[6, 6, 0, 0]} barSize={20} opacity={0.7} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="actions-section">
        <h3 className="section-title">Quick Actions</h3>
        <div className="actions-row">
          <button className="action-card go-online" onClick={() => navigate('/go-online')}>
            <div className="action-icon-wrap">
              <Navigation size={24} />
            </div>
            <span className="action-name">Go Online</span>
            <span className="action-desc">Start accepting rides</span>
          </button>

          <button className="action-card" onClick={() => navigate('/wallet')}>
            <div className="action-icon-wrap withdraw">
              <Wallet size={24} />
            </div>
            <span className="action-name">Withdraw</span>
            <span className="action-desc">Instant to bank</span>
          </button>

          <button className="action-card" onClick={() => navigate('/fuel-stations')}>
            <div className="action-icon-wrap fuel">
              <Fuel size={24} />
            </div>
            <span className="action-name">Fuel Station</span>
            <span className="action-desc">Nearest & cheapest</span>
          </button>

          <button className="action-card" onClick={() => navigate('/suggestions')}>
            <div className="action-icon-wrap suggest">
              <Sparkles size={24} />
            </div>
            <span className="action-name">AI Suggestions</span>
            <span className="action-desc">High profit rides</span>
          </button>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
