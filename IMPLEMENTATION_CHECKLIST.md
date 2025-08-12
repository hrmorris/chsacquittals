# CHS Acquittals System - Implementation Checklist

## ✅ Prerequisites Installation

### Step 1: Install Node.js
- [ ] Go to https://nodejs.org/
- [ ] Download the LTS version (green button)
- [ ] Run the installer with default settings
- [ ] Restart your computer
- [ ] Verify installation: Open PowerShell and run `node --version`

### Step 2: Install XAMPP
- [ ] Go to https://www.apachefriends.org/
- [ ] Download the latest version for Windows
- [ ] Install with default settings
- [ ] Open XAMPP Control Panel
- [ ] Start Apache service (click "Start")
- [ ] Start MySQL service (click "Start")
- [ ] Verify both services show green status

## ✅ Database Setup

### Step 3: Create Database
- [ ] Open your web browser
- [ ] Go to http://localhost/phpmyadmin
- [ ] Login with default credentials (username: root, password: blank)
- [ ] Click "New" on the left sidebar
- [ ] Enter database name: `chs_acquittals`
- [ ] Click "Create"

### Step 4: Import Database Schema
- [ ] Select the `chs_acquittals` database
- [ ] Click "Import" tab
- [ ] Click "Choose File"
- [ ] Select the `setup.sql` file from your project folder
- [ ] Click "Go" to import
- [ ] Verify tables are created (users, goods_services_data, salaries_form1_data, salary_entry_form2_data)

## ✅ Application Setup

### Step 5: Install Dependencies
- [ ] Open PowerShell in your project directory
- [ ] Run: `npm install`
- [ ] Wait for installation to complete

### Step 6: Configure Environment
- [ ] Verify `.env` file exists (already created)
- [ ] Check settings match your XAMPP configuration:
  ```
  DB_HOST=localhost
  DB_USER=root
  DB_PASSWORD=
  DB_NAME=chs_acquittals
  DB_PORT=3306
  ```

### Step 7: Run the Application
- [ ] In PowerShell, run: `npm run dev`
- [ ] Wait for server to start
- [ ] You should see: "Server running on port 3000"

## ✅ Testing the System

### Step 8: Access the Web Interface
- [ ] Open your web browser
- [ ] Go to http://localhost:3000
- [ ] You should see the CHS Acquittals System interface

### Step 9: Create User Account
- [ ] Click "Register" button
- [ ] Enter your email and password
- [ ] Click "Register"
- [ ] You should see a success message with a token

### Step 10: Upload Excel Files
- [ ] Use the three Excel files in your directory:
  - `01_Goods and Services Reporting Form_ECPNG Middle South Fly_Jan-Mar 2024.xlsx`
  - `02_Salaries_Form 1_C-S_ECPNG Middle South Fly_Jan-Mar 2024_All Facilities.xlsx`
  - `03_Salary Entry Form 2_ECPNG Middle South Fly_Jan-Mar 2024_All Facilities.xlsx`
- [ ] Upload each file using the corresponding upload buttons
- [ ] Verify upload success messages

### Step 11: Generate Reports
- [ ] Click "Export Excel" to download consolidated Excel file
- [ ] Click "Export PDF" to download PDF report
- [ ] Verify files are downloaded successfully

## ✅ Troubleshooting

### Common Issues and Solutions

**Node.js not found:**
- Install Node.js from https://nodejs.org/
- Restart computer after installation
- Open new PowerShell window

**XAMPP services won't start:**
- Check if other services are using ports 80, 443, or 3306
- Run XAMPP as administrator
- Stop conflicting services

**Database connection errors:**
- Verify MySQL is running in XAMPP Control Panel
- Check database exists in phpMyAdmin
- Confirm credentials in `.env` file

**Port 3000 already in use:**
- Change PORT in `.env` file to 3001
- Or stop other applications using port 3000

## ✅ Verification Checklist

- [ ] Node.js is installed and working
- [ ] XAMPP is running (Apache and MySQL)
- [ ] Database `chs_acquittals` exists
- [ ] All tables are created
- [ ] Application starts without errors
- [ ] Web interface loads at http://localhost:3000
- [ ] User registration works
- [ ] File uploads work
- [ ] Reports can be generated

## 🎉 Success!

Once all checkboxes are completed, your CHS Acquittals System is fully implemented and ready to use!

**Next Steps:**
1. Upload your Excel files
2. Generate reports
3. Use the system for data management

---

**Need Help?** Check the troubleshooting section or refer to `XAMPP_SETUP.md` for detailed instructions. 