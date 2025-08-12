import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { executeQuery } from '../config/database';
import { logger } from '../utils/logger';
import { pool } from '../config/database'; // Added missing import for pool

const router = express.Router();

// Types
interface User {
  id: number;
  email: string;
  name: string;
  created_at: Date;
}

interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface ProfileUpdateRequest {
  name?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
}

// Validation middleware
const validateRegistration = [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

const validateLogin = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
];

const validateProfileUpdate = [
  body('name').optional().trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('newPassword').optional().isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
];

// JWT Authentication middleware
export const authenticateToken = async (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret') as any;
    
    // Get user from database
    const users = await executeQuery('SELECT id, email, name, created_at FROM users WHERE id = ?', [decoded.userId]);
    
    if (!users || users.length === 0) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = users[0];
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

// Register new user
router.post('/register', validateRegistration, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const { name, email, password }: RegisterRequest = req.body;

    // Check if user already exists
    const existingUsers = await executeQuery('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUsers && existingUsers.length > 0) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user using simple approach
    await executeQuery(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );

    // Get the created user by email
    const users = await executeQuery('SELECT id, email, name, created_at FROM users WHERE email = ?', [email]);
    const user = users[0];

    if (!user) {
      throw new Error('Failed to retrieve created user');
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '24h' }
    );

    logger.info(`New user registered: ${email}`);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        created_at: user.created_at
      }
    });
  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login user
router.post('/login', validateLogin, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const { email, password }: LoginRequest = req.body;

    // Find user
    const users = await executeQuery('SELECT * FROM users WHERE email = ?', [email]);
    if (!users || users.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = users[0];

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '24h' }
    );

    logger.info(`User logged in: ${email}`);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        created_at: user.created_at
      }
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        created_at: user.created_at
      }
    });
  } catch (error) {
    logger.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

// Update user profile
router.put('/profile', authenticateToken, validateProfileUpdate, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const { name, email, currentPassword, newPassword }: ProfileUpdateRequest = req.body;
    const userId = req.user.id;

    // Get current user data
    const users = await executeQuery('SELECT * FROM users WHERE id = ?', [userId]);
    if (!users || users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = users[0];
    const updates: string[] = [];
    const values: any[] = [];

    // Update name if provided
    if (name && name !== user.name) {
      updates.push('name = ?');
      values.push(name);
    }

    // Update email if provided
    if (email && email !== user.email) {
      // Check if email is already taken
      const existingUsers = await executeQuery('SELECT id FROM users WHERE email = ? AND id != ?', [email, userId]);
      if (existingUsers && existingUsers.length > 0) {
        return res.status(400).json({ error: 'Email is already taken' });
      }
      updates.push('email = ?');
      values.push(email);
    }

    // Update password if provided
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ error: 'Current password is required to change password' });
      }

      // Verify current password
      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isValidPassword) {
        return res.status(400).json({ error: 'Current password is incorrect' });
      }

      // Hash new password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
      updates.push('password = ?');
      values.push(hashedPassword);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No changes to update' });
    }

    // Update user
    values.push(userId);
    await executeQuery(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    // Get updated user
    const updatedUsers = await executeQuery('SELECT id, email, name, created_at FROM users WHERE id = ?', [userId]);
    const updatedUser = updatedUsers[0];

    logger.info(`Profile updated for user: ${user.email}`);

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        created_at: updatedUser.created_at
      }
    });
  } catch (error) {
    logger.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Change password
router.post('/change-password', authenticateToken, [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Get current user
    const users = await executeQuery('SELECT password FROM users WHERE id = ?', [userId]);
    if (!users || users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = users[0];

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await executeQuery('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId]);

    logger.info(`Password changed for user ID: ${userId}`);

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    logger.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// Logout (client-side token removal)
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    logger.info(`User logged out: ${req.user.email}`);
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

// Verify token
router.get('/verify', authenticateToken, async (req, res) => {
  try {
    res.json({ 
      valid: true, 
      user: {
        id: req.user.id,
        email: req.user.email,
        name: req.user.name
      }
    });
  } catch (error) {
    logger.error('Token verification error:', error);
    res.status(401).json({ valid: false, error: 'Invalid token' });
  }
});

export default router; 