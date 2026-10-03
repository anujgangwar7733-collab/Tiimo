import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, Circle, Plus, Trash2, ArrowUpRight, 
  Flag, Clock, Sparkles, Filter 
} from 'lucide-react';
import { TIIMO_TINTS, getCardTint } from '../utils/tiimoTokens';
import { playClickSound, playCompletionChime } from '../utils/audioEngine';

export default function TodoView({
  todos = [],
  onToggleTodo,
  onAddTodo,
  onDeleteTodo,
  onScheduleTodoToTimeline,
  isDarkMode = false
}) {
  const [selectedList, setSelectedList] = useState('All');
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState('Medium');
  const [newList, setNewList] = useState('Today');
  const [isAdding, setIsAdding] = useState(false);

  const lists = ['All', 'Today', 'Work', 'Personal', 'Habits'];

  const filteredTodos = todos.filter(t => {
    if (selectedList === 'All') return true;
    return t.list === selectedList;
  });

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    playClickSound();

    const tintMap = {
      Today: 'lavender',
      Work: 'sky',
      Personal: 'mint',
      Habits: 'yellow'
    };

    onAddTodo({
      id: `td-${Date.now()}`,
      title: newTitle.trim(),
      list: newList,
      priority: newPriority,
      tintId: tintMap[newList] || 'mint',
      completed: false,
      scheduledTime: null
    });

    setNewTitle('');
    setIsAdding(false);
  };

  const getPriorityStyle = (priority) => {
    if (isDarkMode) {
      switch (priority) {
        case 'High':
          return { bg: 'rgba(244, 132, 95, 0.22)', text: '#FFAF87', border: 'rgba(244, 132, 95, 0.4)' };
        case 'Medium':
          return { bg: 'rgba(255, 209, 102, 0.22)', text: '#FFE082', border: 'rgba(255, 209, 102, 0.4)' };
        default:
          return { bg: 'rgba(56, 189, 248, 0.22)', text: '#7DD3FC', border: 'rgba(56, 189, 248, 0.4)' };
      }
    }
    switch (priority) {
      case 'High':
        return { bg: '#FFE5D9', text: '#9A3412', border: '#F4845F' };
      case 'Medium':
        return { bg: '#FFF3CD', text: '#785100', border: '#FFD166' };
      default:
        return { bg: '#E0F2FE', text: '#0369A1', border: '#38BDF8' };
    }
  };

  const pendingCount = filteredTodos.filter(t => !t.completed).length;

  return (
    <div className="tiimo-todo-container">
      {/* Category List Filter Pills */}
      <div className="todo-filter-pills-row">
        {lists.map(listName => {
          const isSelected = selectedList === listName;
          const count = listName === 'All' 
            ? todos.filter(t => !t.completed).length 
            : todos.filter(t => t.list === listName && !t.completed).length;

          return (
            <button
              key={listName}
              type="button"
              className={`todo-filter-pill ${isSelected ? 'active' : ''}`}
              onClick={() => {
                playClickSound();
                setSelectedList(listName);
              }}
            >
              <span>{listName}</span>
              {count > 0 && <span className="pill-badge">{count}</span>}
            </button>
          );
        })}
      </div>

      {/* Quick Add Button or Form */}
      {!isAdding ? (
        <button
          type="button"
          className="todo-quick-add-btn"
          onClick={() => {
            playClickSound();
            setIsAdding(true);
          }}
        >
          <Plus size={18} />
          <span>Add new to-do in {selectedList === 'All' ? 'Today' : selectedList}...</span>
        </button>
      ) : (
        <motion.form 
          className="todo-inline-add-card"
          onSubmit={handleCreate}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <input
            type="text"
            className="todo-input-field"
            placeholder="What needs to get done?"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            autoFocus
          />

          <div className="todo-form-controls">
            <div className="select-chips-group">
              <select 
                className="todo-mini-select"
                value={newList}
                onChange={(e) => setNewList(e.target.value)}
              >
                <option value="Today">List: Today</option>
                <option value="Work">List: Work</option>
                <option value="Personal">List: Personal</option>
                <option value="Habits">List: Habits</option>
              </select>

              <select 
                className="todo-mini-select"
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value)}
              >
                <option value="Low">Priority: Low</option>
                <option value="Medium">Priority: Medium</option>
                <option value="High">Priority: High</option>
              </select>
            </div>

            <div className="form-action-btns">
              <button 
                type="button" 
                className="btn-cancel"
                onClick={() => setIsAdding(false)}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn-save"
                disabled={!newTitle.trim()}
              >
                Add To-Do
              </button>
            </div>
          </div>
        </motion.form>
      )}

      {/* Task List */}
      <div className="todo-items-stream">
        {filteredTodos.length === 0 ? (
          <div className="todo-empty-state">
            <div className="empty-icon-circle">
              <CheckCircle2 size={28} />
            </div>
            <h4>All clear in {selectedList}</h4>
            <p>You have finished all items or have not added any yet.</p>
          </div>
        ) : (
          filteredTodos.map(item => {
            const tint = getCardTint(item.tintId, isDarkMode);
            const pStyle = getPriorityStyle(item.priority);

            return (
              <motion.div 
                key={item.id} 
                className={`todo-card ${item.completed ? 'is-done' : ''}`}
                style={{
                  backgroundColor: tint.bg,
                  borderColor: tint.border
                }}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18 }}
              >
                <div className="todo-left-cluster">
                  <button
                    type="button"
                    className="todo-check-btn"
                    onClick={() => {
                      playClickSound();
                      onToggleTodo(item.id);
                    }}
                    title={item.completed ? "Mark undone" : "Mark done"}
                  >
                    {item.completed ? (
                      <CheckCircle2 size={22} color={tint.accent} />
                    ) : (
                      <Circle size={22} color={tint.text} opacity={0.65} />
                    )}
                  </button>

                  <div className="todo-text-block">
                    <span 
                      className="todo-title"
                      style={{ color: tint.text }}
                    >
                      {item.title}
                    </span>
                    <div className="todo-meta-row">
                      <span 
                        className="priority-chip"
                        style={{ backgroundColor: pStyle.bg, color: pStyle.text, borderColor: pStyle.border }}
                      >
                        <Flag size={10} />
                        {item.priority}
                      </span>
                      <span className="list-name-chip" style={{ color: tint.badgeText }}>
                        {item.list}
                      </span>
                      {item.scheduledTime && (
                        <span className="time-chip" style={{ color: tint.badgeText }}>
                          <Clock size={10} />
                          {item.scheduledTime}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="todo-right-cluster">
                  {/* Schedule to Timeline Button */}
                  {!item.completed && (
                    <button
                      type="button"
                      className="todo-schedule-btn"
                      onClick={() => onScheduleTodoToTimeline(item)}
                      title="Add to Today's Timeline"
                    >
                      <ArrowUpRight size={14} />
                      <span className="schedule-label">To Timeline</span>
                    </button>
                  )}

                  {/* Delete Button */}
                  <button
                    type="button"
                    className="todo-delete-btn"
                    onClick={() => onDeleteTodo(item.id)}
                    title="Delete item"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
