-- CHS Acquittals Database Setup
-- Run this in phpMyAdmin or MySQL command line

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS chs_acquittals;
USE chs_acquittals;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create goods_services table
CREATE TABLE IF NOT EXISTS goods_services (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  facility_name VARCHAR(255) NOT NULL,
  item_description TEXT NOT NULL,
  quantity INT NOT NULL,
  unit_cost DECIMAL(10,2) NOT NULL,
  total_cost DECIMAL(10,2) NOT NULL,
  uploaded_by VARCHAR(36),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Create salaries_form1 table
CREATE TABLE IF NOT EXISTS salaries_form1 (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  facility_name VARCHAR(255) NOT NULL,
  employee_name VARCHAR(255) NOT NULL,
  position VARCHAR(255),
  salary_amount DECIMAL(10,2) NOT NULL,
  uploaded_by VARCHAR(36),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Create salary_entry_form2 table
CREATE TABLE IF NOT EXISTS salary_entry_form2 (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  facility_name VARCHAR(255) NOT NULL,
  employee_name VARCHAR(255) NOT NULL,
  position VARCHAR(255),
  gross_salary DECIMAL(10,2) NOT NULL,
  deductions DECIMAL(10,2) DEFAULT 0,
  net_salary DECIMAL(10,2) NOT NULL,
  uploaded_by VARCHAR(36),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Create indexes for better performance
CREATE INDEX idx_goods_services_facility ON goods_services(facility_name);
CREATE INDEX idx_salaries_form1_facility ON salaries_form1(facility_name);
CREATE INDEX idx_salary_entry_form2_facility ON salary_entry_form2(facility_name);
CREATE INDEX idx_users_email ON users(email);

-- Insert a default admin user (password: admin123)
INSERT INTO users (id, email, password, name) VALUES 
('admin-user-id', 'admin@chsacquittals.com', '$2a$10$rQZ8K9mX2nL1vP3qR5sT7uI8oJ9kL0mN1oP2qR3sT4uI5vJ6kL7mN8oP9qR', 'Admin User')
ON DUPLICATE KEY UPDATE name = 'Admin User'; 