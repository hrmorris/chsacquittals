// Frontend TypeScript Interfaces

export interface User {
  id: number;
  email: string;
  name: string;
  created_at: Date;
}

export interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
}

export interface DashboardStats {
  totalRecords: number;
  totalAmount: number;
  totalFacilities: number;
  totalEmployees: number;
  recentUploads: number;
  pendingReports: number;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string[];
    borderColor: string[];
  }[];
}

export interface RecentActivity {
  id: number;
  type: 'upload' | 'export' | 'login' | 'report';
  description: string;
  timestamp: Date;
  user: string;
}

export interface FacilitySummary {
  facilityName: string;
  goodsServicesTotal: number;
  salariesTotal: number;
  employeeCount: number;
  lastUpdated: Date;
}

export interface SystemSettings {
  maxFileSize: number;
  allowedFileTypes: string[];
  sessionTimeout: number;
  enableNotifications: boolean;
  enableAuditLog: boolean;
  backupFrequency: string;
  emailNotifications: boolean;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  dateFormat: string;
  currency: string;
  notifications: {
    email: boolean;
    browser: boolean;
    sms: boolean;
  };
}

export interface AdminSettings {
  maintenanceMode: boolean;
  registrationEnabled: boolean;
  maxUsers: number;
  dataRetentionDays: number;
  securityLevel: 'low' | 'medium' | 'high';
}

export interface UploadResult {
  message: string;
  records_processed: number;
  file_type: string;
}

export interface ReportSummary {
  summary: {
    goods_services_total: number;
    salaries_form1_total: number;
    salary_entry_form2_total: number;
    grand_total: number;
  };
  record_counts: {
    goods_services: number;
    salaries_form1: number;
    salary_entry_form2: number;
  };
}

export interface Notification {
  id: number;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
} 