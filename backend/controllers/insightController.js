import { DailyFocus } from '../models/DailyFocus.js';
import { Task } from '../models/Task.js';

/**
 * Calculate user streak based on consecutive days with activity
 */
const calculateStreak = async (userId, targetDateStr) => {
  const targetDate = new Date(targetDateStr);
  let streak = 1;
  let checkDate = new Date(targetDate);

  // Check previous consecutive days
  for (let i = 1; i <= 365; i++) {
    checkDate.setDate(checkDate.getDate() - 1);
    const dateStr = checkDate.toISOString().split('T')[0];

    // Check if user had a focus session or completed a task on this date
    const [focusRecord, completedTask] = await Promise.all([
      DailyFocus.findOne({ userId, date: dateStr, focusMinutesCompleted: { $gt: 0 } }),
      Task.findOne({ userId, date: dateStr, isCompleted: true })
    ]);

    if (focusRecord || completedTask) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
};

/**
 * @desc    Log completed focus timer session & wellbeing check-in
 * @route   POST /api/insights/focus-session
 * @access  Private
 */
export const logFocusSession = async (req, res, next) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const { 
      minutes, 
      date = today, 
      moodRating, 
      energyRating, 
      moodLabel, 
      feelings, 
      notes 
    } = req.body;

    const streak = await calculateStreak(req.user._id, date);

    // Upsert DailyFocus record for this date
    const dailyFocus = await DailyFocus.findOneAndUpdate(
      { userId: req.user._id, date },
      {
        $inc: {
          focusMinutesCompleted: minutes,
          focusSessionsCount: 1
        },
        $set: {
          streaksCount: streak,
          ...(moodRating && { moodRating }),
          ...(energyRating && { energyRating }),
          ...(moodLabel && { moodLabel }),
          ...(feelings && { feelings }),
          ...(notes !== undefined && { notes })
        }
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({
      success: true,
      message: 'Focus session recorded successfully',
      dailyFocus,
      currentStreak: streak
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get productivity statistics, streak, and completion rate
 * @route   GET /api/insights/stats
 * @access  Private
 */
export const getStats = async (req, res, next) => {
  try {
    const today = new Date();
    const past7Days = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      past7Days.push(d.toISOString().split('T')[0]);
    }

    const startDate = past7Days[0];
    const endDate = past7Days[past7Days.length - 1];

    // Fetch tasks & daily focus for the last 7 days
    const [tasks, focusLogs] = await Promise.all([
      Task.find({
        userId: req.user._id,
        date: { $gte: startDate, $lte: endDate }
      }),
      DailyFocus.find({
        userId: req.user._id,
        date: { $gte: startDate, $lte: endDate }
      })
    ]);

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.isCompleted).length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const totalFocusMinutes = focusLogs.reduce((acc, log) => acc + log.focusMinutesCompleted, 0);
    const totalFocusSessions = focusLogs.reduce((acc, log) => acc + log.focusSessionsCount, 0);

    // Current active streak
    const latestLog = await DailyFocus.findOne({ userId: req.user._id }).sort({ date: -1 });
    const currentStreak = latestLog ? latestLog.streaksCount : 1;

    // Daily breakdown for graph
    const dailyBreakdown = past7Days.map(dateStr => {
      const dayTasks = tasks.filter(t => t.date === dateStr);
      const dayFocus = focusLogs.find(f => f.date === dateStr);
      const d = new Date(dateStr);

      return {
        date: dateStr,
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
        tasksCount: dayTasks.length,
        completedTasksCount: dayTasks.filter(t => t.isCompleted).length,
        focusMinutes: dayFocus ? dayFocus.focusMinutesCompleted : 0,
        mood: dayFocus ? dayFocus.moodLabel : 'Neutral'
      };
    });

    res.status(200).json({
      success: true,
      currentStreak,
      totalFocusMinutes,
      totalFocusSessions,
      completionRate,
      tasksSummary: {
        total: totalTasks,
        completed: completedTasks,
        pending: totalTasks - completedTasks
      },
      dailyBreakdown
    });
  } catch (error) {
    next(error);
  }
};
