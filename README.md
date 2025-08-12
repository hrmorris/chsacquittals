# CHS Acquittals System

A comprehensive Node.js TypeScript web application for data entry and reporting of CHS (Community Health Services) acquittals using Supabase database.

## 🚀 Features

- **📊 Data Entry**: Upload and process Excel files for three different forms
- **🗄️ Database Integration**: Supabase PostgreSQL database for secure data storage
- **📈 Reporting**: Generate comprehensive reports and analytics
- **📤 Export Capabilities**: Export data as Excel files and PDF reports
- **🔐 Authentication**: User registration and login with JWT tokens
- **🌐 RESTful API**: Complete API endpoints for all operations
- **📱 Web Interface**: Modern, responsive web interface for easy data management

## 📋 Supported Excel Forms

1. **Goods and Services Reporting Form** - Facility purchases and services
2. **Salaries Form 1** - Employee salary payments
3. **Salary Entry Form 2** - Detailed salary breakdowns

## 🛠️ Technology Stack

- **Backend**: Node.js, Express.js, TypeScript
- **Database**: Supabase (PostgreSQL)
- **File Processing**: XLSX library for Excel files
- **PDF Generation**: PDFKit for report generation
- **Authentication**: JWT tokens with bcrypt password hashing
- **Frontend**: HTML, CSS, JavaScript (vanilla)

## ⚡ Quick Start

### Prerequisites

1. **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
2. **Supabase Account** - [Sign up here](https://supabase.com/)

### Installation

1. **Clone or download the project files**

2. **Run the installation script** (Windows):
   ```bash
   install.bat
   ```
   
   Or manually:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   copy .env.example .env
   ```
   
   Edit `.env` with your Supabase credentials:
   ```
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   JWT_SECRET=your_jwt_secret_key_here
   ```

4. **Set up Supabase database**:
   - Create a new project at [supabase.com](https://supabase.com/)
   - Go to SQL Editor in your project dashboard
   - Run the SQL script from `setup.sql`

5. **Start the application**:
   ```bash
   npm run dev
   ```

6. **Open the web interface**:
   - Go to `http://localhost:3000`
   - Register a new account or login
   - Upload your Excel files and generate reports

## 📁 Project Structure

```
chsacquittals/
├── src/
│   ├── config/
│   │   └── database.ts          # Supabase configuration
│   ├── middleware/
│   │   └── errorHandler.ts      # Error handling middleware
│   ├── routes/
│   │   ├── auth.ts             # Authentication routes
│   │   ├── dataEntry.ts        # Data entry routes
│   │   ├── reporting.ts        # Reporting routes
│   │   └── export.ts           # Export routes
│   ├── utils/
│   │   └── logger.ts           # Logging utility
│   └── index.ts                # Main application entry point
├── public/
│   └── index.html              # Web interface
├── uploads/                    # File upload directory
├── package.json                # Dependencies and scripts
├── tsconfig.json              # TypeScript configuration
├── setup.sql                  # Database setup script
├── install.bat                # Windows installation script
├── SETUP.md                   # Detailed setup guide
└── README.md                  # This file
```

## 🔌 API Endpoints

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

## 📊 Data Processing

The system automatically:
- ✅ Validates Excel file format
- ✅ Extracts data from worksheets
- ✅ Maps columns to database fields
- ✅ Stores processed data in Supabase
- ✅ Generates Excel and PDF exports
- ✅ Provides summary statistics and analytics

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- Rate limiting protection
- CORS protection
- Helmet security headers

## 📈 Reporting Features

- **Summary Reports**: Total amounts and record counts
- **Facility Breakdown**: Per-facility analysis
- **Excel Export**: Multi-sheet Excel files
- **PDF Export**: Formatted PDF reports
- **Real-time Analytics**: Live data visualization

## 🚀 Usage

1. **Upload Excel Files**:
   - Use the three Excel files in your directory
   - Upload each form type separately
   - System processes and stores data automatically

2. **View Data**:
   - Browse uploaded data in the web interface
   - View summary statistics
   - Analyze facility-wise breakdowns

3. **Generate Reports**:
   - Export consolidated Excel file
   - Generate formatted PDF report
   - Download reports for further analysis

## 🛠️ Development

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Start production server
npm test         # Run tests
npm run lint     # Run linting
npm run format   # Format code
```

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `SUPABASE_URL` | Your Supabase project URL | Yes |
| `SUPABASE_ANON_KEY` | Your Supabase anonymous key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key | Yes |
| `JWT_SECRET` | Secret key for JWT tokens | Yes |
| `PORT` | Server port (default: 3000) | No |
| `NODE_ENV` | Environment (development/production) | No |

## 🔧 Troubleshooting

### Common Issues

1. **"npm is not recognized"**
   - Install Node.js from https://nodejs.org/
   - Restart terminal after installation

2. **"Cannot find module" errors**
   - Run `npm install` to install dependencies
   - Check file structure is correct

3. **Supabase connection errors**
   - Verify environment variables in `.env`
   - Check Supabase project is active
   - Ensure database tables are created

4. **File upload errors**
   - Ensure `uploads/` directory exists
   - Check file permissions
   - Verify Excel file format

### Getting Help

- Check console logs for error messages
- Verify all prerequisites are installed
- Ensure environment variables are set correctly
- Check database tables are created properly

## 📚 Documentation

- **SETUP.md** - Detailed setup instructions
- **setup.sql** - Database schema and setup script
- **API Documentation** - Available in the code comments

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
1. Check the troubleshooting section
2. Review the SETUP.md file
3. Check console logs for error messages
4. Verify all prerequisites are installed correctly

---

**Built with ❤️ for CHS Acquittals Management** 