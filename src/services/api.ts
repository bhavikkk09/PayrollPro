// API Client Service for Frappe HRMS Modern Redesign
import { Employee, LeaveRequest, ComplianceDueItem, PayrollBatch, SalaryComponent } from '../types';

// Helper to get active tenant ID from URL path, query string, or active session
function getTenantHeader(): Record<string, string> {
  const queryTenant = new URLSearchParams(window.location.search).get('tenant');
  const pathname = window.location.pathname.replace(/^\/+|\/+$/g, '');
  const pathTenant = (pathname && pathname !== 'admin' && pathname !== 'superadmin' && !pathname.startsWith('api')) ? pathname : null;
  
  let savedTenant: string | null = null;
  let token: string | null = null;

  try {
    savedTenant = localStorage.getItem('payrollpro_active_tenant');
    const auth = localStorage.getItem('payrollpro_auth_user');
    if (auth) {
      const parsed = JSON.parse(auth);
      if (parsed.tenantId && parsed.tenantId !== 'platform_master' && !savedTenant) {
        savedTenant = parsed.tenantId;
      }
      if (parsed.token) token = parsed.token;
    }
  } catch {}

  const tenant = (queryTenant || pathTenant || savedTenant || 'apex')
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-tenant-id': tenant || 'apex'
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

export const api = {
  // Authentication
  async login(email: string, password: string, tenantCode?: string) {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, tenantCode })
      });
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await res.json();
      }
      return { success: false, message: 'Server returned invalid non-JSON response' };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Server connection error during login' };
    }
  },

  // Audit Logs
  async getAuditLogs() {
    try {
      const res = await fetch('/api/audit-logs', { headers: getTenantHeader() });
      return await res.json();
    } catch {
      return { success: false, logs: [] };
    }
  },

  // Tenant Info & Branding
  async getTenantInfo() {
    try {
      const res = await fetch('/api/tenant/info', { headers: getTenantHeader() });
      return await res.json();
    } catch {
      return null;
    }
  },

  // Health
  async getHealth() {
    try {
      const res = await fetch('/api/health', { headers: getTenantHeader() });
      return await res.json();
    } catch {
      return { status: 'offline', app: 'PayrollPro HRMS' };
    }
  },

  // Employees
  async getEmployees(params?: { branch?: string; department?: string; status?: string; query?: string; unmask?: boolean }) {
    try {
      const queryParams = new URLSearchParams();
      const headers = getTenantHeader();
      queryParams.append('tenant', headers['x-tenant-id']);
      if (params?.branch) queryParams.append('branch', params.branch);
      if (params?.department) queryParams.append('department', params.department);
      if (params?.status) queryParams.append('status', params.status);
      if (params?.query) queryParams.append('query', params.query);
      if (params?.unmask) queryParams.append('unmask', 'true');

      const res = await fetch(`/api/employees?${queryParams.toString()}`, {
        headers: getTenantHeader()
      });
      const data = await res.json();
      return data.employees as (Employee & { customComponents?: Record<string, number> })[];
    } catch (err) {
      console.warn('Backend API offline, returning empty:', err);
      return [];
    }
  },

  async createEmployee(employee: Partial<Employee>) {
    try {
      const res = await fetch('/api/employees', {
        method: 'POST',
        headers: getTenantHeader(),
        body: JSON.stringify(employee)
      });
      return await res.json();
    } catch {
      return { success: false };
    }
  },

  async updateEmployee(id: string, employee: Partial<Employee>) {
    try {
      const res = await fetch(`/api/employees/${id}`, {
        method: 'PUT',
        headers: getTenantHeader(),
        body: JSON.stringify(employee)
      });
      return await res.json();
    } catch {
      return { success: false };
    }
  },

  // Custom Components
  async getCustomComponents(employeeId: string) {
    try {
      const res = await fetch(`/api/employees/${employeeId}/components`, { headers: getTenantHeader() });
      const data = await res.json();
      return data.components as Record<string, number>;
    } catch {
      return {};
    }
  },

  async saveCustomComponents(employeeId: string, components: Record<string, number>) {
    try {
      const res = await fetch(`/api/employees/${employeeId}/components`, {
        method: 'POST',
        headers: getTenantHeader(),
        body: JSON.stringify({ components })
      });
      return await res.json();
    } catch {
      return { success: false };
    }
  },

  // Attendance
  async getAttendanceGrid(month = '2026-07') {
    try {
      const res = await fetch(`/api/attendance/grid?month=${month}`, { headers: getTenantHeader() });
      const data = await res.json();
      return data.grid;
    } catch {
      return null;
    }
  },

  async updateAttendanceStatus(employeeId: string, date: string, status: string) {
    try {
      const res = await fetch('/api/attendance/status', {
        method: 'POST',
        headers: getTenantHeader(),
        body: JSON.stringify({ employeeId, date, status })
      });
      return await res.json();
    } catch {
      return { success: false };
    }
  },

  async bulkUpdateAttendance(updates: Array<{ employeeId: string; date: string; status: string }>) {
    try {
      const res = await fetch('/api/attendance/bulk', {
        method: 'POST',
        headers: getTenantHeader(),
        body: JSON.stringify({ updates })
      });
      return await res.json();
    } catch {
      return { success: false };
    }
  },

  async syncBiometricLogs() {
    try {
      const res = await fetch('/api/attendance/biometric-sync', {
        method: 'POST',
        headers: getTenantHeader()
      });
      return await res.json();
    } catch {
      return { success: false, syncedCount: 0 };
    }
  },

  // Leave Requests
  async getLeaveRequests() {
    try {
      const res = await fetch('/api/leave/requests', { headers: getTenantHeader() });
      const data = await res.json();
      return data.requests as LeaveRequest[];
    } catch {
      return [];
    }
  },

  async createLeaveRequest(request: Partial<LeaveRequest>) {
    try {
      const res = await fetch('/api/leave/request', {
        method: 'POST',
        headers: getTenantHeader(),
        body: JSON.stringify(request)
      });
      return await res.json();
    } catch {
      return { success: false };
    }
  },

  async updateLeaveStatus(id: string, status: 'Approved' | 'Rejected') {
    try {
      const res = await fetch(`/api/leave/requests/${id}/status`, {
        method: 'PUT',
        headers: getTenantHeader(),
        body: JSON.stringify({ status })
      });
      return await res.json();
    } catch {
      return { success: false };
    }
  },

  // Payroll Engine
  async getPayrollBatches() {
    try {
      const res = await fetch('/api/payroll/batches', { headers: getTenantHeader() });
      const data = await res.json();
      return data.batches as PayrollBatch[];
    } catch {
      return [];
    }
  },

  async calculatePayrollBatch(month = 'July 2026', year = 2026) {
    try {
      const res = await fetch('/api/payroll/calculate', {
        method: 'POST',
        headers: getTenantHeader(),
        body: JSON.stringify({ month, year })
      });
      const data = await res.json();
      return data.batch as PayrollBatch;
    } catch {
      return null;
    }
  },

  async processPayrollStep(step: number, batchId?: string) {
    try {
      const res = await fetch('/api/payroll/process', {
        method: 'POST',
        headers: getTenantHeader(),
        body: JSON.stringify({ step, batchId })
      });
      return await res.json();
    } catch {
      return { success: false };
    }
  },

  // Reports
  async getPayRegisterReport() {
    try {
      const res = await fetch('/api/reports/pay-register', { headers: getTenantHeader() });
      return await res.json();
    } catch {
      return null;
    }
  },

  async getPfSummaryReport() {
    try {
      const res = await fetch('/api/reports/pf-summary', { headers: getTenantHeader() });
      return await res.json();
    } catch {
      return null;
    }
  },

  async getEsiSummaryReport() {
    try {
      const res = await fetch('/api/reports/esi-summary', { headers: getTenantHeader() });
      return await res.json();
    } catch {
      return null;
    }
  },

  async getPtSummaryReport() {
    try {
      const res = await fetch('/api/reports/pt-summary', { headers: getTenantHeader() });
      return await res.json();
    } catch {
      return null;
    }
  },

  // Compliance
  async getComplianceItems() {
    try {
      const res = await fetch('/api/compliance/items', { headers: getTenantHeader() });
      const data = await res.json();
      return data.items as ComplianceDueItem[];
    } catch {
      return [];
    }
  },

  async fileComplianceReturn(itemId: string) {
    try {
      const res = await fetch('/api/compliance/file-return', {
        method: 'POST',
        headers: getTenantHeader(),
        body: JSON.stringify({ itemId })
      });
      return await res.json();
    } catch {
      return { success: false };
    }
  },

  // Masters
  async getMasters() {
    try {
      const res = await fetch('/api/masters', { headers: getTenantHeader() });
      return await res.json();
    } catch {
      return null;
    }
  },

  async createBranch(branch: { code: string; name: string; city: string; state: string }) {
    try {
      const res = await fetch('/api/masters/branches', {
        method: 'POST',
        headers: getTenantHeader(),
        body: JSON.stringify(branch)
      });
      return await res.json();
    } catch {
      return { success: false };
    }
  },

  async createDepartment(name: string) {
    try {
      const res = await fetch('/api/masters/departments', {
        method: 'POST',
        headers: getTenantHeader(),
        body: JSON.stringify({ name })
      });
      return await res.json();
    } catch {
      return { success: false };
    }
  },

  // Integrations
  async getIntegrations() {
    try {
      const res = await fetch('/api/integrations', { headers: getTenantHeader() });
      return await res.json();
    } catch {
      return null;
    }
  },

  async toggleIntegration(id: string) {
    try {
      const res = await fetch('/api/integrations/toggle', {
        method: 'POST',
        headers: getTenantHeader(),
        body: JSON.stringify({ id })
      });
      return await res.json();
    } catch {
      return { success: false };
    }
  },

  // Settings
  async getSettings() {
    try {
      const res = await fetch('/api/settings', { headers: getTenantHeader() });
      return await res.json();
    } catch {
      return null;
    }
  },

  async updateSettings(settings: any) {
    try {
      const res = await fetch('/api/settings/update', {
        method: 'POST',
        headers: getTenantHeader(),
        body: JSON.stringify(settings)
      });
      return await res.json();
    } catch {
      return { success: false };
    }
  },

  // SaaS Super Admin
  async getTenants() {
    try {
      const res = await fetch('/api/superadmin/tenants');
      return await res.json();
    } catch {
      return null;
    }
  },

  async createTenant(tenant: { name: string; domain: string; plan: string; region: string; maxEmployees: number; demoData?: boolean }) {
    try {
      const res = await fetch('/api/superadmin/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tenant)
      });
      return await res.json();
    } catch {
      return { success: false };
    }
  },

  async updateTenantStatus(id: string, status: string) {
    try {
      const res = await fetch(`/api/superadmin/tenants/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      return await res.json();
    } catch {
      return { success: false };
    }
  },

  async getSuperAdminMetrics() {
    try {
      const res = await fetch('/api/superadmin/metrics');
      return await res.json();
    } catch {
      return null;
    }
  },

  // Statutory Registers
  async getStatutoryRegisterOptions() {
    try {
      const res = await fetch('/api/registers/options', { headers: getTenantHeader() });
      return await res.json();
    } catch {
      return null;
    }
  },

  async renderStatutoryRegister(params: { register: string; company?: string; month?: string; year?: string; bonusPercent?: number }) {
    try {
      const res = await fetch('/api/registers/render', {
        method: 'POST',
        headers: getTenantHeader(),
        body: JSON.stringify(params)
      });
      return await res.json();
    } catch {
      return { success: false, html: '<div>Could not render statutory register.</div>' };
    }
  }
};
