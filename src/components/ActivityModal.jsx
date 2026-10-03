import React, { useState, useEffect } from 'react';
import { 
  X, Plus, Trash2, Clock, Palette, 
  Sun, Moon, Laptop, Footprints, Mail, Utensils, 
  Sparkles, BookOpen, Coffee, Dumbbell, Music, Heart, Check
} from 'lucide-react';
import { NOTION_TINTS } from '../utils/notionTokens';
import { playClickSound } from '../utils/audioEngine';

const AVAILABLE_ICONS = [
  { name: 'Sun', component: Sun },
  { name: 'Moon', component: Moon },
  { name: 'Laptop', component: Laptop },
  { name: 'Footprints', component: Footprints },
  { name: 'Mail', component: Mail },
  { name: 'Utensils', component: Utensils },
  { name: 'Sparkles', component: Sparkles },
  { name: 'BookOpen', component: BookOpen },
  { name: 'Coffee', component: Coffee },
  { name: 'Dumbbell', component: Dumbbell },
  { name: 'Music', component: Music },
  { name: 'Heart', component: Heart }
];

export default function ActivityModal({
  isOpen,
  onClose,
  onSave,
  editingActivity = null
}) {
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [category, setCategory] = useState('Routine');
  const [tintId, setTintId] = useState('lavender');
  const [icon, setIcon] = useState('Sun');
  const [notes, setNotes] = useState('');
  const [subtasks, setSubtasks] = useState([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  useEffect(() => {
    if (editingActivity) {
      setTitle(editingActivity.title || '');
      setStartTime(editingActivity.startTime || '09:00');
      setDurationMinutes(editingActivity.durationMinutes || 45);
      setCategory(editingActivity.category || 'Routine');
      setTintId(editingActivity.tintId || 'lavender');
      setIcon(editingActivity.icon || 'Sun');
      setNotes(editingActivity.notes || '');
      setSubtasks(editingActivity.subtasks ? [...editingActivity.subtasks] : []);
    } else {
      setTitle('');
      setStartTime('09:00');
      setDurationMinutes(45);
      setCategory('Routine');
      setTintId('lavender');
      setIcon('Sun');
      setNotes('');
      setSubtasks([
        { id: `s-${Date.now()}-1`, title: 'Get started with clear intention', completed: false }
      ]);
    }
  }, [editingActivity, isOpen]);

  if (!isOpen) return null;

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    playClickSound();
    setSubtasks([
      ...subtasks,
      { id: `sub-${Date.now()}`, title: newSubtaskTitle.trim(), completed: false }
    ]);
    setNewSubtaskTitle('');
  };

  const handleRemoveSubtask = (id) => {
    playClickSound();
    setSubtasks(subtasks.filter(s => s.id !== id));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    playClickSound();

    onSave({
      id: editingActivity ? editingActivity.id : `act-${Date.now()}`,
      title: title.trim(),
      startTime,
      durationMinutes: parseInt(durationMinutes, 10) || 30,
      category,
      tintId,
      icon,
      notes: notes.trim(),
      subtasks,
      isCompleted: editingActivity ? editingActivity.isCompleted : false
    });

    onClose();
  };

  const selectedTint = NOTION_TINTS.find(t => t.id === tintId) || NOTION_TINTS[0];

  return (
    <div className="modal-backdrop animate-fade-in" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-wrap">
            <span 
              className="modal-color-preview-dot"
              style={{ backgroundColor: selectedTint.accent }}
            />
            <h3 className="modal-title">
              {editingActivity ? 'Edit Activity' : 'Add New Activity'}
            </h3>
          </div>
          <button 
            type="button" 
            className="modal-close-btn" 
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="modal-body-form">
          {/* Title */}
          <div className="form-group">
            <label className="form-label" htmlFor="act-title">Activity Title</label>
            <input
              id="act-title"
              type="text"
              className="form-input"
              placeholder="e.g. Deep Work Sprint, Yoga Flow, Team Standup"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
              required
            />
          </div>

          {/* Time & Duration Row */}
          <div className="form-row-two">
            <div className="form-group">
              <label className="form-label" htmlFor="act-start-time">
                <Clock size={13} className="inline-icon" />
                Start Time
              </label>
              <input
                id="act-start-time"
                type="time"
                className="form-input"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="act-duration">Duration (Minutes)</label>
              <select
                id="act-duration"
                className="form-select"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
              >
                <option value={15}>15 min</option>
                <option value={25}>25 min (Pomodoro)</option>
                <option value={30}>30 min</option>
                <option value={45}>45 min</option>
                <option value={60}>60 min (1 hr)</option>
                <option value={90}>90 min</option>
                <option value={120}>120 min (2 hr)</option>
              </select>
            </div>
          </div>

          {/* Category */}
          <div className="form-group">
            <label className="form-label">Category</label>
            <div className="category-chips-row">
              {['Routine', 'Work', 'Wellness', 'Creative', 'Habit'].map(cat => (
                <button
                  key={cat}
                  type="button"
                  className={`category-chip ${category === cat ? 'active' : ''}`}
                  onClick={() => setCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Notion Tint Color Picker */}
          <div className="form-group">
            <label className="form-label">
              <Palette size={13} className="inline-icon" />
              Notion Card Tint
            </label>
            <div className="tint-swatches-grid">
              {NOTION_TINTS.map(t => (
                <button
                  key={t.id}
                  type="button"
                  className={`tint-swatch ${tintId === t.id ? 'selected' : ''}`}
                  style={{ backgroundColor: t.bg, borderColor: t.border }}
                  onClick={() => setTintId(t.id)}
                  title={t.name}
                >
                  {tintId === t.id && (
                    <Check size={14} color={t.accent} strokeWidth={3} />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Icon Selector */}
          <div className="form-group">
            <label className="form-label">Activity Icon</label>
            <div className="icons-selector-grid">
              {AVAILABLE_ICONS.map(ic => {
                const Comp = ic.component;
                const isSelected = icon === ic.name;
                return (
                  <button
                    key={ic.name}
                    type="button"
                    className={`icon-pick-btn ${isSelected ? 'active' : ''}`}
                    onClick={() => setIcon(ic.name)}
                  >
                    <Comp size={16} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step-by-Step Checklist */}
          <div className="form-group">
            <label className="form-label">Checklist Steps ({subtasks.length})</label>
            <div className="modal-subtasks-list">
              {subtasks.map(s => (
                <div key={s.id} className="modal-subtask-item">
                  <span className="subtask-dot">•</span>
                  <span className="modal-subtask-name">{s.title}</span>
                  <button
                    type="button"
                    className="subtask-remove-btn"
                    onClick={() => handleRemoveSubtask(s.id)}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>

            <div className="add-subtask-input-row">
              <input
                type="text"
                className="form-input subtask-add-field"
                placeholder="Add subtask step..."
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
              />
              <button
                type="button"
                className="add-subtask-btn"
                onClick={handleAddSubtask}
              >
                <Plus size={14} />
              </button>
            </div>
          </div>

          {/* Notes */}
          <div className="form-group">
            <label className="form-label" htmlFor="act-notes">Notes or Intention</label>
            <input
              id="act-notes"
              type="text"
              className="form-input"
              placeholder="e.g. Focus on quality, put phone on silent..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Actions */}
          <div className="modal-footer">
            <button
              type="button"
              className="btn-cancel"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-save-primary"
            >
              {editingActivity ? 'Save Changes' : 'Create Activity'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
