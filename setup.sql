-- CHS Acquittals Database Setup Script for MySQL
-- Run this in phpMyAdmin or MySQL command line

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS chs_acquittals;
USE chs_acquittals;

-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Goods and Services Data table
CREATE TABLE IF NOT EXISTS goods_services_data (
  id INT AUTO_INCREMENT PRIMARY KEY,
  facility_name VARCHAR(255),
  reporting_period VARCHAR(255),
  item_description TEXT,
  quantity DECIMAL(10,2),
  unit_cost DECIMAL(10,2),
  total_cost DECIMAL(10,2),
  supplier VARCHAR(255),
  date_purchased DATE,
  notes TEXT,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  file_name VARCHAR(255)
);

-- Salaries Form 1 Data table
CREATE TABLE IF NOT EXISTS salaries_form1_data (
  id INT AUTO_INCREMENT PRIMARY KEY,
  facility_name VARCHAR(255),
  employee_name VARCHAR(255),
  position VARCHAR(255),
  salary_amount DECIMAL(10,2),
  payment_date DATE,
  payment_method VARCHAR(255),
  notes TEXT,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  file_name VARCHAR(255)
);

-- Salary Entry Form 2 Data table
CREATE TABLE IF NOT EXISTS salary_entry_form2_data (
  id INT AUTO_INCREMENT PRIMARY KEY,
  facility_name VARCHAR(255),
  employee_id VARCHAR(255),
  employee_name VARCHAR(255),
  position VARCHAR(255),
  basic_salary DECIMAL(10,2),
  allowances DECIMAL(10,2),
  deductions DECIMAL(10,2),
  net_salary DECIMAL(10,2),
  payment_date DATE,
  payment_status VARCHAR(255),
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  file_name VARCHAR(255)
);

-- Create indexes for better performance
CREATE INDEX idx_goods_services_facility ON goods_services_data(facility_name);
CREATE INDEX idx_salaries_form1_facility ON salaries_form1_data(facility_name);
CREATE INDEX idx_salary_entry_form2_facility ON salary_entry_form2_data(facility_name);
CREATE INDEX idx_users_email ON users(email); 