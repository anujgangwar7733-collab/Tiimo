import express from 'express';
import { 
  createCheckoutSession, 
  createPortalSession, 
  handleWebhook,
  demoUpgrade
} from '../controllers/subscriptionController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/create-checkout-session', protect, createCheckoutSession);
router.post('/portal', protect, createPortalSession);
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);
router.post('/demo-upgrade', protect, demoUpgrade);

export default router;
