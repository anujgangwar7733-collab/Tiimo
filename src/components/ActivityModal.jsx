import React, { useState, useEffect } from 'react';
import { 
  X, Plus, Trash2, Clock, Palette, 
  Sun, Moon, Laptop, Footprints, Mail, Utensils, 
  Sparkles, BookOpen, Coffee, Dumbbell, Music, Heart, Check
} from 'lucide-react';
import { TIIMO_TINTS } from '../utils/tiimoTokens';
import { playClickSound } from '../utils/audioEngine';

const AVAILABLE_ICONS = [
  { name: 'Sun', component: Sun },
  { name: 'Moon', component: Moon },
  { name: 'Laptop', component: Laptop },
  { name: 'Footprints', component: Footprints },
  { name: 'Heart', component: Heart },
  { name: 'Utensils', component: Utensils },
  { name: 'Sparkles', component: Sparkles },
  { name: 'BookOpen', component: BookOpen },
  { name: 'Coffee', component: Coffee },
  { name: 'Music', component: Music }
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
  const [category, setCategory] = useState('Morning');
  const [tintId, setTintId] = useState('mint');
  const [icon, setIcon] = useState('Sun');
  const [notes, setNotes] = useState('');
  const [subtasks, setSubtasks] = useState([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  const tintList = Object.values(TIIMO_TINTS);

  useEffect(() => {
    if (editingActivity) {
      setTitle(editingActivity.title || '');
      setStartTime(editingActivity.startTime || '09:00');
      setDurationMinutes(editingActivity.durationMinutes || 45);
      setCategory(editingActivity.category || 'Morning');
      setTintId(editingActivity.tintId || 'mint');
      setIcon(editingActivity.icon || 'Sun');
      setNotes(editingActivity.notes || '');
      setSubtasks(editingActivity.subtasks ? [...editingActivity.subtasks] : []);
    } else {
      setTitle('');
      setStartTime('09:00');
      setDurationMinutes(45);
      setCategory('Morning');
      setTintId('mint');
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

  const selectedTint = TIIMO_TINTS[tintId] || TIIMO_TINTS.mint;

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
              {editingActivity ? 'Edit Activity' : 'Create Tiimo Routine'}
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
            <label className="form-label" htmlFor="act-title">Activity Name</label>
            <input
              id="act-title"
              type="text"
              className="form-input"
              placeholder="e.g. Morning Stretch, Deep Focus, Somatic Reset"
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
              <label className="form-label" htmlFor="act-duration">Duration</label>
              <select
                id="act-duration"
                className="form-select"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
              >
                <option value={15}>15 minutes</option>
                <option value={25}>25 minutes (Focus block)</option>
                <option value={30}>30 minutes</option>
                <option value={45}>45 minutes</option>
                <option value={60}>1 hour</option>
                <option value={90}>1.5 hours</option>
                <option value={120}>2 hours</option>
              </select>
            </div>
          </div>

          {/* Category Chips */}
          <div className="form-group">
            <label className="form-label">Category</label>
            <div className="category-chips-row">
              {['Morning', 'Deep Work', 'Health', 'Mindfulness', 'Evening', 'Routine'].map(cat => (
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

          {/* Tiimo Pastel Tint Picker */}
          <div className="form-group">
            <label className="form-label">
              <Palette size={13} className="inline-icon" />
              Tiimo Pastel Tint
            </label>
            <div className="tint-swatches-grid">
              {tintList.map(t => (
                <button
                  key={t.id}
                  type="button"
                  className={`tint-swatch ${tintId === t.id ? 'selected' : ''}`}
                  style={{ backgroundColor: t.bg, borderColor: t.border }}
                  onClick={() => setTintId(t.id)}
                  title={t.label}
                >
                  {tintId === t.id && (
                    <Check size={14} color={t.accent} strokeWidth={3} />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Icon Picker */}
          <div className="form-group">
            <label className="form-label">Activity Icon</label>
            <div className="icons-picker-row">
              {AVAILABLE_ICONS.map(item => {
                const IconCmp = item.component;
                const isSelected = icon === item.name;
                return (
                  <button
                    key={item.name}
                    type="button"
                    className={`icon-choice-btn ${isSelected ? 'active' : ''}`}
                    onClick={() => setIcon(item.name)}
                  >
                    <IconCmp size={18} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Subtasks Checklist Builder */}
          <div className="form-group">
            <label className="form-label">Micro-steps / Subtasks</label>
            <div className="subtasks-builder">
              {subtasks.map((sub) => (
                <div key={sub.id} className="subtask-edit-row">
                  <span className="subtask-bullet">•</span>
                  <span className="subtask-edit-title">{sub.title}</span>
                  <button
                    type="button"
                    className="subtask-del-btn"
                    onClick={() => handleRemoveSubtask(sub.id)}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}

              <div className="add-subtask-input-row">
                <input
                  type="text"
                  className="subtask-input"
                  placeholder="Add a step..."
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
                  className="add-step-btn"
                  onClick={handleAddSubtask}
                >
                  <Plus size={14} />
                  <span>Add</span>
                </button>
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <div className="modal-actions-footer">
            <button 
              type="button" 
              className="modal-btn-cancel" 
              onClick={onClose}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="modal-btn-save"
            >
              {editingActivity ? 'Save Changes' : 'Add to Schedule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
