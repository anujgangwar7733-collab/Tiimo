import React, { useState, useEffect } from 'react';
import PhoneFrame from './components/PhoneFrame';
import Header from './components/Header';
import BottomNavBar from './components/BottomNavBar';
import TimelineView from './components/TimelineView';
import FocusTimer from './components/FocusTimer';
import AiPlannerView from './components/AiPlannerView';
import TodoView from './components/TodoView';
import WellbeingView from './components/WellbeingView';
import TrophiesView from './components/TrophiesView';
import ActivityModal from './components/ActivityModal';

import { 
  loadActivities, saveActivities, 
  loadTodos, saveTodos, 
  loadMoods, saveMoods, 
  loadTrophies, saveTrophies, 
  loadStreak, saveStreak 
} from './utils/storage';
import { INITIAL_ACTIVITIES, INITIAL_TODOS, INITIAL_MOOD_HISTORY, TROPHIES } from './utils/initialData';
import { playAmbientSound, stopAmbientSound, playCompletionChime } from './utils/audioEngine';
import './App.css';

import LandingPage from './components/LandingPage';
import './components/LandingPage.css';

export default function App() {
  const [currentView, setCurrentView] = useState('landing'); // 'landing' | 'app'
  const [activities, setActivities] = useState(() => loadActivities());
  const [todos, setTodos] = useState(() => loadTodos());
  const [moodHistory, setMoodHistory] = useState(() => loadMoods());
  const [trophies, setTrophies] = useState(() => loadTrophies());
  const [streak, setStreak] = useState(() => loadStreak());
  const [currentTheme, setCurrentTheme] = useState('warm-minimal');

  const [activeTab, setActiveTab] = useState('timeline');
  const [focusActivity, setFocusActivity] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [isAmbientSoundPlaying, setIsAmbientSoundPlaying] = useState(false);

  // Sync state to LocalStorage
  useEffect(() => {
    saveActivities(activities);
  }, [activities]);

  useEffect(() => {
    saveTodos(todos);
  }, [todos]);

  useEffect(() => {
    saveMoods(moodHistory);
  }, [moodHistory]);

  useEffect(() => {
    saveTrophies(trophies);
  }, [trophies]);

  useEffect(() => {
    saveStreak(streak);
  }, [streak]);

  // Apply Theme Attribute
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', currentTheme);
  }, [currentTheme]);

  // Ambient sound quick toggle
  const toggleAmbientSound = () => {
    if (isAmbientSoundPlaying) {
      stopAmbientSound();
      setIsAmbientSoundPlaying(false);
    } else {
      playAmbientSound('pink', 0.2);
      setIsAmbientSoundPlaying(true);
    }
  };

  // Activity Actions
  const handleToggleComplete = (id) => {
    setActivities(prev => prev.map(act => {
      if (act.id === id) {
        const nextState = !act.isCompleted;
        if (nextState) {
          playCompletionChime();
        }
        return { ...act, isCompleted: nextState };
      }
      return act;
    }));
  };

  const handleToggleSubtask = (actId, subId) => {
    setActivities(prev => prev.map(act => {
      if (act.id === actId && act.subtasks) {
        const updatedSubs = act.subtasks.map(s => 
          s.id === subId ? { ...s, completed: !s.completed } : s
        );
        return { ...act, subtasks: updatedSubs };
      }
      return act;
    }));
  };

  const handleDeleteActivity = (id) => {
    setActivities(prev => prev.filter(a => a.id !== id));
  };

  const handleSaveActivity = (activityData) => {
    setActivities(prev => {
      const exists = prev.some(a => a.id === activityData.id);
      if (exists) {
        return prev.map(a => a.id === activityData.id ? activityData : a);
      }
      // sort chronologically
      return [...prev, activityData].sort((a, b) => a.startTime.localeCompare(b.startTime));
    });
    playCompletionChime();
  };

  const handleStartFocus = (act) => {
    setFocusActivity(act);
    setActiveTab('focus');
  };

  // AI Planner action
  const handleAddGeneratedActivities = (newActivities) => {
    setActivities(prev => {
      const merged = [...prev, ...newActivities];
      return merged.sort((a, b) => a.startTime.localeCompare(b.startTime));
    });
    setActiveTab('timeline');
  };

  // Todo Actions
  const handleToggleTodo = (id) => {
    setTodos(prev => prev.map(t => {
      if (t.id === id) {
        const nextState = !t.completed;
        if (nextState) playCompletionChime();
        return { ...t, completed: nextState };
      }
      return t;
    }));
  };

  const handleAddTodo = (newTodo) => {
    setTodos(prev => [newTodo, ...prev]);
  };

  const handleDeleteTodo = (id) => {
    setTodos(prev => prev.filter(t => t.id !== id));
  };

  const handleScheduleTodoToTimeline = (todoItem) => {
    const newActivity = {
      id: `act-from-todo-${Date.now()}`,
      title: todoItem.title,
      icon: 'CheckSquare',
      startTime: todoItem.scheduledTime || '14:00',
      durationMinutes: 30,
      tintId: todoItem.tintId || 'lavender',
      category: todoItem.list,
      isCompleted: false,
      subtasks: [
        { id: `s-${Date.now()}`, title: 'Complete scheduled objective', completed: false }
      ],
      notes: `Scheduled from To-Do: ${todoItem.list} list`
    };

    handleSaveActivity(newActivity);
    setActiveTab('timeline');
  };

  // Wellbeing Actions
  const handleLogMood = (entry) => {
    setMoodHistory(prev => [entry, ...prev.slice(0, 6)]);
  };

  // Reset Demo Data
  const handleResetData = () => {
    setActivities(INITIAL_ACTIVITIES);
    setTodos(INITIAL_TODOS);
    setMoodHistory(INITIAL_MOOD_HISTORY);
    setTrophies(TROPHIES);
    setStreak(5);
  };

  const pendingTodoCount = todos.filter(t => !t.completed).length;

  return (
    <div className="app-root-container">
      {/* Floating View Switcher pill on bottom-right for instant navigation */}
      <aside aria-label="Global View Switcher" className="global-view-toggle-pill">
        <button
          type="button"
          className={`view-pill-btn ${currentView === 'landing' ? 'active' : ''}`}
          onClick={() => setCurrentView('landing')}
        >
          <span>🌐 Landing Page</span>
        </button>
        <button
          type="button"
          className={`view-pill-btn ${currentView === 'app' ? 'active' : ''}`}
          onClick={() => setCurrentView('app')}
        >
          <span>📱 Open App</span>
        </button>
      </aside>

      {currentView === 'landing' ? (
        <LandingPage onLaunchApp={() => setCurrentView('app')} />
      ) : (
        <div className="app-mode-wrapper animate-fade-in">
          {/* Top Quick Bar back to Landing */}
          <div className="app-top-return-bar">
            <button
              type="button"
              className="return-landing-btn"
              onClick={() => setCurrentView('landing')}
            >
              <span>← Back to Landing Page</span>
            </button>
            <span className="app-mode-notice">Daily Routine v1.0 • Notion Minimal Design</span>
          </div>

          <PhoneFrame>
            {/* App Header */}
            <Header
              streak={streak}
              isSoundPlaying={isAmbientSoundPlaying}
              onToggleSound={toggleAmbientSound}
              onOpenAddModal={() => {
                setEditingActivity(null);
                setIsAddModalOpen(true);
              }}
            />

            {/* Main Screen Viewport */}
            <main className="app-main-viewport">
              {activeTab === 'timeline' && (
                <TimelineView
                  activities={activities}
                  onToggleComplete={handleToggleComplete}
                  onToggleSubtask={handleToggleSubtask}
                  onDeleteActivity={handleDeleteActivity}
                  onEditActivity={(act) => {
                    setEditingActivity(act);
                    setIsAddModalOpen(true);
                  }}
                  onStartFocus={handleStartFocus}
                  onOpenAddModal={() => {
                    setEditingActivity(null);
                    setIsAddModalOpen(true);
                  }}
                />
              )}

              {activeTab === 'focus' && (
                <FocusTimer
                  activity={focusActivity || activities[0]}
                  onClose={() => {
                    setFocusActivity(null);
                    setActiveTab('timeline');
                  }}
                  onCompleteActivity={(id) => {
                    handleToggleComplete(id);
                    setActiveTab('timeline');
                  }}
                  onToggleSubtask={handleToggleSubtask}
                />
              )}

              {activeTab === 'ai' && (
                <AiPlannerView
                  onAddGeneratedActivities={handleAddGeneratedActivities}
                />
              )}

              {activeTab === 'todo' && (
                <TodoView
                  todos={todos}
                  onToggleTodo={handleToggleTodo}
                  onAddTodo={handleAddTodo}
                  onDeleteTodo={handleDeleteTodo}
                  onScheduleTodoToTimeline={handleScheduleTodoToTimeline}
                />
              )}

              {activeTab === 'wellbeing' && (
                <WellbeingView
                  moodHistory={moodHistory}
                  onLogMood={handleLogMood}
                />
              )}

              {activeTab === 'trophies' && (
                <TrophiesView
                  trophies={trophies}
                  streak={streak}
                  currentTheme={currentTheme}
                  onChangeTheme={setCurrentTheme}
                  onResetData={handleResetData}
                />
              )}
            </main>

            {/* Mobile Tab Navigation */}
            <BottomNavBar
              activeTab={activeTab}
              onSelectTab={(tabId) => {
                if (tabId === 'focus' && !focusActivity) {
                  const target = activities.find(a => !a.isCompleted) || activities[0];
                  setFocusActivity(target);
                }
                setActiveTab(tabId);
              }}
              pendingTodoCount={pendingTodoCount}
            />

            {/* Add / Edit Activity Modal */}
            <ActivityModal
              isOpen={isAddModalOpen}
              editingActivity={editingActivity}
              onClose={() => {
                setIsAddModalOpen(false);
                setEditingActivity(null);
              }}
              onSave={handleSaveActivity}
            />
          </PhoneFrame>
        </div>
      )}
    </div>
  );
}
