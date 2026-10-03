import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Award, Flame, Sunrise, Sparkles, CheckCheck, 
  Heart, Palette, Volume2, ShieldCheck, RefreshCw, 
  Check, Globe, LogOut, User, Mail, Shield
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { TIIMO_THEMES } from '../utils/tiimoTokens';
import { playClickSound, playCompletionChime } from '../utils/audioEngine';

export default function ProfileView({
  trophies = [],
  streak = 5,
  currentTheme = 'calm-cream',
  onChangeTheme,
  onResetData,
  onOpenLanding
}) {
  const { user, logout } = useAuth();
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [resetConfirm, setResetConfirm] = useState(false);
  const [logoutConfirm, setLogoutConfirm] = useState(false);

  const daysOfWeek = [
    { day: 'M', completed: true },
    { day: 'T', completed: true },
    { day: 'W', completed: true },
    { day: 'T', completed: true },
    { day: 'F', completed: true },
    { day: 'S', completed: true },
    { day: 'S', completed: false }
  ];

  const handleLogout = () => {
    playClickSound();
    logout();
  };

  return (
    <div className="tiimo-profile-container">
      {/* 1. User Account Card */}
      <div className="profile-hero-card">
        <div className="profile-hero-top">
          <div className="profile-avatar-wrapper">
            <img 
              src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'} 
              alt={user?.name}
              className="profile-avatar-large"
            />
          </div>
          <div className="profile-user-info">
            <h3 className="profile-name">{user?.name || 'Alex Rivera'}</h3>
            <span className="profile-email">{user?.email || 'alex@tiimoapp.com'}</span>
            <span className="profile-badge">
              <Shield size={11} />
              <span>Tiimo Pro Member</span>
            </span>
          </div>
        </div>

        {/* Streak & Consistency Heatmap */}
        <div className="profile-streak-box">
          <div className="streak-stat-header">
            <div className="streak-flame-circle">
              <Flame size={20} className="flame-wiggle" />
            </div>
            <div>
              <span className="streak-label">ACTIVE STREAK</span>
              <h4 className="streak-days">{streak} Days in Flow</h4>
            </div>
          </div>

          <div className="week-dots-row">
            {daysOfWeek.map((d, i) => (
              <div key={i} className="week-col">
                <span className="week-day-title">{d.day}</span>
                <div className={`week-dot ${d.completed ? 'completed' : ''}`}>
                  {d.completed && <Check size={12} strokeWidth={3} />}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Achievements & Badges */}
      <div className="profile-section-card">
        <div className="section-title-row">
          <Award size={18} className="section-icon" />
          <h4>Achievements & Badges</h4>
        </div>

        <div className="trophies-mini-grid">
          {trophies.map(trophy => (
            <div 
              key={trophy.id} 
              className={`trophy-pill ${trophy.unlocked ? 'unlocked' : 'locked'}`}
            >
              <div className="trophy-pill-icon">
                <Sparkles size={16} />
              </div>
              <div className="trophy-pill-text">
                <span className="t-title">{trophy.title}</span>
                <span className="t-status">{trophy.unlocked ? '✓ Unlocked' : 'In progress'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Theme & Appearance */}
      <div className="profile-section-card">
        <div className="section-title-row">
          <Palette size={18} className="section-icon" />
          <h4>Theme & Atmosphere</h4>
        </div>

        <div className="themes-selector-row">
          {TIIMO_THEMES.map(theme => {
            const isSelected = currentTheme === theme.id;
            return (
              <button
                key={theme.id}
                type="button"
                className={`theme-pill-btn ${isSelected ? 'active' : ''}`}
                onClick={() => {
                  playClickSound();
                  onChangeTheme(theme.id);
                }}
              >
                <span className="theme-color-dot" style={{ backgroundColor: theme.bg, border: '1px solid #ccc' }} />
                <span>{theme.name}</span>
                {isSelected && <span className="theme-check">✓</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Sensory Comfort & Audio */}
      <div className="profile-section-card">
        <div className="section-title-row">
          <ShieldCheck size={18} className="section-icon" />
          <h4>Sensory Comfort & Audio</h4>
        </div>

        <div className="preference-item">
          <div>
            <span className="pref-heading">Tactile Sound Chimes</span>
            <span className="pref-sub">Gentle auditory cues on completing tasks & focus</span>
          </div>
          <button
            type="button"
            className={`tiimo-switch ${soundEnabled ? 'on' : ''}`}
            onClick={() => {
              playClickSound();
              setSoundEnabled(!soundEnabled);
            }}
          >
            <span className="switch-thumb" />
          </button>
        </div>
      </div>

      {/* 5. Marketing Website Link */}
      {onOpenLanding && (
        <div className="profile-section-card website-card">
          <div className="section-title-row">
            <Globe size={18} className="section-icon" />
            <h4>Tiimo Website & Features</h4>
          </div>
          <p className="website-card-desc">
            Explore neuroscience research, pricing plans, and full product showcases.
          </p>
          <button
            type="button"
            className="website-open-btn"
            onClick={onOpenLanding}
          >
            <Globe size={15} />
            <span>Visit Website</span>
            <span className="arrow">→</span>
          </button>
        </div>
      )}

      {/* 6. Account Actions (Reset & Log Out) */}
      <div className="profile-section-card danger-zone">
        {/* Reset Demo Data */}
        <div className="action-row">
          {!resetConfirm ? (
            <button
              type="button"
              className="action-btn text-muted"
              onClick={() => setResetConfirm(true)}
            >
              <RefreshCw size={15} />
              <span>Reset Demo Routines</span>
            </button>
          ) : (
            <div className="action-confirm-box">
              <span>Reset all tasks to defaults?</span>
              <div className="confirm-btns">
                <button
                  type="button"
                  className="btn-confirm-yes"
                  onClick={() => {
                    onResetData();
                    setResetConfirm(false);
                    playCompletionChime();
                  }}
                >
                  Yes
                </button>
                <button
                  type="button"
                  className="btn-confirm-cancel"
                  onClick={() => setResetConfirm(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Log Out Button */}
        <div className="action-row logout-row">
          {!logoutConfirm ? (
            <button
              type="button"
              className="action-btn text-danger"
              onClick={() => setLogoutConfirm(true)}
            >
              <LogOut size={16} />
              <span>Log Out of Tiimo</span>
            </button>
          ) : (
            <div className="action-confirm-box logout-confirm">
              <span>Are you sure you want to log out?</span>
              <div className="confirm-btns">
                <button
                  type="button"
                  className="btn-confirm-danger"
                  onClick={handleLogout}
                >
                  Log Out
                </button>
                <button
                  type="button"
                  className="btn-confirm-cancel"
                  onClick={() => setLogoutConfirm(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
