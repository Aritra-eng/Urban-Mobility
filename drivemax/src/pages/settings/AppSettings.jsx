import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Globe, Palette, Ruler, MapPin, Clock, Volume2, Eye, Type, Monitor, Smartphone } from 'lucide-react';
import { useToast } from '../../components/Toast';
import './SettingsShared.css';

const AppSettings = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [settings, setSettings] = useState({
    language: 'English',
    theme: 'light',
    distanceUnit: 'km',
    currencyFormat: 'INR (₹)',
    mapStyle: 'default',
    autoAccept: false,
    soundEffects: true,
    hapticFeedback: true,
    fontSize: 'medium',
    compactMode: false,
    showTips: true,
    autoBrightness: true,
  });

  const toggle = (key) => {
    const newVal = !settings[key];
    setSettings((s) => ({ ...s, [key]: newVal }));
    const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase());
    toast(`${label} ${newVal ? 'enabled' : 'disabled'}`, newVal ? 'success' : 'info');
  };

  const updateSetting = (key, value, label) => {
    setSettings((s) => ({ ...s, [key]: value }));
    toast(`${label} changed to ${value}`, 'success');
  };

  return (
    <div className="settings-page">
      <div className="settings-page-header">
        <button className="back-btn" onClick={() => navigate('/profile')}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="page-heading">App Settings</h1>
          <p className="page-subheading">Customize your language, theme, and display preferences</p>
        </div>
      </div>

      {/* ── Language & Region ────────────────────────── */}
      <div className="sp-section">
        <div className="sp-section-header">
          <div>
            <h3 className="sp-section-title"><Globe size={18} /> Language & Region</h3>
          </div>
        </div>
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="sp-row">
            <div className="sp-row-left">
              <div className="sp-row-icon blue"><Globe size={18} /></div>
              <div className="sp-row-info">
                <span className="sp-row-name">Language</span>
                <span className="sp-row-desc">App display language</span>
              </div>
            </div>
            <div className="sp-row-right">
              <select
                className="sp-select"
                value={settings.language}
                onChange={(e) => updateSetting('language', e.target.value, 'Language')}
              >
                <option>English</option>
                <option>Hindi (हिन्दी)</option>
                <option>Kannada (ಕನ್ನಡ)</option>
                <option>Tamil (தமிழ்)</option>
                <option>Telugu (తెలుగు)</option>
                <option>Marathi (मराठी)</option>
              </select>
            </div>
          </div>

          <div className="sp-row">
            <div className="sp-row-left">
              <div className="sp-row-icon green"><MapPin size={18} /></div>
              <div className="sp-row-info">
                <span className="sp-row-name">Currency Format</span>
                <span className="sp-row-desc">How amounts are displayed</span>
              </div>
            </div>
            <div className="sp-row-right">
              <select
                className="sp-select"
                value={settings.currencyFormat}
                onChange={(e) => updateSetting('currencyFormat', e.target.value, 'Currency')}
              >
                <option>INR (₹)</option>
                <option>USD ($)</option>
                <option>EUR (€)</option>
              </select>
            </div>
          </div>

          <div className="sp-row">
            <div className="sp-row-left">
              <div className="sp-row-icon amber"><Clock size={18} /></div>
              <div className="sp-row-info">
                <span className="sp-row-name">Time Format</span>
                <span className="sp-row-desc">12-hour or 24-hour clock</span>
              </div>
            </div>
            <div className="sp-row-right">
              <select
                className="sp-select"
                defaultValue="12h"
                onChange={(e) => toast(`Time format changed to ${e.target.value === '12h' ? '12-hour' : '24-hour'}`, 'success')}
              >
                <option value="12h">12-hour</option>
                <option value="24h">24-hour</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* ── Appearance ───────────────────────────────── */}
      <div className="sp-section">
        <div className="sp-section-header">
          <div>
            <h3 className="sp-section-title"><Palette size={18} /> Appearance</h3>
          </div>
        </div>
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="sp-row">
            <div className="sp-row-left">
              <div className="sp-row-icon purple"><Monitor size={18} /></div>
              <div className="sp-row-info">
                <span className="sp-row-name">Theme</span>
                <span className="sp-row-desc">Choose light, dark, or auto</span>
              </div>
            </div>
            <div className="sp-row-right">
              <select
                className="sp-select"
                value={settings.theme}
                onChange={(e) => updateSetting('theme', e.target.value, 'Theme')}
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="auto">Auto (System)</option>
              </select>
            </div>
          </div>

          <div className="sp-row">
            <div className="sp-row-left">
              <div className="sp-row-icon blue"><Type size={18} /></div>
              <div className="sp-row-info">
                <span className="sp-row-name">Font Size</span>
                <span className="sp-row-desc">Adjust text readability</span>
              </div>
            </div>
            <div className="sp-row-right">
              <select
                className="sp-select"
                value={settings.fontSize}
                onChange={(e) => updateSetting('fontSize', e.target.value, 'Font size')}
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>
          </div>

          <div className="sp-row">
            <div className="sp-row-left">
              <div className="sp-row-icon cyan"><Smartphone size={18} /></div>
              <div className="sp-row-info">
                <span className="sp-row-name">Compact Mode</span>
                <span className="sp-row-desc">Reduce spacing for more content</span>
              </div>
            </div>
            <div className="sp-row-right">
              <label className="toggle-switch">
                <input type="checkbox" checked={settings.compactMode} onChange={() => toggle('compactMode')} />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>

          <div className="sp-row">
            <div className="sp-row-left">
              <div className="sp-row-icon amber"><Eye size={18} /></div>
              <div className="sp-row-info">
                <span className="sp-row-name">Auto Brightness</span>
                <span className="sp-row-desc">Adjust screen based on ambient light</span>
              </div>
            </div>
            <div className="sp-row-right">
              <label className="toggle-switch">
                <input type="checkbox" checked={settings.autoBrightness} onChange={() => toggle('autoBrightness')} />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* ── Units & Map ──────────────────────────────── */}
      <div className="sp-section">
        <div className="sp-section-header">
          <div>
            <h3 className="sp-section-title"><Ruler size={18} /> Units & Navigation</h3>
          </div>
        </div>
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="sp-row">
            <div className="sp-row-left">
              <div className="sp-row-icon green"><Ruler size={18} /></div>
              <div className="sp-row-info">
                <span className="sp-row-name">Distance Unit</span>
                <span className="sp-row-desc">Kilometers or miles</span>
              </div>
            </div>
            <div className="sp-row-right">
              <select
                className="sp-select"
                value={settings.distanceUnit}
                onChange={(e) => updateSetting('distanceUnit', e.target.value === 'km' ? 'Kilometers' : 'Miles', 'Distance unit')}
              >
                <option value="km">Kilometers (km)</option>
                <option value="mi">Miles (mi)</option>
              </select>
            </div>
          </div>

          <div className="sp-row">
            <div className="sp-row-left">
              <div className="sp-row-icon blue"><MapPin size={18} /></div>
              <div className="sp-row-info">
                <span className="sp-row-name">Map Style</span>
                <span className="sp-row-desc">Navigation map appearance</span>
              </div>
            </div>
            <div className="sp-row-right">
              <select
                className="sp-select"
                value={settings.mapStyle}
                onChange={(e) => updateSetting('mapStyle', e.target.value, 'Map style')}
              >
                <option value="default">Default</option>
                <option value="satellite">Satellite</option>
                <option value="terrain">Terrain</option>
                <option value="dark">Dark Mode</option>
              </select>
            </div>
          </div>

          <div className="sp-row">
            <div className="sp-row-left">
              <div className="sp-row-icon purple"><Volume2 size={18} /></div>
              <div className="sp-row-info">
                <span className="sp-row-name">Sound Effects</span>
                <span className="sp-row-desc">New ride alerts and notifications</span>
              </div>
            </div>
            <div className="sp-row-right">
              <label className="toggle-switch">
                <input type="checkbox" checked={settings.soundEffects} onChange={() => toggle('soundEffects')} />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>

          <div className="sp-row">
            <div className="sp-row-left">
              <div className="sp-row-icon neutral"><Smartphone size={18} /></div>
              <div className="sp-row-info">
                <span className="sp-row-name">Haptic Feedback</span>
                <span className="sp-row-desc">Vibration on interactions</span>
              </div>
            </div>
            <div className="sp-row-right">
              <label className="toggle-switch">
                <input type="checkbox" checked={settings.hapticFeedback} onChange={() => toggle('hapticFeedback')} />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>

          <div className="sp-row">
            <div className="sp-row-left">
              <div className="sp-row-icon green"><Eye size={18} /></div>
              <div className="sp-row-info">
                <span className="sp-row-name">Show Tips & Hints</span>
                <span className="sp-row-desc">Display helpful driving tips</span>
              </div>
            </div>
            <div className="sp-row-right">
              <label className="toggle-switch">
                <input type="checkbox" checked={settings.showTips} onChange={() => toggle('showTips')} />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppSettings;
