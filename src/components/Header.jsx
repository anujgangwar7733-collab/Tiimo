import React from 'react';
import { Flame, Volume2, VolumeX, Globe, Plus, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { playClickSound } from '../utils/audioEngine';

export default function Header({
  streak = 5,
  isSoundPlaying = false,
  onToggleSound,
  onOpenAddModal,
  selectedDayOffset = 0,
  onSelectDayOffset,
  onOpenLanding,
  onOpenProfile,
  currentTheme = 'calm-cream',
  onToggleTheme,
  onOpenInsights
}) {
  const { user } = useAuth();

  const firstName = user?.name ? user.name.split(' ')[0] : 'Friend';

  // Current greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Generate 9 days horizontal strip (-2 days to +6 days)
  const days = [-2, -1, 0, 1, 2, 3, 4, 5, 6].map(offset => {
    const date = new Date();
    date.setDate(date.getDate() + offset);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
    const dayNum = String(date.getDate()).padStart(2, '0');
    const isToday = offset === 0;
    return {
      offset,
      dayName,
      dayNum,
      isToday,
      fullDate: date
    };
  });

  return (
    <header className="tiimo-header-container">
      {/* Top Greeting & Action Bar */}
      <div className="tiimo-header-top">
        <div className="tiimo-user-profile-row" onClick={onOpenProfile} role="button" tabIndex={0}>
          <div className="tiimo-avatar-ring">
            <img 
              src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'} 
              alt={user?.name || 'Profile'} 
              className="tiimo-avatar-img"
            />
          </div>
          <div className="tiimo-greeting-group">
            <h2 className="tiimo-greeting-title">
              {getGreeting()}, <span className="user-name-highlight">{firstName}</span>
            </h2>
            <span className="tiimo-today-sub">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </span>
          </div>
        </div>

        <div className="tiimo-header-actions">
          {/* Streak Badge */}
          <div 
            className="tiimo-streak-pill" 
            title={`${streak} days routine streak! Tap to view habit heatmap & insights`}
            onClick={() => {
              playClickSound();
              if (onOpenInsights) onOpenInsights();
            }}
            role="button"
            tabIndex={0}
          >
            <Flame size={14} className="streak-flame-icon" />
            <span className="streak-number">{streak}</span>
          </div>

          {/* Calming Sound Toggle */}
          <button 
            type="button" 
            className={`tiimo-icon-action-btn ${isSoundPlaying ? 'active' : ''}`}
            onClick={onToggleSound}
            title={isSoundPlaying ? "Mute ambient audio" : "Play calming pink noise"}
            aria-label="Toggle sensory sound"
          >
            {isSoundPlaying ? (
              <Volume2 size={16} className="sound-pulse-icon" />
            ) : (
              <VolumeX size={16} />
            )}
          </button>

          {/* Light / Dark Mode Quick Toggle */}
          {onToggleTheme && (
            <button
              type="button"
              className={`tiimo-icon-action-btn theme-toggle-btn ${currentTheme === 'deep-charcoal' ? 'dark' : 'light'}`}
              onClick={() => {
                playClickSound();
                onToggleTheme();
              }}
              title={
                currentTheme === 'deep-charcoal'
                  ? 'Switch to Calm Cream (Light Mode)'
                  : 'Switch to Deep Charcoal (Dark Mode)'
              }
              aria-label="Toggle Light and Dark Mode"
            >
              {currentTheme === 'deep-charcoal' ? (
                <Sun size={16} className="theme-toggle-sun" />
              ) : (
                <Moon size={16} className="theme-toggle-moon" />
              )}
            </button>
          )}

          {/* Website / Landing Page Shortcut */}
          {onOpenLanding && (
            <button
              type="button"
              className="tiimo-icon-action-btn"
              onClick={onOpenLanding}
              title="Visit Tiimo Landing Page & Features"
              aria-label="Visit Website"
            >
              <Globe size={16} />
            </button>
          )}

          {/* Quick Add Button */}
          {onOpenAddModal && (
            <button
              type="button"
              className="tiimo-header-add-pill"
              onClick={onOpenAddModal}
              title="Add Activity or Routine"
              aria-label="Add activity"
            >
              <Plus size={16} strokeWidth={2.6} />
              <span>Add</span>
            </button>
          )}
        </div>
      </div>

      {/* Horizontal Scrollable Date Strip (Tiimo Signature Feature) */}
      <div className="tiimo-date-strip-wrapper">
        <div className="tiimo-date-strip">
          {days.map((d) => {
            const isSelected = selectedDayOffset === d.offset;
            return (
              <button
                key={d.offset}
                type="button"
                className={`tiimo-date-pill ${isSelected ? 'selected' : ''} ${d.isToday ? 'is-today' : ''}`}
                onClick={() => onSelectDayOffset && onSelectDayOffset(d.offset)}
              >
                <span className="date-pill-weekday">{d.dayName}</span>
                <span className="date-pill-daynum">{d.dayNum}</span>
                {d.isToday && !isSelected && <span className="today-dot" />}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
