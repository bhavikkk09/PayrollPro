import React from 'react';
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  CalendarDays,
  Banknote,
  ShieldCheck,
  FileText,
  Mail,
  BarChart3,
  Database,
  GitFork,
  Plug,
  Sparkles,
  Settings,
  Building2,
  ChevronLeft,
  ChevronRight,
  Info,
  X,
  Server,
  ExternalLink,
  Globe
} from 'lucide-react';
import { NavigationSection } from '../../types';

interface SidebarProps {
  currentSection: NavigationSection;
  onSelectSection: (section: NavigationSection) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onOpenFrappeRationale: () => void;
  onOpenAiAssistant: () => void;
  companyName?: string;
  employeesCount?: number;
  pendingLeaveCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentSection,
  onSelectSection,
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
  onOpenFrappeRationale,
  onOpenAiAssistant,
  companyName,
  employeesCount = 0,
  pendingLeaveCount = 0
}) => {
  const tenantMenuItems = [
    { id: 'dashboard' as NavigationSection, label: 'Dashboard', icon: LayoutDashboard, badge: null },
    { id: 'employees' as NavigationSection, label: 'Employees', icon: Users, badge: String(employeesCount) },
    { id: 'attendance' as NavigationSection, label: 'Attendance', icon: CalendarCheck, badge: 'Excel' },
    { id: 'leave' as NavigationSection, label: 'Leave & Holidays', icon: CalendarDays, badge: pendingLeaveCount > 0 ? String(pendingLeaveCount) : null },
    { id: 'payroll' as NavigationSection, label: 'Payroll Wizard', icon: Banknote, badge: employeesCount > 0 ? 'Due' : null },
    { id: 'compliance' as NavigationSection, label: 'Compliance (IN)', icon: ShieldCheck, badge: 'PF/TDS' },
    { id: 'statutory-registers' as NavigationSection, label: 'Statutory Registers', icon: FileText, badge: 'Form IV' },
    { id: 'hr-letters' as NavigationSection, label: 'HR Letters & Certs', icon: Mail, badge: 'Templates' },
    { id: 'reports' as NavigationSection, label: 'Reports & Analytics', icon: BarChart3, badge: null },
    { id: 'masters' as NavigationSection, label: 'Masters & Setup', icon: Database, badge: null },
    { id: 'workflows' as NavigationSection, label: 'Workflows & Journey', icon: GitFork, badge: null },
    { id: 'integrations' as NavigationSection, label: 'Integrations', icon: Plug, badge: '3 Connected' },
    { id: 'ai' as NavigationSection, label: 'AI HR Copilot', icon: Sparkles, badge: 'AI' },
    { id: 'settings' as NavigationSection, label: 'Settings', icon: Settings, badge: null },
  ];

  const handleNavClick = (id: NavigationSection) => {
    if (id === 'ai') {
      onOpenAiAssistant();
    } else {
      onSelectSection(id);
    }
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Drawer Overlay Backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-30 md:hidden animate-in fade-in duration-200"
        />
      )}

      {/* Main Sidebar Drawer Container */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-40 bg-slate-900 text-slate-100 flex flex-col transition-all duration-300 ease-in-out border-r border-slate-800 ${
          mobileOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0'
        } ${collapsed ? 'md:w-20' : 'md:w-64'}`}
      >
        {/* Brand & Organization Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/20 shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            {(!collapsed || mobileOpen) && (
              <div className="flex flex-col truncate">
                <span className="font-bold text-sm tracking-tight text-slate-100 truncate">
                  PayrollPro
                </span>
                <span className="text-[11px] text-indigo-400 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  {companyName || 'Enterprise HR Suite'}
                </span>
              </div>
            )}
          </div>

          {/* Close button on mobile, Collapse button on desktop */}
          <div className="flex items-center gap-1">
            <button
              onClick={onCloseMobile}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 md:hidden transition-colors"
              title="Close Menu"
            >
              <X className="w-5 h-5" />
            </button>

            <button
              onClick={onToggleCollapse}
              className="hidden md:block p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors shrink-0"
              title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Primary Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1 custom-scrollbar">
          {(!collapsed || mobileOpen) && (
            <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Tenant HRMS Sections
            </div>
          )}

          {tenantMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentSection === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 group relative ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-slate-100'
                }`}
                title={collapsed && !mobileOpen ? item.label : undefined}
              >
                <Icon className={`w-5 h-5 shrink-0 transition-transform ${isActive ? 'scale-110' : 'group-hover:scale-105'}`} />

                {(!collapsed || mobileOpen) && (
                  <span className="truncate flex-1 text-left">{item.label}</span>
                )}

                {(!collapsed || mobileOpen) && item.badge && (
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : item.badge === 'AI'
                        ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white'
                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}

                {collapsed && !mobileOpen && isActive && (
                  <div className="absolute right-1 w-1.5 h-6 bg-white rounded-full"></div>
                )}
              </button>
            );
          })}
        </div>

        {/* User Info Footer */}
        {(!collapsed || mobileOpen) && (
          <div className="p-3 border-t border-slate-800/80 flex items-center gap-3 bg-slate-950/40">
            <div className="w-9 h-9 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center border border-indigo-400 text-xs shrink-0">
              {companyName ? companyName.charAt(0) : 'P'}
            </div>
            <div className="flex flex-col truncate">
              <span className="text-xs font-semibold text-slate-200 truncate">{companyName || 'PayrollPro'} Admin</span>
              <span className="text-[10px] text-slate-400 truncate">HR Operations Manager</span>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};

