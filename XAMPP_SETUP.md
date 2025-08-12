# CHS Acquittals System - XAMPP Setup Guide

This guide will help you set up the CHS Acquittals System using XAMPP (MySQL) instead of Supabase.

## 📋 Complete Installation Guide

### Step 1: Install Node.js

1. **Download Node.js**:
   - Open your web browser
   - Go to https://nodejs.org/
   - You'll see two download buttons - click the one that says "LTS" (Long Term Support)
   - This will download the Windows installer

2. **Run the Installer**:
   - Find the downloaded file (usually in Downloads folder)
   - Double-click the `.msi` file
   - Click "Next" through the installation wizard
   - Accept the default settings
   - Click "Install"
   - Wait for installation to complete
   - Click "Finish"

3. **Restart Your Computer** (Important!):
   - After installation, restart your computer
   - This ensures the PATH environment variable is updated

### Step 2: Verify Installation

After restarting, open a new PowerShell window and run:

```powershell
node --version
npm --version
```

You should see version numbers like:
```
v18.17.0
9.6.7
```

### Step 3: Install Project Dependencies

Once Node.js is installed, run:

```powershell
npm install
```

### Step 4: Set Up XAMPP

1. **Download XAMPP**:
   - Go to https://www.apachefriends.org/
   - Download the latest version for Windows
   - Install with default settings

2. **Start XAMPP**:
   - Open XAMPP Control Panel
   - Start Apache and MySQL services

### Step 5: Set Up Database

1. **Open phpMyAdmin**:
   - Go to http://localhost/phpmyadmin
   - Create database: `chs_acquittals`
   - Import the `setup.sql` file

### Step 6: Configure Environment

1. **Create .env file**:
   ```powershell
   copy .env.example .env
   ```

2. **Edit .env file** with these settings:
   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=chs_acquittals
   DB_PORT=3306
   PORT=3000
   NODE_ENV=development
   JWT_SECRET=your_jwt_secret_key_here
   ```

### Step 7: Run the Application

```powershell
npm run dev
```

##  Alternative: Quick Installation Script

If you want to automate the process, you can run the installation script after Node.js is installed:

```powershell
.\install_xampp.bat
```

## ❓ Need Help?

If you encounter any issues:

1. **Node.js installation problems**:
   - Make sure you downloaded the LTS version
   - Run the installer as administrator
   - Restart your computer after installation

2. **PATH issues**:
   - After installing Node.js, restart your computer
   - Open a new PowerShell window
   - Try the commands again

3. **XAMPP issues**:
   - Make sure no other services are using ports 80, 443, or 3306
   - Run XAMPP as administrator if needed

Once Node.js is installed, you'll be able to run `npm run dev` successfully! 

Would you like me to help you with any specific step after you install Node.js? 