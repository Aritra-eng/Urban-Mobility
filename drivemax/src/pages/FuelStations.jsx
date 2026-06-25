import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Fuel, MapPin, Star, Clock, Navigation, ArrowLeft, Filter, TrendingDown, Droplets, IndianRupee, Route } from 'lucide-react';
import { useToast } from '../components/Toast';
import { apiRequest } from '../services/api';
import './FuelStations.css';

const valueOf = (obj, keys, fallback = '') => keys.map((k) => obj?.[k]).find((v) => v !== undefined && v !== null) ?? fallback;
const numberFrom = (value, fallback = 0) => {
  if (typeof value === 'number') return value;
  const parsed = parseFloat(String(value ?? '').replace(/[^\d.]/g, ''));
  return Number.isNaN(parsed) ? fallback : parsed;
};

const normalizeStation = (station, index) => ({
  id: valueOf(station, ['station_id', 'id'], index + 1),
  name: valueOf(station, ['name', 'station_name'], 'Fuel Station'),
  brand: valueOf(station, ['brand'], 'Fuel'),
  address: valueOf(station, ['address', 'location'], 'Nearby'),
  distance: `${numberFrom(valueOf(station, ['distance', 'distance_km'], 0), 0)} km`,
  petrol: numberFrom(valueOf(station, ['petrol', 'petrol_price'], 0), 0),
  diesel: numberFrom(valueOf(station, ['diesel', 'diesel_price'], 0), 0),
  rating: numberFrom(valueOf(station, ['rating'], 0), 0),
  reviews: numberFrom(valueOf(station, ['reviews', 'review_count'], 0), 0),
  open: valueOf(station, ['open', 'is_open'], true) !== false,
  amenities: Array.isArray(station.amenities) ? station.amenities : String(valueOf(station, ['amenities'], 'Air,Water')).split(',').map((a) => a.trim()).filter(Boolean),
  savings: numberFrom(valueOf(station, ['savings'], 0), 0),
  waitTime: valueOf(station, ['waitTime', 'wait_time'], 'N/A'),
});

const getBrandColor = (brand) => {
  switch (String(brand).toUpperCase()) {
    case 'HP': return '#00a650';
    case 'IOC': return '#e63312';
    case 'SHELL': return '#fbce07';
    case 'BPCL': return '#0066b3';
    default: return '#64748b';
  }
};

const FuelStations = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [stations, setStations] = useState([]);
  const [sortBy, setSortBy] = useState('distance');
  const [fuelType, setFuelType] = useState('petrol');
  const [navigatingTo, setNavigatingTo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadStations = async () => {
      setLoading(true);
      setError('');

      try {
        const data = await apiRequest('/fuel');
        setStations((Array.isArray(data) ? data : []).map(normalizeStation));
      } catch (err) {
        setError(err.message || 'Unable to load fuel stations.');
        toast(err.message || 'Unable to load fuel stations.', 'error');
      } finally {
        setLoading(false);
      }
    };

    loadStations();
  }, [toast]);

  const sortedStations = useMemo(() => [...stations].sort((a, b) => {
    if (sortBy === 'distance') return numberFrom(a.distance) - numberFrom(b.distance);
    if (sortBy === 'price') return a[fuelType] - b[fuelType];
    if (sortBy === 'rating') return b.rating - a.rating;
    return 0;
  }), [stations, sortBy, fuelType]);

  const cheapest = sortedStations.filter((station) => station[fuelType] > 0).sort((a, b) => a[fuelType] - b[fuelType])[0];
  const nearest = [...stations].sort((a, b) => numberFrom(a.distance) - numberFrom(b.distance))[0];
  const avgPrice = stations.length ? stations.reduce((sum, station) => sum + Number(station[fuelType] || 0), 0) / stations.length : 0;

  const handleNavigate = (station) => {
    setNavigatingTo(station.id);
    toast(`Starting navigation to ${station.name}...`, 'info');
    setTimeout(() => {
      setNavigatingTo(null);
      toast(`Estimated arrival at ${station.name}: ${station.waitTime}`, 'success');
    }, 1200);
  };

  if (loading) {
    return <div className="fuel-page"><div className="glass-card">Loading fuel stations...</div></div>;
  }

  if (error) {
    return <div className="fuel-page"><div className="glass-card">{error}</div></div>;
  }

  return (
    <div className="fuel-page">
      <div className="fuel-header">
        <div className="fuel-header-left">
          <button className="back-btn" onClick={() => navigate('/dashboard')}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="page-heading">Fuel Stations</h1>
            <p className="page-subheading">Find nearest & cheapest fuel near you</p>
          </div>
        </div>
      </div>

      <div className="fuel-summary">
        <div className="fuel-summary-card glass-card best-price">
          <div className="summary-icon green"><TrendingDown size={22} /></div>
          <div className="summary-info">
            <span className="summary-label">Cheapest Nearby</span>
            <span className="summary-value">Rs.{(cheapest?.[fuelType] || 0).toFixed(2)}</span>
            <span className="summary-sub">{cheapest?.name || 'No station available'}</span>
          </div>
        </div>
        <div className="fuel-summary-card glass-card nearest">
          <div className="summary-icon blue"><Navigation size={22} /></div>
          <div className="summary-info">
            <span className="summary-label">Nearest Station</span>
            <span className="summary-value">{nearest?.distance || 'N/A'}</span>
            <span className="summary-sub">{nearest?.name || 'No station available'}</span>
          </div>
        </div>
        <div className="fuel-summary-card glass-card avg-price">
          <div className="summary-icon amber"><Droplets size={22} /></div>
          <div className="summary-info">
            <span className="summary-label">Avg. {fuelType === 'petrol' ? 'Petrol' : 'Diesel'} Price</span>
            <span className="summary-value">Rs.{avgPrice.toFixed(2)}</span>
            <span className="summary-sub">Backend station average</span>
          </div>
        </div>
        <div className="fuel-summary-card glass-card monthly">
          <div className="summary-icon purple"><IndianRupee size={22} /></div>
          <div className="summary-info">
            <span className="summary-label">Stations Found</span>
            <span className="summary-value">{stations.length}</span>
            <span className="summary-sub">Live fuel network</span>
          </div>
        </div>
      </div>

      <div className="fuel-filters glass-card">
        <div className="filter-group">
          <Filter size={16} />
          <span className="filter-label">Sort by</span>
          <div className="filter-pills">
            {['distance', 'price', 'rating'].map((opt) => (
              <button key={opt} className={`filter-pill ${sortBy === opt ? 'active' : ''}`} onClick={() => setSortBy(opt)}>
                {opt.charAt(0).toUpperCase() + opt.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className="filter-group">
          <Droplets size={16} />
          <span className="filter-label">Fuel</span>
          <div className="filter-pills">
            <button className={`filter-pill ${fuelType === 'petrol' ? 'active' : ''}`} onClick={() => setFuelType('petrol')}>Petrol</button>
            <button className={`filter-pill ${fuelType === 'diesel' ? 'active' : ''}`} onClick={() => setFuelType('diesel')}>Diesel</button>
          </div>
        </div>
      </div>

      <div className="stations-list">
        {sortedStations.length === 0 && <div className="glass-card">No fuel stations available.</div>}
        {sortedStations.map((station, i) => (
          <div key={station.id} className={`station-card glass-card ${!station.open ? 'closed' : ''}`} style={{ animationDelay: `${i * 0.07}s` }}>
            {station.savings > 0 && station.open && (
              <div className="savings-ribbon">
                <TrendingDown size={12} /> Save Rs.{station.savings.toFixed(2)}/L
              </div>
            )}

            <div className="station-top">
              <div className="station-brand-info">
                <div className="brand-badge" style={{ background: `${getBrandColor(station.brand)}15`, color: getBrandColor(station.brand) }}>
                  <Fuel size={18} />
                </div>
                <div className="station-details">
                  <h4 className="station-name">{station.name}</h4>
                  <p className="station-address"><MapPin size={13} /> {station.address}</p>
                </div>
              </div>
              <div className="station-status">
                <span className={`open-badge ${station.open ? 'open' : 'closed'}`}>{station.open ? 'Open Now' : 'Closed'}</span>
              </div>
            </div>

            <div className="station-prices">
              <div className={`price-block ${fuelType === 'petrol' ? 'highlighted' : ''}`}>
                <span className="price-type">Petrol</span>
                <span className="price-value">Rs.{station.petrol.toFixed(2)}</span>
              </div>
              <div className="price-divider"></div>
              <div className={`price-block ${fuelType === 'diesel' ? 'highlighted' : ''}`}>
                <span className="price-type">Diesel</span>
                <span className="price-value">Rs.{station.diesel.toFixed(2)}</span>
              </div>
            </div>

            <div className="station-bottom">
              <div className="station-metas">
                <span className="station-meta-item"><Route size={14} /> {station.distance}</span>
                <span className="station-meta-item"><Star size={14} className="star-icon" /> {station.rating}<span className="review-count">({station.reviews})</span></span>
                <span className="station-meta-item"><Clock size={14} /> {station.waitTime}</span>
              </div>
              <div className="station-amenities">
                {station.amenities.map((a) => <span key={a} className="amenity-tag">{a}</span>)}
              </div>
            </div>

            {station.open && (
              <button className={`navigate-btn ${navigatingTo === station.id ? 'navigating' : ''}`} onClick={() => handleNavigate(station)} disabled={navigatingTo === station.id}>
                <Navigation size={15} /> {navigatingTo === station.id ? 'Starting...' : 'Navigate'}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FuelStations;
