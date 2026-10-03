import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Sparkles, Trophy, ChevronRight, TrendingUp, Zap, Compass, Moon, Award, ArrowLeft } from 'lucide-react';
import { useGamification } from '../context/GamificationContext';
import HabitHeatmap from './HabitHeatmap';
import TrophiesView from './TrophiesView';

export default function InsightsView({ onClose, isDarkMode = false }) {
  const { streak, heatmapData, trophies, triggerConfettiCelebration } = useGamification();
  const [subView, setSubView] = useState('insights'); // 'insights' | 'trophies'

  const currentStreak = streak?.currentStreak || 5;
  const longestStreak = streak?.longestStreak || 5;

  if (subView === 'trophies') {
    return <TrophiesView onBack={() => setSubView('insights')} isDarkMode={isDarkMode} />;
  }

  // Calculate mood counts from past week
  const moodCounts = {
    energized: heatmapData.filter(d => d.mood === 'energized').length,
    focused: heatmapData.filter(d => d.mood === 'focused').length,
    neutral: heatmapData.filter(d => d.mood === 'neutral').length,
    tired: heatmapData.filter(d => d.mood === 'tired').length,
    overwhelmed: heatmapData.filter(d => d.mood === 'overwhelmed').length
  };

  const unlockedTrophiesCount = trophies.filter(t => t.isUnlocked).length;

  return (
    <div className="tiimo-insights-container animate-fade-in">
      {/* Top Header if in modal or standalone */}
      {onClose && (
        <div className="insights-header-bar">
          <button type="button" className="insights-back-btn" onClick={onClose}>
            <ArrowLeft size={18} />
            <span>Back</span>
          </button>
          <span className="insights-bar-title">Insights & Flow</span>
          <div style={{ width: 40 }} />
        </div>
      )}

      {/* 1. Visual Streak Hero Card */}
      <div className="insights-streak-card">
        <div className="streak-left-cluster">
          <motion.div 
            className="streak-flame-disc"
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => triggerConfettiCelebration(`🔥 ${currentStreak}-Day Flow Streak!`)}
          >
            <Flame size={32} className="streak-flame-icon-glow" />
          </motion.div>
          <div>
            <span className="streak-tag">ACTIVE CONSISTENCY</span>
            <h3 className="streak-big-readout">{currentStreak}-Day Flow</h3>
            <p className="streak-sub-text">
              {currentStreak >= 7 
                ? 'Unstoppable flow! You are building deep neuro-friendly habits.' 
                : 'Keep checking in each day to strengthen your daily rhythm.'}
            </p>
          </div>
        </div>

        <div className="streak-meta-pills">
          <div className="streak-meta-pill">
            <span className="pill-num">{longestStreak} Days</span>
            <span className="pill-desc">Longest Run</span>
          </div>
          <div className="streak-meta-pill">
            <span className="pill-num">{streak?.totalDaysCompleted || 5} Days</span>
            <span className="pill-desc">Total Active</span>
          </div>
        </div>
      </div>

      {/* 2. Interactive Habit Heatmap */}
      <HabitHeatmap isDarkMode={isDarkMode} />

      {/* 3. Weekly Mood Trend Summary */}
      <div className="insights-section-card">
        <div className="section-title-row">
          <TrendingUp size={18} className="section-icon" />
          <h4 className="section-heading">Mood & Energy Rhythm</h4>
        </div>
        <p className="section-desc">
          How your mind and body felt over the past 30 days:
        </p>

        <div className="mood-bars-stack">
          <div className="mood-bar-item">
            <div className="mood-bar-info">
              <span className="mood-bar-label">⚡ Energized</span>
              <span className="mood-bar-count">{moodCounts.energized} days</span>
            </div>
            <div className="mood-bar-track">
              <div 
                className="mood-bar-fill energized-fill" 
                style={{ width: `${Math.min(100, moodCounts.energized * 12)}%` }} 
              />
            </div>
          </div>

          <div className="mood-bar-item">
            <div className="mood-bar-info">
              <span className="mood-bar-label">🧘 Focused & Calm</span>
              <span className="mood-bar-count">{moodCounts.focused} days</span>
            </div>
            <div className="mood-bar-track">
              <div 
                className="mood-bar-fill focused-fill" 
                style={{ width: `${Math.min(100, moodCounts.focused * 12)}%` }} 
              />
            </div>
          </div>

          <div className="mood-bar-item">
            <div className="mood-bar-info">
              <span className="mood-bar-label">🥱 Tired / Low</span>
              <span className="mood-bar-count">{moodCounts.tired} days</span>
            </div>
            <div className="mood-bar-track">
              <div 
                className="mood-bar-fill tired-fill" 
                style={{ width: `${Math.min(100, moodCounts.tired * 12)}%` }} 
              />
            </div>
          </div>
        </div>
      </div>

      {/* 4. Achievements & Badges Shortcut */}
      <div 
        className="insights-section-card trophies-teaser-card"
        onClick={() => setSubView('trophies')}
        role="button"
        tabIndex={0}
      >
        <div className="trophies-teaser-left">
          <div className="trophies-teaser-icon-disc">
            <Trophy size={20} />
          </div>
          <div>
            <h5 className="teaser-title">Achievements & Trophies</h5>
            <span className="teaser-sub">
              {unlockedTrophiesCount} of {trophies.length} unlocked • Tap to explore
            </span>
          </div>
        </div>
        <ChevronRight size={18} className="teaser-arrow" />
      </div>
    </div>
  );
}
