import React, { useState, useEffect } from 'react';
import {
  User,
  Briefcase,
  Banknote,
  FileText,
  CalendarCheck,
  CalendarDays,
  Award,
  Laptop,
  Clock,
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Building2,
  ShieldCheck,
  CheckCircle2,
  Download,
  Plus,
  Edit3,
  Check,
  X
} from 'lucide-react';
import { Employee, SalaryComponent } from '../../types';
import { api } from '../../services/api';
import { salaryComponentsList } from '../../data/mockData';

interface EmployeeProfileProps {
  employee: Employee;
  onBack: () => void;
  onOpenAiAssistant: (context: string) => void;
}

export const EmployeeProfile: React.FC<EmployeeProfileProps> = ({
  employee: initialEmployee,
  onBack,
  onOpenAiAssistant
}) => {
  const [employee, setEmployee] = useState<Employee>(initialEmployee);
  const [activeTab, setActiveTab] = useState<
    'personal' | 'employment' | 'salary' | 'documents' | 'attendance' | 'leave' | 'performance' | 'assets' | 'timeline'
  >('salary');

  const [masterComponents, setMasterComponents] = useState<SalaryComponent[]>(salaryComponentsList);
  const [customComponents, setCustomComponents] = useState<Record<string, number>>({
    'SC-01': initialEmployee.basicSalary || 45000,
    'SC-02': Math.round((initialEmployee.basicSalary || 45000) * 0.5),
    'SC-03': Math.max(0, initialEmployee.grossSalary - (initialEmployee.basicSalary * 1.5)),
    'SC-05': Math.min(initialEmployee.basicSalary || 45000, 15000) * 0.12,
    'SC-07': 200,
    'SC-08': Math.round(initialEmployee.grossSalary * 0.08)
  });

  const [isEditSalaryModalOpen, setIsEditSalaryModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      const comps = await api.getSalaryComponents();
      if (comps && comps.length > 0) setMasterComponents(comps);

      const empData = await api.getEmployees({ query: initialEmployee.id });
      if (empData && empData.length > 0) {
        const found = empData[0];
        setEmployee(found);
        if (found.customComponents && Object.keys(found.customComponents).length > 0) {
          setCustomComponents(found.customComponents);
        }
      }
    }
    loadData();
  }, [initialEmployee.id]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleCustomComponentChange = (compId: string, amountStr: string) => {
    const val = Number(amountStr) || 0;
    setCustomComponents(prev => ({ ...prev, [compId]: val }));
  };

  const handleSaveSalaryBreakdown = async (e: React.FormEvent) => {
    e.preventDefault();

    // Calculate new Gross & Basic
    let newBasic = customComponents['SC-01'] || employee.basicSalary;
    let newGross = 0;
    masterComponents.forEach(comp => {
      if (comp.category === 'Earning') {
        newGross += Number(customComponents[comp.id] || 0);
      }
    });

    if (newGross === 0) newGross = employee.grossSalary;

    const updatedEmp = {
      ...employee,
      basicSalary: newBasic,
      grossSalary: newGross,
      ctc: Math.round(newGross * 12 * 1.15)
    };

    setEmployee(updatedEmp);
    await api.updateEmployee(employee.id, {
      basicSalary: newBasic,
      grossSalary: newGross,
      ctc: updatedEmp.ctc,
      customComponents
    });

    setIsEditSalaryModalOpen(false);
    showToast(`Salary component breakdown updated for ${employee.fullName}!`);
  };

  const tabs = [
    { id: 'salary', label: 'Salary & Component Breakdown', icon: Banknote },
    { id: 'personal', label: 'Personal Details', icon: User },
    { id: 'employment', label: 'Employment', icon: Briefcase },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
    { id: 'leave', label: 'Leave Ledger', icon: CalendarDays },
    { id: 'performance', label: 'Performance & KRA', icon: Award },
    { id: 'assets', label: 'Assets', icon: Laptop },
    { id: 'timeline', label: 'Timeline & History', icon: Clock },
  ] as const;

  // Calculate live earnings & deductions
  const earningsList = masterComponents.filter(c => c.category === 'Earning');
  const deductionsList = masterComponents.filter(c => c.category === 'Deduction');

  const totalEarnings = earningsList.reduce((acc, c) => acc + (customComponents[c.id] || 0), 0) || employee.grossSalary;
  const totalDeductions = deductionsList.reduce((acc, c) => acc + (customComponents[c.id] || 0), 0) || (Math.min(employee.basicSalary, 15000) * 0.12 + 200 + Math.round(employee.grossSalary * 0.08));
  const netTakeHome = totalEarnings - totalDeductions;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto font-sans">
      {/* Back Button & Action Controls */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-indigo-600 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Directory
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenAiAssistant(`Draft HR probation/confirmation/salary letter for employee ${employee.fullName} (${employee.id})`)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 rounded-xl text-xs font-semibold transition-all cursor-pointer"
          >
            Draft Letter via AI Copilot
          </button>

          <button
            onClick={() => alert(`Payslip for ${employee.fullName} generated as PDF.`)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Download Payslip
          </button>
        </div>
      </div>

      {/* Hero Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={employee.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
            alt={employee.fullName}
            className="w-20 h-20 rounded-2xl object-cover border-2 border-slate-100 shadow-md shrink-0"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">{employee.fullName}</h1>
              <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md">
                {employee.id}
              </span>
              <span
                className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                  employee.status === 'Active'
                    ? 'bg-emerald-100 text-emerald-800'
                    : employee.status === 'Probation'
                    ? 'bg-indigo-100 text-indigo-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {employee.status}
              </span>
            </div>

            <p className="text-xs font-medium text-slate-600 mt-1">
              {employee.designation} • <span className="text-slate-800 font-semibold">{employee.department}</span>
            </p>

            <div className="flex items-center gap-4 text-xs text-slate-500 mt-2 flex-wrap">
              <span className="flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                {employee.branch}
              </span>
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                {employee.email}
              </span>
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                {employee.phone}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Highlights */}
        <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-slate-200 pt-4 md:pt-0 md:pl-6 text-xs text-slate-600">
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Monthly Gross</div>
            <div className="text-base font-bold text-slate-900">₹{totalEarnings.toLocaleString('en-IN')}</div>
            <div className="text-[10px] text-emerald-600 font-semibold">Net Take Home: ₹{netTakeHome.toLocaleString('en-IN')}</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Joined Company</div>
            <div className="text-base font-bold text-slate-900">{employee.doj}</div>
            <div className="text-[10px] text-slate-500 font-medium">Manager: {employee.managerName}</div>
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-1.5 shadow-xs overflow-x-auto flex items-center gap-1 custom-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content Cards */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        {/* Tab 1: Salary & Custom Components Editing */}
        {activeTab === 'salary' && (
          <div className="relative space-y-6">
            {localStorage.getItem('payrollpro_company_logo') && (
              <div className="print-watermark hidden print:flex absolute inset-0 items-center justify-center pointer-events-none z-0 overflow-hidden opacity-10 select-none">
                <img
                  src={localStorage.getItem('payrollpro_company_logo') || ''}
                  alt="Company Logo Watermark"
                  className="max-w-[320px] max-h-[320px] object-contain filter grayscale"
                />
              </div>
            )}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Banknote className="w-4 h-4 text-indigo-600" />
                  Customized Salary Structure & Component Breakdown
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Set specific ₹ amounts for Basic, HRA, Special Allowance, PF, PT & custom components for {employee.fullName}
                </p>
              </div>

              <button
                onClick={() => setIsEditSalaryModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-xs cursor-pointer transition-all"
              >
                <Edit3 className="w-4 h-4" /> Edit Component Amounts
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Earnings Table */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs font-bold text-slate-800 uppercase tracking-wider">
                  <span>Earnings Breakdown (Monthly)</span>
                  <span className="text-emerald-700 font-mono text-sm">₹{totalEarnings.toLocaleString('en-IN')}</span>
                </div>
                <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                  <div className="flex justify-between p-2.5 bg-slate-50 font-semibold text-slate-600">
                    <span>Component Name</span>
                    <span>Monthly Amount (₹)</span>
                  </div>
                  {earningsList.map(comp => (
                    <div key={comp.id} className="flex justify-between p-2.5 border-t border-slate-100">
                      <div>
                        <span className="font-semibold text-slate-800">{comp.name}</span>
                        {comp.isStatutory && <span className="text-[10px] text-purple-700 font-bold ml-1">({comp.statutoryType})</span>}
                      </div>
                      <span className="font-mono font-bold text-slate-900">
                        ₹{(customComponents[comp.id] || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between p-2.5 bg-emerald-50 font-bold text-emerald-900 border-t border-emerald-200">
                    <span>TOTAL GROSS EARNINGS</span>
                    <span className="font-mono text-sm">₹{totalEarnings.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* Deductions & Net Take Home Table */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs font-bold text-slate-800 uppercase tracking-wider">
                  <span>Statutory Deductions (Monthly)</span>
                  <span className="text-rose-700 font-mono text-sm">₹{totalDeductions.toLocaleString('en-IN')}</span>
                </div>
                <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                  <div className="flex justify-between p-2.5 bg-slate-50 font-semibold text-slate-600">
                    <span>Deduction Name</span>
                    <span>Deduction Amount (₹)</span>
                  </div>
                  {deductionsList.map(comp => (
                    <div key={comp.id} className="flex justify-between p-2.5 border-t border-slate-100">
                      <div>
                        <span className="font-semibold text-slate-800">{comp.name}</span>
                        {comp.isStatutory && <span className="text-[10px] text-purple-700 font-bold ml-1">({comp.statutoryType})</span>}
                      </div>
                      <span className="font-mono font-bold text-rose-700">
                        ₹{(customComponents[comp.id] || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between p-2.5 bg-rose-50 font-bold text-rose-900 border-t border-rose-200">
                    <span>TOTAL DEDUCTIONS</span>
                    <span className="font-mono text-sm">₹{totalDeductions.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="p-4 bg-indigo-900 text-white rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-indigo-200 uppercase font-bold tracking-wider">NET TAKE HOME PAY</span>
                    <div className="text-2xl font-extrabold font-mono">₹{netTakeHome.toLocaleString('en-IN')}</div>
                  </div>
                  <div className="text-right text-xs text-indigo-200">
                    Direct Deposit to {employee.bankName}<br />
                    <span className="font-mono text-white font-bold">{employee.bankAccount}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Personal */}
        {activeTab === 'personal' && (
          <div className="space-y-6 text-xs">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2">
              Personal Information & Statutory IDs
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <span className="text-slate-400">PAN Card Number</span>
                <div className="font-bold text-slate-900 font-mono text-sm mt-0.5">{employee.panNumber}</div>
              </div>
              <div>
                <span className="text-slate-400">Aadhaar Number</span>
                <div className="font-bold text-slate-900 font-mono text-sm mt-0.5">{employee.aadhaarNumber}</div>
              </div>
              <div>
                <span className="text-slate-400">EPFO UAN Number</span>
                <div className="font-bold text-slate-900 font-mono text-sm mt-0.5">{employee.uanNumber}</div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Employment */}
        {activeTab === 'employment' && (
          <div className="space-y-6 text-xs">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2">
              Employment Details & Roster
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <span className="text-slate-400">Designation</span>
                <div className="font-bold text-slate-900 mt-0.5">{employee.designation}</div>
              </div>
              <div>
                <span className="text-slate-400">Department</span>
                <div className="font-bold text-slate-900 mt-0.5">{employee.department}</div>
              </div>
              <div>
                <span className="text-slate-400">Reporting Manager</span>
                <div className="font-bold text-slate-900 mt-0.5">{employee.managerName}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* EDIT CUSTOM SALARY COMPONENT AMOUNTS MODAL */}
      {isEditSalaryModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold flex items-center gap-2">
                  <Banknote className="w-5 h-5 text-indigo-400" />
                  Customize Salary Components for {employee.fullName}
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Set specific ₹ amounts for each salary component. Live calculates Gross & Net Pay.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditSalaryModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSalaryBreakdown} className="p-6 space-y-6 text-xs max-h-[80vh] overflow-y-auto custom-scrollbar">
              {/* Earnings Inputs */}
              <div className="space-y-3">
                <h4 className="font-bold text-emerald-800 text-sm uppercase tracking-wider border-b border-emerald-100 pb-1">
                  Earnings Components (+)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {earningsList.map(comp => (
                    <div key={comp.id}>
                      <label className="block font-semibold text-slate-700 mb-1">
                        {comp.name} {comp.formula ? `(${comp.formula})` : ''}
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                        <input
                          type="number"
                          value={customComponents[comp.id] ?? 0}
                          onChange={(e) => handleCustomComponentChange(comp.id, e.target.value)}
                          className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-hidden"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Deductions Inputs */}
              <div className="space-y-3">
                <h4 className="font-bold text-rose-800 text-sm uppercase tracking-wider border-b border-rose-100 pb-1">
                  Statutory Deductions Components (-)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {deductionsList.map(comp => (
                    <div key={comp.id}>
                      <label className="block font-semibold text-slate-700 mb-1">
                        {comp.name} {comp.formula ? `(${comp.formula})` : ''}
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                        <input
                          type="number"
                          value={customComponents[comp.id] ?? 0}
                          onChange={(e) => handleCustomComponentChange(comp.id, e.target.value)}
                          className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-rose-700 focus:ring-2 focus:ring-rose-500 outline-hidden"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Preview Banner */}
              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-500 block">Calculated Gross Pay:</span>
                  <span className="font-bold text-emerald-800 text-sm font-mono">₹{totalEarnings.toLocaleString('en-IN')}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block">Calculated Net Pay:</span>
                  <span className="font-bold text-indigo-900 text-sm font-mono">₹{netTakeHome.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditSalaryModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Save Custom Components
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-xs border border-slate-700 animate-in slide-in-from-bottom-5 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
