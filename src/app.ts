import { apiService } from './services/api';
import { User, AuthState, DashboardStats, SystemSettings, UserPreferences, Notification } from './types/frontend';

// Configuration
const API_BASE_URL = ((window as any).APP_API_BASE_URL || window.location.origin).replace(/\/$/, '');

class CHSApp {
    private authState: AuthState = {
        token: localStorage.getItem('authToken'),
        user: null,
        isAuthenticated: !!localStorage.getItem('authToken')
    };
    private currentUser: User | null = null;
    private dashboardStats: DashboardStats | null = null;
    private systemSettings: SystemSettings | null = null;
    private userPreferences: UserPreferences | null = null;
    private notifications: Notification[] = [];

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
        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);
        
        try {
            const email = (document.getElementById('email') as HTMLInputElement).value;
            const password = (document.getElementById('password') as HTMLInputElement).value;
            
            const response = await apiService.login({ email, password });
            
            if (response.success) {
                this.authState.token = response.data.token;
                this.currentUser = response.data.user;
                this.authState.isAuthenticated = true;
                localStorage.setItem('authToken', response.data.token);
                
                await this.loadDashboardData();
                this.showDashboard();
            } else {
                this.showMessage('loginMessage', response.message, 'error');
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
            
            const response = await apiService.register({ name, email, password });
            
            if (response.success) {
                this.authState.token = response.data.token;
                this.currentUser = response.data.user;
                this.authState.isAuthenticated = true;
                localStorage.setItem('authToken', response.data.token);
                
                await this.loadDashboardData();
                this.showDashboard();
            } else {
                this.showMessage('registerMessage', response.message, 'error');
            }
        } catch (error) {
            console.error('Registration error:', error);
            this.showMessage('registerMessage', 'Registration failed. Please try again.', 'error');
        }
    }

    private async loadUserProfile(): Promise<void> {
        try {
            const response = await apiService.getProfile();
            if (response.success) {
                this.currentUser = response.data.user;
            }
        } catch (error) {
            console.error('Failed to load user profile:', error);
        }
    }

    private async loadDashboardData(): Promise<void> {
        try {
            // Load dashboard stats
            const statsResponse = await apiService.getDashboardStats();
            if (statsResponse.success) {
                this.dashboardStats = statsResponse.data.stats;
                this.updateDashboardStats();
            }

            // Load system settings
            const settingsResponse = await apiService.getSystemSettings();
            if (settingsResponse.success) {
                this.systemSettings = settingsResponse.data.settings;
            }

            // Load user preferences
            const prefsResponse = await apiService.getUserPreferences();
            if (prefsResponse.success) {
                this.userPreferences = prefsResponse.data.preferences;
            }

            // Load notifications
            const notifResponse = await apiService.getNotifications();
            if (notifResponse.success) {
                this.notifications = notifResponse.data.notifications;
                this.updateNotifications();
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

    private updateNotifications(): void {
        const notificationContainer = document.getElementById('notificationContainer');
        if (!notificationContainer || !this.notifications.length) return;

        const notificationHtml = this.notifications
            .map(notification => `
                <div class="notification ${notification.type}">
                    <strong>${notification.title}</strong>
                    <p>${notification.message}</p>
                    <small>${new Date(notification.timestamp).toLocaleString()}</small>
                </div>
            `)
            .join('');

        notificationContainer.innerHTML = notificationHtml;
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
                    `${response.data.message} - ${response.data.records_processed} records processed`, 
                    'success'
                );
                await this.loadDashboardData(); // Refresh stats
            } else {
                this.showMessage(`${fileType}Status`, response.message, 'error');
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

        // Load section-specific data
        this.loadSectionData(sectionId);
    }

    private async loadSectionData(sectionId: string): Promise<void> {
        switch (sectionId) {
            case 'overview':
                await this.loadOverviewData();
                break;
            case 'upload':
                // Upload section is handled by event listeners
                break;
            case 'reports':
                await this.loadReportsData();
                break;
            case 'data':
                await this.loadDataView();
                break;
            case 'export':
                // Export section is handled by event listeners
                break;
            case 'settings':
                await this.loadSettingsData();
                break;
        }
    }

    private async loadOverviewData(): Promise<void> {
        try {
            const response = await apiService.getDashboardStats();
            if (response.success) {
                this.dashboardStats = response.data.stats;
                this.updateDashboardStats();
            }
        } catch (error) {
            console.error('Failed to load overview data:', error);
        }
    }

    private async loadReportsData(): Promise<void> {
        try {
            const response = await apiService.getSummaryReport();
            if (response.success) {
                this.updateReportsDisplay(response.data);
            }
        } catch (error) {
            console.error('Failed to load reports data:', error);
        }
    }

    private async loadDataView(): Promise<void> {
        try {
            const response = await apiService.getAllData();
            if (response.success) {
                this.updateDataDisplay(response.data);
            }
        } catch (error) {
            console.error('Failed to load data view:', error);
        }
    }

    private async loadSettingsData(): Promise<void> {
        try {
            const settingsResponse = await apiService.getSystemSettings();
            const prefsResponse = await apiService.getUserPreferences();
            
            if (settingsResponse.success) {
                this.systemSettings = settingsResponse.data.settings;
            }
            
            if (prefsResponse.success) {
                this.userPreferences = prefsResponse.data.preferences;
            }
            
            this.updateSettingsDisplay();
        } catch (error) {
            console.error('Failed to load settings data:', error);
        }
    }

    private updateReportsDisplay(data: any): void {
        const reportsContent = document.getElementById('reportsContent');
        if (!reportsContent) return;

        const html = `
            <div class="reports-summary">
                <h3>Summary Report</h3>
                <div class="stats-grid">
                    <div class="stat-card">
                        <h4>Total Records</h4>
                        <p>${data.totalRecords || 0}</p>
                    </div>
                    <div class="stat-card">
                        <h4>Total Amount</h4>
                        <p>$${(data.totalAmount || 0).toFixed(2)}</p>
                    </div>
                    <div class="stat-card">
                        <h4>Facilities</h4>
                        <p>${data.facilities || 0}</p>
                    </div>
                </div>
            </div>
        `;
        
        reportsContent.innerHTML = html;
    }

    private updateDataDisplay(data: any): void {
        const dataContent = document.getElementById('dataContent');
        if (!dataContent) return;

        let html = '<h3>All Data</h3>';
        
        if (data.goodsServices && data.goodsServices.length > 0) {
            html += `
                <h4>Goods and Services</h4>
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Facility</th>
                            <th>Item</th>
                            <th>Total Cost</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.goodsServices.map((item: any) => `
                            <tr>
                                <td>${item.facility_name || ''}</td>
                                <td>${item.item_description || ''}</td>
                                <td>$${(item.total_cost || 0).toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        }
        
        if (data.salaries && data.salaries.length > 0) {
            html += `
                <h4>Salaries</h4>
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Facility</th>
                            <th>Employee</th>
                            <th>Salary</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.salaries.map((item: any) => `
                            <tr>
                                <td>${item.facility_name || ''}</td>
                                <td>${item.employee_name || ''}</td>
                                <td>$${(item.salary_amount || 0).toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        }
        
        dataContent.innerHTML = html;
    }

    private updateSettingsDisplay(): void {
        const settingsContent = document.getElementById('settingsContent');
        if (!settingsContent) return;

        const html = `
            <div class="settings-section">
                <h3>System Settings</h3>
                <div class="setting-item">
                    <label>Database Status:</label>
                    <span class="status-ok">Connected</span>
                </div>
                <div class="setting-item">
                    <label>Server Status:</label>
                    <span class="status-ok">Running</span>
                </div>
                <div class="setting-item">
                    <label>Last Backup:</label>
                    <span>${new Date().toLocaleString()}</span>
                </div>
            </div>
        `;
        
        settingsContent.innerHTML = html;
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
        localStorage.removeItem('authToken');
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