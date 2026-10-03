import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { apiLimiter } from './middlewares/rateLimiter.js';
import { ApiError } from './utils/ApiError.js';

// Route Imports
import authRoutes from './routes/authRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import insightRoutes from './routes/insightRoutes.js';
import subscriptionRoutes from './routes/subscriptionRoutes.js';
import gamificationRoutes from './routes/gamificationRoutes.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Trust proxy for rate limiting behind reverse proxies (Render, Railway, Vercel)
app.set('trust proxy', 1);

// CORS Configuration
const clientUrls = (process.env.CLIENT_URL || '')
  .split(',')
  .map((u) => u.trim())
  .filter(Boolean);

const allowedOrigins = [
  ...clientUrls,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://localhost:4173'
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, capacitor, curl, postman)
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        origin.endsWith('.vercel.app') ||
        origin.endsWith('.onrender.com') ||
        origin.endsWith('.railway.app')
      ) {
        return callback(null, true);
      }
      return callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'stripe-signature']
  })
);

// Note: Stripe webhook route requires raw body for signature verification
// Handle raw webhook payload before general JSON body parser
app.use('/api/subscription/webhook', express.raw({ type: 'application/json' }));

// Body Parsers & Cookie Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser(process.env.COOKIE_SECRET || 'tiimo_cloud_production_super_secret_cookie_key_2026'));

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    app: 'Tiimo Planner Cloud REST API',
    version: '2.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// General API Rate Limiter
app.use('/api', apiLimiter);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/insights', insightRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/gamification', gamificationRoutes);

// Catch 404 for unhandled routes
app.use((req, res, next) => {
  next(new ApiError(404, `Endpoint not found: ${req.method} ${req.originalUrl}`));
});

// Centralized Error Handling Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`🚀 Tiimo Cloud API running in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(`🔗 Local Server: http://localhost:${PORT}`);
  console.log(`🩺 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`💳 Subscriptions: Stripe Webhook mounted at /api/subscription/webhook`);
  console.log(`===============================================`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection Error: ${err.message}`);
  // In non-critical development, log without crashing
  if (process.env.NODE_ENV === 'production') {
    server.close(() => process.exit(1));
  }
});

export default app;
