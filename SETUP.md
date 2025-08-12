# CHS Acquittals System - Setup Guide

## Prerequisites

Before setting up the CHS Acquittals system, you need to install:

1. **Node.js** (v18 or higher)
   - Download from: https://nodejs.org/
   - Choose the LTS version
   - Install with default settings

2. **Supabase Account**
   - Sign up at: https://supabase.com/
   - Create a new project

## Step 1: Install Node.js

1. Go to https://nodejs.org/
2. Download the LTS version (recommended)
3. Run the installer and follow the setup wizard
4. Restart your terminal/PowerShell
5. Verify installation:
   ```bash
   node --version
   npm --version
   ```

## Step 2: Install Dependencies

Once Node.js is installed, run:

```bash
npm install
```

This will install all required packages including:
- Express.js (web framework)
- Supabase client
- Excel processing libraries
- PDF generation libraries
- Authentication libraries

## Step 3: Set Up Supabase Database

1. **Create Supabase Project**:
   - Go to https://supabase.com/
   - Sign up/login and create a new project
   - Note your project URL and API keys

2. **Set Environment Variables**:
   - Copy `.env.example` to `.env`
   - Fill in your Supabase credentials:
   ```
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   JWT_SECRET=your_jwt_secret_key_here
   ```

3. **Create Database Tables**:
   - Go to your Supabase project dashboard
   - Navigate to SQL Editor
   - Run the SQL script from `setup.sql`

## Step 4: Run the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm run build
npm start
```

The application will be available at `http://localhost:3000`

## Step 5: Test the System

1. **Open the Web Interface**:
   - Go to `http://localhost:3000`
   - You'll see the CHS Acquittals System interface

2. **Register/Login**:
   - Click "Register" to create a new account
   - Or use "Login" if you already have an account

3. **Upload Excel Files**:
   - Use the three Excel files in your directory:
     - `01_Goods and Services Reporting Form_ECPNG Middle South Fly_Jan-Mar 2024.xlsx`
     - `02_Salaries_Form 1_C-S_ECPNG Middle South Fly_Jan-Mar 2024_All Facilities.xlsx`
     - `03_Salary Entry Form 2_ECPNG Middle South Fly_Jan-Mar 2024_All Facilities.xlsx`

4. **Generate Reports**:
   - Click "Export Excel" to download consolidated Excel file
   - Click "Export PDF" to download PDF report

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Data Entry
- `POST /api/data-entry/goods-services` - Upload Goods and Services form
- `POST /api/data-entry/salaries-form1` - Upload Salaries Form 1
- `POST /api/data-entry/salary-entry-form2` - Upload Salary Entry Form 2
- `GET /api/data-entry/data` - Get all uploaded data

### Reporting
- `GET /api/reporting/summary` - Get summary statistics
- `GET /api/reporting/facility-breakdown` - Get facility-wise breakdown

### Export
- `GET /api/export/excel` - Export all data as Excel file
- `GET /api/export/pdf` - Export all data as PDF report

## File Structure

```
chsacquittals/
├── src/
│   ├── config/
│   │   └── database.ts          # Supabase configuration
│   ├── middleware/
│   │   └── errorHandler.ts      # Error handling
│   ├── routes/
│   │   ├── auth.ts             # Authentication routes
│   │   ├── dataEntry.ts        # Data entry routes
│   │   ├── reporting.ts        # Reporting routes
│   │   └── export.ts           # Export routes
│   ├── utils/
│   │   └── logger.ts           # Logging utility
│   └── index.ts                # Main application
├── public/
│   └── index.html              # Web interface
├── uploads/                    # File upload directory
├── package.json                # Dependencies
├── tsconfig.json              # TypeScript config
├── setup.sql                  # Database setup script
└── README.md                  # Documentation
```

## Troubleshooting

### Common Issues

1. **"npm is not recognized"**
   - Install Node.js from https://nodejs.org/
   - Restart your terminal after installation

2. **"Cannot find module" errors**
   - Run `npm install` to install dependencies
   - Check that all files are in the correct directories

3. **Supabase connection errors**
   - Verify your environment variables in `.env`
   - Check that your Supabase project is active
   - Ensure database tables are created using `setup.sql`

4. **File upload errors**
   - Ensure the `uploads/` directory exists
   - Check file permissions
   - Verify Excel file format

5. **Port already in use**
   - Change the port in `.env` file
   - Or kill the process using the port

### Getting Help

If you encounter issues:
1. Check the console logs for error messages
2. Verify all prerequisites are installed
3. Ensure environment variables are set correctly
4. Check that database tables are created properly

## Security Notes

- Keep your JWT_SECRET secure and unique
- Use HTTPS in production
- Regularly update dependencies
- Monitor database access logs
- Implement proper user authentication in production

## Production Deployment

For production deployment:
1. Set `NODE_ENV=production`
2. Use a proper database (PostgreSQL recommended)
3. Set up proper file storage (AWS S3, etc.)
4. Configure HTTPS
5. Set up monitoring and logging
6. Implement proper backup strategies 