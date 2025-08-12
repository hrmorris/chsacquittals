import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';

import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';
import { connectDatabase } from './config/database';

// Import routes
import authRoutes from './routes/auth';
import dataEntryRoutes from './routes/dataEntry';
import reportingRoutes from './routes/reporting';
import exportRoutes from './routes/export';
import settingsRoutes from './routes/settings';
import dashboardRoutes from './routes/dashboard';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      scriptSrcAttr: ["'unsafe-inline'"],
      imgSrc: ["'self'", "data:"],
      fontSrc: ["'self'", "https:", "data:"],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: []
    }
  }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: 'Too many requests from this IP, please try again later.',
});
app.use(limiter);

// Middleware
app.use(cors());
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/public', express.static(path.join(__dirname, '../public')));

// Serve the main HTML file at root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index-working.html'));
});

// Serve test page
app.get('/test', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/test.html'));
});

// Serve debug page
app.get('/debug', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/debug.html'));
});

// Serve simple test page
app.get('/simple-test', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/simple-test.html'));
});

// Serve simplified main page
app.get('/simple', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index-simple.html'));
});

// Serve register test page
app.get('/register-test', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/register-test.html'));
});

// Serve data entry page
app.get('/data-entry', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/data-entry.html'));
});

// Serve compiled TypeScript files
app.use('/dist', express.static(path.join(__dirname, '../dist')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV 
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/data-entry', dataEntryRoutes);
app.use('/api/reporting', reportingRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl 
  });
});

// Start server
async function startServer() {
  try {
    await connectDatabase();
    
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer(); 