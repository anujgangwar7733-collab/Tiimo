import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';

export const protect = async (req, res, next) => {
  try {
    let token = null;

    // 1. Check Authorization Bearer header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    } 
    // 2. Check HTTP-only cookie
    else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      throw new ApiError(401, 'Authentication required. Please log in.');
    }

    // Verify token
    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET || 'tiimo_cloud_production_super_secret_jwt_key_2026'
    );

    // Find user by ID
    const user = await User.findById(decoded.id);
    if (!user) {
      throw new ApiError(401, 'User account associated with this token no longer exists.');
    }

    req.user = user;
    req.user.id = user._id.toString();
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new ApiError(401, 'Invalid authentication token.'));
    }
    if (error.name === 'TokenExpiredError') {
      return next(new ApiError(401, 'Authentication token has expired. Please log in again.'));
    }
    next(error);
  }
};

// Alias requested in architectural specs
export const requireAuth = protect;
