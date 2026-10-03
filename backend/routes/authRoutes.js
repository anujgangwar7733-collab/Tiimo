import express from 'express';
import { 
  register, 
  login, 
  authGoogle, 
  logout, 
  getMe, 
  updateMe 
} from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { authLimiter } from '../middlewares/rateLimiter.js';
import { validate } from '../middlewares/validate.js';
import { 
  registerSchema, 
  loginSchema, 
  updateProfileSchema 
} from '../validations/authValidation.js';

const router = express.Router();

router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/google', authLimiter, authGoogle);
router.post('/logout', logout);
router.get('/me', protect, getMe);
router.put('/me', protect, validate(updateProfileSchema), updateMe);

export default router;
