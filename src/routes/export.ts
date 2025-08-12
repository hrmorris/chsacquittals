import express from 'express';
import * as XLSX from 'xlsx';
import PDFDocument from 'pdfkit';
import { executeQuery } from '../config/database';
import { logger } from '../utils/logger';

const router = express.Router();

// Export all data as Excel files
router.get('/excel', async (req, res) => {
  try {
    const goodsServices = await executeQuery('SELECT * FROM goods_services_data');
    const salariesForm1 = await executeQuery('SELECT * FROM salaries_form1_data');
    const salaryEntryForm2 = await executeQuery('SELECT * FROM salary_entry_form2_data');

    // Create workbook with multiple sheets
    const workbook = XLSX.utils.book_new();

    // Add Goods and Services sheet
    const goodsServicesSheet = XLSX.utils.json_to_sheet(goodsServices);
    XLSX.utils.book_append_sheet(workbook, goodsServicesSheet, 'Goods and Services');

    // Add Salaries Form 1 sheet
    const salariesForm1Sheet = XLSX.utils.json_to_sheet(salariesForm1);
    XLSX.utils.book_append_sheet(workbook, salariesForm1Sheet, 'Salaries Form 1');

    // Add Salary Entry Form 2 sheet
    const salaryEntryForm2Sheet = XLSX.utils.json_to_sheet(salaryEntryForm2);
    XLSX.utils.book_append_sheet(workbook, salaryEntryForm2Sheet, 'Salary Entry Form 2');

    // Generate buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="chs_acquittals_report.xlsx"');
    res.send(buffer);

  } catch (error) {
    logger.error('Excel export error:', error);
    res.status(500).json({ error: 'Failed to export Excel file' });
  }
});

// Export as PDF
router.get('/pdf', async (req, res) => {
  try {
    const goodsServices = await executeQuery('SELECT * FROM goods_services_data');
    const salariesForm1 = await executeQuery('SELECT * FROM salaries_form1_data');
    const salaryEntryForm2 = await executeQuery('SELECT * FROM salary_entry_form2_data');

    // Create PDF document
    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="chs_acquittals_report.pdf"');
    doc.pipe(res);

    // Add title
    doc.fontSize(20).text('CHS Acquittals Report', { align: 'center' });
    doc.moveDown();

    // Add summary
    const totalGoodsServices = goodsServices.reduce((sum, item) => sum + (parseFloat(item.total_cost) || 0), 0);
    const totalSalariesForm1 = salariesForm1.reduce((sum, item) => sum + (parseFloat(item.salary_amount) || 0), 0);
    const totalSalaryEntryForm2 = salaryEntryForm2.reduce((sum, item) => sum + (parseFloat(item.net_salary) || 0), 0);

    doc.fontSize(14).text('Summary', { underline: true });
    doc.fontSize(12).text(`Goods and Services Total: $${totalGoodsServices.toFixed(2)}`);
    doc.fontSize(12).text(`Salaries Form 1 Total: $${totalSalariesForm1.toFixed(2)}`);
    doc.fontSize(12).text(`Salary Entry Form 2 Total: $${totalSalaryEntryForm2.toFixed(2)}`);
    doc.fontSize(12).text(`Grand Total: $${(totalGoodsServices + totalSalariesForm1 + totalSalaryEntryForm2).toFixed(2)}`);
    doc.moveDown();

    // Add detailed data
    if (goodsServices.length > 0) {
      doc.addPage();
      doc.fontSize(16).text('Goods and Services Details', { underline: true });
      doc.moveDown();

      goodsServices.forEach((item, index) => {
        doc.fontSize(10).text(`${index + 1}. ${item.facility_name} - ${item.item_description} - $${item.total_cost}`);
      });
    }

    if (salariesForm1.length > 0) {
      doc.addPage();
      doc.fontSize(16).text('Salaries Form 1 Details', { underline: true });
      doc.moveDown();

      salariesForm1.forEach((item, index) => {
        doc.fontSize(10).text(`${index + 1}. ${item.facility_name} - ${item.employee_name} - $${item.salary_amount}`);
      });
    }

    if (salaryEntryForm2.length > 0) {
      doc.addPage();
      doc.fontSize(16).text('Salary Entry Form 2 Details', { underline: true });
      doc.moveDown();

      salaryEntryForm2.forEach((item, index) => {
        doc.fontSize(10).text(`${index + 1}. ${item.facility_name} - ${item.employee_name} - $${item.net_salary}`);
      });
    }

    doc.end();

  } catch (error) {
    logger.error('PDF export error:', error);
    res.status(500).json({ error: 'Failed to export PDF' });
  }
});

export default router; 