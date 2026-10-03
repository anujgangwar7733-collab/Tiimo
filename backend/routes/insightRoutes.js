import express from 'express';
import { logFocusSession, getStats } from '../controllers/insightController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validate.js';
import { focusSessionSchema } from '../validations/insightValidation.js';

const router = express.Router();

router.use(protect);

router.post('/focus-session', validate(focusSessionSchema), logFocusSession);
router.get('/stats', getStats);

export default router;
