import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { CommandPalette } from './components/layout/CommandPalette';
import { ActionDashboard } from './components/dashboard/ActionDashboard';
import { EmployeeDirectory } from './components/employees/EmployeeDirectory';
import { EmployeeProfile } from './components/employees/EmployeeProfile';
import { AttendanceGrid } from './components/attendance/AttendanceGrid';
import { LeaveManagement } from './components/leave/LeaveManagement';
import { PayrollWizard } from './components/payroll/PayrollWizard';
import { ComplianceHub } from './components/compliance/ComplianceHub';
import { StatutoryRegisters } from './components/compliance/StatutoryRegisters';
import { HrLetters } from './components/hr/HrLetters';
import { ReportsAnalytics } from './components/reports/ReportsAnalytics';
import { ConsolidatedMasters } from './components/masters/ConsolidatedMasters';
import { WorkflowJourney } from './components/workflows/WorkflowJourney';
import { IntegrationsHub } from './components/integrations/IntegrationsHub';
import { SettingsView } from './components/settings/SettingsView';
import { SuperAdminPortal } from './components/superadmin/SuperAdminPortal';
import { AiAssistantDrawer } from './components/ai/AiAssistantDrawer';
import { FrappeRationaleModal } from './components/modals/FrappeRationaleModal';
import { InteractiveDemoEngine } from './components/demo/InteractiveDemoEngine';
import { LoginPage, AuthUser } from './components/auth/LoginPage';
import { sampleEmployees } from './data/mockData';
import { Employee, LeaveRequest, NavigationSection } from './types';
import { api } from './services/api';

export default function App() {
  // Authentication & 1-Hour Session Security State
  // Helper to extract active tenant and active section from URL path
  const parseUrlPath = () => {
    const pathname = window.location.pathname.replace(/^\/+|\/+$/g, '');
    const segments = pathname.split('/').filter(Boolean);
    const queryParams = new URLSearchParams(window.location.search);
    const querySection = queryParams.get('section');
    const queryTenant = queryParams.get('tenant');

    const isAdmin = pathname === 'admin' || pathname === 'superadmin' || queryParams.get('admin') === 'true';

    let tenant = queryTenant || sessionStorage.getItem('payrollpro_active_tenant') || 'apex';
    let section: NavigationSection = 'dashboard';

    if (segments.length >= 1 && segments[0] !== 'admin' && segments[0] !== 'superadmin' && !segments[0].startsWith('api')) {
      tenant = segments[0].toLowerCase().replace(/[^a-z0-9-]/g, '');
      if (segments.length >= 2) {
        section = segments[1] as NavigationSection;
      } else if (querySection) {
        section = querySection as NavigationSection;
      }
    } else if (querySection) {
      section = querySection as NavigationSection;
    }

    return { isAdmin, tenant, section };
  };

  const initialRoute = parseUrlPath();

  // Authentication & 1-Hour Session Security State (Strict Tab-Scoped Auth Guard)
  const [authUser, setAuthUser] = useState<AuthUser | null>(() => {
    try {
      const saved = sessionStorage.getItem('payrollpro_auth_user');
      const lastActive = sessionStorage.getItem('payrollpro_last_active_time');
      if (saved && lastActive) {
        const elapsed = Date.now() - parseInt(lastActive, 10);
        if (elapsed >= 3600000) {
          sessionStorage.removeItem('payrollpro_auth_user');
          sessionStorage.removeItem('payrollpro_last_active_time');
          return null;
        }
        const user: AuthUser = JSON.parse(saved);
        // Verify session matches target URL tenant or is Super Admin
        if (user.role === 'super_admin' || initialRoute.isAdmin || !initialRoute.tenant || user.tenantId === initialRoute.tenant) {
          return user;
        }
      }
    } catch {}
    return null;
  });

  const handleLoginSuccess = (user: AuthUser) => {
    setAuthUser(user);
    sessionStorage.setItem('payrollpro_auth_user', JSON.stringify(user));
    sessionStorage.setItem('payrollpro_last_active_time', Date.now().toString());
    localStorage.setItem('payrollpro_auth_user', JSON.stringify(user));
    localStorage.setItem('payrollpro_last_active_time', Date.now().toString());

    if (user.role === 'super_admin') {
      setIsAdminView(true);
      window.history.pushState({ admin: true }, '', '/admin');
    } else {
      const tenantCode = (user.tenantId || 'apex').toLowerCase().replace(/[^a-z0-9-]/g, '');
      sessionStorage.setItem('payrollpro_active_tenant', tenantCode);
      localStorage.setItem('payrollpro_active_tenant', tenantCode);
      setIsAdminView(false);
      setActiveSection('dashboard');
      window.history.pushState({ tenant: tenantCode, section: 'dashboard' }, '', `/${tenantCode}/dashboard`);
    }
  };

  const handleLogout = (msg?: string) => {
    setAuthUser(null);
    // Remove session ONLY from current browser tab so other tabs remain signed in
    sessionStorage.removeItem('payrollpro_auth_user');
    sessionStorage.removeItem('payrollpro_active_tenant');
    sessionStorage.removeItem('payrollpro_last_active_time');
    if (msg) {
      alert(msg);
    }
  };

  // Activity tracker for 1-Hour Inactivity Session Lock
  useEffect(() => {
    if (!authUser) return;

    const updateActivity = () => {
      const now = Date.now().toString();
      sessionStorage.setItem('payrollpro_last_active_time', now);
      localStorage.setItem('payrollpro_last_active_time', now);
    };

    window.addEventListener('mousemove', updateActivity);
    window.addEventListener('keydown', updateActivity);
    window.addEventListener('mousedown', updateActivity);
    window.addEventListener('scroll', updateActivity);
    window.addEventListener('touchstart', updateActivity);

    const interval = setInterval(() => {
      const lastActive = sessionStorage.getItem('payrollpro_last_active_time') || localStorage.getItem('payrollpro_last_active_time');
      if (lastActive) {
        const elapsed = Date.now() - parseInt(lastActive, 10);
        if (elapsed >= 3600000) {
          handleLogout('Your session has expired due to 1 hour of inactivity. Please log in again.');
        }
      }
    }, 15000);

    return () => {
      window.removeEventListener('mousemove', updateActivity);
      window.removeEventListener('keydown', updateActivity);
      window.removeEventListener('mousedown', updateActivity);
      window.removeEventListener('scroll', updateActivity);
      window.removeEventListener('touchstart', updateActivity);
      clearInterval(interval);
    };
  }, [authUser]);

  const [activeSection, setActiveSection] = useState<NavigationSection>(initialRoute.section);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [employeesList, setEmployeesList] = useState<Employee[]>([]);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);
  const [aiPromptContext, setAiPromptContext] = useState('');
  const [isRationaleModalOpen, setIsRationaleModalOpen] = useState(false);
  const [isDemoModeActive, setIsDemoModeActive] = useState(false);

  // Responsive Sidebar States
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState('ALL');

  // Dedicated SuperAdmin URL routing logic (Isolates Super Admin from Company Tenants)
  const [isAdminView, setIsAdminView] = useState<boolean>(initialRoute.isAdmin);

  const handleSelectSection = (section: NavigationSection) => {
    setActiveSection(section);
    setSelectedEmployeeId(null);
    const tenant = (authUser?.tenantId || sessionStorage.getItem('payrollpro_active_tenant') || initialRoute.tenant || 'apex').toLowerCase().replace(/[^a-z0-9-]/g, '');
    const cleanPath = `/${tenant}/${section}`;
    try {
      window.history.pushState({ section, tenant }, '', cleanPath);
    } catch {}
  };

  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      const route = parseUrlPath();
      setIsAdminView(route.isAdmin);
      if (route.tenant) {
        sessionStorage.setItem('payrollpro_active_tenant', route.tenant);
        localStorage.setItem('payrollpro_active_tenant', route.tenant);
      }
      setActiveSection(route.section);
      setSelectedEmployeeId(null);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const [currentCompanyName, setCurrentCompanyName] = useState<string>('Apex Enterprises Pvt. Ltd.');
  const [leaveRequestsList, setLeaveRequestsList] = useState<LeaveRequest[]>([]);

  // Load employees from Express REST API on mount / tenant change
  useEffect(() => {
    async function loadBackendData() {
      const info = await api.getTenantInfo();
      if (info && info.companyName) {
        setCurrentCompanyName(info.companyName);
      }
      const data = await api.getEmployees();
      if (Array.isArray(data)) {
        setEmployeesList(data);
      }
      const leaveData = await api.getLeaveRequests();
      if (Array.isArray(leaveData)) {
        setLeaveRequestsList(leaveData);
      }
    }
    loadBackendData();
  }, [window.location.pathname, window.location.search]);

  const handleOpenAiAssistant = (context: string) => {
    setAiPromptContext(context);
    setIsAiDrawerOpen(true);
  };

  const handleAddEmployee = async (newEmployee: Employee) => {
    setEmployeesList((prev) => [newEmployee, ...prev]);
    const res = await api.createEmployee(newEmployee);
    if (res && res.success && res.employee) {
      setEmployeesList((prev) => prev.map((e) => (e.id === newEmployee.id ? res.employee : e)));
    }
  };

  const selectedEmployee = employeesList.find((e) => e.id === selectedEmployeeId);
  const pendingLeaveCount = leaveRequestsList.filter((l) => l.status.includes('Pending')).length;

  const handleApproveLeave = async (leaveId: string) => {
    setLeaveRequestsList((prev) =>
      prev.map((r) => (r.id === leaveId ? { ...r, status: 'Approved' } : r))
    );
    await api.updateLeaveStatus(leaveId, 'Approved');
  };

  const handleRejectLeave = async (leaveId: string) => {
    setLeaveRequestsList((prev) =>
      prev.map((r) => (r.id === leaveId ? { ...r, status: 'Rejected' } : r))
    );
    await api.updateLeaveStatus(leaveId, 'Rejected');
  };

  // Render Login Page if user is not authenticated
  if (!authUser) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} initialTenantCode={initialRoute.tenant} />;
  }

  // Standalone Isolated SuperAdmin Portal View (runs at http://localhost:3000/admin)
  if (isAdminView || authUser.role === 'super_admin') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased">
        <div className="h-14 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-bold">
              ⚡
            </div>
            <div>
              <span className="font-bold text-white text-sm">hrms_control</span>
              <span className="text-slate-400 ml-2 text-[11px]">SaaS Super Admin Control Plane</span>
            </div>
            <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
              http://localhost:3000/admin
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleLogout()}
              className="px-3 py-1.5 bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-800/80 rounded-lg text-xs font-bold transition-all"
            >
              Sign Out
            </button>
            {authUser.role === 'super_admin' && (
              <button
                onClick={() => setIsAdminView(false)}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold"
              >
                Switch to Company Tenant View
              </button>
            )}
          </div>
        </div>

        <div className="flex-1">
          <SuperAdminPortal />
        </div>
      </div>
    );
  }

  // Tenant Application View (Company HRMS)
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900 antialiased selection:bg-indigo-500 selection:text-white">
      {/* Sidebar Navigation (No Super Admin Link) */}
      <Sidebar
        currentSection={activeSection}
        onSelectSection={handleSelectSection}
        collapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        mobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        onOpenFrappeRationale={() => setIsRationaleModalOpen(true)}
        onOpenAiAssistant={() => handleOpenAiAssistant('General HR & Payroll Query')}
        companyName={currentCompanyName}
        employeesCount={employeesList.length}
        pendingLeaveCount={pendingLeaveCount}
      />

      {/* Main Content Workspace Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden transition-all duration-300 ${
          isSidebarCollapsed ? 'md:pl-20' : 'md:pl-64'
        }`}
      >
        {/* Top Header */}
        <Header
          currentSection={activeSection}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onOpenAiAssistant={() => handleOpenAiAssistant('General HR & Payroll Query')}
          onOpenFrappeRationale={() => setIsRationaleModalOpen(true)}
          onOpenDemoMode={() => setIsDemoModeActive(true)}
          onSelectSection={handleSelectSection}
          selectedBranch={selectedBranch}
          onChangeBranch={setSelectedBranch}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          companyName={currentCompanyName}
          onLogout={() => handleLogout()}
        />

        {/* View Router Main Content */}
        <main className="flex-1 pb-12">
          {/* 1. Action Dashboard */}
          {activeSection === 'dashboard' && (
            <ActionDashboard
              onSelectSection={(sec) => {
                setActiveSection(sec);
                setSelectedEmployeeId(null);
              }}
              onSelectEmployee={(empId) => {
                setActiveSection('employees');
                setSelectedEmployeeId(empId);
              }}
              onOpenAiAssistant={handleOpenAiAssistant}
              employeesList={employeesList}
              leaveRequestsList={leaveRequestsList}
              onApproveLeave={handleApproveLeave}
              onRejectLeave={handleRejectLeave}
            />
          )}

          {/* 2. Employee Master & Directory / Profile */}
          {activeSection === 'employees' && (
            <>
              {selectedEmployeeId && selectedEmployee ? (
                <EmployeeProfile
                  employee={selectedEmployee}
                  onBack={() => setSelectedEmployeeId(null)}
                  onOpenAiAssistant={handleOpenAiAssistant}
                />
              ) : (
                <EmployeeDirectory
                  employees={employeesList}
                  onAddEmployee={handleAddEmployee}
                  onSelectEmployee={(empId) => setSelectedEmployeeId(empId)}
                  onOpenAiAssistant={handleOpenAiAssistant}
                />
              )}
            </>
          )}

          {/* 3. Monthly Attendance Grid */}
          {activeSection === 'attendance' && <AttendanceGrid />}

          {/* 4. Leave & Holidays Management */}
          {activeSection === 'leave' && <LeaveManagement employeesList={employeesList} />}

          {/* 5. Guided Payroll Wizard */}
          {activeSection === 'payroll' && <PayrollWizard />}

          {/* 6. Statutory Compliance Hub */}
          {activeSection === 'compliance' && <ComplianceHub />}

          {/* 6b. Statutory Registers */}
          {activeSection === 'statutory-registers' && <StatutoryRegisters />}

          {/* 6c. HR Letters & Service Certificates */}
          {activeSection === 'hr-letters' && (
            <HrLetters
              companyName={currentCompanyName}
              companyLogo={localStorage.getItem('payrollpro_company_logo') || undefined}
            />
          )}

          {/* 7. Reports & Analytics */}
          {activeSection === 'reports' && <ReportsAnalytics />}

          {/* 8. Consolidated Masters */}
          {activeSection === 'masters' && <ConsolidatedMasters />}

          {/* 9. Workflow-First Journey Map */}
          {activeSection === 'workflows' && (
            <WorkflowJourney
              onSelectSection={(sec) => {
                setActiveSection(sec);
                setSelectedEmployeeId(null);
              }}
            />
          )}

          {/* 10. Integrations Hub */}
          {activeSection === 'integrations' && <IntegrationsHub />}

          {/* 11. System Settings */}
          {activeSection === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Global Command Palette Modal (Cmd + K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectSection={(sec) => {
          setActiveSection(sec);
          setSelectedEmployeeId(null);
        }}
        onSelectEmployee={(empId) => {
          setActiveSection('employees');
          setSelectedEmployeeId(empId);
        }}
        onOpenAiAssistant={() => handleOpenAiAssistant('Command Palette Query')}
      />

      {/* Slide-over Frappe HR Copilot AI Assistant Drawer */}
      <AiAssistantDrawer
        isOpen={isAiDrawerOpen}
        onClose={() => setIsAiDrawerOpen(false)}
        initialPrompt={aiPromptContext}
      />

      {/* Frappe UX Rationale & DocType Mapping Modal */}
      <FrappeRationaleModal
        isOpen={isRationaleModalOpen}
        onClose={() => setIsRationaleModalOpen(false)}
      />

      {/* Interactive Guided Demo & Video Recording Engine */}
      <InteractiveDemoEngine
        isActive={isDemoModeActive}
        onClose={() => setIsDemoModeActive(false)}
        onSelectSection={(sec) => {
          setActiveSection(sec);
          setSelectedEmployeeId(null);
        }}
        onSelectEmployee={(empId) => {
          setActiveSection('employees');
          setSelectedEmployeeId(empId);
        }}
        onOpenAiAssistant={handleOpenAiAssistant}
      />
    </div>
  );
}
