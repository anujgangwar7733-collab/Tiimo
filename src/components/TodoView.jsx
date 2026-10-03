import React, { useState } from 'react';
import { 
  CheckCircle2, Circle, Plus, Trash2, Calendar, 
  Clock, Tag, Flag, ArrowUpRight, Check 
} from 'lucide-react';
import { playClickSound, playCompletionChime } from '../utils/audioEngine';
import { NOTION_TINTS } from '../utils/notionTokens';

export default function TodoView({
  todos = [],
  onToggleTodo,
  onAddTodo,
  onDeleteTodo,
  onScheduleTodoToTimeline
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
      tintId: tintMap[newList] || 'gray',
      completed: false,
      scheduledTime: null
    });

    setNewTitle('');
    setIsAdding(false);
  };

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'High':
        return { bg: '#fde0ec', text: '#a02e6d', border: '#f7c2d8' };
      case 'Medium':
        return { bg: '#fef7d6', text: '#793400', border: '#f9e79f' };
      default:
        return { bg: '#f0eeec', text: '#5d5b54', border: '#dedad6' };
    }
  };

  const completedCount = filteredTodos.filter(t => t.completed).length;

  return (
    <div className="todo-view-container animate-fade-in">
      {/* Category List Tabs */}
      <div className="todo-tabs-scroll">
        {lists.map(listName => (
          <button
            key={listName}
            type="button"
            className={`todo-tab-btn ${selectedList === listName ? 'active' : ''}`}
            onClick={() => {
              playClickSound();
              setSelectedList(listName);
            }}
          >
            <span>{listName}</span>
            <span className="todo-count-badge">
              {listName === 'All' 
                ? todos.filter(t => !t.completed).length 
                : todos.filter(t => t.list === listName && !t.completed).length}
            </span>
          </button>
        ))}
      </div>

      {/* Summary progress bar */}
      <div className="todo-summary-card">
        <div className="todo-progress-header">
          <span className="todo-progress-title">{selectedList} Tasks</span>
          <span className="todo-progress-stat">
            {completedCount} of {filteredTodos.length} completed
          </span>
        </div>
        <div className="todo-progress-track">
          <div 
            className="todo-progress-fill"
            style={{
              width: filteredTodos.length > 0 ? `${(completedCount / filteredTodos.length) * 100}%` : '0%'
            }}
          />
        </div>
      </div>

      {/* Inline Quick Add Task Button / Form */}
      {!isAdding ? (
        <button
          type="button"
          className="todo-open-add-btn"
          onClick={() => setIsAdding(true)}
        >
          <Plus size={16} strokeWidth={2.5} />
          <span>New Task in {selectedList === 'All' ? 'Today' : selectedList}...</span>
        </button>
      ) : (
        <form className="todo-add-form animate-fade-in" onSubmit={handleCreate}>
          <input
            type="text"
            className="todo-add-input"
            placeholder="What needs to be done?"
            autoFocus
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />

          <div className="todo-form-options">
            <div className="form-selects">
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

            <div className="form-buttons">
              <button 
                type="button" 
                className="form-cancel-btn"
                onClick={() => setIsAdding(false)}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="form-save-btn"
                disabled={!newTitle.trim()}
              >
                Add Task
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Task List */}
      <div className="todo-items-list">
        {filteredTodos.length === 0 ? (
          <div className="todo-empty-state">
            <CheckCircle2 size={32} opacity={0.3} />
            <p>No tasks in this list. Tap above to add one!</p>
          </div>
        ) : (
          filteredTodos.map(item => {
            const pStyle = getPriorityStyle(item.priority);
            return (
              <div 
                key={item.id} 
                className={`todo-item-card ${item.completed ? 'completed' : ''}`}
              >
                <div className="todo-item-main">
                  <button
                    type="button"
                    className="todo-checkbox-btn"
                    onClick={() => {
                      playClickSound();
                      onToggleTodo(item.id);
                    }}
                  >
                    {item.completed ? (
                      <CheckCircle2 size={20} className="checked-icon" />
                    ) : (
                      <Circle size={20} className="unchecked-icon" />
                    )}
                  </button>

                  <div className="todo-content">
                    <span className="todo-title-text">{item.title}</span>
                    <div className="todo-meta-row">
                      <span 
                        className="priority-chip"
                        style={{ backgroundColor: pStyle.bg, color: pStyle.text, borderColor: pStyle.border }}
                      >
                        <Flag size={10} className="inline-icon" />
                        {item.priority}
                      </span>
                      <span className="todo-list-tag">
                        {item.list}
                      </span>
                      {item.scheduledTime && (
                        <span className="todo-scheduled-tag">
                          <Clock size={10} className="inline-icon" />
                          {item.scheduledTime}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="todo-item-actions">
                  {/* Quick Schedule to Timeline */}
                  {!item.completed && (
                    <button
                      type="button"
                      className="todo-schedule-btn"
                      onClick={() => onScheduleTodoToTimeline(item)}
                      title="Add to Today's Timeline"
                    >
                      <ArrowUpRight size={14} />
                      <span className="btn-text">To Timeline</span>
                    </button>
                  )}

                  <button
                    type="button"
                    className="todo-delete-btn"
                    onClick={() => {
                      playClickSound();
                      onDeleteTodo(item.id);
                    }}
                    title="Delete task"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
