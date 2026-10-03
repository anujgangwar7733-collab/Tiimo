import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthView from './components/AuthView';
import PhoneFrame from './components/PhoneFrame';
import Header from './components/Header';
import BottomNavBar from './components/BottomNavBar';
import TimelineView from './components/TimelineView';
import FocusTimer from './components/FocusTimer';
import TodoView from './components/TodoView';
import ProfileView from './components/ProfileView';
import ActivityModal from './components/ActivityModal';
import LandingPage from './components/LandingPage';

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
import './components/LandingPage.css';

function MainApp() {
  const { user, isAuthenticated } = useAuth();

  // Root view: 'app' (default) | 'landing'
  const [currentView, setCurrentView] = useState(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('view') === 'landing' || window.location.hash === '#landing') {
        return 'landing';
      }
    }
    return 'app';
  });

  const [activities, setActivities] = useState(() => loadActivities());
  const [todos, setTodos] = useState(() => loadTodos());
  const [moodHistory, setMoodHistory] = useState(() => loadMoods());
  const [trophies, setTrophies] = useState(() => loadTrophies());
  const [streak, setStreak] = useState(() => loadStreak());
  const [currentTheme, setCurrentTheme] = useState('calm-cream');

  // Core navigation tabs: 'timeline' | 'todo' | 'focus' | 'profile'
  const [activeTab, setActiveTab] = useState('timeline');
  const [selectedDayOffset, setSelectedDayOffset] = useState(0); // 0 = Today
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
      return [...prev, activityData].sort((a, b) => a.startTime.localeCompare(b.startTime));
    });
    playCompletionChime();
  };

  const handleStartFocus = (act) => {
    setFocusActivity(act);
    setActiveTab('focus');
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

  // Reset Demo Data
  const handleResetData = () => {
    setActivities(INITIAL_ACTIVITIES);
    setTodos(INITIAL_TODOS);
    setMoodHistory(INITIAL_MOOD_HISTORY);
    setTrophies(TROPHIES);
    setStreak(5);
  };

  const pendingTodoCount = todos.filter(t => !t.completed).length;

  // View: Landing Page (User explicitly visited)
  if (currentView === 'landing') {
    return (
      <LandingPage onLaunchApp={() => setCurrentView('app')} />
    );
  }

  // Auth Gateway: If unauthenticated, show Tiimo Onboarding Screen
  if (!isAuthenticated) {
    return (
      <AuthView onOpenLanding={() => setCurrentView('landing')} />
    );
  }

  // Authenticated: Main Tiimo App Experience
  return (
    <div className="app-root-container">
      <PhoneFrame onOpenLanding={() => setCurrentView('landing')}>
        {/* Tiimo Header with User Greeting and Horizontal Date Strip */}
        <Header
          streak={streak}
          isSoundPlaying={isAmbientSoundPlaying}
          onToggleSound={toggleAmbientSound}
          onOpenAddModal={() => {
            setEditingActivity(null);
            setIsAddModalOpen(true);
          }}
          selectedDayOffset={selectedDayOffset}
          onSelectDayOffset={setSelectedDayOffset}
          onOpenLanding={() => setCurrentView('landing')}
          onOpenProfile={() => setActiveTab('profile')}
        />

        {/* Main Viewport Container */}
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
              activity={focusActivity || activities.find(a => !a.isCompleted) || activities[0]}
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

          {activeTab === 'todo' && (
            <TodoView
              todos={todos}
              onToggleTodo={handleToggleTodo}
              onAddTodo={handleAddTodo}
              onDeleteTodo={handleDeleteTodo}
              onScheduleTodoToTimeline={handleScheduleTodoToTimeline}
            />
          )}

          {activeTab === 'profile' && (
            <ProfileView
              trophies={trophies}
              streak={streak}
              currentTheme={currentTheme}
              onChangeTheme={setCurrentTheme}
              onResetData={handleResetData}
              onOpenLanding={() => setCurrentView('landing')}
            />
          )}
        </main>

        {/* Floating Docked Bottom Navigation Bar + FAB */}
        <BottomNavBar
          activeTab={activeTab}
          onSelectTab={(tabId) => {
            if (tabId === 'focus' && !focusActivity) {
              const target = activities.find(a => !a.isCompleted) || activities[0];
              setFocusActivity(target);
            }
            setActiveTab(tabId);
          }}
          onOpenAddModal={() => {
            setEditingActivity(null);
            setIsAddModalOpen(true);
          }}
          pendingTodoCount={pendingTodoCount}
        />

        {/* Create / Edit Activity Modal */}
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
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
