// API Client Service for Frappe HRMS Modern Redesign
import { Employee, LeaveRequest, ComplianceDueItem, PayrollBatch, SalaryComponent } from '../types';

// Helper to get active tenant ID from URL path or query string
function getTenantHeader(): Record<string, string> {
  const queryTenant = new URLSearchParams(window.location.search).get('tenant');
  const pathname = window.location.pathname.replace(/^\/+|\/+$/g, '');
  const pathTenant = (pathname && pathname !== 'admin' && pathname !== 'superadmin') ? pathname : null;
  const tenant = queryTenant || pathTenant || 'apex';

  return {
    'Content-Type': 'application/json',
    'x-tenant-id': tenant
  };
}

export const api = {
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
      return { status: 'offline', app: 'Frappe HRMS' };
    }
  },

  // Employees
  async getEmployees(params?: { branch?: string; department?: string; status?: string; query?: string }) {
    try {
      const queryParams = new URLSearchParams();
      const headers = getTenantHeader();
      queryParams.append('tenant', headers['x-tenant-id']);
      if (params?.branch) queryParams.append('branch', params.branch);
      if (params?.department) queryParams.append('department', params.department);
      if (params?.status) queryParams.append('status', params.status);
      if (params?.query) queryParams.append('query', params.query);

      const res = await fetch(`/api/employees?${queryParams.toString()}`, {
        headers: getTenantHeader()
      });
      const data = await res.json();
      return data.employees as (Employee & { customComponents?: Record<string, number> })[];
    } catch (err) {
      console.warn('Backend API offline, falling back to local state:', err);
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
    } catch (err) {
      return { success: false, error: 'Network error' };
    }
  },

  async updateEmployee(id: string, updates: Partial<Employee> & { customComponents?: Record<string, number> }) {
    try {
      const res = await fetch(`/api/employees/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      return await res.json();
    } catch (err) {
      return { success: false };
    }
  },

  async deleteEmployee(id: string) {
    try {
      const res = await fetch(`/api/employees/${id}`, { method: 'DELETE' });
      return await res.json();
    } catch (err) {
      return { success: false };
    }
  },

  // Salary Components CRUD
  async getSalaryComponents() {
    try {
      const res = await fetch('/api/masters/components');
      const data = await res.json();
      return data.components as SalaryComponent[];
    } catch {
      return null;
    }
  },

  async createSalaryComponent(component: Partial<SalaryComponent>) {
    try {
      const res = await fetch('/api/masters/components', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(component)
      });
      return await res.json();
    } catch {
      return { success: false };
    }
  },

  async updateSalaryComponent(id: string, updates: Partial<SalaryComponent>) {
    try {
      const res = await fetch(`/api/masters/components/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      return await res.json();
    } catch {
      return { success: false };
    }
  },

  async deleteSalaryComponent(id: string) {
    try {
      const res = await fetch(`/api/masters/components/${id}`, { method: 'DELETE' });
      return await res.json();
    } catch {
      return { success: false };
    }
  },

  // Attendance
  async getAttendance() {
    try {
      const res = await fetch('/api/attendance');
      return await res.json();
    } catch {
      return null;
    }
  },

  async updateAttendanceCell(update: { employeeId: string; day: string; status: string; otHours?: number }) {
    try {
      const res = await fetch('/api/attendance/update-cell', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(update)
      });
      return await res.json();
    } catch {
      return { success: false };
    }
  },

  async importBiometrics() {
    try {
      const res = await fetch('/api/attendance/bulk-import', { method: 'POST' });
      return await res.json();
    } catch {
      return { success: false };
    }
  },

  async importMonthlyAttendanceCSV(records: Array<{ employeeId: string; dayStatuses: Record<string, string> }>) {
    try {
      const res = await fetch('/api/attendance/bulk-import-month', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month: 'July 2026', records })
      });
      return await res.json();
    } catch {
      return { success: false };
    }
  },

  // Leave Requests
  async getLeaveRequests() {
    try {
      const res = await fetch('/api/leave/requests');
      const data = await res.json();
      return data.requests as LeaveRequest[];
    } catch {
      return null;
    }
  },

  async createLeaveRequest(request: Partial<LeaveRequest>) {
    try {
      const res = await fetch('/api/leave/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      return await res.json();
    } catch {
      return { success: false };
    }
  },

  // Payroll
  async getPayrollBatches() {
    try {
      const res = await fetch('/api/payroll/batches');
      const data = await res.json();
      return data.batches as PayrollBatch[];
    } catch {
      return null;
    }
  },

  async processPayrollStep(step: number, batchId?: string) {
    try {
      const res = await fetch('/api/payroll/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      const res = await fetch('/api/reports/pay-register');
      return await res.json();
    } catch {
      return null;
    }
  },

  async getPfSummaryReport() {
    try {
      const res = await fetch('/api/reports/pf-summary');
      return await res.json();
    } catch {
      return null;
    }
  },

  async getEsiSummaryReport() {
    try {
      const res = await fetch('/api/reports/esi-summary');
      return await res.json();
    } catch {
      return null;
    }
  },

  async getPtSummaryReport() {
    try {
      const res = await fetch('/api/reports/pt-summary');
      return await res.json();
    } catch {
      return null;
    }
  },

  // Compliance
  async getComplianceItems() {
    try {
      const res = await fetch('/api/compliance/items');
      const data = await res.json();
      return data.items as ComplianceDueItem[];
    } catch {
      return null;
    }
  },

  async fileComplianceReturn(itemId: string) {
    try {
      const res = await fetch('/api/compliance/file-return', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      const res = await fetch('/api/masters');
      return await res.json();
    } catch {
      return null;
    }
  },

  async createBranch(branch: { code: string; name: string; city: string; state: string }) {
    try {
      const res = await fetch('/api/masters/branches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
        headers: { 'Content-Type': 'application/json' },
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
      const res = await fetch('/api/integrations');
      return await res.json();
    } catch {
      return null;
    }
  },

  async toggleIntegration(id: string) {
    try {
      const res = await fetch('/api/integrations/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      const res = await fetch('/api/settings');
      return await res.json();
    } catch {
      return null;
    }
  },

  async updateSettings(settings: any) {
    try {
      const res = await fetch('/api/settings/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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

  async createTenant(tenant: { name: string; domain: string; plan: string; region: string; maxEmployees: number }) {
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
      const res = await fetch('/api/registers/options');
      return await res.json();
    } catch {
      return null;
    }
  },

  async renderStatutoryRegister(params: { register: string; company?: string; month?: string; year?: string; bonusPercent?: number }) {
    try {
      const res = await fetch('/api/registers/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      return await res.json();
    } catch {
      return { success: false, html: '<div>Could not render statutory register.</div>' };
    }
  }
};
