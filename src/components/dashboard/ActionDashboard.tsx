import React from 'react';
import {
  Users,
  CalendarCheck,
  CalendarDays,
  Banknote,
  ShieldAlert,
  UserPlus,
  Play,
  FileSpreadsheet,
  Download,
  Cake,
  AlertCircle,
  FileText,
  Clock,
  Sparkles
} from 'lucide-react';
import { sampleEmployees, sampleLeaveRequests, sampleComplianceItems, sampleActionItems } from '../../data/mockData';
import { NavigationSection, Employee, LeaveRequest } from '../../types';

interface ActionDashboardProps {
  onSelectSection: (section: NavigationSection) => void;
  onSelectEmployee: (empId: string) => void;
  onOpenAiAssistant: () => void;
  employeesList?: Employee[];
  leaveRequestsList?: LeaveRequest[];
  onApproveLeave?: (id: string) => void;
  onRejectLeave?: (id: string) => void;
}

export const ActionDashboard: React.FC<ActionDashboardProps> = ({
  onSelectSection,
  onSelectEmployee,
  onOpenAiAssistant,
  employeesList = [],
  leaveRequestsList = [],
  onApproveLeave,
  onRejectLeave
}) => {
  const totalEmployees = employeesList.length;
  const presentCount = employeesList.filter((e) => (e.attendanceSummaryMtd?.present || 0) > 0).length;
  const absentCount = employeesList.filter((e) => (e.attendanceSummaryMtd?.absent || 0) > 0).length;
  const pendingLeaveRequests = leaveRequestsList.filter((l) => l.status.includes('Pending'));
  const pendingLeavesCount = pendingLeaveRequests.length;
  const complianceCount = totalEmployees > 0 ? 4 : 0;

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      {/* Action-Oriented Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-4 sm:p-6 shadow-xl border border-indigo-900/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
              Operational Hub
            </span>
            <span className="text-xs text-slate-400 font-mono">Month: July 2026</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight mt-1 text-white">
            Action Center & Daily HR Controls
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            {totalEmployees === 0 ? (
              <span>This tenant is initialized with <span className="text-emerald-300 font-semibold">0 employees (Clean Slate)</span>. Add your first employee below!</span>
            ) : (
              <span>You have <span className="text-yellow-300 font-semibold">{pendingLeavesCount + absentCount} urgent HR task(s)</span> requiring attention.</span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
          <button
            onClick={() => onSelectSection('payroll')}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-xs shadow-lg transition-all"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            Launch Payroll Wizard
          </button>
          <button
            onClick={onOpenAiAssistant}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-2 bg-purple-600/80 hover:bg-purple-600 text-white font-medium rounded-xl text-xs border border-purple-400/40 shadow-sm transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            AI Anomaly Check
          </button>
        </div>
      </div>

      {/* Primary KPI Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Present Today */}
        <div
          onClick={() => onSelectSection('attendance')}
          className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:border-emerald-500/50 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold text-slate-600">Present Today</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-110 transition-transform">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{presentCount}</span>
            <span className="text-xs font-medium text-slate-500">/ {totalEmployees}</span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-600 font-medium flex items-center gap-1">
            <span>{totalEmployees > 0 ? `${Math.round((presentCount / totalEmployees) * 100)}% Present` : '0 Active Employees'}</span>
          </div>
        </div>

        {/* Absent / Missing Punch */}
        <div
          onClick={() => onSelectSection('attendance')}
          className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:border-rose-500/50 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold text-slate-600">Absent / Missing</span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600 group-hover:scale-110 transition-transform">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{absentCount}</span>
          </div>
          <div className="mt-2 text-[11px] text-rose-600 font-medium">
            {absentCount > 0 ? 'Requires HR Resolution' : 'No Absences'}
          </div>
        </div>

        {/* Leave Requests */}
        <div
          onClick={() => onSelectSection('leave')}
          className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:border-amber-500/50 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold text-slate-600">Leave Requests</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600 group-hover:scale-110 transition-transform">
              <CalendarDays className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{pendingLeavesCount}</span>
            {pendingLeavesCount > 0 && (
              <span className="text-xs font-semibold px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded-md">
                Pending
              </span>
            )}
          </div>
          <div className="mt-2 text-[11px] text-amber-700 font-medium">
            {pendingLeavesCount > 0 ? `${pendingLeavesCount} Application(s) Pending` : 'All Requests Cleared'}
          </div>
        </div>

        {/* Payroll Status */}
        <div
          onClick={() => onSelectSection('payroll')}
          className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:border-indigo-500/50 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold text-slate-600">Payroll Status</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 group-hover:scale-110 transition-transform">
              <Banknote className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-lg font-bold text-slate-900">July 2026</span>
          </div>
          <div className="mt-2 text-[11px] text-indigo-600 font-semibold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            {totalEmployees > 0 ? 'Ready for Calculation' : 'Clean Slate Tenant'}
          </div>
        </div>

        {/* Compliance Due */}
        <div
          onClick={() => onSelectSection('compliance')}
          className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:border-purple-500/50 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold text-slate-600">Compliance Due</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600 group-hover:scale-110 transition-transform">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{complianceCount} Items</span>
          </div>
          <div className="mt-2 text-[11px] text-purple-600 font-medium">
            {complianceCount > 0 ? 'EPFO ECR & TDS Form 24Q' : 'No Pending Filings'}
          </div>
        </div>
      </div>

      {/* Quick Action Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
          Quick Actions & Operations
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          <button
            onClick={() => onSelectSection('employees')}
            className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-200/80 hover:border-indigo-200 text-slate-700 hover:text-indigo-700 text-xs font-medium transition-all group"
          >
            <UserPlus className="w-4 h-4 text-indigo-600 group-hover:scale-110 transition-transform" />
            <span>Add Employee</span>
          </button>

          <button
            onClick={() => onSelectSection('payroll')}
            className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200/80 hover:border-emerald-200 text-slate-700 hover:text-emerald-700 text-xs font-medium transition-all group"
          >
            <Play className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
            <span>Run Payroll</span>
          </button>

          <button
            onClick={() => onSelectSection('attendance')}
            className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200/80 hover:border-blue-200 text-slate-700 hover:text-blue-700 text-xs font-medium transition-all group"
          >
            <FileSpreadsheet className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
            <span>Attendance Grid</span>
          </button>

          <button
            onClick={() => onSelectSection('compliance')}
            className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 hover:bg-amber-50 border border-slate-200/80 hover:border-amber-200 text-slate-700 hover:text-amber-700 text-xs font-medium transition-all group"
          >
            <Download className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
            <span>Export Bank File</span>
          </button>

          <button
            onClick={onOpenAiAssistant}
            className="flex items-center gap-2.5 p-3 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-900 text-xs font-semibold transition-all group"
          >
            <Sparkles className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" />
            <span>Draft AI Document</span>
          </button>
        </div>
      </div>

      {/* Urgent Action Queue & Lifecycle Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Urgent Action Queue */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              Urgent HR Action Items
            </h3>
            <span className="text-xs text-slate-500">{sampleActionItems.length} items require response</span>
          </div>

          <div className="space-y-3">
            {sampleActionItems.map((action) => (
              <div
                key={action.id}
                className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between gap-4 hover:border-indigo-300 transition-all"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                      action.urgency === 'High' ? 'bg-rose-500' : 'bg-amber-500'
                    }`}
                  ></div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{action.title}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{action.subtitle}</p>
                    <span className="inline-block mt-1 text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-xs">
                      {action.category}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (action.actionType === 'GOTO_LEAVE') onSelectSection('leave');
                    else if (action.actionType === 'GOTO_ATTENDANCE') onSelectSection('attendance');
                    else if (action.actionType === 'GOTO_EMPLOYEES') onSelectSection('employees');
                    else if (action.actionType === 'GOTO_COMPLIANCE') onSelectSection('compliance');
                  }}
                  className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white rounded-xl text-xs font-semibold border border-indigo-200/80 transition-all shrink-0"
                >
                  {action.actionLabel}
                </button>
              </div>
            ))}
          </div>

          {/* Pending Leave Request Fast-Approve Box */}
          <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                <CalendarDays className="w-4 h-4 text-amber-600" />
                Pending Leave Applications Inbox ({pendingLeaveRequests.length})
              </h4>
              <button
                onClick={() => onSelectSection('leave')}
                className="text-xs text-amber-700 hover:underline font-semibold cursor-pointer"
              >
                View All Inbox →
              </button>
            </div>

            <div className="space-y-2">
              {pendingLeaveRequests.length === 0 ? (
                <div className="p-4 text-center bg-white rounded-xl border border-amber-200/60 text-slate-500 text-xs font-medium">
                  ✨ No pending leave applications requiring approval.
                </div>
              ) : (
                pendingLeaveRequests.map((req) => (
                  <div key={req.id} className="p-3 bg-white rounded-xl border border-amber-200/60 flex items-center justify-between text-xs hover:border-amber-400 transition-all shadow-2xs">
                    <div>
                      <span className="font-bold text-slate-900">{req.employeeName}</span>
                      <span className="text-slate-500"> • {req.leaveType}</span>
                      <p className="text-[11px] text-slate-500 mt-0.5">{req.fromDate} to {req.toDate} ({req.totalDays} days)</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onApproveLeave && onApproveLeave(req.id)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-xs transition-all shadow-2xs cursor-pointer"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => onRejectLeave && onRejectLeave(req.id)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-rose-100 text-slate-700 hover:text-rose-700 rounded-xl font-semibold text-xs border border-slate-200 transition-all cursor-pointer"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Personnel Life Events & Statutory Expiry Monitors */}
        <div className="space-y-4">
          {/* Birthdays & Work Anniversaries */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Cake className="w-4 h-4 text-pink-500" />
                Birthdays & Anniversaries
              </h3>
              <span className="text-[10px] text-pink-600 font-semibold bg-pink-50 px-2 py-0.5 rounded-full">
                This Week
              </span>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
                <div className="flex items-center gap-2.5">
                  <img
                    src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80"
                    alt="Priya"
                    className="w-7 h-7 rounded-full object-cover"
                  />
                  <div>
                    <div className="text-xs font-semibold text-slate-800">Priya Patel</div>
                    <div className="text-[10px] text-slate-500">Birthday • 29th July</div>
                  </div>
                </div>
                <button
                  onClick={() => alert("Wishes sent to Priya Patel via WhatsApp/Email!")}
                  className="text-[10px] font-semibold text-indigo-600 bg-white border border-slate-200 px-2 py-1 rounded-md hover:bg-indigo-50"
                >
                  Send Wish 🎉
                </button>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
                <div className="flex items-center gap-2.5">
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
                    alt="Amit"
                    className="w-7 h-7 rounded-full object-cover"
                  />
                  <div>
                    <div className="text-xs font-semibold text-slate-800">Amit Verma</div>
                    <div className="text-[10px] text-slate-500">6 Years Work Anniversary</div>
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">10 Aug</span>
              </div>
            </div>
          </div>

          {/* Probation & Document Expiry */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-indigo-600" />
              Probation & Document Expiry
            </h3>

            <div className="space-y-2">
              <div className="p-2.5 rounded-xl border border-indigo-100 bg-indigo-50/40 text-xs space-y-1">
                <div className="flex items-center justify-between font-semibold text-slate-800">
                  <span>Karan Mehta</span>
                  <span className="text-[10px] bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded-xs">
                    Probation Ends 01 Aug
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">Full Stack Dev • Bengaluru Branch</p>
                <button
                  onClick={() => onSelectEmployee('EMP-00105')}
                  className="text-[11px] font-bold text-indigo-600 hover:underline pt-1 block"
                >
                  Review Probation & Issue Letter →
                </button>
              </div>

              <div className="p-2.5 rounded-xl border border-amber-100 bg-amber-50/40 text-xs space-y-1">
                <div className="flex items-center justify-between font-semibold text-slate-800">
                  <span>Ananya Iyer</span>
                  <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-xs">
                    Notice Period (30 Days)
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">Exit Clearance & F&F Settlement pending</p>
                <button
                  onClick={() => onSelectEmployee('EMP-00106')}
                  className="text-[11px] font-bold text-amber-700 hover:underline pt-1 block"
                >
                  Open Exit Workflow →
                </button>
              </div>
            </div>
          </div>

          {/* Compliance Due Dates Widget */}
          <div className="p-4 bg-slate-900 text-slate-100 rounded-2xl border border-slate-800 shadow-md space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-emerald-400" />
                Statutory Deadlines
              </h3>
              <button
                onClick={() => onSelectSection('compliance')}
                className="text-[10px] text-emerald-400 font-semibold hover:underline"
              >
                Compliance Hub →
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-300">EPFO PF ECR Return</span>
                <span className="font-mono text-emerald-400 font-bold">15 Aug 2026</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-300">Form 24Q Q1 TDS</span>
                <span className="font-mono text-amber-400 font-bold">31 Jul 2026</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Maharashtra PT Return</span>
                <span className="font-mono text-amber-400 font-bold">31 Jul 2026</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
