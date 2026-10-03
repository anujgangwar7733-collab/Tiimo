import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, RotateCcw, Plus, CheckCircle2, Circle, 
  Volume2, VolumeX, ArrowLeft, Sparkles, Award, Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { playAmbientSound, stopAmbientSound, playCompletionChime, playClickSound } from '../utils/audioEngine';
import { NOTION_TINTS } from '../utils/notionTokens';

export default function FocusTimer({
  activity,
  onClose,
  onCompleteActivity,
  onToggleSubtask
}) {
  const initialSeconds = (activity?.durationMinutes || 25) * 60;
  const [totalSeconds, setTotalSeconds] = useState(initialSeconds);
  const [secondsRemaining, setSecondsRemaining] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(true);
  const [soundMode, setSoundMode] = useState('pink'); // Default to calming pink noise
  const [completedSteps, setCompletedSteps] = useState(0);

  const timerRef = useRef(null);

  // Sync with ambient sound
  useEffect(() => {
    if (isRunning && soundMode !== 'none') {
      playAmbientSound(soundMode, 0.22);
    } else {
      stopAmbientSound();
    }
    return () => {
      stopAmbientSound();
    };
  }, [isRunning, soundMode]);

  // Timer Tick
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setSecondsRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleFinish(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isRunning]);

  const handleFinish = (isAuto = false) => {
    setIsRunning(false);
    stopAmbientSound();
    playCompletionChime();
    
    // Trigger confetti celebration
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#5645d4', '#ff64c8', '#1aae39', '#f5a623', '#2a9d99']
      });
    } catch(e) {}

    if (activity && onCompleteActivity) {
      onCompleteActivity(activity.id);
    }
  };

  const togglePlayPause = () => {
    playClickSound();
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    playClickSound();
    setIsRunning(false);
    setSecondsRemaining(totalSeconds);
  };

  const handleAddFiveMinutes = () => {
    playClickSound();
    setTotalSeconds(prev => prev + 300);
    setSecondsRemaining(prev => prev + 300);
  };

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainderSecs = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(remainderSecs).padStart(2, '0')}`;
  };

  // Circular progress calculations
  const progressRatio = totalSeconds > 0 ? (totalSeconds - secondsRemaining) / totalSeconds : 0;
  const radius = 100;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progressRatio * circumference;

  const tint = activity?.tintId ? NOTION_TINTS.find(t => t.id === activity.tintId) : NOTION_TINTS[0];

  return (
    <div className="focus-timer-screen animate-fade-in">
      {/* Top Header bar */}
      <div className="focus-header">
        <button 
          type="button" 
          className="focus-back-btn"
          onClick={() => {
            stopAmbientSound();
            onClose();
          }}
        >
          <ArrowLeft size={18} />
          <span>Exit Focus</span>
        </button>

        <span className="focus-mode-badge">
          <Sparkles size={13} className="sparkle-icon" />
          Focus Session
        </span>
      </div>

      {/* Main Focus Card */}
      <div className="focus-content-wrap">
        <h2 className="focus-task-title">{activity?.title || 'Deep Focus Block'}</h2>
        <span className="focus-task-notes">
          {activity?.notes || 'Stay grounded. Notice how good it feels to focus on one thing.'}
        </span>

        {/* Circular Progress Ring */}
        <div className="circular-timer-container">
          <svg className="timer-svg" width="240" height="240" viewBox="0 0 240 240">
            {/* Background Circle */}
            <circle
              className="timer-track"
              cx="120"
              cy="120"
              r={radius}
              strokeWidth="12"
              fill="transparent"
            />
            {/* Animated Active Stroke */}
            <circle
              className="timer-stroke"
              cx="120"
              cy="120"
              r={radius}
              strokeWidth="12"
              fill="transparent"
              stroke={tint?.accent || '#5645d4'}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>

          {/* Time text centered inside ring */}
          <div className="timer-center-content">
            <span className="timer-numbers">{formatTime(secondsRemaining)}</span>
            <span className="timer-status-sub">
              {isRunning ? 'IN PROGRESS' : (secondsRemaining === 0 ? 'COMPLETED' : 'PAUSED')}
            </span>
          </div>
        </div>

        {/* Primary Controls */}
        <div className="timer-controls-row">
          <button 
            type="button" 
            className="control-secondary-btn"
            onClick={handleReset}
            title="Reset Timer"
          >
            <RotateCcw size={18} />
          </button>

          <button 
            type="button" 
            className="control-primary-btn"
            onClick={togglePlayPause}
            style={{ backgroundColor: tint?.accent || '#5645d4' }}
          >
            {isRunning ? (
              <Pause size={24} fill="#ffffff" />
            ) : (
              <Play size={24} fill="#ffffff" style={{ marginLeft: 3 }} />
            )}
          </button>

          <button 
            type="button" 
            className="control-secondary-btn"
            onClick={handleAddFiveMinutes}
            title="Add 5 Minutes"
          >
            <span className="add-five-label">+5m</span>
          </button>
        </div>

        {/* Sound Ambiance Mode Switcher */}
        <div className="focus-sound-selector">
          <span className="sound-section-title">
            <Volume2 size={13} className="inline-icon" />
            Ambient Focus Audio:
          </span>
          <div className="sound-chips">
            {[
              { id: 'pink', label: 'Pink Noise' },
              { id: 'rain', label: 'Gentle Rain' },
              { id: 'white', label: 'White Noise' },
              { id: 'binaural', label: '432Hz Alpha' },
              { id: 'none', label: 'Mute' }
            ].map(snd => (
              <button
                key={snd.id}
                type="button"
                className={`sound-chip ${soundMode === snd.id ? 'active' : ''}`}
                onClick={() => {
                  playClickSound();
                  setSoundMode(snd.id);
                }}
              >
                {snd.label}
              </button>
            ))}
          </div>
        </div>

        {/* In-Session Subtasks Checklist */}
        {activity?.subtasks && activity.subtasks.length > 0 && (
          <div className="focus-checklist-section">
            <h4 className="checklist-heading">Step-by-Step Focus:</h4>
            <div className="focus-steps-list">
              {activity.subtasks.map(step => (
                <div 
                  key={step.id} 
                  className={`focus-step-row ${step.completed ? 'completed' : ''}`}
                  onClick={() => {
                    playClickSound();
                    if (onToggleSubtask) {
                      onToggleSubtask(activity.id, step.id);
                    }
                  }}
                >
                  <div className={`step-check-circle ${step.completed ? 'checked' : ''}`}>
                    {step.completed && <Check size={12} strokeWidth={3} />}
                  </div>
                  <span className="step-name">{step.title}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Finish Routine Button */}
        <button
          type="button"
          className="focus-finish-routine-btn"
          onClick={() => handleFinish(false)}
        >
          <Award size={16} />
          <span>Complete & Mark Done</span>
        </button>
      </div>
    </div>
  );
}
