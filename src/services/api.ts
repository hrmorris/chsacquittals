import { 
  User, 
  AuthState, 
  DashboardStats, 
  ChartData, 
  RecentActivity, 
  FacilitySummary,
  SystemSettings,
  UserPreferences,
  AdminSettings,
  UploadResult,
  ReportSummary,
  Notification,
  ApiResponse
} from '../types/frontend';

class ApiService {
  private baseUrl: string = '/api';
  private token: string | null = localStorage.getItem('authToken');

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Request failed'
        };
      }

      return {
        success: true,
        data
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error'
      };
    }
  }

  // Authentication methods
  async register(userData: { name: string; email: string; password: string }): Promise<ApiResponse<{ token: string; user: User }>> {
    return this.request<{ token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  async login(credentials: { email: string; password: string }): Promise<ApiResponse<{ token: string; user: User }>> {
    return this.request<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  }

  async logout(): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>('/auth/logout', {
      method: 'POST'
    });
  }

  async getProfile(): Promise<ApiResponse<{ user: User }>> {
    return this.request<{ user: User }>('/auth/profile');
  }

  async updateProfile(profileData: Partial<User>): Promise<ApiResponse<{ user: User }>> {
    return this.request<{ user: User }>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
  }

  // Dashboard methods
  async getDashboardStats(): Promise<ApiResponse<{ stats: DashboardStats }>> {
    return this.request<{ stats: DashboardStats }>('/dashboard/overview');
  }

  async getChartData(): Promise<ApiResponse<{ chartData: ChartData }>> {
    return this.request<{ chartData: ChartData }>('/dashboard/charts');
  }

  async getRecentActivity(limit: number = 10): Promise<ApiResponse<{ activities: RecentActivity[] }>> {
    return this.request<{ activities: RecentActivity[] }>(`/dashboard/recent-activity?limit=${limit}`);
  }

  async getFacilitySummary(): Promise<ApiResponse<{ summaries: FacilitySummary[] }>> {
    return this.request<{ summaries: FacilitySummary[] }>('/dashboard/facility-summary');
  }

  async getQuickStats(): Promise<ApiResponse<{ quickStats: any }>> {
    return this.request<{ quickStats: any }>('/dashboard/quick-stats');
  }

  // Settings methods
  async getSystemSettings(): Promise<ApiResponse<{ settings: SystemSettings }>> {
    return this.request<{ settings: SystemSettings }>('/settings/system');
  }

  async updateSystemSettings(settings: Partial<SystemSettings>): Promise<ApiResponse<{ settings: SystemSettings }>> {
    return this.request<{ settings: SystemSettings }>('/settings/system', {
      method: 'PUT',
      body: JSON.stringify(settings)
    });
  }

  async getUserPreferences(): Promise<ApiResponse<{ preferences: UserPreferences }>> {
    return this.request<{ preferences: UserPreferences }>('/settings/preferences');
  }

  async updateUserPreferences(preferences: Partial<UserPreferences>): Promise<ApiResponse<{ preferences: UserPreferences }>> {
    return this.request<{ preferences: UserPreferences }>('/settings/preferences', {
      method: 'PUT',
      body: JSON.stringify(preferences)
    });
  }

  async getAdminSettings(): Promise<ApiResponse<{ settings: AdminSettings }>> {
    return this.request<{ settings: AdminSettings }>('/settings/admin');
  }

  async updateAdminSettings(settings: Partial<AdminSettings>): Promise<ApiResponse<{ settings: AdminSettings }>> {
    return this.request<{ settings: AdminSettings }>('/settings/admin', {
      method: 'PUT',
      body: JSON.stringify(settings)
    });
  }

  // Data entry methods
  async uploadFile(file: File, fileType: string): Promise<ApiResponse<UploadResult>> {
    const formData = new FormData();
    formData.append('file', file);

    return this.request<UploadResult>(`/data-entry/${fileType}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`
      },
      body: formData
    });
  }

  async getAllData(): Promise<ApiResponse<any>> {
    return this.request<any>('/data-entry/data');
  }

  // Reporting methods
  async getSummaryReport(): Promise<ApiResponse<ReportSummary>> {
    return this.request<ReportSummary>('/reporting/summary');
  }

  // Export methods
  async exportExcel(): Promise<Blob> {
    const response = await fetch(`${this.baseUrl}/export/excel`, {
      headers: {
        'Authorization': `Bearer ${this.token}`
      }
    });
    return response.blob();
  }

  async exportPDF(): Promise<Blob> {
    const response = await fetch(`${this.baseUrl}/export/pdf`, {
      headers: {
        'Authorization': `Bearer ${this.token}`
      }
    });
    return response.blob();
  }

  // Notifications
  async getNotifications(): Promise<ApiResponse<{ notifications: Notification[] }>> {
    return this.request<{ notifications: Notification[] }>('/dashboard/notifications');
  }

  async markNotificationRead(id: number): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>(`/dashboard/notifications/${id}/read`, {
      method: 'PUT'
    });
  }

  // Utility methods
  setToken(token: string): void {
    this.token = token;
    localStorage.setItem('authToken', token);
  }

  clearToken(): void {
    this.token = null;
    localStorage.removeItem('authToken');
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }
}

export const apiService = new ApiService(); 