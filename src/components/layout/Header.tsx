import React, { useState, useEffect } from 'react';
import {
  Menu,
  Search,
  Plus,
  Sparkles,
  Building2,
  Info,
  Command,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  Play,
  CalendarCheck,
  Download,
  FileText,
  Server,
  ExternalLink,
  Video,
  LogOut
} from 'lucide-react';
import { NavigationSection } from '../../types';
import { api } from '../../services/api';

interface HeaderProps {
  currentSection: NavigationSection;
  onOpenCommandPalette: () => void;
  onOpenAiAssistant: () => void;
  onOpenFrappeRationale: () => void;
  onOpenDemoMode?: () => void;
  onSelectSection: (section: NavigationSection) => void;
  selectedBranch: string;
  onChangeBranch: (branch: string) => void;
  onToggleMobileSidebar: () => void;
  companyName?: string;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentSection,
  onOpenCommandPalette,
  onOpenAiAssistant,
  onOpenFrappeRationale,
  onOpenDemoMode,
  onSelectSection,
  selectedBranch,
  onChangeBranch,
  onToggleMobileSidebar,
  companyName,
  onLogout
}) => {
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [dynamicBranches, setDynamicBranches] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    async function loadBranches() {
      const data = await api.getMasters();
      if (data && data.branches && Array.isArray(data.branches)) {
        setDynamicBranches(data.branches);
      }
    }
    loadBranches();
  }, [window.location.pathname]);

  const sectionTitles: Record<NavigationSection, { title: string; subtitle: string }> = {
    dashboard: { title: 'Action Dashboard', subtitle: 'Real-time operational alerts, attendance & payroll status' },
    employees: { title: 'Employee Directory', subtitle: 'Manage employee master, 1-page profile, and lifecycle' },
    attendance: { title: 'Attendance Grid', subtitle: 'Excel-like 31-day bulk editor with OT and punch resolution' },
    leave: { title: 'Leave & Holidays', subtitle: 'Leave request approvals, ledger balances & sandwich policy' },
    payroll: { title: 'Payroll Wizard', subtitle: '7-step Indian payroll engine: PF, ESIC, PT, TDS & Bank File' },
    compliance: { title: 'Compliance Hub', subtitle: 'PF ECR text file, ESIC return, PT slabs & Form 24Q TDS' },
    'statutory-registers': { title: 'Statutory Registers', subtitle: 'Form IV B Pay Slips, Pay Register, Form XVI Muster Roll, PF/ESI/PT statements' },
    'hr-letters': { title: 'HR Letters & Certificates', subtitle: 'Offer letters, Appointment orders, Relieving certs & Warning notices' },
    reports: { title: 'Reports & Analytics', subtitle: 'Headcount trends, attrition rate, attendance & cost charts' },
    masters: { title: 'Masters & Setup', subtitle: 'Company setup, Shift types, Salary components & Approval matrix' },
    workflows: { title: 'Workflow Journey', subtitle: 'End-to-end process visualizer & Frappe Doctype mapping' },
    integrations: { title: 'Integrations & APIs', subtitle: 'Biometric logs, Razorpay payout, EPFO Portal & WhatsApp HR' },
    ai: { title: 'AI HR Copilot', subtitle: 'Intelligent policy drafting, letter generator & anomaly check' },
    settings: { title: 'System Settings', subtitle: 'User roles, security permissions & Frappe REST API config' },
    superadmin: { title: 'Super Admin Control Panel', subtitle: 'GCP multi-tenant SaaS site orchestration, Cloud SQL, billing & provisioning' },
  };

  const current = sectionTitles[currentSection] || { title: 'Frappe HRMS', subtitle: 'Enterprise HR platform' };

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 sticky top-0 z-20 px-3 sm:px-6 flex items-center justify-between shadow-xs">
      {/* Mobile Menu Button + Title */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          onClick={onToggleMobileSidebar}
          className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 md:hidden transition-colors shrink-0"
          title="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Back / Forward History Navigation Control */}
        <div className="flex items-center gap-0.5 bg-slate-100/90 p-1 rounded-xl border border-slate-200/80 shrink-0">
          <button
            onClick={() => window.history.back()}
            className="p-1 text-slate-600 hover:text-indigo-600 hover:bg-white rounded-lg transition-all cursor-pointer shadow-2xs"
            title="Navigate Back (Previous Page)"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => window.history.forward()}
            className="p-1 text-slate-600 hover:text-indigo-600 hover:bg-white rounded-lg transition-all cursor-pointer shadow-2xs"
            title="Navigate Forward (Next Page)"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2 truncate">
            <h1 className="text-sm sm:text-base font-semibold text-slate-900 tracking-tight truncate">
              {current.title}
            </h1>
            <span className="hidden sm:inline-block text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium border border-slate-200 shrink-0">
              India Edition
            </span>
          </div>
          <p className="text-xs text-slate-500 font-normal hidden lg:block truncate">
            {current.subtitle}
          </p>
        </div>
      </div>

      {/* Center & Right Actions: Command Palette Trigger & Controls */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        {/* Branch Switcher */}
        <div className="relative hidden xl:flex items-center">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700">
            <Building2 className="w-3.5 h-3.5 text-indigo-600" />
            <select
              value={selectedBranch}
              onChange={(e) => onChangeBranch(e.target.value)}
              className="bg-transparent border-none outline-hidden cursor-pointer text-xs font-semibold text-slate-800 pr-1"
            >
              <option value="ALL">All Branches ({companyName || 'Corporate Entity'})</option>
              {dynamicBranches.length > 0
                ? dynamicBranches.map((b) => (
                    <option key={b.id || b.name} value={b.name}>
                      {b.name}
                    </option>
                  ))
                : ['Mumbai Headquarters', 'Bengaluru Tech Hub', 'Pune Works'].map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
            </select>
          </div>
        </div>

        {/* Global Search / Command Palette Trigger */}
        <button
          onClick={onOpenCommandPalette}
          className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 bg-slate-100 hover:bg-slate-200/70 border border-slate-200/80 text-slate-500 rounded-lg text-xs font-medium transition-all"
          title="Global Search & Shortcuts (Cmd + K)"
        >
          <Search className="w-3.5 h-3.5 text-slate-500" />
          <span className="hidden md:inline text-slate-600">Search...</span>
          <span className="hidden sm:flex bg-white px-1.5 py-0.5 rounded-md text-[10px] font-mono text-slate-500 border border-slate-200 items-center gap-0.5 shadow-xs">
            <Command className="w-2.5 h-2.5" /> K
          </span>
        </button>

        {/* Quick Actions Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowQuickActions(!showQuickActions)}
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium shadow-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Quick Action</span>
            <ChevronDown className="w-3 h-3 opacity-80" />
          </button>

          {showQuickActions && (
            <div
              className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200/80 py-1.5 z-50 text-xs text-slate-700 animate-in fade-in slide-in-from-top-2"
              onMouseLeave={() => setShowQuickActions(false)}
            >
              <div className="px-3 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Common HR Operations
              </div>
              <button
                onClick={() => {
                  onSelectSection('employees');
                  setShowQuickActions(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-slate-50 text-slate-700 hover:text-indigo-600 text-left"
              >
                <UserPlus className="w-4 h-4 text-indigo-500" />
                Add New Employee
              </button>
              <button
                onClick={() => {
                  onSelectSection('payroll');
                  setShowQuickActions(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-slate-50 text-slate-700 hover:text-indigo-600 text-left"
              >
                <Play className="w-4 h-4 text-emerald-500" />
                Run Payroll Wizard
              </button>
              <button
                onClick={() => {
                  onSelectSection('attendance');
                  setShowQuickActions(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-slate-50 text-slate-700 hover:text-indigo-600 text-left"
              >
                <CalendarCheck className="w-4 h-4 text-blue-500" />
                Open Attendance Grid
              </button>
              <button
                onClick={() => {
                  onSelectSection('compliance');
                  setShowQuickActions(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-slate-50 text-slate-700 hover:text-indigo-600 text-left"
              >
                <Download className="w-4 h-4 text-amber-500" />
                Generate EPFO PF ECR
              </button>
              <button
                onClick={() => {
                  onOpenAiAssistant();
                  setShowQuickActions(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-slate-50 text-slate-700 hover:text-indigo-600 text-left border-t border-slate-100"
              >
                <FileText className="w-4 h-4 text-purple-500" />
                Draft Letter with AI Copilot
              </button>
            </div>
          )}
        </div>



        {/* AI Copilot Button */}
        <button
          onClick={onOpenAiAssistant}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-all"
          title="Ask AI HR Copilot"
        >
          <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
          <span className="hidden sm:inline">AI Copilot</span>
        </button>

        {/* Sign Out / Lock Session Button */}
        {onLogout && (
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 border border-slate-200 hover:border-red-200 rounded-lg text-xs font-semibold transition-all"
            title="Sign out of current session"
          >
            <LogOut className="w-3.5 h-3.5 text-slate-500 hover:text-red-600" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        )}

        {/* Frappe Doctype Info Button */}
        <button
          onClick={onOpenFrappeRationale}
          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          title="Frappe Doctype Mappings & UX Specs"
        >
          <Info className="w-4 h-4 text-indigo-600" />
        </button>
      </div>
    </header>
  );
};

