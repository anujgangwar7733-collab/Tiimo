import React, { useState, useEffect } from 'react';
import { 
  Heart, Smile, Frown, Meh, Sun, Zap, 
  Wind, Check, Sparkles, BookOpen, Clock 
} from 'lucide-react';
import { playClickSound, playCompletionChime } from '../utils/audioEngine';

export default function WellbeingView({ moodHistory = [], onLogMood }) {
  const [selectedMood, setSelectedMood] = useState('Calm');
  const [energyLevel, setEnergyLevel] = useState(4);
  const [selectedTags, setSelectedTags] = useState(['Focused', 'Grateful']);
  const [reflectionText, setReflectionText] = useState('');
  const [isSavedNotice, setIsSavedNotice] = useState(false);

  // Box Breathing exercise state
  const [isBreathingActive, setIsBreathingActive] = useState(false);
  const [breathPhase, setBreathPhase] = useState('Inhale'); // Inhale, Hold, Exhale, Hold
  const [breathSeconds, setBreathSeconds] = useState(4);

  useEffect(() => {
    let interval = null;
    if (isBreathingActive) {
      interval = setInterval(() => {
        setBreathSeconds(prev => {
          if (prev <= 1) {
            setBreathPhase(curr => {
              if (curr === 'Inhale') return 'Hold (Full)';
              if (curr === 'Hold (Full)') return 'Exhale';
              if (curr === 'Exhale') return 'Hold (Empty)';
              return 'Inhale';
            });
            return 4;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setBreathPhase('Inhale');
      setBreathSeconds(4);
    }
    return () => clearInterval(interval);
  }, [isBreathingActive]);

  const moods = [
    { label: 'Joyful', emoji: '✨', tint: '#fef7d6', text: '#544200' },
    { label: 'Calm', emoji: '🌿', tint: '#d9f3e1', text: '#0e4a24' },
    { label: 'Focused', emoji: '🎯', tint: '#e6e0f5', text: '#352166' },
    { label: 'Tired', emoji: '☕', tint: '#ffe8d4', text: '#612a02' },
    { label: 'Overwhelmed', emoji: '🌧️', tint: '#fde0ec', text: '#631039' }
  ];

  const availableTags = [
    'Grateful', 'Focused', 'Restless', 'Clear', 'Distracted', 
    'Productive', 'Peaceful', 'Stressed', 'Motivated'
  ];

  const toggleTag = (tag) => {
    playClickSound();
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSaveCheckin = () => {
    playClickSound();
    playCompletionChime();
    onLogMood({
      date: 'Today',
      mood: selectedMood,
      energy: energyLevel,
      reflection: reflectionText.trim() || `Felt ${selectedMood.toLowerCase()} with energy level ${energyLevel}/5.`
    });
    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 3000);
  };

  return (
    <div className="wellbeing-view-container animate-fade-in">
      {/* Header */}
      <div className="wellbeing-header-card">
        <div className="wellbeing-icon-badge">
          <Heart size={20} className="heart-icon" />
        </div>
        <div>
          <h2 className="wellbeing-title">Daily Wellbeing & Energy</h2>
          <p className="wellbeing-subtitle">Tune in to how you feel. Align your routines with your natural capacity.</p>
        </div>
      </div>

      {/* Mood Selector */}
      <div className="wellbeing-section-card">
        <h3 className="section-label">How are you feeling right now?</h3>
        <div className="mood-pill-grid">
          {moods.map(m => {
            const isSelected = selectedMood === m.label;
            return (
              <button
                key={m.label}
                type="button"
                className={`mood-select-btn ${isSelected ? 'selected' : ''}`}
                style={{
                  backgroundColor: isSelected ? m.tint : 'var(--color-surface)',
                  color: isSelected ? m.text : 'var(--color-ink)'
                }}
                onClick={() => {
                  playClickSound();
                  setSelectedMood(m.label);
                }}
              >
                <span className="mood-emoji">{m.emoji}</span>
                <span className="mood-name">{m.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Energy Level Slider */}
      <div className="wellbeing-section-card">
        <div className="energy-header-row">
          <span className="section-label">Current Energy Level:</span>
          <span className="energy-value-badge">
            <Zap size={13} fill="currentColor" />
            {energyLevel} / 5
          </span>
        </div>
        <input
          type="range"
          min="1"
          max="5"
          step="1"
          className="energy-range-slider"
          value={energyLevel}
          onChange={(e) => setEnergyLevel(parseInt(e.target.value, 10))}
        />
        <div className="energy-scale-labels">
          <span>1 Depleted</span>
          <span>3 Moderate</span>
          <span>5 Vibrant</span>
        </div>
      </div>

      {/* Feelings Tags */}
      <div className="wellbeing-section-card">
        <h3 className="section-label">Context & Feelings:</h3>
        <div className="tags-flex-wrap">
          {availableTags.map(tag => {
            const isTagActive = selectedTags.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                className={`context-tag-btn ${isTagActive ? 'active' : ''}`}
                onClick={() => toggleTag(tag)}
              >
                {isTagActive && <Check size={12} strokeWidth={3} />}
                <span>{tag}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Reflection Note */}
      <div className="wellbeing-section-card">
        <h3 className="section-label">Mindful Reflection:</h3>
        <textarea
          className="wellbeing-textarea"
          rows={2}
          placeholder="What felt good or demanding today? Note any adjustments for tomorrow..."
          value={reflectionText}
          onChange={(e) => setReflectionText(e.target.value)}
        />
        <button
          type="button"
          className="wellbeing-save-btn"
          onClick={handleSaveCheckin}
        >
          <span>Save Today's Check-in</span>
        </button>
        {isSavedNotice && (
          <span className="save-confirm-msg animate-fade-in">✓ Check-in saved to your daily history</span>
        )}
      </div>

      {/* Interactive Box Breathing Sensory Tool */}
      <div className="box-breathing-card">
        <div className="breathing-top">
          <div className="breathing-icon-wrap">
            <Wind size={18} />
          </div>
          <div>
            <h4 className="breathing-title">1-Minute Sensory Reset</h4>
            <p className="breathing-desc">Regulate executive functioning with box breathing.</p>
          </div>
        </div>

        <div className="breathing-visual-area">
          <div className={`breathing-circle-outer ${isBreathingActive ? 'active ' + breathPhase.toLowerCase().replace(/[^a-z]/g, '') : ''}`}>
            <div className="breathing-circle-inner">
              <span className="breath-phase-text">{breathPhase}</span>
              <span className="breath-count">{breathSeconds}s</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          className="breathing-toggle-btn"
          onClick={() => {
            playClickSound();
            setIsBreathingActive(!isBreathingActive);
          }}
        >
          {isBreathingActive ? 'Pause Exercise' : 'Start Box Breathing'}
        </button>
      </div>

      {/* Mood History Log */}
      <div className="mood-history-card">
        <h3 className="history-heading">Recent Check-ins</h3>
        <div className="history-list">
          {moodHistory.map((item, idx) => (
            <div key={idx} className="history-row">
              <div className="history-row-left">
                <span className="history-date">{item.date}</span>
                <span className="history-mood-badge">{item.mood}</span>
              </div>
              <p className="history-reflection">{item.reflection}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
