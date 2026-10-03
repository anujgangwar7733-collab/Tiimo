import React, { useState, useEffect } from 'react';
import { Smartphone, Monitor, Battery, Wifi, Clock } from 'lucide-react';

export default function PhoneFrame({ children }) {
  const [isMobileFrame, setIsMobileFrame] = useState(true);
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="phone-wrapper-container">
      {/* Top control bar to switch between Phone Frame and Responsive Desktop view */}
      <aside aria-label="Device View Switcher" className="frame-toggle-bar">
        <div className="frame-toggle-left">
          <span className="frame-brand-dot"></span>
          <span className="frame-brand-title">Daily Routine</span>
          <span className="frame-brand-badge">Notion Style</span>
        </div>
        <div className="frame-toggle-controls">
          <button
            type="button"
            className={`frame-btn ${isMobileFrame ? 'active' : ''}`}
            onClick={() => setIsMobileFrame(true)}
            title="View as Mobile App"
          >
            <Smartphone size={15} />
            <span>Mobile Device</span>
          </button>
          <button
            type="button"
            className={`frame-btn ${!isMobileFrame ? 'active' : ''}`}
            onClick={() => setIsMobileFrame(false)}
            title="View as Full Responsive Screen"
          >
            <Monitor size={15} />
            <span>Expanded View</span>
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className={`frame-content-outer ${isMobileFrame ? 'as-mobile' : 'as-desktop'}`}>
        {isMobileFrame ? (
          <div className="iphone-bezel">
            {/* Dynamic Island / Speaker */}
            <div className="iphone-dynamic-island">
              <span className="island-camera"></span>
              <span className="island-sensor"></span>
            </div>

            {/* Mobile Status Bar */}
            <div className="iphone-status-bar">
              <span className="status-time">{currentTime || '09:41'}</span>
              <div className="status-icons">
                <Wifi size={13} strokeWidth={2.4} />
                <Battery size={15} strokeWidth={2.4} />
              </div>
            </div>

            {/* App Screen inside phone */}
            <div className="iphone-screen">
              {children}
            </div>

            {/* Home indicator bar at bottom */}
            <div className="iphone-home-bar"></div>
          </div>
        ) : (
          <div className="desktop-view-container">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
