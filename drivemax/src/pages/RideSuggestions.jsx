import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Navigation, TrendingUp, DollarSign, Clock, Zap, Star, ArrowRight, Flame, CheckCircle } from 'lucide-react';
import { useToast } from '../components/Toast';
import { aiRequest, apiRequest, getDriverId } from '../services/api';
import './RideSuggestions.css';

const valueOf = (obj, keys, fallback = '') => keys.map((k) => obj?.[k]).find((v) => v !== undefined && v !== null) ?? fallback;
const money = (value) => Number(value || 0).toLocaleString();
const numberFrom = (value, fallback = 0) => {
  if (typeof value === 'number') return value;
  const parsed = parseFloat(String(value ?? '').replace(/[^\d.]/g, ''));
  return Number.isNaN(parsed) ? fallback : parsed;
};

const trafficValue = (traffic) => {
  const text = String(traffic || '').toLowerCase();
  if (text.includes('low')) return 2;
  if (text.includes('medium')) return 5;
  if (text.includes('high')) return 8;
  return numberFrom(traffic, 5);
};

const normalizeRide = (ride, index) => {
  const distance = numberFrom(valueOf(ride, ['distance', 'distance_km'], 10), 10);
  const fare = Number(valueOf(ride, ['fare', 'price', 'amount'], 0));
  const fuelCost = Number(valueOf(ride, ['fuelCost', 'fuel_cost'], Math.round(distance * 8)));
  const id = valueOf(ride, ['ride_id', 'id'], index + 1);
  const score = Number(valueOf(ride, ['profit_score', 'score'], 7));

  return {
    ...ride,
    id,
    ride_id: id,
    pickup: valueOf(ride, ['pickup', 'pickup_location', 'source'], 'Pickup location'),
    dropoff: valueOf(ride, ['dropoff', 'drop_location', 'destination'], 'Drop location'),
    fare,
    fuelCost,
    profit: Number(valueOf(ride, ['profit', 'net_profit'], fare - fuelCost)),
    distance: `${distance} km`,
    distanceValue: distance,
    time: valueOf(ride, ['time', 'duration', 'eta'], 'N/A'),
    score,
    traffic: valueOf(ride, ['traffic'], 'Medium'),
    surge: valueOf(ride, ['surge', 'surge_multiplier'], null),
    recommended: index === 0 || Number(valueOf(ride, ['rank'], 99)) === 1,
    aiLabel: valueOf(ride, ['recommendation_label'], ''),
    predictedProfit: valueOf(ride, ['predictedProfit'], null),
  };
};

const rideToAiInput = (ride) => ({
  ride_id: ride.ride_id,
  distance: ride.distanceValue,
  traffic: trafficValue(ride.traffic),
  fuel_price: Number(valueOf(ride, ['fuel_price', 'fuelPrice'], 100)),
  surge: numberFrom(ride.surge, 1),
  ride_type: valueOf(ride, ['ride_type', 'type'], 'local'),
});

const getTrafficColor = (traffic) => {
  const text = String(traffic).toLowerCase();
  if (text.includes('low')) return 'green';
  if (text.includes('medium')) return 'amber';
  return 'red';
};

const getScoreColor = (score) => {
  if (score >= 75 || score >= 9) return 'green';
  if (score >= 45 || score >= 8) return 'blue';
  return 'amber';
};

const RideCard = ({ ride, index, onAccept, accepted }) => (
  <div className={`ride-card glass-card ${ride.recommended ? 'recommended' : ''} ${accepted ? 'accepted' : ''}`} style={{ animationDelay: `${index * 0.08}s` }}>
    {ride.recommended && !accepted && (
      <div className="rec-ribbon">
        <Flame size={14} /> Best Match
      </div>
    )}
    {accepted && (
      <div className="rec-ribbon" style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}>
        <CheckCircle size={14} /> Accepted
      </div>
    )}

    <div className="ride-top">
      <div className="route-visual">
        <div className="route-markers">
          <div className="marker pickup"></div>
          <div className="route-dash"></div>
          <div className="marker drop"></div>
        </div>
        <div className="route-labels">
          <div>
            <span className="route-type">PICKUP</span>
            <p className="route-name">{ride.pickup}</p>
          </div>
          <div>
            <span className="route-type">DROP</span>
            <p className="route-name">{ride.dropoff}</p>
          </div>
        </div>
      </div>

      <div className="fare-block">
        <span className="fare-amount">Rs.{money(ride.fare)}</span>
        {ride.surge && <span className="surge-tag"><Zap size={12} /> {ride.surge}</span>}
        {ride.predictedProfit && <span className="surge-tag">AI Rs.{money(ride.predictedProfit)}</span>}
      </div>
    </div>

    <div className="ride-metrics">
      <div className="metric">
        <Navigation size={15} className="metric-icon" />
        <div>
          <span className="metric-val">{ride.distance}</span>
          <span className="metric-lbl">Distance</span>
        </div>
      </div>
      <div className="metric">
        <Clock size={15} className="metric-icon" />
        <div>
          <span className="metric-val">{ride.time}</span>
          <span className="metric-lbl">Duration</span>
        </div>
      </div>
      <div className="metric">
        <DollarSign size={15} className="metric-icon fuel-icon" />
        <div>
          <span className="metric-val fuel-val">-Rs.{money(ride.fuelCost)}</span>
          <span className="metric-lbl">Fuel Cost</span>
        </div>
      </div>
      <div className="metric">
        <TrendingUp size={15} className="metric-icon profit-icon" />
        <div>
          <span className="metric-val profit-val">Rs.{money(ride.profit)}</span>
          <span className="metric-lbl">Net Profit</span>
        </div>
      </div>
    </div>

    <div className="ride-bottom">
      <div className="ride-tags">
        <span className={`tag traffic-${getTrafficColor(ride.traffic)}`}>{ride.traffic} Traffic</span>
        <span className={`tag score-${getScoreColor(ride.score)}`}><Star size={12} /> {ride.score}</span>
        {ride.aiLabel && <span className="tag score-blue">{ride.aiLabel}</span>}
      </div>
      <button className={`accept-btn ${ride.recommended ? 'primary' : 'secondary'} ${accepted ? 'accepted' : ''}`} onClick={() => !accepted && onAccept(ride)} disabled={accepted}>
        {accepted ? <><CheckCircle size={16} /> Accepted</> : <>Accept Ride <ArrowRight size={16} /></>}
      </button>
    </div>
  </div>
);

const RideSuggestions = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const driverId = getDriverId();
  const [rides, setRides] = useState([]);
  const [forecast, setForecast] = useState(null);
  const [aiStatus, setAiStatus] = useState('Checking AI');
  const [acceptedRides, setAcceptedRides] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadSuggestions = async () => {
      setLoading(true);
      setError('');
      setAiStatus('Checking AI');

      try {
        const backendRides = await apiRequest('/rides');
        const normalized = (Array.isArray(backendRides) ? backendRides : []).map(normalizeRide);
        let visibleRides = normalized;

        try {
          const ranked = await aiRequest('/api/rank-rides', { rides: normalized.map(rideToAiInput) });
          const rankedById = new Map((Array.isArray(ranked) ? ranked : []).map((ride) => [String(ride.ride_id), ride]));
          visibleRides = normalized
            .map((ride) => normalizeRide({ ...ride, ...rankedById.get(String(ride.ride_id)) }, 0))
            .sort((a, b) => Number(valueOf(a, ['rank'], 99)) - Number(valueOf(b, ['rank'], 99)));
          setAiStatus('AI Active');
        } catch {
          setAiStatus('Backend List');
        }

        const withPredictions = await Promise.all(visibleRides.map(async (ride) => {
          try {
            const result = await aiRequest('/api/predict-profit', rideToAiInput(ride));
            return { ...ride, predictedProfit: result.predicted_profit };
          } catch {
            return ride;
          }
        }));
        setRides(withPredictions.map((ride, index) => ({ ...ride, recommended: index === 0 })));

        try {
          const earnings = await apiRequest(`/earnings/${driverId}`);
          const driverRides = (Array.isArray(earnings) ? earnings : []).map((row) => ({
            date: String(valueOf(row, ['earning_date', 'date'], '')).slice(0, 10),
            profit: Number(valueOf(row, ['net_profit', 'earnings', 'amount'], 0)),
          })).filter((row) => row.date);
          const forecastData = await aiRequest('/api/forecast-earnings', { driver_rides: driverRides, days_ahead: 7 });
          setForecast(forecastData);
        } catch {
          setForecast(null);
        }
      } catch (err) {
        setError(err.message || 'Unable to load ride suggestions.');
        toast(err.message || 'Unable to load ride suggestions.', 'error');
      } finally {
        setLoading(false);
      }
    };

    loadSuggestions();
  }, [driverId, toast]);

  const handleAcceptRide = (ride) => {
    setAcceptedRides((prev) => new Set([...prev, ride.id]));
    toast(`Ride to ${ride.dropoff} accepted! Fare: Rs.${money(ride.fare)}`, 'success');
  };

  if (loading) {
    return <div className="suggestions-page"><div className="glass-card">Loading ride suggestions...</div></div>;
  }

  if (error) {
    return <div className="suggestions-page"><div className="glass-card">{error}</div></div>;
  }

  return (
    <div className="suggestions-page">
      <div className="suggestions-header">
        <div>
          <h1 className="page-heading">AI Ride Suggestions</h1>
          <p className="page-subheading">Smart recommendations maximized for your profit</p>
        </div>
        <div className="scanner-badge">
          <div className="scanner-dot"></div>
          <Zap size={16} /> {aiStatus}
        </div>
      </div>

      {forecast?.summary && (
        <div className="prediction-panel glass-card">
          <div className="prediction-content">
            <div className="prediction-icon"><TrendingUp size={24} /></div>
            <div className="prediction-text">
              <h3>Earnings Forecast</h3>
              <p>
                Tomorrow forecast: <strong className="text-success">Rs.{money(forecast.summary.tomorrow)}</strong>.
                Weekly forecast: <strong className="text-success">Rs.{money(forecast.summary.week_total)}</strong>.
              </p>
            </div>
          </div>
          <button className="map-btn" onClick={() => navigate('/go-online')}>
            <MapPin size={16} /> View Peak Zones
          </button>
        </div>
      )}

      <div className="rides-grid">
        {rides.length === 0 && <div className="glass-card">No rides available right now.</div>}
        {rides.map((ride, i) => (
          <RideCard key={ride.id} ride={ride} index={i} onAccept={handleAcceptRide} accepted={acceptedRides.has(ride.id)} />
        ))}
      </div>
    </div>
  );
};

export default RideSuggestions;
