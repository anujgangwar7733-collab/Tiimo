import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sun, Moon, Laptop, Footprints, Heart, Utensils, 
  Music, Coffee, Sparkles, BookOpen, Clock, Play, 
  CheckCircle2, Circle, MoreVertical, Trash2, Edit3, 
  ChevronDown, ChevronUp, Check, AlertCircle, Plus
} from 'lucide-react';
import { TIIMO_TINTS, getCardTint } from '../utils/tiimoTokens';
import { playClickSound, playCompletionChime } from '../utils/audioEngine';

// Icon Map
const ICON_MAP = {
  Sun,
  Moon,
  Laptop,
  Footprints,
  Heart,
  Utensils,
  Music,
  Coffee,
  Sparkles,
  BookOpen,
  Default: Clock
};

export default function TimelineView({
  activities = [],
  onToggleComplete,
  onToggleSubtask,
  onDeleteActivity,
  onEditActivity,
  onStartFocus,
  onOpenAddModal,
  isDarkMode = false,
  isLoading = false,
  syncError = null
}) {
  const [expandedCards, setExpandedCards] = useState({});
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [currentTimeStr, setCurrentTimeStr] = useState('');
  const [currentMinutes, setCurrentMinutes] = useState(0);

  // Sync real-time clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const mins = now.getMinutes();
      setCurrentMinutes(hours * 60 + mins);
      setCurrentTimeStr(
        `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  const toggleExpand = (id) => {
    playClickSound();
    setExpandedCards(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Convert "HH:mm" to total minutes
  const parseTimeToMinutes = (timeStr) => {
    if (!timeStr) return 0;
    const [h, m] = timeStr.split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
  };

  // Format "09:00" + duration => "09:00 - 09:45"
  const getTimeSpan = (startTime, durationMinutes) => {
    const startM = parseTimeToMinutes(startTime);
    const endM = startM + (durationMinutes || 30);
    const endH = String(Math.floor(endM / 60) % 24).padStart(2, '0');
    const endMin = String(endM % 60).padStart(2, '0');
    return `${startTime} - ${endH}:${endMin}`;
  };

  // Check if activity is currently active
  const getActivityStatus = (startTime, durationMinutes, isCompleted) => {
    if (isCompleted) return 'completed';
    const startM = parseTimeToMinutes(startTime);
    const endM = startM + (durationMinutes || 30);

    if (currentMinutes >= startM && currentMinutes < endM) {
      const elapsed = currentMinutes - startM;
      const progress = Math.min(100, Math.max(0, Math.round((elapsed / durationMinutes) * 100)));
      return { status: 'active', progress, remaining: endM - currentMinutes };
    }
    if (currentMinutes >= endM) {
      return 'past';
    }
    return 'upcoming';
  };

  // Calculate completion percentage for day summary
  const totalCount = activities.length;
  const completedCount = activities.filter(a => a.isCompleted).length;
  const dayProgressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="tiimo-timeline-wrapper">
      {/* Day Progress Summary Bar */}
      <div className="tiimo-day-summary-card">
        <div className="summary-left">
          <span className="summary-label">TODAY'S FLOW</span>
          <h3 className="summary-title">
            {completedCount} of {totalCount} completed ({dayProgressPct}%)
          </h3>
        </div>
        <div className="summary-progress-bar-container">
          <div 
            className="summary-progress-bar-fill" 
            style={{ width: `${dayProgressPct}%` }}
          />
        </div>
      </div>

      {/* Activities Timeline Stream */}
      <div className="tiimo-timeline-stream">
        {syncError && (
          <div className="tiimo-sync-banner">
            <AlertCircle size={15} />
            <span>{syncError}</span>
          </div>
        )}

        {isLoading && activities.length === 0 ? (
          <div className="tiimo-skeleton-stream">
            <div className="tiimo-skeleton-card" />
            <div className="tiimo-skeleton-card" />
            <div className="tiimo-skeleton-card" />
          </div>
        ) : activities.length === 0 ? (
          <div className="tiimo-empty-timeline">
            <div className="empty-icon-circle">
              <Sparkles size={28} />
            </div>
            <h4>Your day is wide open</h4>
            <p>Tap below to add your first mindful routine or activity.</p>
            <button
              type="button"
              className="empty-add-btn"
              onClick={onOpenAddModal}
            >
              <Plus size={16} />
              <span>Add an Activity</span>
            </button>
          </div>
        ) : (
          activities.map((act, index) => {
            const tint = getCardTint(act.tintId, isDarkMode);
            const IconComponent = ICON_MAP[act.icon] || ICON_MAP.Default;
            const isExpanded = !!expandedCards[act.id];
            const statusInfo = getActivityStatus(act.startTime, act.durationMinutes, act.isCompleted);
            const isActive = typeof statusInfo === 'object' && statusInfo.status === 'active';
            const totalSub = act.subtasks?.length || 0;
            const completedSub = act.subtasks?.filter(s => s.completed).length || 0;

            // Check if "Now" line should render before this activity
            const prevAct = activities[index - 1];
            const actStartM = parseTimeToMinutes(act.startTime);
            const prevActEndM = prevAct ? parseTimeToMinutes(prevAct.startTime) + (prevAct.durationMinutes || 30) : 0;
            const isBetweenGap = currentMinutes > prevActEndM && currentMinutes < actStartM;

            return (
              <React.Fragment key={act.id}>
                {/* Real-time "NOW" Line indicator between events */}
                {isBetweenGap && (
                  <div className="tiimo-now-indicator">
                    <span className="now-dot-pulsing" />
                    <span className="now-badge">NOW • {currentTimeStr}</span>
                    <span className="now-line" />
                  </div>
                )}

                <motion.div
                  className={`tiimo-card ${act.isCompleted ? 'is-completed' : ''} ${isActive ? 'is-active' : ''}`}
                  style={{
                    backgroundColor: tint.bg,
                    borderColor: tint.border
                  }}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Real-time Active Progress Fill Bar */}
                  {isActive && (
                    <div 
                      className="card-realtime-fill"
                      style={{ 
                        width: `${statusInfo.progress}%`,
                        backgroundColor: tint.accent,
                        opacity: 0.2
                      }}
                    />
                  )}

                  {/* Card Header & Content */}
                  <div className="tiimo-card-header">
                    {/* Left: Icon Badge & Time */}
                    <div className="card-left-cluster">
                      <div 
                        className="card-icon-circle"
                        style={{ backgroundColor: tint.iconBg, color: tint.text }}
                      >
                        <IconComponent size={20} />
                      </div>

                      <div className="card-title-block">
                        <div className="card-time-row">
                          <span className="card-time-span" style={{ color: tint.text }}>
                            {getTimeSpan(act.startTime, act.durationMinutes)}
                          </span>
                          {isActive && (
                            <span className="active-live-badge" style={{ backgroundColor: tint.accent }}>
                              ● IN PROGRESS ({statusInfo.remaining}m left)
                            </span>
                          )}
                        </div>

                        <h4 
                          className="card-title"
                          style={{ color: tint.text }}
                        >
                          {act.title}
                        </h4>

                        <div className="card-meta-chips">
                          {act.category && (
                            <span 
                              className="category-pill"
                              style={{ backgroundColor: 'rgba(255,255,255,0.65)', color: tint.badgeText }}
                            >
                              {act.category}
                            </span>
                          )}
                          {totalSub > 0 && (
                            <span 
                              className="checklist-pill"
                              style={{ color: tint.badgeText }}
                              onClick={() => toggleExpand(act.id)}
                            >
                              ✓ {completedSub}/{totalSub} done
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="card-right-cluster">
                      {/* Focus Trigger Button */}
                      {!act.isCompleted && (
                        <button
                          type="button"
                          className="card-play-btn"
                          style={{ backgroundColor: tint.accent, color: '#ffffff' }}
                          onClick={() => onStartFocus(act)}
                          title="Start Focus Timer"
                          aria-label="Start Focus Timer"
                        >
                          <Play size={14} fill="#ffffff" />
                        </button>
                      )}

                      {/* Complete Checkbox */}
                      <button
                        type="button"
                        className="card-checkbox-btn"
                        onClick={() => {
                          playClickSound();
                          onToggleComplete(act.id);
                        }}
                        title={act.isCompleted ? "Mark uncompleted" : "Mark completed"}
                        aria-label="Toggle completed"
                      >
                        {act.isCompleted ? (
                          <CheckCircle2 size={24} className="checkbox-done" color={tint.accent} />
                        ) : (
                          <Circle size={24} className="checkbox-empty" color={tint.text} opacity={0.6} />
                        )}
                      </button>

                      {/* Subtasks expand chevron */}
                      {totalSub > 0 && (
                        <button
                          type="button"
                          className="card-expand-chevron"
                          onClick={() => toggleExpand(act.id)}
                          aria-label="Expand checklist"
                        >
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                      )}

                      {/* More Menu */}
                      <div className="card-menu-anchor">
                        <button
                          type="button"
                          className="card-more-btn"
                          onClick={() => setActiveMenuId(activeMenuId === act.id ? null : act.id)}
                          aria-label="More options"
                        >
                          <MoreVertical size={16} color={tint.text} />
                        </button>

                        {activeMenuId === act.id && (
                          <div className="tiimo-menu-dropdown">
                            <button
                              type="button"
                              className="menu-option-btn"
                              onClick={() => {
                                setActiveMenuId(null);
                                onEditActivity(act);
                              }}
                            >
                              <Edit3 size={14} />
                              <span>Edit Activity</span>
                            </button>
                            <button
                              type="button"
                              className="menu-option-btn danger"
                              onClick={() => {
                                setActiveMenuId(null);
                                onDeleteActivity(act.id);
                              }}
                            >
                              <Trash2 size={14} />
                              <span>Delete</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expandable Subtasks Checklist */}
                  <AnimatePresence>
                    {isExpanded && totalSub > 0 && (
                      <motion.div 
                        className="card-subtasks-drawer"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <div className="subtasks-list">
                          {act.subtasks.map(sub => (
                            <div 
                              key={sub.id} 
                              className={`subtask-item ${sub.completed ? 'sub-done' : ''}`}
                              onClick={() => {
                                playClickSound();
                                onToggleSubtask(act.id, sub.id);
                              }}
                            >
                              <button type="button" className="subtask-mini-check">
                                {sub.completed ? (
                                  <Check size={12} strokeWidth={3} color={tint.accent} />
                                ) : (
                                  <span className="subtask-empty-dot" />
                                )}
                              </button>
                              <span className="subtask-text">{sub.title}</span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </React.Fragment>
            );
          })
        )}
      </div>
    </div>
  );
}
