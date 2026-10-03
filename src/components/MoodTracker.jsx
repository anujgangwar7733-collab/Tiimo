import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Compass, Meh, Moon, AlertTriangle, Check, Sparkles } from 'lucide-react';
import { useGamification } from '../context/GamificationContext';

export const MOOD_OPTIONS = [
  {
    id: 'energized',
    label: 'Energized',
    icon: Zap,
    emoji: '⚡',
    color: '#FFD166',
    bg: '#FFF3CD',
    border: 'rgba(255, 209, 102, 0.45)',
    darkBg: 'rgba(255, 209, 102, 0.18)',
    text: '#785100',
    darkText: '#FFF3CD'
  },
  {
    id: 'focused',
    label: 'Focused / Calm',
    icon: Compass,
    emoji: '🧘',
    color: '#52B788',
    bg: '#D8F3DC',
    border: 'rgba(82, 183, 136, 0.45)',
    darkBg: 'rgba(82, 183, 136, 0.18)',
    text: '#1B4332',
    darkText: '#D8F3DC'
  },
  {
    id: 'neutral',
    label: 'Neutral',
    icon: Meh,
    emoji: '😐',
    color: '#38BDF8',
    bg: '#E0F2FE',
    border: 'rgba(56, 189, 248, 0.45)',
    darkBg: 'rgba(56, 189, 248, 0.18)',
    text: '#0369A1',
    darkText: '#E0F2FE'
  },
  {
    id: 'tired',
    label: 'Tired / Low',
    icon: Moon,
    emoji: '🥱',
    color: '#9B86ED',
    bg: '#E8E5F8',
    border: 'rgba(155, 134, 237, 0.45)',
    darkBg: 'rgba(155, 134, 237, 0.18)',
    text: '#3B2C6F',
    darkText: '#E8E5F8'
  },
  {
    id: 'overwhelmed',
    label: 'Overwhelmed',
    icon: AlertTriangle,
    emoji: '🤯',
    color: '#F4845F',
    bg: '#FFE5D9',
    border: 'rgba(244, 132, 95, 0.45)',
    darkBg: 'rgba(244, 132, 95, 0.18)',
    text: '#7C2D12',
    darkText: '#FFE5D9'
  }
];

export default function MoodTracker({ isCompact = false, isDarkMode = false }) {
  const { todayMood, recordMood } = useGamification();

  return (
    <div className={`tiimo-mood-tracker-card ${isCompact ? 'compact' : ''}`}>
      <div className="mood-tracker-header">
        <div className="mood-tracker-title-wrap">
          <span className="mood-header-icon">✦</span>
          <div>
            <h4 className="mood-card-title">Daily Mindful Check-In</h4>
            <span className="mood-card-sub">
              {todayMood 
                ? `Logged: ${todayMood.charAt(0).toUpperCase() + todayMood.slice(1)} today` 
                : 'How is your energy & focus right now?'}
            </span>
          </div>
        </div>

        {todayMood && (
          <span className="mood-logged-badge">
            <Check size={12} strokeWidth={3} />
            <span>Checked In</span>
          </span>
        )}
      </div>

      {/* 5 Pastel 1-Tap Mood Options */}
      <div className="mood-pills-row">
        {MOOD_OPTIONS.map((opt) => {
          const isSelected = todayMood === opt.id;
          const bg = isDarkMode ? opt.darkBg : opt.bg;
          const textColor = isDarkMode ? opt.darkText : opt.text;

          return (
            <motion.button
              key={opt.id}
              type="button"
              className={`mood-option-pill ${isSelected ? 'selected' : ''}`}
              style={{
                backgroundColor: isSelected ? opt.color : bg,
                borderColor: opt.border,
                color: isSelected ? '#ffffff' : textColor
              }}
              whileTap={{ scale: 0.92 }}
              whileHover={{ scale: 1.05, y: -2 }}
              onClick={() => recordMood(opt.id, opt.id === 'energized' ? 5 : opt.id === 'tired' ? 2 : 4)}
              title={`Feel ${opt.label}`}
              aria-label={`Log mood as ${opt.label}`}
            >
              <span className="mood-emoji">{opt.emoji}</span>
              <span className="mood-label">{opt.label}</span>
              {isSelected && (
                <motion.span 
                  className="mood-check-dot"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                >
                  ✓
                </motion.span>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
