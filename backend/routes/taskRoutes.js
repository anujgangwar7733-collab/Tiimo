import express from 'express';
import { 
  getTasks, 
  getTasksRange, 
  createTask, 
  updateTask, 
  deleteTask, 
  reorderTasks, 
  toggleSubtask 
} from '../controllers/taskController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validate.js';
import { 
  createTaskSchema, 
  updateTaskSchema, 
  reorderTasksSchema,
  dateQuerySchema,
  rangeQuerySchema
} from '../validations/taskValidation.js';

const router = express.Router();

// All task endpoints require authentication
router.use(protect);

router.get('/', validate(dateQuerySchema, 'query'), getTasks);
router.get('/range', validate(rangeQuerySchema, 'query'), getTasksRange);
router.post('/', validate(createTaskSchema), createTask);
router.put('/:id', validate(updateTaskSchema), updateTask);
router.delete('/:id', deleteTask);
router.post('/reorder', validate(reorderTasksSchema), reorderTasks);
router.patch('/:id/subtasks/:subtaskId', toggleSubtask);

export default router;
