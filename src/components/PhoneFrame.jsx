import React, { useState } from 'react';
import { Smartphone, Monitor, Globe, Sun, Moon } from 'lucide-react';

export default function PhoneFrame({ children, onOpenLanding, currentTheme = 'calm-cream', onToggleTheme }) {
  const [isMobileFrame, setIsMobileFrame] = useState(true);

  return (
    <div className="phone-wrapper-container">
      {/* Desktop-only control bar (completely hidden on mobile screens <= 768px) */}
      <aside aria-label="Device View Switcher" className="frame-toggle-bar desktop-only-bar">
        <div className="frame-toggle-left">
          <span className="frame-brand-dot"></span>
          <span className="frame-brand-title">Tiimo Daily Flow</span>
          <span className="frame-brand-badge">Visual Planner</span>
        </div>
        <div className="frame-toggle-controls">
          <button
            type="button"
            className={`frame-btn ${isMobileFrame ? 'active' : ''}`}
            onClick={() => setIsMobileFrame(true)}
            title="View as Mobile App"
          >
            <Smartphone size={14} />
            <span>Mobile (390px)</span>
          </button>
          <button
            type="button"
            className={`frame-btn ${!isMobileFrame ? 'active' : ''}`}
            onClick={() => setIsMobileFrame(false)}
            title="View as Expanded Screen"
          >
            <Monitor size={14} />
            <span>Expanded (640px)</span>
          </button>

          {onToggleTheme && (
            <button
              type="button"
              className="frame-btn theme-btn"
              onClick={onToggleTheme}
              title={`Switch to ${currentTheme === 'deep-charcoal' ? 'Light' : 'Dark'} mode`}
            >
              {currentTheme === 'deep-charcoal' ? <Sun size={14} /> : <Moon size={14} />}
              <span>{currentTheme === 'deep-charcoal' ? 'Light' : 'Dark'}</span>
            </button>
          )}

          {onOpenLanding && (
            <button
              type="button"
              className="frame-btn landing-link"
              onClick={onOpenLanding}
              title="Visit Landing Page"
            >
              <Globe size={14} />
              <span>Landing Page</span>
            </button>
          )}
        </div>
      </aside>

      {/* Main Container - Edge-to-edge on mobile devices */}
      <div className={`frame-content-outer ${isMobileFrame ? 'as-mobile' : 'as-desktop'}`}>
        <div className="app-device-canvas">
          {children}
        </div>
      </div>
    </div>
  );
}
