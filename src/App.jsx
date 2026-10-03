import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { GamificationProvider, useGamification } from './context/GamificationContext';
import AuthView from './components/AuthView';
import PhoneFrame from './components/PhoneFrame';
import Header from './components/Header';
import BottomNavBar from './components/BottomNavBar';
import TimelineView from './components/TimelineView';
import FocusTimer from './components/FocusTimer';
import TodoView from './components/TodoView';
import ProfileView from './components/ProfileView';
import InsightsView from './components/InsightsView';
import ActivityModal from './components/ActivityModal';
import LandingPage from './components/LandingPage';
import { Sparkles } from 'lucide-react';

import { 
  loadActivities, saveActivities, 
  loadTodos, saveTodos, 
  loadMoods, saveMoods, 
  loadTrophies, saveTrophies, 
  loadStreak, saveStreak 
} from './utils/storage';
import { INITIAL_ACTIVITIES, INITIAL_TODOS, INITIAL_MOOD_HISTORY, TROPHIES } from './utils/initialData';
import { playAmbientSound, stopAmbientSound, playCompletionChime } from './utils/audioEngine';
import { taskApi } from './services/api';
import './App.css';
import './components/LandingPage.css';

function MainApp() {
  const { user, isAuthenticated } = useAuth();
  const { streak: gamificationStreak, onTaskCompleted, milestoneCelebrated, trophies: gamifiedTrophies } = useGamification();
  const [showInsightsModal, setShowInsightsModal] = useState(false);

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
  const currentStreakNumber = gamificationStreak?.currentStreak ?? streak;
  const activeTrophies = (gamifiedTrophies && gamifiedTrophies.length > 0) ? gamifiedTrophies : trophies;
  const [currentTheme, setCurrentTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('tiimo_theme');
      if (saved) return saved;
    }
    return 'calm-cream';
  });

  // Core navigation tabs: 'timeline' | 'todo' | 'focus' | 'profile'
  const [activeTab, setActiveTab] = useState('timeline');
  const [selectedDayOffset, setSelectedDayOffset] = useState(0); // 0 = Today
  const [focusActivity, setFocusActivity] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [isAmbientSoundPlaying, setIsAmbientSoundPlaying] = useState(false);
  const [isTasksLoading, setIsTasksLoading] = useState(false);
  const [tasksError, setTasksError] = useState(null);

  // Helper to format date as YYYY-MM-DD
  const getDateString = (offset = 0) => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return d.toISOString().split('T')[0];
  };

  const currentDateStr = getDateString(selectedDayOffset);

  // Sync state to LocalStorage for offline resilience
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

  // Apply Theme Attribute & Persist
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', currentTheme);
    try {
      localStorage.setItem('tiimo_theme', currentTheme);
    } catch (e) {
      // Ignore storage error
    }
  }, [currentTheme]);

  // Fetch persistent activities from cloud MongoDB when authenticated
  useEffect(() => {
    if (!isAuthenticated) return;

    let isMounted = true;
    const fetchCloudTasks = async () => {
      setIsTasksLoading(true);
      setTasksError(null);
      try {
        const res = await taskApi.getByDate(currentDateStr);
        if (isMounted && res && Array.isArray(res.tasks)) {
          if (res.tasks.length > 0) {
            const mapped = res.tasks.map(t => ({
              id: t._id || t.id,
              title: t.title,
              category: t.category,
              icon: t.icon || 'Clock',
              tintId: t.tintId || 'mint',
              color: t.color || '#52B788',
              startTime: t.startTime,
              durationMinutes: t.duration || 30,
              isCompleted: !!t.isCompleted,
              subtasks: t.subtasks || [],
              notes: t.notes || ''
            }));
            setActivities(mapped);
          } else if (selectedDayOffset === 0 && activities.length === 0) {
            // First time launch: populate initial routines and persist to database
            setActivities(INITIAL_ACTIVITIES);
            INITIAL_ACTIVITIES.forEach(initAct => {
              taskApi.create({
                title: initAct.title,
                category: initAct.category || 'Routine',
                icon: initAct.icon || 'Clock',
                tintId: initAct.tintId || 'mint',
                date: currentDateStr,
                startTime: initAct.startTime,
                duration: initAct.durationMinutes || 30,
                isCompleted: initAct.isCompleted || false,
                subtasks: initAct.subtasks || []
              }).catch(() => {});
            });
          } else if (res.tasks.length === 0) {
            setActivities([]);
          }
        }
      } catch (err) {
        if (isMounted) {
          // If server offline or first boot, gracefully retain local activities
          if (err.code !== 'NETWORK_OFFLINE') {
            console.warn('Task sync notice:', err.message);
          }
        }
      } finally {
        if (isMounted) setIsTasksLoading(false);
      }
    };

    fetchCloudTasks();
    return () => { isMounted = false; };
  }, [isAuthenticated, currentDateStr]);

  // Toggle between Light Mode (Calm Cream) and Dark Mode (Deep Charcoal)
  const toggleTheme = () => {
    setCurrentTheme(prev => (prev === 'calm-cream' ? 'deep-charcoal' : 'calm-cream'));
  };

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

  // Activity Actions with Persistent Cloud CRUD
  const handleToggleComplete = async (id) => {
    let nextState = false;
    setActivities(prev => prev.map(act => {
      if (act.id === id) {
        nextState = !act.isCompleted;
        if (nextState) {
          playCompletionChime();
          if (onTaskCompleted) {
            onTaskCompleted();
          }
        }
        return { ...act, isCompleted: nextState };
      }
      return act;
    }));

    if (isAuthenticated && id && id.length === 24) {
      try {
        await taskApi.update(id, { isCompleted: nextState });
      } catch (e) {
        console.warn('Status sync notice:', e.message);
      }
    }
  };

  const handleToggleSubtask = async (actId, subId) => {
    let targetAct = null;
    setActivities(prev => prev.map(act => {
      if (act.id === actId && act.subtasks) {
        const updatedSubs = act.subtasks.map(s => 
          s.id === subId ? { ...s, completed: !s.completed } : s
        );
        targetAct = { ...act, subtasks: updatedSubs };
        return targetAct;
      }
      return act;
    }));

    if (isAuthenticated && actId && actId.length === 24 && targetAct) {
      try {
        await taskApi.update(actId, { subtasks: targetAct.subtasks });
      } catch (e) {
        console.warn('Subtask sync notice:', e.message);
      }
    }
  };

  const handleDeleteActivity = async (id) => {
    setActivities(prev => prev.filter(a => a.id !== id));
    if (isAuthenticated && id && id.length === 24) {
      try {
        await taskApi.delete(id);
      } catch (e) {
        console.warn('Delete sync notice:', e.message);
      }
    }
  };

  const handleSaveActivity = async (activityData) => {
    playCompletionChime();

    const isEditing = activities.some(a => a.id === activityData.id);
    const tempId = activityData.id || `act-${Date.now()}`;
    const formatted = { ...activityData, id: tempId };

    setActivities(prev => {
      if (isEditing) {
        return prev.map(a => a.id === activityData.id ? activityData : a);
      }
      return [...prev, formatted].sort((a, b) => a.startTime.localeCompare(b.startTime));
    });

    if (isAuthenticated) {
      try {
        const payload = {
          title: activityData.title,
          category: activityData.category || 'General',
          icon: activityData.icon || 'Clock',
          tintId: activityData.tintId || 'mint',
          color: activityData.color || '#52B788',
          date: currentDateStr,
          startTime: activityData.startTime || '09:00',
          duration: activityData.durationMinutes || activityData.duration || 30,
          isCompleted: !!activityData.isCompleted,
          notes: activityData.notes || '',
          subtasks: activityData.subtasks || []
        };

        if (isEditing && activityData.id && activityData.id.length === 24) {
          await taskApi.update(activityData.id, payload);
        } else {
          const res = await taskApi.create(payload);
          if (res && res.task) {
            const serverId = res.task._id || res.task.id;
            setActivities(prev => prev.map(a => a.id === tempId ? { ...a, id: serverId } : a));
          }
        }
      } catch (e) {
        console.warn('Activity save sync notice:', e.message);
      }
    }
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

  const isDarkMode = currentTheme === 'deep-charcoal';

  // Authenticated: Main Tiimo App Experience
  return (
    <div className="app-root-container">
      <PhoneFrame 
        onOpenLanding={() => setCurrentView('landing')}
        currentTheme={currentTheme}
        onToggleTheme={toggleTheme}
      >
        {/* Tiimo Header with User Greeting and Horizontal Date Strip */}
        <Header
          streak={currentStreakNumber}
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
          currentTheme={currentTheme}
          onToggleTheme={toggleTheme}
          onOpenInsights={() => setShowInsightsModal(true)}
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
              isDarkMode={isDarkMode}
              isLoading={isTasksLoading}
              syncError={tasksError}
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
              isDarkMode={isDarkMode}
            />
          )}

          {activeTab === 'todo' && (
            <TodoView
              todos={todos}
              onToggleTodo={handleToggleTodo}
              onAddTodo={handleAddTodo}
              onDeleteTodo={handleDeleteTodo}
              onScheduleTodoToTimeline={handleScheduleTodoToTimeline}
              isDarkMode={isDarkMode}
            />
          )}

          {activeTab === 'profile' && (
            <ProfileView
              trophies={activeTrophies}
              streak={currentStreakNumber}
              currentTheme={currentTheme}
              onChangeTheme={setCurrentTheme}
              onToggleTheme={toggleTheme}
              onResetData={handleResetData}
              onOpenLanding={() => setCurrentView('landing')}
              onOpenInsights={() => setShowInsightsModal(true)}
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
          isDarkMode={isDarkMode}
        />

        {/* Gamification & Consistency Insights Modal / Drawer */}
        {showInsightsModal && (
          <div className="tiimo-modal-backdrop" onClick={() => setShowInsightsModal(false)}>
            <div className="tiimo-insights-modal-content" onClick={(e) => e.stopPropagation()}>
              <InsightsView onClose={() => setShowInsightsModal(false)} isDarkMode={isDarkMode} />
            </div>
          </div>
        )}

        {/* Milestone Celebration Floating Toast */}
        {milestoneCelebrated && (
          <div className="tiimo-celebration-toast animate-bounce-in">
            <Sparkles size={16} />
            <span>{milestoneCelebrated}</span>
          </div>
        )}
      </PhoneFrame>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <GamificationProvider>
        <MainApp />
      </GamificationProvider>
    </AuthProvider>
  );
}
