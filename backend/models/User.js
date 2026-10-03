import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const subscriptionSchema = new mongoose.Schema(
  {
    plan: {
      type: String,
      enum: ['free', 'pro_monthly', 'pro_yearly'],
      default: 'free'
    },
    status: {
      type: String,
      enum: ['active', 'canceled', 'past_due', 'incomplete'],
      default: 'active'
    },
    stripeCustomerId: {
      type: String,
      default: null,
      index: true
    },
    stripeSubscriptionId: {
      type: String,
      default: null
    },
    subscriptionEndsAt: {
      type: Date,
      default: null
    }
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your full name'],
      trim: true,
      maxLength: [70, 'Name cannot exceed 70 characters']
    },
    email: {
      type: String,
      required: [true, 'Please provide your email address'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/,
        'Please provide a valid email address'
      ]
    },
    passwordHash: {
      type: String,
      select: false // Never exposed in queries by default
    },
    avatar: {
      type: String,
      default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    },
    timezone: {
      type: String,
      default: 'UTC'
    },
    googleId: {
      type: String,
      default: null,
      index: true
    },
    subscription: {
      type: subscriptionSchema,
      default: () => ({
        plan: 'free',
        status: 'active',
        stripeCustomerId: null,
        stripeSubscriptionId: null,
        subscriptionEndsAt: null
      })
    },
    preferences: {
      theme: {
        type: String,
        enum: ['calm-cream', 'deep-charcoal', 'warm-minimal', 'dark-slate'],
        default: 'calm-cream'
      },
      soundEnabled: {
        type: Boolean,
        default: true
      },
      hapticFeedback: {
        type: Boolean,
        default: true
      },
      notificationEnabled: {
        type: Boolean,
        default: true
      }
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual property to check if user has active Pro access
userSchema.virtual('isPremium').get(function () {
  if (!this.subscription) return false;
  const isPaidPlan = this.subscription.plan === 'pro_monthly' || this.subscription.plan === 'pro_yearly';
  const isActiveStatus = this.subscription.status === 'active';
  const isNotExpired = !this.subscription.subscriptionEndsAt || new Date(this.subscription.subscriptionEndsAt) > new Date();
  return isPaidPlan && isActiveStatus && isNotExpired;
});

// Virtual password setter to hash password into passwordHash
userSchema.virtual('password').set(function (plainText) {
  this._plainPassword = plainText;
});

userSchema.pre('save', async function (next) {
  if (this._plainPassword) {
    const salt = await bcrypt.genSalt(12);
    this.passwordHash = await bcrypt.hash(this._plainPassword, salt);
  }
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.passwordHash) return false;
  return await bcrypt.compare(candidatePassword, this.passwordHash);
};

// Generate JWT Auth Token
userSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    { 
      id: this._id, 
      email: this.email,
      plan: this.subscription?.plan || 'free',
      isPremium: this.isPremium
    },
    process.env.JWT_SECRET || 'tiimo_cloud_production_super_secret_jwt_key_2026',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Sanitize user object for JSON responses
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  delete obj.__v;
  return obj;
};

export const User = mongoose.model('User', userSchema);
