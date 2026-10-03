import express from 'express';
import { 
  getGamificationSummary, 
  logDailyMood, 
  checkStreak, 
  getHabitHeatmap, 
  getUserTrophies 
} from '../controllers/gamificationController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// All gamification routes require authentication
router.use(protect);

router.get('/summary', getGamificationSummary);
router.post('/mood', logDailyMood);
router.post('/streak/check', checkStreak);
router.get('/heatmap', getHabitHeatmap);
router.get('/trophies', getUserTrophies);

export default router;
