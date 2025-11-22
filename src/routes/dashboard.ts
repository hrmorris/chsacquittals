import express from 'express';
import { executeQuery } from '../config/database';
import { authenticateToken } from './auth';
import { logger } from '../utils/logger';

const router = express.Router();

// Types
interface DashboardStats {
  totalRecords: number;
  totalAmount: number;
  totalFacilities: number;
  totalEmployees: number;
  recentUploads: number;
  pendingReports: number;
}

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string[];
    borderColor: string[];
  }[];
}

interface RecentActivity {
  id: number;
  type: 'upload' | 'export' | 'login' | 'report';
  description: string;
  timestamp: Date;
  user: string;
}

interface FacilitySummary {
  facilityName: string;
  goodsServicesTotal: number;
  salariesTotal: number;
  employeeCount: number;
  lastUpdated: Date;
}

// Get dashboard overview
router.get('/overview', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id;

    // Get total records
    const goodsServicesCount = await executeQuery('SELECT COUNT(*) as count FROM goods_services_data');
    const salariesForm1Count = await executeQuery('SELECT COUNT(*) as count FROM salaries_form1_data');
    const salaryEntryForm2Count = await executeQuery('SELECT COUNT(*) as count FROM salary_entry_form2_data');

    // Get total amounts
    const goodsServicesTotal = await executeQuery('SELECT SUM(total_cost) as total FROM goods_services_data');
    const salariesForm1Total = await executeQuery('SELECT SUM(salary_amount) as total FROM salaries_form1_data');
    const salaryEntryForm2Total = await executeQuery('SELECT SUM(net_salary) as total FROM salary_entry_form2_data');

    // Get unique facilities
    const facilitiesCount = await executeQuery('SELECT COUNT(DISTINCT facility_name) as count FROM goods_services_data');

    // Get unique employees
    const employeesForm1 = await executeQuery('SELECT COUNT(DISTINCT employee_name) as count FROM salaries_form1_data');
    const employeesForm2 = await executeQuery('SELECT COUNT(DISTINCT employee_name) as count FROM salary_entry_form2_data');

    // Get recent uploads (last 7 days)
    const recentUploads = await executeQuery(
      `SELECT COUNT(*) as count FROM (
        SELECT uploaded_at FROM goods_services_data WHERE uploaded_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        UNION ALL
        SELECT uploaded_at FROM salaries_form1_data WHERE uploaded_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        UNION ALL
        SELECT uploaded_at FROM salary_entry_form2_data WHERE uploaded_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      ) as recent_uploads`
    );

    const stats: DashboardStats = {
      totalRecords: (goodsServicesCount[0]?.count || 0) + 
                   (salariesForm1Count[0]?.count || 0) + 
                   (salaryEntryForm2Count[0]?.count || 0),
      totalAmount: (goodsServicesTotal[0]?.total || 0) + 
                  (salariesForm1Total[0]?.total || 0) + 
                  (salaryEntryForm2Total[0]?.total || 0),
      totalFacilities: facilitiesCount[0]?.count || 0,
      totalEmployees: (employeesForm1[0]?.count || 0) + (employeesForm2[0]?.count || 0),
      recentUploads: recentUploads[0]?.count || 0,
      pendingReports: 0 // Placeholder
    };

    res.json({ stats });
  } catch (error) {
    logger.error('Get dashboard overview error:', error);
    res.status(500).json({ error: 'Failed to get dashboard overview' });
  }
});

// Get chart data for analytics
router.get('/charts', authenticateToken, async (req, res) => {
  try {
    // Get monthly data for the last 12 months
    const monthlyData = await executeQuery(`
      SELECT 
        DATE_FORMAT(uploaded_at, '%Y-%m') as month,
        SUM(total_cost) as goods_services_amount,
        COUNT(*) as goods_services_count
      FROM goods_services_data 
      WHERE uploaded_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(uploaded_at, '%Y-%m')
      ORDER BY month
    `);

    // Get facility breakdown
    const facilityData = await executeQuery(`
      SELECT 
        facility_name,
        SUM(total_cost) as total_amount,
        COUNT(*) as record_count
      FROM goods_services_data 
      GROUP BY facility_name 
      ORDER BY total_amount DESC 
      LIMIT 10
    `);

    // Get employee salary distribution
    const salaryData = await executeQuery(`
      SELECT 
        employee_name,
        SUM(salary_amount) as total_salary
      FROM salaries_form1_data 
      GROUP BY employee_name 
      ORDER BY total_salary DESC 
      LIMIT 10
    `);

    const chartData = {
      monthly: {
        labels: monthlyData.map((row: any) => row.month),
        datasets: [{
          label: 'Goods & Services Amount',
          data: monthlyData.map((row: any) => row.goods_services_amount || 0),
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgba(54, 162, 235, 1)'
        }]
      },
      facilities: {
        labels: facilityData.map((row: any) => row.facility_name),
        datasets: [{
          label: 'Total Amount',
          data: facilityData.map((row: any) => row.total_amount || 0),
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          borderColor: 'rgba(255, 99, 132, 1)'
        }]
      },
      salaries: {
        labels: salaryData.map((row: any) => row.employee_name),
        datasets: [{
          label: 'Total Salary',
          data: salaryData.map((row: any) => row.total_salary || 0),
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)'
        }]
      }
    };

    res.json({ chartData });
  } catch (error) {
    logger.error('Get chart data error:', error);
    res.status(500).json({ error: 'Failed to get chart data' });
  }
});

// Get recent activity
router.get('/recent-activity', authenticateToken, async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    // Get recent uploads
    const recentUploads = await executeQuery(`
      SELECT 
        'upload' as type,
        CONCAT('Uploaded ', 
          CASE 
            WHEN dataset = 'goods_services' THEN 'Goods & Services'
            WHEN dataset = 'salaries_form1' THEN 'Salaries Form 1'
            WHEN dataset = 'salary_entry_form2' THEN 'Salary Entry Form 2'
          END, ' data'
        ) as description,
        upload_time as timestamp,
        'System' as user
      FROM (
        SELECT 'goods_services' as dataset, uploaded_at as upload_time FROM goods_services_data 
        UNION ALL
        SELECT 'salaries_form1' as dataset, uploaded_at as upload_time FROM salaries_form1_data 
        UNION ALL
        SELECT 'salary_entry_form2' as dataset, uploaded_at as upload_time FROM salary_entry_form2_data
      ) as all_uploads
      ORDER BY upload_time DESC
      LIMIT ?
    `, [Number(limit)]);

    const activities: RecentActivity[] = recentUploads.map((row: any) => ({
      id: Math.random(), // In real app, use proper ID
      type: row.type as 'upload',
      description: row.description,
      timestamp: new Date(row.timestamp),
      user: row.user
    }));

    res.json({ activities });
  } catch (error) {
    logger.error('Get recent activity error:', error);
    res.status(500).json({ error: 'Failed to get recent activity' });
  }
});

// Get facility summary
router.get('/facility-summary', authenticateToken, async (req, res) => {
  try {
    const facilitySummary = await executeQuery(`
      SELECT 
        facility_name,
        SUM(total_cost) as goods_services_total,
        COUNT(*) as record_count,
        MAX(uploaded_at) as last_updated
      FROM goods_services_data 
      GROUP BY facility_name 
      ORDER BY goods_services_total DESC
    `);

    const summaries: FacilitySummary[] = facilitySummary.map((row: any) => ({
      facilityName: row.facility_name,
      goodsServicesTotal: row.goods_services_total || 0,
      salariesTotal: 0, // Would need to join with salaries tables
      employeeCount: 0, // Would need to count employees
      lastUpdated: new Date(row.last_updated)
    }));

    res.json({ summaries });
  } catch (error) {
    logger.error('Get facility summary error:', error);
    res.status(500).json({ error: 'Failed to get facility summary' });
  }
});

// Get quick stats
router.get('/quick-stats', authenticateToken, async (req, res) => {
  try {
    // Today's uploads
    const todayUploads = await executeQuery(`
      SELECT COUNT(*) as count FROM (
        SELECT uploaded_at FROM goods_services_data WHERE DATE(uploaded_at) = CURDATE()
        UNION ALL
        SELECT uploaded_at FROM salaries_form1_data WHERE DATE(uploaded_at) = CURDATE()
        UNION ALL
        SELECT uploaded_at FROM salary_entry_form2_data WHERE DATE(uploaded_at) = CURDATE()
      ) as today_uploads
    `);

    // This week's uploads
    const weekUploads = await executeQuery(`
      SELECT COUNT(*) as count FROM (
        SELECT uploaded_at FROM goods_services_data WHERE uploaded_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        UNION ALL
        SELECT uploaded_at FROM salaries_form1_data WHERE uploaded_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        UNION ALL
        SELECT uploaded_at FROM salary_entry_form2_data WHERE uploaded_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      ) as week_uploads
    `);

    // This month's uploads
    const monthUploads = await executeQuery(`
      SELECT COUNT(*) as count FROM (
        SELECT uploaded_at FROM goods_services_data WHERE uploaded_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        UNION ALL
        SELECT uploaded_at FROM salaries_form1_data WHERE uploaded_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        UNION ALL
        SELECT uploaded_at FROM salary_entry_form2_data WHERE uploaded_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      ) as month_uploads
    `);

    // Total amount this month
    const monthAmount = await executeQuery(`
      SELECT SUM(total) as amount FROM (
        SELECT SUM(total_cost) as total FROM goods_services_data WHERE uploaded_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        UNION ALL
        SELECT SUM(salary_amount) as total FROM salaries_form1_data WHERE uploaded_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        UNION ALL
        SELECT SUM(net_salary) as total FROM salary_entry_form2_data WHERE uploaded_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      ) as month_totals
    `);

    const quickStats = {
      todayUploads: todayUploads[0]?.count || 0,
      weekUploads: weekUploads[0]?.count || 0,
      monthUploads: monthUploads[0]?.count || 0,
      monthAmount: monthAmount[0]?.amount || 0
    };

    res.json({ quickStats });
  } catch (error) {
    logger.error('Get quick stats error:', error);
    res.status(500).json({ error: 'Failed to get quick stats' });
  }
});

// Get system status
router.get('/system-status', authenticateToken, async (req, res) => {
  try {
    const systemStatus = {
      database: 'connected',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      lastBackup: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      nextBackup: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      activeUsers: 1, // Placeholder
      totalStorage: '2.5GB',
      availableStorage: '15.5GB'
    };

    res.json({ systemStatus });
  } catch (error) {
    logger.error('Get system status error:', error);
    res.status(500).json({ error: 'Failed to get system status' });
  }
});

// Get notifications
router.get('/notifications', authenticateToken, async (req, res) => {
  try {
    const notifications = [
      {
        id: 1,
        type: 'info',
        title: 'System Update',
        message: 'New features have been added to the dashboard',
        timestamp: new Date().toISOString(),
        read: false
      },
      {
        id: 2,
        type: 'warning',
        title: 'Backup Reminder',
        message: 'Scheduled backup will run in 2 hours',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        read: true
      }
    ];

    res.json({ notifications });
  } catch (error) {
    logger.error('Get notifications error:', error);
    res.status(500).json({ error: 'Failed to get notifications' });
  }
});

// Mark notification as read
router.put('/notifications/:id/read', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // In a real app, update notification status in database
    logger.info(`Notification ${id} marked as read by user: ${req.user?.email}`);

    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    logger.error('Mark notification read error:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

export default router; 