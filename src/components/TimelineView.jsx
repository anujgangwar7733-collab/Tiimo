import React, { useState, useEffect } from 'react';
import { 
  Sun, Moon, Laptop, Footprints, Mail, Utensils, Sparkles, 
  BookOpen, Coffee, Dumbbell, Music, Heart, CheckCircle2, Circle, 
  Play, MoreVertical, Trash2, Edit3, Clock, ChevronDown, ChevronUp, Check,
  AlertCircle
} from 'lucide-react';
import { NOTION_TINTS } from '../utils/notionTokens';
import { playClickSound } from '../utils/audioEngine';

// Icon Map
export const ICON_MAP = {
  Sun,
  Moon,
  Laptop,
  Footprints,
  Mail,
  Utensils,
  Sparkles,
  BookOpen,
  Coffee,
  Dumbbell,
  Music,
  Heart,
  Default: Clock
};

export default function TimelineView({
  activities = [],
  onToggleComplete,
  onToggleSubtask,
  onDeleteActivity,
  onEditActivity,
  onStartFocus,
  onOpenAddModal
}) {
  const [selectedDayOffset, setSelectedDayOffset] = useState(0); // 0 = Today
  const [expandedCards, setExpandedCards] = useState({});
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [currentTimeStr, setCurrentTimeStr] = useState('');

  // Update current time string (HH:mm)
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const mins = String(now.getMinutes()).padStart(2, '0');
      setCurrentTimeStr(`${hours}:${mins}`);
    };
    updateTime();
    const timer = setInterval(updateTime, 10000);
    return () => clearInterval(timer);
  }, []);

  // Generate 7 days pill list around today
  const daysList = [-1, 0, 1, 2, 3, 4, 5].map(offset => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return {
      offset,
      dayName: offset === 0 ? 'Today' : d.toLocaleDateString('en-US', { weekday: 'short' }),
      dateNum: d.getDate(),
      fullDate: d
    };
  });

  const toggleExpand = (id) => {
    setExpandedCards(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Find currently active task based on system time (or first incomplete task)
  const currentActiveTask = activities.find(act => !act.isCompleted);

  const getTint = (tintId) => {
    return NOTION_TINTS.find(t => t.id === tintId) || NOTION_TINTS[0];
  };

  return (
    <div className="timeline-view-container animate-fade-in">
      {/* Horizontal Day Selector */}
      <div className="day-selector-scroll">
        {daysList.map(item => {
          const isSelected = selectedDayOffset === item.offset;
          return (
            <button
              key={item.offset}
              type="button"
              className={`day-pill ${isSelected ? 'active' : ''}`}
              onClick={() => {
                setSelectedDayOffset(item.offset);
                playClickSound();
              }}
            >
              <span className="day-name">{item.dayName}</span>
              <span className="day-number">{item.dateNum}</span>
            </button>
          );
        })}
      </div>

      {/* Active "Now" Hero Card if Today is selected */}
      {selectedDayOffset === 0 && currentActiveTask && (
        <section className="now-active-hero">
          <div className="now-hero-header">
            <span className="now-live-badge">
              <span className="now-pulsing-dot"></span>
              CURRENT ROUTINE
            </span>
            <span className="now-time-indicator">{currentActiveTask.startTime} • {currentActiveTask.durationMinutes} min</span>
          </div>

          <div className="now-hero-body">
            <div className="now-hero-info">
              <h3 className="now-task-title">{currentActiveTask.title}</h3>
              {currentActiveTask.notes && (
                <p className="now-task-notes">{currentActiveTask.notes}</p>
              )}
            </div>

            <button
              type="button"
              className="now-start-focus-btn"
              onClick={() => onStartFocus(currentActiveTask)}
            >
              <Play size={16} fill="currentColor" />
              <span>Start Focus</span>
            </button>
          </div>

          {currentActiveTask.subtasks && currentActiveTask.subtasks.length > 0 && (
            <div className="now-steps-progress">
              <div className="steps-bar">
                <div 
                  className="steps-fill"
                  style={{
                    width: `${(currentActiveTask.subtasks.filter(s => s.completed).length / currentActiveTask.subtasks.length) * 100}%`
                  }}
                />
              </div>
              <span className="steps-text">
                {currentActiveTask.subtasks.filter(s => s.completed).length} of {currentActiveTask.subtasks.length} steps completed
              </span>
            </div>
          )}
        </section>
      )}

      {/* Real-time Indicator Line */}
      {selectedDayOffset === 0 && (
        <div className="realtime-ruler">
          <div className="ruler-line"></div>
          <div className="ruler-badge">
            <span className="ruler-dot"></span>
            <span>NOW • {currentTimeStr || '12:00'}</span>
          </div>
          <div className="ruler-line"></div>
        </div>
      )}

      {/* Activities Timeline List */}
      <div className="timeline-items-list">
        {activities.length === 0 ? (
          <div className="empty-timeline-card">
            <AlertCircle size={28} className="empty-icon" />
            <h4 className="empty-title">No activities planned yet</h4>
            <p className="empty-subtitle">Tap below to add your first routine or let AI plan your day.</p>
            <button
              type="button"
              className="empty-add-btn"
              onClick={onOpenAddModal}
            >
              + Create Activity
            </button>
          </div>
        ) : (
          activities.map((act) => {
            const tint = getTint(act.tintId);
            const IconComponent = ICON_MAP[act.icon] || ICON_MAP.Default;
            const isExpanded = expandedCards[act.id] !== false; // default open
            const totalSub = act.subtasks ? act.subtasks.length : 0;
            const completedSub = act.subtasks ? act.subtasks.filter(s => s.completed).length : 0;

            return (
              <div 
                key={act.id} 
                className={`activity-card ${act.isCompleted ? 'completed' : ''}`}
                style={{
                  backgroundColor: tint.bg,
                  borderColor: tint.border
                }}
              >
                {/* Card Header Row */}
                <div className="activity-card-header">
                  {/* Left: Complete Checkbox & Icon */}
                  <div className="activity-left-group">
                    <button
                      type="button"
                      className="activity-checkbox-btn"
                      onClick={() => {
                        playClickSound();
                        onToggleComplete(act.id);
                      }}
                      title={act.isCompleted ? "Mark incomplete" : "Mark completed"}
                    >
                      {act.isCompleted ? (
                        <CheckCircle2 size={22} className="check-done" color={tint.accent} />
                      ) : (
                        <Circle size={22} className="check-todo" color={tint.text} opacity={0.6} />
                      )}
                    </button>

                    <div 
                      className="activity-icon-badge"
                      style={{ backgroundColor: 'rgba(255, 255, 255, 0.7)', color: tint.text }}
                    >
                      <IconComponent size={18} />
                    </div>

                    <div className="activity-title-group">
                      <h4 
                        className="activity-title"
                        style={{ color: tint.text }}
                      >
                        {act.title}
                      </h4>
                      <div className="activity-meta">
                        <span className="activity-time-pill" style={{ color: tint.text }}>
                          <Clock size={11} className="inline-icon" />
                          {act.startTime} ({act.durationMinutes}m)
                        </span>
                        {act.category && (
                          <span className="activity-cat-tag" style={{ color: tint.accent }}>
                            {act.category}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="activity-right-group">
                    {/* Focus Session Trigger */}
                    {!act.isCompleted && (
                      <button
                        type="button"
                        className="card-focus-btn"
                        style={{ backgroundColor: tint.accent, color: '#ffffff' }}
                        onClick={() => onStartFocus(act)}
                        title="Start Focus Timer for this task"
                      >
                        <Play size={13} fill="#ffffff" />
                        <span>Focus</span>
                      </button>
                    )}

                    {/* Subtasks dropdown toggle */}
                    {totalSub > 0 && (
                      <button
                        type="button"
                        className="card-expand-btn"
                        onClick={() => toggleExpand(act.id)}
                        title="Toggle checklist"
                      >
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    )}

                    {/* More Menu */}
                    <div className="card-menu-wrapper">
                      <button
                        type="button"
                        className="card-more-btn"
                        onClick={() => setActiveMenuId(activeMenuId === act.id ? null : act.id)}
                      >
                        <MoreVertical size={16} />
                      </button>

                      {activeMenuId === act.id && (
                        <div className="card-menu-dropdown animate-fade-in">
                          <button
                            type="button"
                            className="menu-item"
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
                            className="menu-item delete"
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

                {/* Subtasks Checklist */}
                {totalSub > 0 && isExpanded && (
                  <div className="activity-subtasks-container">
                    <div className="subtasks-summary-bar">
                      <span>Checklist ({completedSub}/{totalSub})</span>
                    </div>
                    <div className="subtasks-list">
                      {act.subtasks.map(step => (
                        <div 
                          key={step.id} 
                          className={`subtask-item ${step.completed ? 'completed' : ''}`}
                          onClick={() => {
                            playClickSound();
                            onToggleSubtask(act.id, step.id);
                          }}
                        >
                          <div className={`subtask-check-box ${step.completed ? 'checked' : ''}`}>
                            {step.completed && <Check size={11} strokeWidth={3} />}
                          </div>
                          <span className="subtask-text">{step.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Add Routine Footer Button */}
        <button
          type="button"
          className="timeline-add-routine-btn"
          onClick={onOpenAddModal}
        >
          <span>+ Add Activity or Routine</span>
        </button>
      </div>
    </div>
  );
}
