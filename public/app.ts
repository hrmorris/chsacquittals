// Browser-compatible TypeScript app
const API_BASE_URL = 'http://localhost:3001';

interface User {
    id: number;
    email: string;
    name: string;
    created_at: Date;
}

interface AuthState {
    token: string | null;
    user: User | null;
    isAuthenticated: boolean;
}

interface DashboardStats {
    totalRecords: number;
    totalAmount: number;
    totalFacilities: number;
    totalEmployees: number;
    recentUploads: number;
    pendingReports: number;
}

interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

class ApiService {
    private baseUrl: string = '/api';
    private token: string | null = localStorage.getItem('authToken');

    private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
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

    async getDashboardStats(): Promise<ApiResponse<{ stats: DashboardStats }>> {
        return this.request<{ stats: DashboardStats }>('/dashboard/overview');
    }

    async uploadFile(file: File, fileType: string): Promise<ApiResponse<any>> {
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch(`${this.baseUrl}/data-entry/${fileType}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.token}`
                },
                body: formData
            });

            const data = await response.json();

            if (!response.ok) {
                return {
                    success: false,
                    error: data.error || 'Upload failed'
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

    setToken(token: string): void {
        this.token = token;
        localStorage.setItem('authToken', token);
    }

    clearToken(): void {
        this.token = null;
        localStorage.removeItem('authToken');
    }
}

const apiService = new ApiService();

class CHSApp {
    private authState: AuthState = {
        token: localStorage.getItem('authToken'),
        user: null,
        isAuthenticated: !!localStorage.getItem('authToken')
    };
    private currentUser: User | null = null;
    private dashboardStats: DashboardStats | null = null;

    constructor() {
        this.initialize();
    }

    private async initialize(): Promise<void> {
        try {
            console.log('Initializing CHS App...');
            this.setupEventListeners();
            
            if (this.authState.isAuthenticated) {
                await this.loadUserProfile();
                this.showDashboard();
            } else {
                this.showLogin();
            }
        } catch (error) {
            console.error('Initialization error:', error);
            this.showLogin();
        }
    }

    private setupEventListeners(): void {
        // Login form
        const loginForm = document.getElementById('loginForm') as HTMLFormElement;
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Register form
        const registerForm = document.getElementById('registerForm') as HTMLFormElement;
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }

        // Dashboard navigation
        const navTabs = document.querySelectorAll('.nav-tab');
        navTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                const target = e.target as HTMLElement;
                const sectionId = target.getAttribute('data-section');
                if (sectionId) {
                    this.showSection(sectionId);
                }
            });
        });

        // File upload handlers
        this.setupFileUploadHandlers();
    }

    private async handleLogin(e: Event): Promise<void> {
        e.preventDefault();
        
        try {
            const email = (document.getElementById('email') as HTMLInputElement).value;
            const password = (document.getElementById('password') as HTMLInputElement).value;
            
            const response = await apiService.login({ email, password });
            
            if (response.success && response.data) {
                this.authState.token = response.data.token;
                this.currentUser = response.data.user;
                this.authState.isAuthenticated = true;
                apiService.setToken(response.data.token);
                
                await this.loadDashboardData();
                this.showDashboard();
            } else {
                this.showMessage('loginMessage', response.error || 'Login failed', 'error');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showMessage('loginMessage', 'Login failed. Please try again.', 'error');
        }
    }

    private async handleRegister(e: Event): Promise<void> {
        e.preventDefault();
        
        try {
            const name = (document.getElementById('regName') as HTMLInputElement).value;
            const email = (document.getElementById('regEmail') as HTMLInputElement).value;
            const password = (document.getElementById('regPassword') as HTMLInputElement).value;
            
            console.log('Attempting registration with:', { name, email, password: '***' });
            
            const response = await apiService.register({ name, email, password });
            
            if (response.success && response.data) {
                this.authState.token = response.data.token;
                this.currentUser = response.data.user;
                this.authState.isAuthenticated = true;
                apiService.setToken(response.data.token);
                
                await this.loadDashboardData();
                this.showDashboard();
            } else {
                this.showMessage('registerMessage', response.error || 'Registration failed', 'error');
            }
        } catch (error) {
            console.error('Registration error:', error);
            this.showMessage('registerMessage', 'Registration failed. Please try again.', 'error');
        }
    }

    private async loadUserProfile(): Promise<void> {
        // For now, just set a default user
        this.currentUser = {
            id: 1,
            email: 'admin@chsacquittals.com',
            name: 'Admin User',
            created_at: new Date()
        };
    }

    private async loadDashboardData(): Promise<void> {
        try {
            const response = await apiService.getDashboardStats();
            if (response.success && response.data) {
                this.dashboardStats = response.data.stats;
                this.updateDashboardStats();
            }
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        }
    }

    private updateDashboardStats(): void {
        if (!this.dashboardStats) return;

        const totalRecordsEl = document.getElementById('totalRecords');
        const totalAmountEl = document.getElementById('totalAmount');
        const facilitiesEl = document.getElementById('facilities');
        const employeesEl = document.getElementById('employees');

        if (totalRecordsEl) totalRecordsEl.textContent = this.dashboardStats.totalRecords.toString();
        if (totalAmountEl) totalAmountEl.textContent = `$${this.dashboardStats.totalAmount.toFixed(2)}`;
        if (facilitiesEl) facilitiesEl.textContent = this.dashboardStats.totalFacilities.toString();
        if (employeesEl) employeesEl.textContent = this.dashboardStats.totalEmployees.toString();
    }

    private setupFileUploadHandlers(): void {
        const uploadButtons = document.querySelectorAll('[data-upload]');
        uploadButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const target = e.target as HTMLElement;
                const fileType = target.getAttribute('data-upload');
                if (fileType) {
                    this.handleFileUpload(fileType);
                }
            });
        });
    }

    private async handleFileUpload(fileType: string): Promise<void> {
        const fileInput = document.getElementById(`${fileType}File`) as HTMLInputElement;
        if (!fileInput || !fileInput.files || !fileInput.files[0]) {
            this.showMessage(`${fileType}Status`, 'Please select a file first.', 'error');
            return;
        }

        const file = fileInput.files[0];
        
        try {
            const response = await apiService.uploadFile(file, fileType);
            
            if (response.success) {
                this.showMessage(`${fileType}Status`, 
                    `${response.data?.message || 'Upload successful'} - ${response.data?.records_processed || 0} records processed`, 
                    'success'
                );
                await this.loadDashboardData(); // Refresh stats
            } else {
                this.showMessage(`${fileType}Status`, response.error || 'Upload failed', 'error');
            }
        } catch (error) {
            console.error('File upload error:', error);
            this.showMessage(`${fileType}Status`, 'Upload failed. Please try again.', 'error');
        }
    }

    public showLogin(): void {
        console.log('Showing login screen');
        const loginScreen = document.getElementById('loginScreen') as HTMLElement;
        const registerScreen = document.getElementById('registerScreen') as HTMLElement;
        const dashboard = document.getElementById('dashboard') as HTMLElement;

        if (loginScreen) loginScreen.style.display = 'flex';
        if (registerScreen) registerScreen.style.display = 'none';
        if (dashboard) dashboard.style.display = 'none';
    }

    public showRegister(): void {
        console.log('Showing register screen');
        const loginScreen = document.getElementById('loginScreen') as HTMLElement;
        const registerScreen = document.getElementById('registerScreen') as HTMLElement;
        const dashboard = document.getElementById('dashboard') as HTMLElement;

        if (loginScreen) loginScreen.style.display = 'none';
        if (registerScreen) registerScreen.style.display = 'flex';
        if (dashboard) dashboard.style.display = 'none';
    }

    private showDashboard(): void {
        const loginScreen = document.getElementById('loginScreen') as HTMLElement;
        const registerScreen = document.getElementById('registerScreen') as HTMLElement;
        const dashboard = document.getElementById('dashboard') as HTMLElement;

        if (loginScreen) loginScreen.style.display = 'none';
        if (registerScreen) registerScreen.style.display = 'none';
        if (dashboard) dashboard.style.display = 'block';

        this.showSection('overview');
    }

    private showSection(sectionId: string): void {
        // Hide all sections
        const sections = document.querySelectorAll('.section');
        sections.forEach(section => {
            section.classList.remove('active');
        });

        // Remove active class from all tabs
        const tabs = document.querySelectorAll('.nav-tab');
        tabs.forEach(tab => {
            tab.classList.remove('active');
        });

        // Show selected section
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
        }

        // Add active class to clicked tab
        const activeTab = document.querySelector(`[data-section="${sectionId}"]`);
        if (activeTab) {
            activeTab.classList.add('active');
        }
    }

    private showMessage(elementId: string, message: string, type: 'success' | 'error'): void {
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = `<div class="${type}">${message}</div>`;
        }
    }

    public logout(): void {
        this.authState.token = null;
        this.authState.user = null;
        this.authState.isAuthenticated = false;
        this.currentUser = null;
        apiService.clearToken();
        this.showLogin();
    }

    public async exportExcel(): Promise<void> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/export/excel`, {
                headers: { 'Authorization': `Bearer ${this.authState.token}` }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'chs_acquittals_report.xlsx';
            a.click();
            window.URL.revokeObjectURL(url);

            this.showMessage('exportMessage', 'Excel file downloaded successfully', 'success');
        } catch (error) {
            console.error('Export error:', error);
            this.showMessage('exportMessage', 'Export failed. Please try again.', 'error');
        }
    }

    public async exportPDF(): Promise<void> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/export/pdf`, {
                headers: { 'Authorization': `Bearer ${this.authState.token}` }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'chs_acquittals_report.pdf';
            a.click();
            window.URL.revokeObjectURL(url);

            this.showMessage('exportMessage', 'PDF file downloaded successfully', 'success');
        } catch (error) {
            console.error('Export error:', error);
            this.showMessage('exportMessage', 'Export failed. Please try again.', 'error');
        }
    }
}

// Initialize the application
const app = new CHSApp();

// Make app available globally for HTML onclick handlers
(window as any).app = app;
(window as any).showRegister = () => app.showRegister();
(window as any).showLogin = () => app.showLogin();
(window as any).logout = () => app.logout();
(window as any).exportExcel = () => app.exportExcel();
(window as any).exportPDF = () => app.exportPDF(); 