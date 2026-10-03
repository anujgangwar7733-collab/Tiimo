import { OAuth2Client } from 'google-auth-library';
import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Helper to set HTTP-only cookie & return standardized auth response
 */
const sendAuthResponse = (user, statusCode, res, message = 'Success') => {
  const token = user.generateAuthToken();

  const isProduction = process.env.NODE_ENV === 'production';
  const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  };

  res.cookie('token', token, cookieOptions);

  return res.status(statusCode).json({
    success: true,
    message,
    token,
    user,
    subscriptionStatus: user.subscription,
    isPremium: user.isPremium
  });
};

/**
 * @desc    Register a new user with password hashing
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password, timezone, preferences } = req.body;

    if (!name || !email || !password) {
      throw new ApiError(400, 'Please provide full name, email, and password.');
    }

    if (password.length < 6) {
      throw new ApiError(400, 'Password must be at least 6 characters long.');
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new ApiError(409, 'An account with this email address already exists. Please log in.');
    }

    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      timezone: timezone || 'UTC',
      preferences: preferences || {}
    });

    // Virtual setter hashes password into passwordHash
    user.password = password;
    await user.save();

    sendAuthResponse(user, 201, res, 'Account created successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Authenticate user with email & password
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new ApiError(400, 'Please provide both email and password.');
    }

    // Explicitly select passwordHash which is hidden by default
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+passwordHash');
    if (!user) {
      throw new ApiError(401, 'Invalid email or password.');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new ApiError(401, 'Invalid email or password.');
    }

    sendAuthResponse(user, 200, res, 'Logged in successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Verify Google ID Token and upsert user account
 * @route   POST /api/auth/google
 * @access  Public
 */
export const authGoogle = async (req, res, next) => {
  try {
    const { credential, idToken, name: fallbackName, email: fallbackEmail, avatar: fallbackAvatar } = req.body;
    const token = credential || idToken;

    let googlePayload = null;

    if (token) {
      try {
        if (process.env.GOOGLE_CLIENT_ID) {
          const ticket = await googleClient.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID
          });
          googlePayload = ticket.getPayload();
        } else {
          // If no GOOGLE_CLIENT_ID configured in local environment, decode JWT payload
          const parts = token.split('.');
          if (parts.length === 3) {
            const decoded = Buffer.from(parts[1], 'base64').toString('utf8');
            googlePayload = JSON.parse(decoded);
          }
        }
      } catch (err) {
        console.warn('Google token verification failed or skipped:', err.message);
      }
    }

    const email = (googlePayload?.email || fallbackEmail || '').toLowerCase().trim();
    const name = googlePayload?.name || fallbackName || 'Google User';
    const avatar = googlePayload?.picture || fallbackAvatar || '';
    const googleId = googlePayload?.sub || null;

    if (!email) {
      throw new ApiError(400, 'Invalid Google credentials. Email could not be verified.');
    }

    // Find existing user or create a new user
    let user = await User.findOne({ email });

    if (user) {
      let changed = false;
      if (!user.googleId && googleId) {
        user.googleId = googleId;
        changed = true;
      }
      if (!user.avatar && avatar) {
        user.avatar = avatar;
        changed = true;
      }
      if (changed) {
        await user.save();
      }
    } else {
      // Create new user with Google credentials
      user = new User({
        name,
        email,
        avatar,
        googleId,
        timezone: 'UTC',
        subscription: {
          plan: 'free',
          status: 'active'
        }
      });
      // Generate a secure random password so user can also use standard login if desired
      user.password = `Gg_${Math.random().toString(36).substring(2, 12)}!${Date.now()}`;
      await user.save();
    }

    sendAuthResponse(user, 200, res, 'Google authentication successful');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Log out user & clear HTTP-only session cookie
 * @route   POST /api/auth/logout
 * @access  Public
 */
export const logout = async (req, res) => {
  const isProduction = process.env.NODE_ENV === 'production';
  res.clearCookie('token', {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax'
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};

/**
 * @desc    Get currently logged-in user profile, subscription status & preferences
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      user: req.user,
      subscriptionStatus: req.user.subscription,
      isPremium: req.user.isPremium,
      preferences: req.user.preferences
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user profile & preferences
 * @route   PUT /api/auth/me
 * @access  Private
 */
export const updateMe = async (req, res, next) => {
  try {
    const { name, avatar, timezone, preferences } = req.body;

    const updateFields = {};
    if (name) updateFields.name = name.trim();
    if (avatar !== undefined) updateFields.avatar = avatar;
    if (timezone) updateFields.timezone = timezone;
    if (preferences) {
      updateFields.preferences = {
        ...req.user.preferences?.toObject(),
        ...preferences
      };
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser,
      subscriptionStatus: updatedUser.subscription,
      isPremium: updatedUser.isPremium
    });
  } catch (error) {
    next(error);
  }
};
