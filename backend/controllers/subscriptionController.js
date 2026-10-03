import Stripe from 'stripe';
import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock_stripe_key_tiimo', {
  apiVersion: '2023-10-16'
});

/**
 * @desc    Create Stripe Checkout Session for Tiimo Pro
 * @route   POST /api/subscription/create-checkout-session
 * @access  Private
 */
export const createCheckoutSession = async (req, res, next) => {
  try {
    const { plan = 'pro_monthly', successUrl, cancelUrl } = req.body;
    const user = req.user;

    const priceId = plan === 'pro_yearly'
      ? process.env.STRIPE_PRICE_YEARLY
      : process.env.STRIPE_PRICE_MONTHLY;

    const appOrigin = process.env.CLIENT_URL?.split(',')[0]?.trim() || 'http://localhost:5173';

    // 1. Ensure or retrieve Stripe customer ID
    let customerId = user.subscription?.stripeCustomerId;
    if (!customerId && process.env.STRIPE_SECRET_KEY) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: {
          userId: user._id.toString()
        }
      });
      customerId = customer.id;
      user.subscription.stripeCustomerId = customerId;
      await user.save();
    }

    // 2. Build Stripe Checkout Session
    if (process.env.STRIPE_SECRET_KEY && priceId) {
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1
          }
        ],
        mode: 'subscription',
        success_url: successUrl || `${appOrigin}/?session_id={CHECKOUT_SESSION_ID}&upgrade=success`,
        cancel_url: cancelUrl || `${appOrigin}/?upgrade=cancelled`,
        metadata: {
          userId: user._id.toString(),
          plan
        }
      });

      return res.status(200).json({
        success: true,
        checkoutUrl: session.url,
        sessionId: session.id
      });
    }

    // Fallback Mock URL in local development if Stripe keys are not yet configured
    const mockSessionId = `cs_test_${Date.now()}`;
    res.status(200).json({
      success: true,
      checkoutUrl: `${appOrigin}/?session_id=${mockSessionId}&upgrade=mock_success&plan=${plan}`,
      sessionId: mockSessionId,
      mock: true,
      message: 'Running in developer test mode. Set STRIPE_SECRET_KEY in .env for live Stripe gateway.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create Stripe Customer Portal session (manage card, pause, cancel)
 * @route   POST /api/subscription/portal
 * @access  Private
 */
export const createPortalSession = async (req, res, next) => {
  try {
    const user = req.user;
    const customerId = user.subscription?.stripeCustomerId;

    if (!customerId) {
      throw new ApiError(400, 'No active billing profile found for this account.');
    }

    const appOrigin = process.env.CLIENT_URL?.split(',')[0]?.trim() || 'http://localhost:5173';

    if (process.env.STRIPE_SECRET_KEY) {
      const portalSession = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: `${appOrigin}/`
      });

      return res.status(200).json({
        success: true,
        portalUrl: portalSession.url
      });
    }

    res.status(200).json({
      success: true,
      portalUrl: `${appOrigin}/`,
      mock: true
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Stripe Webhook Handler
 * @route   POST /api/subscription/webhook
 * @access  Public (Validated with Stripe Signature)
 */
export const handleWebhook = async (req, res, next) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    if (webhookSecret && sig) {
      // Must use raw unparsed body for webhook signature verification
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } else {
      // Fallback parsed payload if running in webhook test harness
      event = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    }
  } catch (err) {
    console.error(`⚠️ Stripe Webhook Signature Verification Failed:`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle specific subscription events
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.metadata?.userId;
        const plan = session.metadata?.plan || 'pro_monthly';

        if (userId) {
          const user = await User.findById(userId);
          if (user) {
            const durationDays = plan === 'pro_yearly' ? 365 : 30;
            const endsAt = new Date();
            endsAt.setDate(endsAt.getDate() + durationDays);

            user.subscription.plan = plan;
            user.subscription.status = 'active';
            user.subscription.stripeCustomerId = session.customer;
            user.subscription.stripeSubscriptionId = session.subscription;
            user.subscription.subscriptionEndsAt = endsAt;
            await user.save();
            console.log(`✅ Subscription activated for user ${user.email} (${plan})`);
          }
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        const customerId = invoice.customer;

        if (customerId) {
          const user = await User.findOne({ 'subscription.stripeCustomerId': customerId });
          if (user) {
            user.subscription.status = 'active';
            // Extend subscription by 30 days
            const currentEnd = user.subscription.subscriptionEndsAt 
              ? new Date(user.subscription.subscriptionEndsAt)
              : new Date();
            currentEnd.setDate(currentEnd.getDate() + 30);
            user.subscription.subscriptionEndsAt = currentEnd;
            await user.save();
            console.log(`✅ Recurring subscription renewed for ${user.email}`);
          }
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object;
        const customerId = sub.customer;

        if (customerId) {
          const user = await User.findOne({ 'subscription.stripeCustomerId': customerId });
          if (user) {
            user.subscription.status = 'canceled';
            await user.save();
            console.log(`ℹ️ Subscription canceled for ${user.email}`);
          }
        }
        break;
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object;
        const customerId = sub.customer;

        if (customerId) {
          const user = await User.findOne({ 'subscription.stripeCustomerId': customerId });
          if (user) {
            user.subscription.status = sub.status === 'active' ? 'active' : 'canceled';
            if (sub.current_period_end) {
              user.subscription.subscriptionEndsAt = new Date(sub.current_period_end * 1000);
            }
            await user.save();
          }
        }
        break;
      }

      default:
        console.log(`Unhandled Stripe event type: ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Error handling webhook event:', error);
    next(error);
  }
};

/**
 * @desc    Developer / Demo instant upgrade toggle (for testing)
 * @route   POST /api/subscription/demo-upgrade
 * @access  Private
 */
export const demoUpgrade = async (req, res, next) => {
  try {
    const { plan = 'pro_monthly' } = req.body;
    const user = req.user;

    const endsAt = new Date();
    endsAt.setDate(endsAt.getDate() + (plan === 'pro_yearly' ? 365 : 30));

    user.subscription.plan = plan;
    user.subscription.status = 'active';
    user.subscription.subscriptionEndsAt = endsAt;
    await user.save();

    res.status(200).json({
      success: true,
      message: `Account upgraded to ${plan} (Tiimo Pro Demo)`,
      user
    });
  } catch (error) {
    next(error);
  }
};
