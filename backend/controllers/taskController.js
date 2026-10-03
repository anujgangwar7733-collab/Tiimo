import { Task } from '../models/Task.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * @desc    Get tasks for a specific date (Daily Timeline)
 * @route   GET /api/tasks?date=YYYY-MM-DD
 * @access  Private
 */
export const getTasks = async (req, res, next) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const date = req.query.date || today;

    const tasks = await Task.find({
      userId: req.user._id,
      date
    }).sort({ order: 1, startTime: 1 });

    res.status(200).json({
      success: true,
      date,
      count: tasks.length,
      tasks
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get tasks across a date range (Weekly / Monthly views)
 * @route   GET /api/tasks/range?start=YYYY-MM-DD&end=YYYY-MM-DD
 * @access  Private
 */
export const getTasksRange = async (req, res, next) => {
  try {
    const { start, end } = req.query;

    if (!start || !end) {
      throw new ApiError(400, 'Both "start" and "end" date query parameters are required.');
    }

    const tasks = await Task.find({
      userId: req.user._id,
      date: { $gte: start, $lte: end }
    }).sort({ date: 1, order: 1, startTime: 1 });

    res.status(200).json({
      success: true,
      start,
      end,
      count: tasks.length,
      tasks
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new task / routine item
 * @route   POST /api/tasks
 * @access  Private
 */
export const createTask = async (req, res, next) => {
  try {
    const taskData = {
      ...req.body,
      userId: req.user._id
    };

    // If order is not specified, place it at the end of the day's timeline
    if (taskData.order === undefined) {
      const count = await Task.countDocuments({
        userId: req.user._id,
        date: taskData.date
      });
      taskData.order = count;
    }

    const task = await Task.create(taskData);

    res.status(201).json({
      success: true,
      message: 'Activity created successfully',
      task
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update task details, reschedule, or toggle completion
 * @route   PUT /api/tasks/:id
 * @access  Private
 */
export const updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;

    const task = await Task.findOne({ _id: id, userId: req.user._id });
    if (!task) {
      throw new ApiError(404, 'Task not found or access denied.');
    }

    // Apply allowed updates
    Object.assign(task, req.body);
    await task.save();

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      task
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a task
 * @route   DELETE /api/tasks/:id
 * @access  Private
 */
export const deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;

    const task = await Task.findOneAndDelete({ _id: id, userId: req.user._id });
    if (!task) {
      throw new ApiError(404, 'Task not found or access denied.');
    }

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reorder timeline activities (Drag & Drop support)
 * @route   POST /api/tasks/reorder
 * @access  Private
 */
export const reorderTasks = async (req, res, next) => {
  try {
    const { items } = req.body;

    const bulkOperations = items.map(item => ({
      updateOne: {
        filter: { _id: item.id, userId: req.user._id },
        update: {
          $set: {
            order: item.order,
            ...(item.startTime && { startTime: item.startTime })
          }
        }
      }
    }));

    await Task.bulkWrite(bulkOperations);

    res.status(200).json({
      success: true,
      message: 'Timeline reordered successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle subtask completion status
 * @route   PATCH /api/tasks/:id/subtasks/:subtaskId
 * @access  Private
 */
export const toggleSubtask = async (req, res, next) => {
  try {
    const { id, subtaskId } = req.params;

    const task = await Task.findOne({ _id: id, userId: req.user._id });
    if (!task) {
      throw new ApiError(404, 'Task not found');
    }

    const subtask = task.subtasks.id(subtaskId);
    if (!subtask) {
      throw new ApiError(404, 'Subtask not found');
    }

    subtask.completed = !subtask.completed;
    await task.save();

    res.status(200).json({
      success: true,
      subtask,
      task
    });
  } catch (error) {
    next(error);
  }
};
