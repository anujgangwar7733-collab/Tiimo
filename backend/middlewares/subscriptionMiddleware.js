import { ApiError } from '../utils/ApiError.js';

/**
 * Middleware to gate premium features (AI Routine auto-schedule, Unlimited tasks, Full Sound Player)
 */
export const checkSubscription = (featureName = 'Pro feature') => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'Authentication required to verify subscription access.'));
    }

    // Verify user's active paid plan and active status
    if (!req.user.isPremium) {
      return res.status(402).json({
        success: false,
        error: `Upgrade to Tiimo Pro to unlock ${featureName}.`,
        code: 'PRO_SUBSCRIPTION_REQUIRED',
        feature: featureName,
        currentPlan: req.user.subscription?.plan || 'free',
        upgradeOptions: [
          {
            plan: 'pro_monthly',
            name: 'Tiimo Pro Monthly',
            price: '$7.99 / month',
            priceId: process.env.STRIPE_PRICE_MONTHLY || 'price_pro_monthly_test'
          },
          {
            plan: 'pro_yearly',
            name: 'Tiimo Pro Yearly (Best Value)',
            price: '$47.99 / year ($3.99/mo)',
            priceId: process.env.STRIPE_PRICE_YEARLY || 'price_pro_yearly_test',
            savings: 'Save 50%'
          }
        ]
      });
    }

    next();
  };
};
