import { UserStreak } from '../models/UserStreak.js';
import { MoodLog } from '../models/MoodLog.js';
import { Trophy } from '../models/Trophy.js';
import { Task } from '../models/Task.js';
import { ApiError } from '../utils/ApiError.js';

// Standard Badges Catalog
export const BADGE_CATALOG = [
  {
    key: 'early_bird',
    title: 'Early Bird',
    description: 'Complete your first mindful task before 9:00 AM',
    icon: 'Sunrise',
    category: 'timing'
  },
  {
    key: 'deep_diver',
    title: 'Deep Diver',
    description: 'Log 60+ minutes in Focus Timer in a single day',
    icon: 'Sparkles',
    category: 'focus'
  },
  {
    key: 'streak_7',
    title: 'Streak Master',
    description: 'Maintain an uninterrupted 7-day flow streak',
    icon: 'Flame',
    category: 'consistency'
  },
  {
    key: 'task_crusher',
    title: 'Task Crusher',
    description: 'Complete 10 or more tasks in a single day',
    icon: 'Award',
    category: 'productivity'
  },
  {
    key: 'mindful_soul',
    title: 'Mindful Soul',
    description: 'Record daily mood check-ins 3 days in a row',
    icon: 'Heart',
    category: 'wellbeing'
  },
  {
    key: 'flow_initiate',
    title: 'Flow Initiate',
    description: 'Complete your very first routine in Tiimo',
    icon: 'CheckCheck',
    category: 'onboarding'
  }
];

/**
 * @desc    Get complete gamification summary (Streak, Heatmap, Today's Mood, Trophies)
 * @route   GET /api/gamification/summary
 * @access  Private
 */
export const getGamificationSummary = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const today = new Date().toISOString().split('T')[0];

    // 1. Get or initialize UserStreak
    let streak = await UserStreak.findOne({ userId });
    if (!streak) {
      streak = await UserStreak.create({
        userId,
        currentStreak: 5, // Default onboarding streak
        longestStreak: 5,
        lastCompletedDate: today,
        totalDaysCompleted: 5
      });
    }

    // 2. Get today's mood
    const todayMood = await MoodLog.findOne({ userId, date: today });

    // 3. Get user's unlocked trophies
    const userTrophies = await Trophy.find({ userId });
    const unlockedMap = new Map(userTrophies.map(t => [t.badgeKey, t.unlockedAt]));

    const trophies = BADGE_CATALOG.map(badge => ({
      ...badge,
      isUnlocked: unlockedMap.has(badge.key),
      unlockedAt: unlockedMap.get(badge.key) || null
    }));

    // 4. Generate 30-day heatmap summary
    const heatmap = await generateHeatmapData(userId, 30);

    res.status(200).json({
      success: true,
      streak: {
        currentStreak: streak.currentStreak,
        longestStreak: streak.longestStreak,
        lastCompletedDate: streak.lastCompletedDate,
        totalDaysCompleted: streak.totalDaysCompleted
      },
      todayMood: todayMood || null,
      trophies,
      heatmap
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Record or update daily mood & energy check-in
 * @route   POST /api/gamification/mood
 * @access  Private
 */
export const logDailyMood = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { mood, energyLevel = 3, note = '', date } = req.body;

    const targetDate = date || new Date().toISOString().split('T')[0];

    if (!mood) {
      throw new ApiError(400, 'Mood selection is required.');
    }

    const validMoods = ['energized', 'focused', 'neutral', 'tired', 'overwhelmed'];
    if (!validMoods.includes(mood.toLowerCase())) {
      throw new ApiError(400, `Invalid mood. Allowed options: ${validMoods.join(', ')}`);
    }

    // Upsert mood log (1 per day per user)
    const moodLog = await MoodLog.findOneAndUpdate(
      { userId, date: targetDate },
      {
        $set: {
          mood: mood.toLowerCase(),
          energyLevel: Math.max(1, Math.min(5, Number(energyLevel) || 3)),
          note: note.trim()
        }
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    // Check if user has logged mood 3+ days in past week to unlock "mindful_soul"
    const recentMoodCount = await MoodLog.countDocuments({
      userId,
      date: {
        $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }
    });

    let newBadge = null;
    if (recentMoodCount >= 3) {
      const exists = await Trophy.findOne({ userId, badgeKey: 'mindful_soul' });
      if (!exists) {
        newBadge = await Trophy.create({
          userId,
          badgeKey: 'mindful_soul',
          title: 'Mindful Soul'
        });
      }
    }

    res.status(200).json({
      success: true,
      message: 'Mood check-in recorded successfully',
      moodLog,
      newBadge: newBadge ? { key: newBadge.badgeKey, title: newBadge.title } : null
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Check and recalculate streak and unlock badges on task completion
 * @route   POST /api/gamification/streak/check
 * @access  Private
 */
export const checkStreak = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const today = new Date().toISOString().split('T')[0];

    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterday = yesterdayDate.toISOString().split('T')[0];

    // Find all completed tasks for today
    const completedToday = await Task.find({
      userId,
      date: today,
      isCompleted: true
    });

    let streak = await UserStreak.findOne({ userId });
    if (!streak) {
      streak = new UserStreak({ userId, currentStreak: 0, longestStreak: 0 });
    }

    const newBadges = [];

    if (completedToday.length > 0) {
      // If today wasn't recorded as completed yet
      if (streak.lastCompletedDate !== today) {
        if (streak.lastCompletedDate === yesterday) {
          // Consecutive day: increment streak
          streak.currentStreak += 1;
        } else if (!streak.lastCompletedDate) {
          streak.currentStreak = 1;
        } else {
          // Streak was broken: reset to 1
          streak.currentStreak = 1;
        }

        streak.longestStreak = Math.max(streak.longestStreak, streak.currentStreak);
        streak.lastCompletedDate = today;
        streak.totalDaysCompleted += 1;
        await streak.save();
      }

      // Check Badges
      // 1. Flow Initiate (Completed at least 1 task)
      const hasFlow = await Trophy.findOne({ userId, badgeKey: 'flow_initiate' });
      if (!hasFlow) {
        const b = await Trophy.create({ userId, badgeKey: 'flow_initiate', title: 'Flow Initiate' });
        newBadges.push(b);
      }

      // 2. Early Bird (Task completed before 09:00 AM)
      const hasEarlyBird = await Trophy.findOne({ userId, badgeKey: 'early_bird' });
      if (!hasEarlyBird) {
        const isEarly = completedToday.some(t => t.startTime && t.startTime < '09:00');
        if (isEarly) {
          const b = await Trophy.create({ userId, badgeKey: 'early_bird', title: 'Early Bird' });
          newBadges.push(b);
        }
      }

      // 3. Task Crusher (10+ completed tasks today)
      if (completedToday.length >= 10) {
        const hasCrusher = await Trophy.findOne({ userId, badgeKey: 'task_crusher' });
        if (!hasCrusher) {
          const b = await Trophy.create({ userId, badgeKey: 'task_crusher', title: 'Task Crusher' });
          newBadges.push(b);
        }
      }

      // 4. Streak Master (7+ day streak)
      if (streak.currentStreak >= 7) {
        const hasStreak7 = await Trophy.findOne({ userId, badgeKey: 'streak_7' });
        if (!hasStreak7) {
          const b = await Trophy.create({ userId, badgeKey: 'streak_7', title: 'Streak Master' });
          newBadges.push(b);
        }
      }
    }

    res.status(200).json({
      success: true,
      streak: {
        currentStreak: streak.currentStreak,
        longestStreak: streak.longestStreak,
        lastCompletedDate: streak.lastCompletedDate,
        totalDaysCompleted: streak.totalDaysCompleted
      },
      newBadges
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get habit completion heatmap array for the past N days
 * @route   GET /api/gamification/heatmap?days=30
 * @access  Private
 */
export const getHabitHeatmap = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const days = Math.min(90, Math.max(7, Number(req.query.days) || 30));

    const heatmap = await generateHeatmapData(userId, days);

    res.status(200).json({
      success: true,
      days,
      heatmap
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user trophies and unlock status
 * @route   GET /api/gamification/trophies
 * @access  Private
 */
export const getUserTrophies = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const userTrophies = await Trophy.find({ userId });
    const unlockedMap = new Map(userTrophies.map(t => [t.badgeKey, t.unlockedAt]));

    const trophies = BADGE_CATALOG.map(badge => ({
      ...badge,
      isUnlocked: unlockedMap.has(badge.key),
      unlockedAt: unlockedMap.get(badge.key) || null
    }));

    res.status(200).json({
      success: true,
      totalBadges: BADGE_CATALOG.length,
      unlockedCount: userTrophies.length,
      trophies
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Helper to build heatmap data for past N days
 */
async function generateHeatmapData(userId, daysCount = 30) {
  const dates = [];
  const today = new Date();

  for (let i = daysCount - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    dates.push(d.toISOString().split('T')[0]);
  }

  const startDate = dates[0];
  const endDate = dates[dates.length - 1];

  // Fetch tasks and moods for this date range
  const [tasks, moods] = await Promise.all([
    Task.find({ userId, date: { $gte: startDate, $lte: endDate } }),
    MoodLog.find({ userId, date: { $gte: startDate, $lte: endDate } })
  ]);

  const taskMap = new Map();
  tasks.forEach(t => {
    if (!taskMap.has(t.date)) {
      taskMap.set(t.date, { total: 0, completed: 0 });
    }
    const stat = taskMap.get(t.date);
    stat.total++;
    if (t.isCompleted) stat.completed++;
  });

  const moodMap = new Map(moods.map(m => [m.date, m.mood]));

  return dates.map(date => {
    const stat = taskMap.get(date) || { total: 0, completed: 0 };
    const percentage = stat.total > 0 ? Math.round((stat.completed / stat.total) * 100) : 0;

    // Intensity: 0 (0%), 1 (1-49%), 2 (50-79%), 3 (80-100%)
    let intensity = 0;
    if (stat.completed > 0) {
      if (percentage >= 80) intensity = 3;
      else if (percentage >= 50) intensity = 2;
      else intensity = 1;
    }

    const d = new Date(date);
    return {
      date,
      dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNumber: d.getDate(),
      totalTasks: stat.total,
      completedTasks: stat.completed,
      percentage,
      intensity,
      mood: moodMap.get(date) || null
    };
  });
}
