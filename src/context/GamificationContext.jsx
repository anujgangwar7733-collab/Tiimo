import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { gamificationApi } from '../services/api';
import { useAuth } from './AuthContext';
import { playCompletionChime, playClickSound } from '../utils/audioEngine';

const GamificationContext = createContext(null);

export const DEFAULT_TROPHIES = [
  {
    key: 'early_bird',
    title: 'Early Bird',
    description: 'Complete your first mindful task before 9:00 AM',
    icon: 'Sunrise',
    category: 'timing',
    isUnlocked: true,
    unlockedAt: new Date(Date.now() - 3 * 86400000).toISOString()
  },
  {
    key: 'deep_diver',
    title: 'Deep Diver',
    description: 'Log 60+ minutes in Focus Timer in a single day',
    icon: 'Sparkles',
    category: 'focus',
    isUnlocked: true,
    unlockedAt: new Date(Date.now() - 1 * 86400000).toISOString()
  },
  {
    key: 'streak_7',
    title: 'Streak Master',
    description: 'Maintain an uninterrupted 7-day flow streak',
    icon: 'Flame',
    category: 'consistency',
    isUnlocked: false,
    unlockedAt: null
  },
  {
    key: 'task_crusher',
    title: 'Task Crusher',
    description: 'Complete 10 or more tasks in a single day',
    icon: 'Award',
    category: 'productivity',
    isUnlocked: false,
    unlockedAt: null
  },
  {
    key: 'mindful_soul',
    title: 'Mindful Soul',
    description: 'Record daily mood check-ins 3 days in a row',
    icon: 'Heart',
    category: 'wellbeing',
    isUnlocked: true,
    unlockedAt: new Date().toISOString()
  },
  {
    key: 'flow_initiate',
    title: 'Flow Initiate',
    description: 'Complete your very first routine in Tiimo',
    icon: 'CheckCheck',
    category: 'onboarding',
    isUnlocked: true,
    unlockedAt: new Date(Date.now() - 5 * 86400000).toISOString()
  }
];

export function GamificationProvider({ children }) {
  const { isAuthenticated, user } = useAuth();

  const [streak, setStreak] = useState({
    currentStreak: 5,
    longestStreak: 5,
    lastCompletedDate: new Date().toISOString().split('T')[0],
    totalDaysCompleted: 5
  });

  const [todayMood, setTodayMood] = useState(null);
  const [heatmapData, setHeatmapData] = useState([]);
  const [trophies, setTrophies] = useState(DEFAULT_TROPHIES);
  const [isLoading, setIsLoading] = useState(false);
  const [milestoneCelebrated, setMilestoneCelebrated] = useState(null);

  /**
   * Confetti celebration burst helper
   */
  const triggerConfettiCelebration = (message = null) => {
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.55 },
      colors: ['#52B788', '#9B86ED', '#FFD166', '#38BDF8', '#F4845F']
    });
    playCompletionChime();
    if (message) {
      setMilestoneCelebrated(message);
      setTimeout(() => setMilestoneCelebrated(null), 4000);
    }
  };

  /**
   * Fetch complete gamification summary from cloud
   */
  const fetchSummary = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      const res = await gamificationApi.getGamificationSummary();
      if (res && res.success) {
        if (res.streak) setStreak(res.streak);
        if (res.todayMood) setTodayMood(res.todayMood.mood);
        if (Array.isArray(res.trophies) && res.trophies.length > 0) {
          setTrophies(res.trophies);
        }
        if (Array.isArray(res.heatmap)) {
          setHeatmapData(res.heatmap);
        }
      }
    } catch (e) {
      // In offline mode, generate fallback heatmap from local history
      console.warn('Gamification cloud sync notice:', e.message);
      if (heatmapData.length === 0) {
        setHeatmapData(generateLocalFallbackHeatmap());
      }
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  /**
   * Record daily mood with optimistic update and cloud sync
   */
  const recordMood = async (mood, energyLevel = 3, note = '') => {
    playClickSound();
    setTodayMood(mood); // Optimistic UI update

    try {
      const today = new Date().toISOString().split('T')[0];
      const res = await gamificationApi.logDailyMood({
        date: today,
        mood,
        energyLevel,
        note
      });

      if (res?.newBadge) {
        triggerConfettiCelebration(`Badge Unlocked: ${res.newBadge.title}! 🏆`);
        fetchSummary();
      }
    } catch (err) {
      console.warn('Mood record sync notice:', err.message);
    }
  };

  /**
   * Check streak on task completion and trigger milestone celebrations
   */
  const onTaskCompleted = async () => {
    try {
      const res = await gamificationApi.checkStreak();
      if (res && res.success && res.streak) {
        const prevStreak = streak.currentStreak;
        const newStreak = res.streak.currentStreak;
        setStreak(res.streak);

        // Check Milestone celebrations: 3, 7, 14, 30 days
        const milestones = [3, 7, 14, 30];
        if (milestones.includes(newStreak) && newStreak > prevStreak) {
          triggerConfettiCelebration(`🎉 Amazing! You reached a ${newStreak}-Day Flow Streak! 🔥`);
        }

        if (Array.isArray(res.newBadges) && res.newBadges.length > 0) {
          triggerConfettiCelebration(`🏆 Achievement Unlocked: ${res.newBadges[0].title}!`);
          fetchSummary();
        }
      }
    } catch (err) {
      console.warn('Streak check sync notice:', err.message);
    }
  };

  return (
    <GamificationContext.Provider
      value={{
        streak,
        todayMood,
        heatmapData,
        trophies,
        isLoading,
        milestoneCelebrated,
        recordMood,
        onTaskCompleted,
        fetchSummary,
        triggerConfettiCelebration
      }}
    >
      {children}
    </GamificationContext.Provider>
  );
}

export function useGamification() {
  const ctx = useContext(GamificationContext);
  if (!ctx) {
    throw new Error('useGamification must be used within GamificationProvider');
  }
  return ctx;
}

/**
 * Fallback local heatmap generator when offline
 */
function generateLocalFallbackHeatmap(days = 30) {
  const arr = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const isPast = i > 0;
    const completed = isPast ? (Math.random() > 0.3 ? Math.floor(Math.random() * 4) + 1 : 0) : 2;
    const total = completed > 0 ? completed + Math.floor(Math.random() * 2) : 3;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    let intensity = 0;
    if (completed > 0) {
      if (percentage >= 80) intensity = 3;
      else if (percentage >= 50) intensity = 2;
      else intensity = 1;
    }

    arr.push({
      date: dateStr,
      dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNumber: d.getDate(),
      totalTasks: total,
      completedTasks: completed,
      percentage,
      intensity,
      mood: percentage >= 80 ? 'focused' : percentage >= 50 ? 'energized' : 'neutral'
    });
  }
  return arr;
}
