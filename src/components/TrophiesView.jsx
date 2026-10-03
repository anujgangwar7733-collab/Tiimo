import React, { useState } from 'react';
import { 
  Award, Flame, Sunrise, Sparkles, CheckCheck, 
  Heart, Palette, Bell, Volume2, ShieldCheck, RefreshCw, Check
} from 'lucide-react';
import { APP_THEMES } from '../utils/notionTokens';
import { playClickSound, playCompletionChime } from '../utils/audioEngine';

export default function TrophiesView({
  trophies = [],
  streak = 5,
  currentTheme = 'warm-minimal',
  onChangeTheme,
  onResetData
}) {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [visualMode, setVisualMode] = useState('pastel'); // pastel or bold
  const [resetConfirm, setResetConfirm] = useState(false);

  const trophyIconMap = {
    Sunrise,
    Flame,
    Sparkles,
    Award,
    Heart,
    CheckCheck
  };

  const daysOfWeek = [
    { day: 'M', completed: true },
    { day: 'T', completed: true },
    { day: 'W', completed: true },
    { day: 'T', completed: true },
    { day: 'F', completed: true },
    { day: 'S', completed: true },
    { day: 'S', completed: false }
  ];

  return (
    <div className="trophies-view-container animate-fade-in">
      {/* Streak Hero Card */}
      <div className="streak-hero-card">
        <div className="streak-hero-top">
          <div className="flame-badge-big">
            <Flame size={28} className="flame-animate" />
          </div>
          <div>
            <span className="streak-label">ACTIVE STREAK</span>
            <h2 className="streak-number">{streak} Days</h2>
            <p className="streak-sub">You've followed your routines consistently this week!</p>
          </div>
        </div>

        {/* Weekly Heatmap Row */}
        <div className="streak-week-row">
          {daysOfWeek.map((d, i) => (
            <div key={i} className="week-day-col">
              <span className="week-day-letter">{d.day}</span>
              <div className={`week-day-dot ${d.completed ? 'completed' : ''}`}>
                {d.completed && <Check size={12} strokeWidth={3} />}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trophies & Rewards Grid */}
      <div className="trophies-section">
        <div className="section-title-row">
          <Award size={18} className="inline-icon" />
          <h3 className="section-heading">Achievements & Badges</h3>
        </div>

        <div className="trophies-grid">
          {trophies.map(trophy => {
            const Icon = trophyIconMap[trophy.icon] || Award;
            return (
              <div 
                key={trophy.id} 
                className={`trophy-card ${trophy.unlocked ? 'unlocked' : 'locked'}`}
              >
                <div className="trophy-icon-circle">
                  <Icon size={22} />
                </div>
                <div className="trophy-info">
                  <h4 className="trophy-title">{trophy.title}</h4>
                  <p className="trophy-desc">{trophy.desc}</p>
                  <span className="trophy-status-pill">
                    {trophy.unlocked ? `✓ ${trophy.date}` : trophy.date}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Make it Yours / Notion Design System Themes */}
      <div className="settings-section-card">
        <div className="section-title-row">
          <Palette size={18} className="inline-icon" />
          <h3 className="section-heading">Make it Yours (Theme & Style)</h3>
        </div>
        <p className="settings-desc">Choose from curated Notion-inspired palette themes:</p>

        <div className="themes-grid">
          {APP_THEMES.map(theme => {
            const isSelected = currentTheme === theme.id;
            return (
              <button
                key={theme.id}
                type="button"
                className={`theme-card-btn ${isSelected ? 'selected' : ''}`}
                onClick={() => {
                  playClickSound();
                  onChangeTheme(theme.id);
                }}
              >
                <div className="theme-color-swatches">
                  <span className="color-dot" style={{ backgroundColor: theme.primary }} />
                  <span className="color-dot" style={{ backgroundColor: theme.bg, border: '1px solid #ccc' }} />
                  <span className="color-dot" style={{ backgroundColor: theme.surface }} />
                </div>
                <span className="theme-name">{theme.name}</span>
                {isSelected && <span className="theme-check">✓ Active</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Neurodiversity & Audio Preferences */}
      <div className="settings-section-card">
        <div className="section-title-row">
          <ShieldCheck size={18} className="inline-icon" />
          <h3 className="section-heading">Focus & Sensory Comfort</h3>
        </div>

        <div className="preference-row">
          <div>
            <span className="pref-title">Tactile Audio Chimes</span>
            <span className="pref-desc">Gentle tones on task and timer completions</span>
          </div>
          <button
            type="button"
            className={`toggle-switch ${soundEnabled ? 'on' : ''}`}
            onClick={() => {
              playClickSound();
              setSoundEnabled(!soundEnabled);
            }}
          >
            <span className="toggle-thumb" />
          </button>
        </div>

        <div className="preference-row">
          <div>
            <span className="pref-title">Visual Layout Mode</span>
            <span className="pref-desc">Soft pastel tints or high-contrast focus</span>
          </div>
          <div className="mode-toggle-group">
            <button
              type="button"
              className={`mode-btn ${visualMode === 'pastel' ? 'active' : ''}`}
              onClick={() => setVisualMode('pastel')}
            >
              Pastel Tints
            </button>
            <button
              type="button"
              className={`mode-btn ${visualMode === 'bold' ? 'active' : ''}`}
              onClick={() => setVisualMode('bold')}
            >
              Contrast
            </button>
          </div>
        </div>

        {/* Reset Demo Data */}
        <div className="reset-data-row">
          {!resetConfirm ? (
            <button
              type="button"
              className="reset-demo-btn"
              onClick={() => setResetConfirm(true)}
            >
              <RefreshCw size={14} />
              <span>Reset Demo Routines & Tasks</span>
            </button>
          ) : (
            <div className="reset-confirm-box">
              <span>Restore all default demo items?</span>
              <button
                type="button"
                className="confirm-yes-btn"
                onClick={() => {
                  onResetData();
                  setResetConfirm(false);
                  playCompletionChime();
                }}
              >
                Yes, Reset
              </button>
              <button
                type="button"
                className="confirm-no-btn"
                onClick={() => setResetConfirm(false)}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
