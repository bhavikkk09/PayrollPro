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
  const [authUser, setAuthUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem('payrollpro_auth_user');
      const lastActive = localStorage.getItem('payrollpro_last_active_time');
      if (saved && lastActive) {
        const elapsed = Date.now() - parseInt(lastActive, 10);
        // 1 Hour = 3600000 ms
        if (elapsed >= 3600000) {
          localStorage.removeItem('payrollpro_auth_user');
          localStorage.removeItem('payrollpro_last_active_time');
          return null;
        }
        return JSON.parse(saved);
      }
    } catch {}
    return null;
  });

  const handleLoginSuccess = (user: AuthUser) => {
    setAuthUser(user);
    localStorage.setItem('payrollpro_auth_user', JSON.stringify(user));
    localStorage.setItem('payrollpro_last_active_time', Date.now().toString());
    if (user.role === 'super_admin') {
      setIsAdminView(true);
    } else {
      setIsAdminView(false);
      setActiveSection('dashboard');
    }
  };

  const handleLogout = (msg?: string) => {
    setAuthUser(null);
    localStorage.removeItem('payrollpro_auth_user');
    localStorage.removeItem('payrollpro_last_active_time');
    if (msg) {
      alert(msg);
    }
  };

  // Activity tracker for 1-Hour Inactivity Session Lock
  useEffect(() => {
    if (!authUser) return;

    const updateActivity = () => {
      localStorage.setItem('payrollpro_last_active_time', Date.now().toString());
    };

    window.addEventListener('mousemove', updateActivity);
    window.addEventListener('keydown', updateActivity);
    window.addEventListener('mousedown', updateActivity);
    window.addEventListener('scroll', updateActivity);
    window.addEventListener('touchstart', updateActivity);

    const interval = setInterval(() => {
      const lastActive = localStorage.getItem('payrollpro_last_active_time');
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

  const [activeSection, setActiveSection] = useState<NavigationSection>('dashboard');
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
  const [isAdminView, setIsAdminView] = useState<boolean>(() => {
    return (
      window.location.pathname === '/admin' ||
      window.location.pathname === '/superadmin' ||
      window.location.search.includes('admin=true')
    );
  });

  const handleSelectSection = (section: NavigationSection) => {
    setActiveSection(section);
    setSelectedEmployeeId(null);
    try {
      window.history.pushState({ section }, '', `?section=${section}`);
    } catch {}
  };

  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      setIsAdminView(
        window.location.pathname === '/admin' ||
        window.location.pathname === '/superadmin' ||
        window.location.search.includes('admin=true')
      );
      if (e.state?.section) {
        setActiveSection(e.state.section);
        setSelectedEmployeeId(null);
      }
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
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
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
