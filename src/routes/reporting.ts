import express from 'express';
import { executeQuery } from '../config/database';
import { logger } from '../utils/logger';

const router = express.Router();

// Get summary statistics
router.get('/summary', async (req, res) => {
  try {
    const goodsServices = await executeQuery('SELECT total_cost FROM goods_services_data');
    const salariesForm1 = await executeQuery('SELECT salary_amount FROM salaries_form1_data');
    const salaryEntryForm2 = await executeQuery('SELECT net_salary FROM salary_entry_form2_data');

    const totalGoodsServices = goodsServices.reduce((sum, item) => sum + (parseFloat(item.total_cost) || 0), 0);
    const totalSalariesForm1 = salariesForm1.reduce((sum, item) => sum + (parseFloat(item.salary_amount) || 0), 0);
    const totalSalaryEntryForm2 = salaryEntryForm2.reduce((sum, item) => sum + (parseFloat(item.net_salary) || 0), 0);

    res.json({
      summary: {
        goods_services_total: totalGoodsServices,
        salaries_form1_total: totalSalariesForm1,
        salary_entry_form2_total: totalSalaryEntryForm2,
        grand_total: totalGoodsServices + totalSalariesForm1 + totalSalaryEntryForm2
      },
      record_counts: {
        goods_services: goodsServices.length,
        salaries_form1: salariesForm1.length,
        salary_entry_form2: salaryEntryForm2.length
      }
    });

  } catch (error) {
    logger.error('Summary generation error:', error);
    res.status(500).json({ error: 'Failed to generate summary' });
  }
});

// Get facility summary
router.get('/facility-summary', async (req, res) => {
  try {
    const goodsServices = await executeQuery(`
      SELECT facility_name, 
             COUNT(*) as record_count, 
             SUM(total_cost) as total_amount
      FROM goods_services_data 
      GROUP BY facility_name
    `);
    
    const salariesForm1 = await executeQuery(`
      SELECT facility_name, 
             COUNT(*) as record_count, 
             SUM(salary_amount) as total_amount
      FROM salaries_form1_data 
      GROUP BY facility_name
    `);
    
    const salaryEntryForm2 = await executeQuery(`
      SELECT facility_name, 
             COUNT(*) as record_count, 
             SUM(net_salary) as total_amount
      FROM salary_entry_form2_data 
      GROUP BY facility_name
    `);

    res.json({
      goods_services: goodsServices,
      salaries_form1: salariesForm1,
      salary_entry_form2: salaryEntryForm2
    });

  } catch (error) {
    logger.error('Facility summary error:', error);
    res.status(500).json({ error: 'Failed to generate facility summary' });
  }
});

// Get detailed analytics
router.get('/analytics', async (req, res) => {
  try {
    // Top suppliers
    const topSuppliers = await executeQuery(`
      SELECT supplier, 
             COUNT(*) as transaction_count, 
             SUM(total_cost) as total_amount
      FROM goods_services_data 
      WHERE supplier IS NOT NULL AND supplier != ''
      GROUP BY supplier 
      ORDER BY total_amount DESC 
      LIMIT 10
    `);

    // Top positions by salary
    const topPositions = await executeQuery(`
      SELECT position, 
             COUNT(*) as employee_count, 
             AVG(salary_amount) as avg_salary,
             SUM(salary_amount) as total_salary
      FROM salaries_form1_data 
      GROUP BY position 
      ORDER BY avg_salary DESC 
      LIMIT 10
    `);

    // Monthly trends
    const monthlyTrends = await executeQuery(`
      SELECT 
        DATE_FORMAT(uploaded_at, '%Y-%m') as month,
        COUNT(*) as record_count,
        SUM(total_cost) as total_amount
      FROM goods_services_data 
      GROUP BY DATE_FORMAT(uploaded_at, '%Y-%m')
      ORDER BY month DESC
      LIMIT 12
    `);

    res.json({
      top_suppliers: topSuppliers,
      top_positions: topPositions,
      monthly_trends: monthlyTrends
    });

  } catch (error) {
    logger.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to generate analytics' });
  }
});

// Get employee summary
router.get('/employee-summary', async (req, res) => {
  try {
    const employees = await executeQuery(`
      SELECT 
        employee_name,
        position,
        salary_amount,
        payment_date,
        payment_method
      FROM salaries_form1_data 
      ORDER BY salary_amount DESC
    `);

    const employeeDetails = await executeQuery(`
      SELECT 
        employee_name,
        position,
        basic_salary,
        allowances,
        deductions,
        net_salary,
        payment_status
      FROM salary_entry_form2_data 
      ORDER BY net_salary DESC
    `);

    res.json({
      employees: employees,
      employee_details: employeeDetails
    });

  } catch (error) {
    logger.error('Employee summary error:', error);
    res.status(500).json({ error: 'Failed to generate employee summary' });
  }
});

export default router; 