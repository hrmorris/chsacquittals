require('dotenv').config();
const mysql = require('mysql2/promise');

async function testDatabase() {
  try {
    console.log('Testing database connection...');
    
    // Create connection pool
    const pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      port: parseInt(process.env.DB_PORT || '3306'),
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    // Test connection without database first
    const connection = await pool.getConnection();
    console.log('✓ MySQL server is running');

    // Create database if it doesn't exist
    await connection.query('CREATE DATABASE IF NOT EXISTS chs_acquittals');
    console.log('✓ Database created/verified');

    // Use the database
    await connection.query('USE chs_acquittals');

    // Create tables without foreign keys first
    const tables = [
      `CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      
      `CREATE TABLE IF NOT EXISTS goods_services (
        id INT AUTO_INCREMENT PRIMARY KEY,
        facility_name VARCHAR(255) NOT NULL,
        item_description TEXT NOT NULL,
        quantity INT NOT NULL,
        unit_cost DECIMAL(10,2) NOT NULL,
        total_cost DECIMAL(10,2) NOT NULL,
        uploaded_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      
      `CREATE TABLE IF NOT EXISTS salaries_form1 (
        id INT AUTO_INCREMENT PRIMARY KEY,
        facility_name VARCHAR(255) NOT NULL,
        employee_name VARCHAR(255) NOT NULL,
        position VARCHAR(255),
        salary_amount DECIMAL(10,2) NOT NULL,
        uploaded_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      
      `CREATE TABLE IF NOT EXISTS salary_entry_form2 (
        id INT AUTO_INCREMENT PRIMARY KEY,
        facility_name VARCHAR(255) NOT NULL,
        employee_name VARCHAR(255) NOT NULL,
        position VARCHAR(255),
        gross_salary DECIMAL(10,2) NOT NULL,
        deductions DECIMAL(10,2) DEFAULT 0,
        net_salary DECIMAL(10,2) NOT NULL,
        uploaded_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`
    ];

    for (const table of tables) {
      await connection.query(table);
    }
    console.log('✓ Tables created/verified');

    // Create indexes
    const indexes = [
      'CREATE INDEX idx_goods_services_facility ON goods_services(facility_name)',
      'CREATE INDEX idx_salaries_form1_facility ON salaries_form1(facility_name)',
      'CREATE INDEX idx_salary_entry_form2_facility ON salary_entry_form2(facility_name)',
      'CREATE INDEX idx_users_email ON users(email)'
    ];

    for (const index of indexes) {
      try {
        await connection.query(index);
      } catch (error) {
        // Index might already exist, ignore error
        console.log(`Index already exists or error: ${error.message}`);
      }
    }
    console.log('✓ Indexes created/verified');

    connection.release();
    console.log('✓ Database setup completed successfully!');
    console.log('\nYou can now start the server with: node dist/index.js');
    
  } catch (error) {
    console.error('✗ Database setup failed:', error.message);
    console.log('\nPlease check:');
    console.log('1. XAMPP is running');
    console.log('2. MySQL is started in XAMPP Control Panel');
    console.log('3. MySQL port 3306 is not blocked');
    process.exit(1);
  }
}

testDatabase(); 