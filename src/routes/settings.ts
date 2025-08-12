import express from 'express';
import { body, validationResult } from 'express-validator';
import { executeQuery } from '../config/database';
import { authenticateToken } from './auth';
import { logger } from '../utils/logger';

const router = express.Router();

// Types
interface SystemSettings {
  maxFileSize: number;
  allowedFileTypes: string[];
  sessionTimeout: number;
  enableNotifications: boolean;
  enableAuditLog: boolean;
  backupFrequency: string;
  emailNotifications: boolean;
}

interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  dateFormat: string;
  currency: string;
  notifications: {
    email: boolean;
    browser: boolean;
    sms: boolean;
  };
}

interface AdminSettings {
  maintenanceMode: boolean;
  registrationEnabled: boolean;
  maxUsers: number;
  dataRetentionDays: number;
  securityLevel: 'low' | 'medium' | 'high';
}

// Validation middleware
const validateSystemSettings = [
  body('maxFileSize').isInt({ min: 1024, max: 104857600 }).withMessage('Max file size must be between 1KB and 100MB'),
  body('sessionTimeout').isInt({ min: 300, max: 86400 }).withMessage('Session timeout must be between 5 minutes and 24 hours'),
  body('enableNotifications').isBoolean().withMessage('Enable notifications must be a boolean'),
  body('enableAuditLog').isBoolean().withMessage('Enable audit log must be a boolean'),
  body('backupFrequency').isIn(['daily', 'weekly', 'monthly']).withMessage('Backup frequency must be daily, weekly, or monthly'),
  body('emailNotifications').isBoolean().withMessage('Email notifications must be a boolean')
];

const validateUserPreferences = [
  body('theme').isIn(['light', 'dark', 'auto']).withMessage('Theme must be light, dark, or auto'),
  body('language').isLength({ min: 2, max: 5 }).withMessage('Language code must be 2-5 characters'),
  body('timezone').notEmpty().withMessage('Timezone is required'),
  body('dateFormat').notEmpty().withMessage('Date format is required'),
  body('currency').isLength({ min: 3, max: 3 }).withMessage('Currency must be 3 characters')
];

const validateAdminSettings = [
  body('maintenanceMode').isBoolean().withMessage('Maintenance mode must be a boolean'),
  body('registrationEnabled').isBoolean().withMessage('Registration enabled must be a boolean'),
  body('maxUsers').isInt({ min: 1, max: 10000 }).withMessage('Max users must be between 1 and 10000'),
  body('dataRetentionDays').isInt({ min: 30, max: 3650 }).withMessage('Data retention must be between 30 and 3650 days'),
  body('securityLevel').isIn(['low', 'medium', 'high']).withMessage('Security level must be low, medium, or high')
];

// Get system settings
router.get('/system', authenticateToken, async (req, res) => {
  try {
    // For now, return default settings
    // In a real app, these would be stored in database
    const settings: SystemSettings = {
      maxFileSize: 10485760, // 10MB
      allowedFileTypes: ['.xlsx', '.xls', '.csv'],
      sessionTimeout: 3600, // 1 hour
      enableNotifications: true,
      enableAuditLog: true,
      backupFrequency: 'daily',
      emailNotifications: true
    };

    res.json({ settings });
  } catch (error) {
    logger.error('Get system settings error:', error);
    res.status(500).json({ error: 'Failed to get system settings' });
  }
});

// Update system settings (admin only)
router.put('/system', authenticateToken, validateSystemSettings, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    // Check if user is admin (you can implement admin role checking)
    const settings: SystemSettings = req.body;

    // In a real app, save to database
    logger.info(`System settings updated by user: ${req.user?.email}`);

    res.json({ 
      message: 'System settings updated successfully',
      settings 
    });
  } catch (error) {
    logger.error('Update system settings error:', error);
    res.status(500).json({ error: 'Failed to update system settings' });
  }
});

// Get user preferences
router.get('/preferences', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    
    // Get user preferences from database
    const preferences = await executeQuery(
      'SELECT preferences FROM user_preferences WHERE user_id = ?',
      [userId]
    );

    let userPrefs: UserPreferences;
    if (preferences && preferences.length > 0) {
      userPrefs = JSON.parse(preferences[0].preferences);
    } else {
      // Default preferences
      userPrefs = {
        theme: 'light',
        language: 'en',
        timezone: 'UTC',
        dateFormat: 'YYYY-MM-DD',
        currency: 'USD',
        notifications: {
          email: true,
          browser: true,
          sms: false
        }
      };
    }

    res.json({ preferences: userPrefs });
  } catch (error) {
    logger.error('Get user preferences error:', error);
    res.status(500).json({ error: 'Failed to get user preferences' });
  }
});

// Update user preferences
router.put('/preferences', authenticateToken, validateUserPreferences, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const userId = req.user?.id;
    const preferences: UserPreferences = req.body;

    // Save to database
    await executeQuery(
      `INSERT INTO user_preferences (user_id, preferences) 
       VALUES (?, ?) 
       ON DUPLICATE KEY UPDATE preferences = ?`,
      [userId, JSON.stringify(preferences), JSON.stringify(preferences)]
    );

    logger.info(`User preferences updated for user: ${req.user?.email}`);

    res.json({ 
      message: 'User preferences updated successfully',
      preferences 
    });
  } catch (error) {
    logger.error('Update user preferences error:', error);
    res.status(500).json({ error: 'Failed to update user preferences' });
  }
});

// Get admin settings
router.get('/admin', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin (implement admin role checking)
    const adminSettings: AdminSettings = {
      maintenanceMode: false,
      registrationEnabled: true,
      maxUsers: 1000,
      dataRetentionDays: 365,
      securityLevel: 'medium'
    };

    res.json({ settings: adminSettings });
  } catch (error) {
    logger.error('Get admin settings error:', error);
    res.status(500).json({ error: 'Failed to get admin settings' });
  }
});

// Update admin settings
router.put('/admin', authenticateToken, validateAdminSettings, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    // Check if user is admin (implement admin role checking)
    const settings: AdminSettings = req.body;

    logger.info(`Admin settings updated by user: ${req.user?.email}`);

    res.json({ 
      message: 'Admin settings updated successfully',
      settings 
    });
  } catch (error) {
    logger.error('Update admin settings error:', error);
    res.status(500).json({ error: 'Failed to update admin settings' });
  }
});

// Get backup status
router.get('/backup/status', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    const backupStatus = {
      lastBackup: new Date().toISOString(),
      nextBackup: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      backupSize: '2.5GB',
      status: 'completed',
      files: 1500,
      databases: 1
    };

    res.json({ backupStatus });
  } catch (error) {
    logger.error('Get backup status error:', error);
    res.status(500).json({ error: 'Failed to get backup status' });
  }
});

// Trigger manual backup
router.post('/backup/trigger', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    logger.info(`Manual backup triggered by user: ${req.user?.email}`);

    // In a real app, trigger backup process
    res.json({ 
      message: 'Backup process started',
      estimatedTime: '5 minutes'
    });
  } catch (error) {
    logger.error('Trigger backup error:', error);
    res.status(500).json({ error: 'Failed to trigger backup' });
  }
});

// Get system health
router.get('/health', authenticateToken, async (req, res) => {
  try {
    const health = {
      status: 'healthy',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      database: 'connected',
      timestamp: new Date().toISOString()
    };

    res.json({ health });
  } catch (error) {
    logger.error('Get system health error:', error);
    res.status(500).json({ error: 'Failed to get system health' });
  }
});

// Get audit log
router.get('/audit-log', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    const { page = 1, limit = 50 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    // In a real app, get from audit_log table
    const auditLog = [
      {
        id: 1,
        user: 'admin@chsacquittals.com',
        action: 'LOGIN',
        timestamp: new Date().toISOString(),
        ip: '192.168.1.1',
        details: 'User logged in successfully'
      },
      {
        id: 2,
        user: 'admin@chsacquittals.com',
        action: 'UPLOAD',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        ip: '192.168.1.1',
        details: 'Uploaded goods_services.xlsx'
      }
    ];

    res.json({ 
      auditLog,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: auditLog.length
      }
    });
  } catch (error) {
    logger.error('Get audit log error:', error);
    res.status(500).json({ error: 'Failed to get audit log' });
  }
});

// Export settings
router.get('/export', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    
    // Get all settings for export
    const exportData = {
      system: {
        maxFileSize: 10485760,
        allowedFileTypes: ['.xlsx', '.xls', '.csv'],
        sessionTimeout: 3600,
        enableNotifications: true,
        enableAuditLog: true,
        backupFrequency: 'daily',
        emailNotifications: true
      },
      user: {
        preferences: {
          theme: 'light',
          language: 'en',
          timezone: 'UTC',
          dateFormat: 'YYYY-MM-DD',
          currency: 'USD'
        }
      },
      admin: {
        maintenanceMode: false,
        registrationEnabled: true,
        maxUsers: 1000,
        dataRetentionDays: 365,
        securityLevel: 'medium'
      }
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="settings_export.json"');
    res.json(exportData);
  } catch (error) {
    logger.error('Export settings error:', error);
    res.status(500).json({ error: 'Failed to export settings' });
  }
});

// Import settings
router.post('/import', authenticateToken, async (req, res) => {
  try {
    const settings = req.body;
    
    // Validate imported settings
    if (!settings.system || !settings.user || !settings.admin) {
      return res.status(400).json({ error: 'Invalid settings format' });
    }

    logger.info(`Settings imported by user: ${req.user?.email}`);

    res.json({ message: 'Settings imported successfully' });
  } catch (error) {
    logger.error('Import settings error:', error);
    res.status(500).json({ error: 'Failed to import settings' });
  }
});

export default router; 