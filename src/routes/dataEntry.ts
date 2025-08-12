import express from 'express';
import multer from 'multer';
import * as XLSX from 'xlsx';
import { executeQuery } from '../config/database';
import { logger } from '../utils/logger';

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '.xlsx');
  }
});

const upload = multer({ storage });

// Upload Goods and Services Form
router.post('/goods-services', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const workbook = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    let processedCount = 0;
    for (const row of data) {
      const rowData = row as any;
      await executeQuery(
        `INSERT INTO goods_services_data 
         (facility_name, reporting_period, item_description, quantity, unit_cost, total_cost, supplier, date_purchased, notes, file_name) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          rowData['Facility Name'] || '',
          rowData['Reporting Period'] || '',
          rowData['Item Description'] || '',
          rowData['Quantity'] || 0,
          rowData['Unit Cost'] || 0,
          rowData['Total Cost'] || 0,
          rowData['Supplier'] || '',
          rowData['Date Purchased'] || null,
          rowData['Notes'] || '',
          req.file.originalname
        ]
      );
      processedCount++;
    }

    return res.json({
      message: 'Data uploaded successfully',
      records_processed: processedCount
    });

  } catch (error) {
    logger.error('File processing error:', error);
    return res.status(500).json({ error: 'Failed to process file' });
  }
});

// Upload Salaries Form 1
router.post('/salaries-form1', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const workbook = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    let processedCount = 0;
    for (const row of data) {
      const rowData = row as any;
      await executeQuery(
        `INSERT INTO salaries_form1_data 
         (facility_name, employee_name, position, salary_amount, payment_date, payment_method, notes, file_name) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          rowData['Facility Name'] || '',
          rowData['Employee Name'] || '',
          rowData['Position'] || '',
          rowData['Salary Amount'] || 0,
          rowData['Payment Date'] || null,
          rowData['Payment Method'] || '',
          rowData['Notes'] || '',
          req.file.originalname
        ]
      );
      processedCount++;
    }

    return res.json({
      message: 'Data uploaded successfully',
      records_processed: processedCount
    });

  } catch (error) {
    logger.error('File processing error:', error);
    return res.status(500).json({ error: 'Failed to process file' });
  }
});

// Upload Salary Entry Form 2
router.post('/salary-entry-form2', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const workbook = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    let processedCount = 0;
    for (const row of data) {
      const rowData = row as any;
      await executeQuery(
        `INSERT INTO salary_entry_form2_data 
         (facility_name, employee_id, employee_name, position, basic_salary, allowances, deductions, net_salary, payment_date, payment_status, file_name) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          rowData['Facility Name'] || '',
          rowData['Employee ID'] || '',
          rowData['Employee Name'] || '',
          rowData['Position'] || '',
          rowData['Basic Salary'] || 0,
          rowData['Allowances'] || 0,
          rowData['Deductions'] || 0,
          rowData['Net Salary'] || 0,
          rowData['Payment Date'] || null,
          rowData['Payment Status'] || '',
          req.file.originalname
        ]
      );
      processedCount++;
    }

    return res.json({
      message: 'Data uploaded successfully',
      records_processed: processedCount
    });

  } catch (error) {
    logger.error('File processing error:', error);
    return res.status(500).json({ error: 'Failed to process file' });
  }
});

// Get all data
router.get('/data', async (req, res) => {
  try {
    const goodsServices = await executeQuery('SELECT * FROM goods_services_data ORDER BY uploaded_at DESC');
    const salariesForm1 = await executeQuery('SELECT * FROM salaries_form1_data ORDER BY uploaded_at DESC');
    const salaryEntryForm2 = await executeQuery('SELECT * FROM salary_entry_form2_data ORDER BY uploaded_at DESC');

    return res.json({
      goods_services: goodsServices,
      salaries_form1: salariesForm1,
      salary_entry_form2: salaryEntryForm2
    });

  } catch (error) {
    logger.error('Data retrieval error:', error);
    return res.status(500).json({ error: 'Failed to retrieve data' });
  }
});

// Manual data entry - Goods and Services
router.post('/goods-services-manual', async (req, res) => {
  try {
    const {
      facility_name,
      reporting_period,
      item_description,
      quantity,
      unit_cost,
      total_cost,
      supplier,
      date_purchased,
      notes
    } = req.body;

    // Validate required fields
    if (!facility_name || !reporting_period || !item_description || !quantity || !unit_cost || !total_cost) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    await executeQuery(
      `INSERT INTO goods_services_data 
       (facility_name, reporting_period, item_description, quantity, unit_cost, total_cost, supplier, date_purchased, notes, file_name) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        facility_name,
        reporting_period,
        item_description,
        quantity,
        unit_cost,
        total_cost,
        supplier || '',
        date_purchased || null,
        notes || '',
        'Manual Entry'
      ]
    );

    return res.json({
      message: 'Record saved successfully',
      success: true
    });

  } catch (error) {
    logger.error('Manual data entry error:', error);
    return res.status(500).json({ error: 'Failed to save record' });
  }
});

// Manual data entry - Salaries Form 1
router.post('/salaries-form1-manual', async (req, res) => {
  try {
    const {
      facility_name,
      employee_name,
      position,
      salary_amount,
      payment_date,
      payment_method,
      notes
    } = req.body;

    // Validate required fields
    if (!facility_name || !employee_name || !position || !salary_amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    await executeQuery(
      `INSERT INTO salaries_form1_data 
       (facility_name, employee_name, position, salary_amount, payment_date, payment_method, notes, file_name) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        facility_name,
        employee_name,
        position,
        salary_amount,
        payment_date || null,
        payment_method || '',
        notes || '',
        'Manual Entry'
      ]
    );

    return res.json({
      message: 'Record saved successfully',
      success: true
    });

  } catch (error) {
    logger.error('Manual data entry error:', error);
    return res.status(500).json({ error: 'Failed to save record' });
  }
});

// Manual data entry - Salary Entry Form 2
router.post('/salary-entry-form2-manual', async (req, res) => {
  try {
    const {
      facility_name,
      employee_id,
      employee_name,
      position,
      basic_salary,
      allowances,
      deductions,
      net_salary,
      payment_date,
      payment_status
    } = req.body;

    // Validate required fields
    if (!facility_name || !employee_id || !employee_name || !position || !basic_salary || !net_salary) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    await executeQuery(
      `INSERT INTO salary_entry_form2_data 
       (facility_name, employee_id, employee_name, position, basic_salary, allowances, deductions, net_salary, payment_date, payment_status, file_name) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        facility_name,
        employee_id,
        employee_name,
        position,
        basic_salary,
        allowances || 0,
        deductions || 0,
        net_salary,
        payment_date || null,
        payment_status || '',
        'Manual Entry'
      ]
    );

    return res.json({
      message: 'Record saved successfully',
      success: true
    });

  } catch (error) {
    logger.error('Manual data entry error:', error);
    return res.status(500).json({ error: 'Failed to save record' });
  }
});

export default router; 