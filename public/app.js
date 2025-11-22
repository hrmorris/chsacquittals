// Browser-compatible JavaScript app
// Prefer a configurable global but default to the same origin as the page
const API_BASE_URL = window.APP_API_BASE_URL || window.location.origin;

class ApiService {
    constructor() {
        this.baseUrl = '/api';
        this.token = localStorage.getItem('authToken');
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const headers = {
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

    async register(userData) {
        return this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }

    async login(credentials) {
        return this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        });
    }

    async getDashboardStats() {
        return this.request('/dashboard/overview');
    }

    async uploadFile(file, fileType) {
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

    setToken(token) {
        this.token = token;
        localStorage.setItem('authToken', token);
    }

    clearToken() {
        this.token = null;
        localStorage.removeItem('authToken');
    }
}

const apiService = new ApiService();

class CHSApp {
    constructor() {
        this.authState = {
            token: localStorage.getItem('authToken'),
            user: null,
            isAuthenticated: !!localStorage.getItem('authToken')
        };
        this.currentUser = null;
        this.dashboardStats = null;
        this.initialize();
    }

    async initialize() {
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

    setupEventListeners() {
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Register form
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }

        // Dashboard navigation
        const navTabs = document.querySelectorAll('.nav-tab');
        navTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                const target = e.target;
                const sectionId = target.getAttribute('data-section');
                if (sectionId) {
                    this.showSection(sectionId);
                }
            });
        });

        // File upload handlers
        this.setupFileUploadHandlers();
    }

    async handleLogin(e) {
        e.preventDefault();
        
        try {
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
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

    async handleRegister(e) {
        e.preventDefault();
        
        try {
            const name = document.getElementById('regName').value;
            const email = document.getElementById('regEmail').value;
            const password = document.getElementById('regPassword').value;
            
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

    async loadUserProfile() {
        // For now, just set a default user
        this.currentUser = {
            id: 1,
            email: 'admin@chsacquittals.com',
            name: 'Admin User',
            created_at: new Date()
        };
    }

    async loadDashboardData() {
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

    updateDashboardStats() {
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

    setupFileUploadHandlers() {
        const uploadButtons = document.querySelectorAll('[data-upload]');
        uploadButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const target = e.target;
                const fileType = target.getAttribute('data-upload');
                if (fileType) {
                    this.handleFileUpload(fileType);
                }
            });
        });
    }

    async handleFileUpload(fileType) {
        const fileInput = document.getElementById(`${fileType}File`);
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

    showLogin() {
        console.log('Showing login screen');
        const loginScreen = document.getElementById('loginScreen');
        const registerScreen = document.getElementById('registerScreen');
        const dashboard = document.getElementById('dashboard');

        if (loginScreen) loginScreen.style.display = 'flex';
        if (registerScreen) registerScreen.style.display = 'none';
        if (dashboard) dashboard.style.display = 'none';
    }

    showRegister() {
        console.log('Showing register screen');
        const loginScreen = document.getElementById('loginScreen');
        const registerScreen = document.getElementById('registerScreen');
        const dashboard = document.getElementById('dashboard');

        if (loginScreen) loginScreen.style.display = 'none';
        if (registerScreen) registerScreen.style.display = 'flex';
        if (dashboard) dashboard.style.display = 'none';
    }

    showDashboard() {
        const loginScreen = document.getElementById('loginScreen');
        const registerScreen = document.getElementById('registerScreen');
        const dashboard = document.getElementById('dashboard');

        if (loginScreen) loginScreen.style.display = 'none';
        if (registerScreen) registerScreen.style.display = 'none';
        if (dashboard) dashboard.style.display = 'block';

        this.showSection('overview');
    }

    showSection(sectionId) {
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

    showMessage(elementId, message, type) {
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = `<div class="${type}">${message}</div>`;
        }
    }

    logout() {
        this.authState.token = null;
        this.authState.user = null;
        this.authState.isAuthenticated = false;
        this.currentUser = null;
        apiService.clearToken();
        this.showLogin();
    }

    async exportExcel() {
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

    async exportPDF() {
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
window.app = app;
window.showRegister = () => app.showRegister();
window.showLogin = () => app.showLogin();
window.logout = () => app.logout();
window.exportExcel = () => app.exportExcel();
window.exportPDF = () => app.exportPDF(); 