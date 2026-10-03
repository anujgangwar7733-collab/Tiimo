import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Play, Pause, Plus, CheckCircle2, X, Volume2, 
  VolumeX, RotateCcw, Sparkles, Check, ChevronDown, ChevronUp
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { TIIMO_TINTS } from '../utils/tiimoTokens';
import { playAmbientSound, stopAmbientSound, playCompletionChime, playClickSound } from '../utils/audioEngine';

export default function FocusTimer({
  activity,
  onClose,
  onCompleteActivity,
  onToggleSubtask
}) {
  const duration = (activity?.durationMinutes || 25) * 60;
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isRunning, setIsRunning] = useState(true);
  const [activeSound, setActiveSound] = useState('pink'); // 'pink' | 'rain' | 'alpha' | 'white' | 'off'
  const [showSubtasks, setShowSubtasks] = useState(false);

  const tint = TIIMO_TINTS[activity?.tintId] || TIIMO_TINTS.lavender;

  // Sound generator toggle
  useEffect(() => {
    if (isRunning && activeSound !== 'off') {
      playAmbientSound(activeSound, 0.25);
    } else {
      stopAmbientSound();
    }
    return () => {
      stopAmbientSound();
    };
  }, [isRunning, activeSound]);

  // Timer Tick
  useEffect(() => {
    let interval = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      handleComplete();
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const handleTogglePlay = () => {
    playClickSound();
    setIsRunning(!isRunning);
  };

  const handleAddFiveMin = () => {
    playClickSound();
    setTimeLeft(prev => prev + 300);
  };

  const handleReset = () => {
    playClickSound();
    setIsRunning(false);
    setTimeLeft(duration);
  };

  const handleComplete = () => {
    stopAmbientSound();
    playCompletionChime();
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#52B788', '#9B86ED', '#FFD166', '#38BDF8', '#F4845F']
    });
    if (onCompleteActivity && activity?.id) {
      onCompleteActivity(activity.id);
    }
  };

  // Format MM:SS
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Circular SVG Math
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const progressRatio = duration > 0 ? (duration - timeLeft) / duration : 0;
  const strokeDashoffset = circumference - (progressRatio * circumference);

  const subtasks = activity?.subtasks || [];
  const completedSubs = subtasks.filter(s => s.completed).length;

  return (
    <motion.div 
      className="tiimo-focus-overlay"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.25 }}
    >
      {/* Top Header */}
      <div className="focus-top-bar">
        <button 
          type="button" 
          className="focus-close-btn"
          onClick={onClose}
          aria-label="Close focus timer"
        >
          <X size={20} />
        </button>
        <span className="focus-mode-label">FOCUS PLAYER</span>
        <button 
          type="button" 
          className="focus-reset-btn"
          onClick={handleReset}
          title="Reset timer"
          aria-label="Reset timer"
        >
          <RotateCcw size={18} />
        </button>
      </div>

      {/* Main Circular Countdown Display */}
      <div className="focus-dial-container">
        <svg className="focus-svg-ring" width="280" height="280" viewBox="0 0 280 280">
          {/* Background Track */}
          <circle
            cx="140"
            cy="140"
            r={radius}
            className="ring-track"
            stroke={tint.border}
            strokeWidth="14"
            fill="transparent"
          />
          {/* Animated Progress Ring */}
          <circle
            cx="140"
            cy="140"
            r={radius}
            className="ring-progress"
            stroke={tint.accent}
            strokeWidth="14"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            transform="rotate(-90 140 140)"
          />
        </svg>

        {/* Center Readout */}
        <div className="focus-center-content">
          <span className="focus-task-tag" style={{ color: tint.badgeText, backgroundColor: tint.iconBg }}>
            {activity?.category || 'Focus'}
          </span>
          <h2 className="focus-time-display">
            {formatTime(timeLeft)}
          </h2>
          <span className="focus-sub-status">
            {isRunning ? 'in flow...' : 'paused'}
          </span>
          <h3 className="focus-active-title" title={activity?.title}>
            {activity?.title || 'Deep Focus Session'}
          </h3>
        </div>
      </div>

      {/* Primary Action Controls */}
      <div className="focus-controls-row">
        {/* +5 Minutes Button */}
        <button
          type="button"
          className="focus-secondary-ctrl"
          onClick={handleAddFiveMin}
          title="Add 5 Minutes"
        >
          <Plus size={16} />
          <span>+5m</span>
        </button>

        {/* Play / Pause Giant Button */}
        <button
          type="button"
          className="focus-play-giant"
          style={{ backgroundColor: tint.accent }}
          onClick={handleTogglePlay}
        >
          {isRunning ? (
            <Pause size={28} fill="#ffffff" color="#ffffff" />
          ) : (
            <Play size={28} fill="#ffffff" color="#ffffff" className="play-offset" />
          )}
        </button>

        {/* Mark Done Button */}
        <button
          type="button"
          className="focus-secondary-ctrl complete"
          onClick={handleComplete}
          title="Complete Task"
        >
          <CheckCircle2 size={18} />
          <span>Done</span>
        </button>
      </div>

      {/* Ambient Sound / Focus Noise Selector Pills */}
      <div className="focus-ambient-section">
        <span className="ambient-title">SENSORY AUDIO</span>
        <div className="ambient-pills-row">
          {[
            { id: 'pink', label: 'Pink Noise' },
            { id: 'rain', label: 'Rain Calm' },
            { id: 'alpha', label: '432Hz Alpha' },
            { id: 'white', label: 'White Noise' },
            { id: 'off', label: 'Muted' }
          ].map((snd) => (
            <button
              key={snd.id}
              type="button"
              className={`ambient-pill-btn ${activeSound === snd.id ? 'active' : ''}`}
              onClick={() => {
                playClickSound();
                setActiveSound(snd.id);
              }}
            >
              <span>{snd.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Focus Checklist Drawer */}
      {subtasks.length > 0 && (
        <div className="focus-checklist-container">
          <button 
            type="button" 
            className="focus-checklist-toggle"
            onClick={() => setShowSubtasks(!showSubtasks)}
          >
            <span>Subtasks ({completedSubs}/{subtasks.length})</span>
            {showSubtasks ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {showSubtasks && (
            <div className="focus-subtasks-drawer">
              {subtasks.map(s => (
                <div 
                  key={s.id} 
                  className={`focus-sub-item ${s.completed ? 'done' : ''}`}
                  onClick={() => {
                    playClickSound();
                    onToggleSubtask(activity.id, s.id);
                  }}
                >
                  <button type="button" className="focus-sub-check">
                    {s.completed && <Check size={12} strokeWidth={3} />}
                  </button>
                  <span>{s.title}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
