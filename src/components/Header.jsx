import React from 'react';
import { Plus, Volume2, VolumeX, Flame, Calendar as CalendarIcon, Globe } from 'lucide-react';

export default function Header({
  streak = 5,
  isSoundPlaying = false,
  onToggleSound,
  onOpenAddModal,
  activeDate = new Date(),
  onOpenLanding
}) {
  const formattedDate = activeDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  return (
    <header className="app-header">
      <div className="header-top-row">
        <div className="header-brand">
          <div className="header-logo-icon">
            <span className="logo-sparkle">✦</span>
          </div>
          <div className="header-title-group">
            <h1 className="header-app-title">Daily Routine</h1>
            <span className="header-date">
              <CalendarIcon size={12} className="inline-icon" />
              {formattedDate}
            </span>
          </div>
        </div>

        <div className="header-actions">
          {/* Website / Landing Page Shortcut */}
          {onOpenLanding && (
            <button
              type="button"
              className="header-website-btn"
              onClick={onOpenLanding}
              title="Visit Landing Page & Product Overview"
              aria-label="View Landing Page"
            >
              <Globe size={15} />
              <span className="website-btn-text">Website</span>
            </button>
          )}

          {/* Streak Badge */}
          <div className="streak-pill" title={`${streak} days routine streak!`}>
            <Flame size={14} className="flame-icon" />
            <span className="streak-count">{streak}</span>
          </div>

          {/* Sound Toggle */}
          <button 
            type="button" 
            className={`sound-toggle-btn ${isSoundPlaying ? 'playing' : ''}`}
            onClick={onToggleSound}
            title={isSoundPlaying ? "Mute ambient sound" : "Play calming pink noise"}
            aria-label="Toggle ambient noise"
          >
            {isSoundPlaying ? (
              <Volume2 size={16} className="sound-active-icon" />
            ) : (
              <VolumeX size={16} />
            )}
          </button>

          {/* Quick Add Button */}
          <button
            type="button"
            className="header-add-btn"
            onClick={onOpenAddModal}
            title="Add Activity or Routine"
            aria-label="Add activity"
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>Add</span>
          </button>
        </div>
      </div>
    </header>
  );
}
