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
  X,
  CreditCard,
  Building,
  Upload,
  Eye,
  FileSpreadsheet
} from 'lucide-react';
import { Employee, SalaryComponent } from '../../types';
import { api } from '../../services/api';

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
    'salary' | 'personal' | 'employment' | 'documents' | 'attendance' | 'leave' | 'performance' | 'assets' | 'timeline'
  >('salary');

  const [masterComponents, setMasterComponents] = useState<SalaryComponent[]>([]);
  const [customComponents, setCustomComponents] = useState<Record<string, number>>({
    'SC-01': initialEmployee.basicSalary || 45000,
    'SC-02': Math.round((initialEmployee.basicSalary || 45000) * 0.5),
    'SC-03': Math.max(0, initialEmployee.grossSalary - (initialEmployee.basicSalary * 1.5)),
    'SC-05': Math.min(initialEmployee.basicSalary || 45000, 15000) * 0.12,
    'SC-07': 200,
    'SC-08': Math.round(initialEmployee.grossSalary * 0.08)
  });

  const [isEditSalaryModalOpen, setIsEditSalaryModalOpen] = useState(false);
  const [isEditBankModalOpen, setIsEditBankModalOpen] = useState(false);
  const [isUploadDocModalOpen, setIsUploadDocModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Editable Bank Form State
  const [bankForm, setBankForm] = useState({
    bankName: initialEmployee.bankName || 'HDFC Bank',
    bankAccount: initialEmployee.bankAccount || '918020011223',
    bankIfsc: initialEmployee.bankIfsc || 'HDFC0000123',
    bankBranch: 'BKC Corporate Branch, Mumbai',
    paymentMode: 'Corporate NEFT / RTGS Disbursal'
  });

  // Mock Uploaded Documents List State
  const [documentsList, setDocumentsList] = useState([
    { id: 'doc-1', name: `Aadhaar Card — ${employee.fullName}`, type: 'Govt Identity', size: '1.4 MB', date: '2024-01-10', status: 'Verified' },
    { id: 'doc-2', name: `PAN Card — ${employee.fullName}`, type: 'Tax ID', size: '0.8 MB', date: '2024-01-10', status: 'Verified' },
    { id: 'doc-3', name: 'Signed Appointment & Offer Letter', type: 'HR Contract', size: '2.1 MB', date: employee.doj || '2018-04-15', status: 'Signed' },
    { id: 'doc-4', name: 'Degree Certificate & Educational Marksheet', type: 'Qualification', size: '3.5 MB', date: '2024-01-12', status: 'Verified' },
    { id: 'doc-5', name: 'Cancelled Cheque & Bank Passbook Copy', type: 'Banking', size: '1.1 MB', date: '2024-01-15', status: 'Verified' },
    { id: 'doc-6', name: 'Form 16 Tax Certificate (FY 2025-26)', type: 'Tax Document', size: '1.9 MB', date: '2026-06-15', status: 'Generated' }
  ]);

  const [newDocName, setNewDocName] = useState('');
  const [newDocType, setNewDocType] = useState('Identity Proof');

  useEffect(() => {
    async function loadData() {
      const comps = await api.getSalaryComponents();
      if (comps && comps.length > 0) setMasterComponents(comps);

      const empData = await api.getEmployees({ query: initialEmployee.id, unmask: true });
      if (empData && empData.length > 0) {
        const found = empData[0];
        setEmployee(found);
        setBankForm({
          bankName: found.bankName || 'HDFC Bank',
          bankAccount: found.bankAccount || '918020011223',
          bankIfsc: found.bankIfsc || 'HDFC0000123',
          bankBranch: 'BKC Corporate Branch, Mumbai',
          paymentMode: 'Corporate NEFT / RTGS Disbursal'
        });
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
      ctc: updatedEmp.ctc
    });

    setIsEditSalaryModalOpen(false);
    showToast(`Salary component breakdown updated for ${employee.fullName}!`);
  };

  const handleSaveBankDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    const updatedEmp = {
      ...employee,
      bankName: bankForm.bankName,
      bankAccount: bankForm.bankAccount,
      bankIfsc: bankForm.bankIfsc
    };
    setEmployee(updatedEmp);
    await api.updateEmployee(employee.id, {
      bankName: bankForm.bankName,
      bankAccount: bankForm.bankAccount,
      bankIfsc: bankForm.bankIfsc
    });
    setIsEditBankModalOpen(false);
    showToast(`Bank account details updated successfully for ${employee.fullName}!`);
  };

  const handleUploadDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocName.trim()) return;
    const newDoc = {
      id: 'doc-' + Date.now(),
      name: newDocName,
      type: newDocType,
      size: '1.2 MB',
      date: new Date().toISOString().split('T')[0],
      status: 'Uploaded'
    };
    setDocumentsList(prev => [newDoc, ...prev]);
    setNewDocName('');
    setIsUploadDocModalOpen(false);
    showToast(`Document "${newDocName}" uploaded successfully!`);
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
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto font-sans relative">
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

        {/* Quick Compensation Snapshot */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center gap-6 shrink-0 w-full md:w-auto">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">MONTHLY GROSS</span>
            <span className="text-lg font-extrabold text-slate-900 font-mono">
              ₹{employee.grossSalary.toLocaleString('en-IN')}
            </span>
            <span className="text-[11px] text-emerald-600 font-semibold block">Net Take Home: ₹{netTakeHome.toLocaleString('en-IN')}</span>
          </div>

          <div className="border-l border-slate-200 pl-6">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">JOINED COMPANY</span>
            <span className="text-sm font-bold text-slate-800 font-mono">{employee.doj}</span>
            <span className="text-[11px] text-slate-500 block">Manager: {employee.managerName}</span>
          </div>
        </div>
      </div>

      {/* Navigation Subtabs Bar */}
      <div className="border-b border-slate-200 overflow-x-auto custom-scrollbar">
        <div className="flex gap-2 min-w-max pb-1">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Tab Main View Content */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        {/* Tab 1: Salary Breakdown & Bank Details */}
        {activeTab === 'salary' && (
          <div className="space-y-6 text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Compensation & Statutory Breakdown</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Detailed monthly earnings, statutory deductions (EPF, ESIC, PT, TDS) & Bank Disbursal Account
                </p>
              </div>

              <button
                onClick={() => setIsEditSalaryModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" /> Edit Components
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Earnings Table */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs font-bold text-slate-800 uppercase tracking-wider">
                  <span>Earnings Components (Monthly)</span>
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

            {/* INTEGRATED BANK ACCOUNT DETAILS CARD */}
            <div className="pt-6 border-t border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-indigo-600" />
                  <h4 className="text-sm font-bold text-slate-900">Bank Disbursal & Salary Credit Account</h4>
                </div>

                <button
                  onClick={() => setIsEditBankModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Edit Bank Details
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <div>
                  <span className="text-slate-400 block text-[11px]">Bank Name</span>
                  <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5 mt-0.5">
                    <Building className="w-3.5 h-3.5 text-indigo-600" />
                    {employee.bankName || bankForm.bankName}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">Bank Account Number</span>
                  <span className="font-bold font-mono text-slate-900 text-xs mt-0.5 block">
                    {employee.bankAccount || bankForm.bankAccount}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">IFSC Code</span>
                  <span className="font-bold font-mono text-slate-900 text-xs mt-0.5 block">
                    {employee.bankIfsc || bankForm.bankIfsc}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">Disbursal Mode</span>
                  <span className="inline-block px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-md text-[10px] font-bold mt-0.5">
                    {bankForm.paymentMode}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Personal Details */}
        {activeTab === 'personal' && (
          <div className="space-y-6 text-xs font-sans">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2">
              Personal Information & Statutory Identity Cards
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <span className="text-slate-400 block text-[11px]">Full Name</span>
                <span className="font-bold text-slate-900 text-sm">{employee.fullName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Gender</span>
                <span className="font-semibold text-slate-800">{employee.gender || 'Male'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Date of Birth</span>
                <span className="font-mono font-semibold text-slate-800">1992-05-14</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Blood Group</span>
                <span className="font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md">O+</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 pt-4 border-t border-slate-100">
              <div>
                <span className="text-slate-400 block text-[11px]">PAN Card Number</span>
                <span className="font-bold font-mono text-slate-900">{employee.panNumber}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Aadhaar Number</span>
                <span className="font-bold font-mono text-slate-900">{employee.aadhaarNumber}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">EPFO UAN Number</span>
                <span className="font-bold font-mono text-slate-900">{employee.uanNumber || '100900112233'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">ESIC IP Number</span>
                <span className="font-bold font-mono text-slate-900">{employee.esicNumber || '3100012345'}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-4">
              <h4 className="font-bold text-slate-900">Communication & Emergency Contacts</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="text-slate-500 font-semibold block">Permanent Address</span>
                  <p className="text-slate-800 font-medium">Flat 402, Shivam Residency, BKC Road, Mumbai, Maharashtra - 400051</p>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="text-slate-500 font-semibold block">Emergency Contact Person</span>
                  <p className="text-slate-800 font-medium">Ramesh Sharma (Father) • <span className="font-mono text-indigo-700 font-bold">+91 98200 99887</span></p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Employment */}
        {activeTab === 'employment' && (
          <div className="space-y-6 text-xs font-sans">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2">
              Employment Profile & Organizational Hierarchy
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <span className="text-slate-400 block text-[11px]">Designation</span>
                <span className="font-bold text-slate-900">{employee.designation}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Department</span>
                <span className="font-bold text-slate-900">{employee.department}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Branch Location</span>
                <span className="font-bold text-slate-900">{employee.branch}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Reporting Manager</span>
                <span className="font-bold text-slate-900">{employee.managerName}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 pt-4 border-t border-slate-100">
              <div>
                <span className="text-slate-400 block text-[11px]">Employment Type</span>
                <span className="inline-block px-2.5 py-0.5 bg-indigo-50 text-indigo-700 font-bold rounded-full border border-indigo-200 mt-0.5">
                  {employee.employmentType}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Cost Center Code</span>
                <span className="font-mono font-bold text-slate-900">{employee.costCenter}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Assigned Shift</span>
                <span className="font-semibold text-slate-800">General Shift (09:30 - 18:30)</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Notice Period</span>
                <span className="font-bold text-slate-900 font-mono">{employee.noticePeriodDays} Days</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Documents */}
        {activeTab === 'documents' && (
          <div className="space-y-6 text-xs font-sans">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Uploaded Compliance & HR Documents</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Identity proofs, educational certificates, appointment letters, and Form 16 copies
                </p>
              </div>

              <button
                onClick={() => setIsUploadDocModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" /> Upload Document
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {documentsList.map(doc => (
                <div key={doc.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-4 hover:border-indigo-300 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">{doc.name}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {doc.type} • {doc.size} • {doc.date}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md text-[10px] font-bold">
                      {doc.status}
                    </span>
                    <button
                      onClick={() => alert(`Downloading ${doc.name}...`)}
                      className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 5: Attendance */}
        {activeTab === 'attendance' && (
          <div className="space-y-6 text-xs font-sans">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Monthly Attendance Summary (July 2026)</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Biometric check-in logs, late arrivals, overtime hours, and LOP deductions
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
                <span className="text-[11px] text-emerald-700 font-bold block">PRESENT DAYS</span>
                <span className="text-xl font-extrabold font-mono text-emerald-900">
                  {employee.attendanceSummaryMtd?.present || 24}
                </span>
              </div>
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-center">
                <span className="text-[11px] text-rose-700 font-bold block">ABSENT / LOP</span>
                <span className="text-xl font-extrabold font-mono text-rose-900">
                  {employee.attendanceSummaryMtd?.absent || 0}
                </span>
              </div>
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-center">
                <span className="text-[11px] text-amber-700 font-bold block">LATE ARRIVALS</span>
                <span className="text-xl font-extrabold font-mono text-amber-900">
                  {employee.attendanceSummaryMtd?.lateComing || 1}
                </span>
              </div>
              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-center">
                <span className="text-[11px] text-indigo-700 font-bold block">OVERTIME (OT)</span>
                <span className="text-xl font-extrabold font-mono text-indigo-900">
                  {employee.attendanceSummaryMtd?.otHours || 0} hrs
                </span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center col-span-2 sm:col-span-1">
                <span className="text-[11px] text-slate-600 font-bold block">TOTAL HOURS</span>
                <span className="text-xl font-extrabold font-mono text-slate-900">216 hrs</span>
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="p-3 bg-slate-50 border-b border-slate-200 font-bold text-slate-800">
                Daily Biometric Punch Log (July 2026)
              </div>
              <div className="divide-y divide-slate-100">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map(day => (
                  <div key={day} className="p-3 flex items-center justify-between text-xs hover:bg-slate-50">
                    <span className="font-mono text-slate-600 font-semibold">2026-07-{day < 10 ? '0' + day : day}</span>
                    <span className="font-mono font-medium text-slate-800">09:28 AM - 06:34 PM</span>
                    <span className="font-mono text-slate-500">9.1 hrs</span>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded-md text-[10px]">
                      Present (P)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 6: Leave Ledger */}
        {activeTab === 'leave' && (
          <div className="space-y-6 text-xs font-sans">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Leave Balance Ledger & Applications</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Casual, Sick, Privilege (Earned) leave balances and recent requests
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl">
                <span className="text-[11px] text-indigo-700 font-bold block">CASUAL LEAVE (CL)</span>
                <span className="text-2xl font-extrabold font-mono text-indigo-900">
                  {employee.leaveBalance?.casual ?? 8} Days
                </span>
              </div>
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                <span className="text-[11px] text-emerald-700 font-bold block">SICK LEAVE (SL)</span>
                <span className="text-2xl font-extrabold font-mono text-emerald-900">
                  {employee.leaveBalance?.sick ?? 10} Days
                </span>
              </div>
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl">
                <span className="text-[11px] text-purple-700 font-bold block">PRIVILEGE LEAVE (PL)</span>
                <span className="text-2xl font-extrabold font-mono text-purple-900">
                  {employee.leaveBalance?.privilege ?? 22} Days
                </span>
              </div>
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <span className="text-[11px] text-amber-700 font-bold block">COMP OFF BALANCE</span>
                <span className="text-2xl font-extrabold font-mono text-amber-900">
                  {employee.leaveBalance?.compOff ?? 2} Days
                </span>
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="p-3 bg-slate-50 border-b border-slate-200 font-bold text-slate-800">
                Leave Transaction Audit Log
              </div>
              <table className="w-full text-left font-sans">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <th className="p-3">Applied Date</th>
                    <th className="p-3">Leave Type</th>
                    <th className="p-3">Duration</th>
                    <th className="p-3">Reason</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="p-3 font-mono text-slate-600">2026-06-12</td>
                    <td className="p-3 font-bold text-slate-800">Casual Leave (CL)</td>
                    <td className="p-3 font-mono">1 Day</td>
                    <td className="p-3 text-slate-600">Personal Work</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded-md text-[10px]">
                        Approved
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-slate-600">2026-04-05</td>
                    <td className="p-3 font-bold text-slate-800">Sick Leave (SL)</td>
                    <td className="p-3 font-mono">2 Days</td>
                    <td className="p-3 text-slate-600">Fever & Medical Rest</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded-md text-[10px]">
                        Approved
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 7: Performance */}
        {activeTab === 'performance' && (
          <div className="space-y-6 text-xs font-sans">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Performance Evaluation & KRA Scorecard</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Annual appraisal rating, key result areas, and manager evaluation comments
                </p>
              </div>
            </div>

            <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[11px] text-indigo-700 font-bold uppercase tracking-wider block">ANNUAL PERFORMANCE RATING</span>
                <div className="text-2xl font-extrabold text-indigo-900 flex items-center gap-2 mt-0.5">
                  4.8 / 5.0
                  <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold border border-emerald-300">
                    Exceeds Expectations
                  </span>
                </div>
              </div>
              <div className="text-right text-slate-600 text-xs">
                Evaluated by: <span className="font-bold text-slate-900">{employee.managerName}</span><br />
                Appraisal Cycle: FY 2025-26
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-slate-900">Key Result Areas (KRAs)</h4>
              <div className="space-y-2">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900">1. Overall Equipment Effectiveness (OEE) Target</div>
                    <div className="text-slate-500 text-[11px]">Maintain plant OEE above 88% across all production lines</div>
                  </div>
                  <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">102% Achieved</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900">2. Zero Safety & EHS Incidents</div>
                    <div className="text-slate-500 text-[11px]">Enforce ISO 45001 EHS safety protocols across shift workforce</div>
                  </div>
                  <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">100% Achieved</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 8: Assets */}
        {activeTab === 'assets' && (
          <div className="space-y-6 text-xs font-sans">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Company Assigned Physical & IT Assets</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Laptops, security keycards, plant equipment, and peripheral tracking
                </p>
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left font-sans">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <th className="p-3">Asset Name</th>
                    <th className="p-3">Asset Tag ID</th>
                    <th className="p-3">Serial Number</th>
                    <th className="p-3">Assigned Date</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="p-3 font-bold text-slate-900 flex items-center gap-2">
                      <Laptop className="w-4 h-4 text-indigo-600" />
                      ThinkPad X1 Carbon Gen 11 (Intel i7 / 32GB)
                    </td>
                    <td className="p-3 font-mono font-semibold text-slate-700">AST-2024-8841</td>
                    <td className="p-3 font-mono text-slate-600">SN-PF492810</td>
                    <td className="p-3 font-mono text-slate-600">2024-01-15</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded-md text-[10px]">
                        Assigned
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-slate-900 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-indigo-600" />
                      Plant Security Access Keycard & Badge
                    </td>
                    <td className="p-3 font-mono font-semibold text-slate-700">KEYCARD-MUM-101</td>
                    <td className="p-3 font-mono text-slate-600">RFID-992019</td>
                    <td className="p-3 font-mono text-slate-600">2018-04-15</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded-md text-[10px]">
                        Active
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 9: Timeline */}
        {activeTab === 'timeline' && (
          <div className="space-y-6 text-xs font-sans">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Career Progression & Audit Audit Log</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Chronological history of promotions, transfers, salary revisions, and HR events
                </p>
              </div>
            </div>

            <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 pl-8">
              <div className="relative">
                <div className="absolute -left-8 top-0.5 w-3 h-3 rounded-full bg-indigo-600 border-2 border-white shadow-xs" />
                <div className="font-bold text-slate-900 text-sm">Jul 2026 — Annual Salary Revision & Appraisal</div>
                <div className="text-slate-600 text-xs mt-0.5">CTC revised by +12% based on annual performance score 4.8/5.0. Approved by HR Head Sunita Verma.</div>
              </div>
              <div className="relative">
                <div className="absolute -left-8 top-0.5 w-3 h-3 rounded-full bg-slate-400 border-2 border-white shadow-xs" />
                <div className="font-bold text-slate-900 text-sm">Apr 2022 — Promoted to Plant Head & GM</div>
                <div className="text-slate-600 text-xs mt-0.5">Promoted from Senior Production Lead to Plant Head & GM. Transferred to Mumbai HQ.</div>
              </div>
              <div className="relative">
                <div className="absolute -left-8 top-0.5 w-3 h-3 rounded-full bg-slate-400 border-2 border-white shadow-xs" />
                <div className="font-bold text-slate-900 text-sm">Apr 2018 — Joined ABC Manufacturing Pvt. Ltd.</div>
                <div className="text-slate-600 text-xs mt-0.5">Onboarded as Senior Production Lead in Manufacturing Department.</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* EDIT CUSTOM SALARY COMPONENT AMOUNTS MODAL */}
      {isEditSalaryModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden font-sans">
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

      {/* EDIT BANK ACCOUNT DETAILS MODAL */}
      {isEditBankModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden font-sans">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-indigo-400" />
                  Update Bank Disbursal Details
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Update bank name, account number & IFSC code for {employee.fullName}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditBankModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBankDetails} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Bank Name</label>
                <select
                  value={bankForm.bankName}
                  onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 outline-hidden"
                >
                  <option value="HDFC Bank">HDFC Bank</option>
                  <option value="ICICI Bank">ICICI Bank</option>
                  <option value="State Bank of India">State Bank of India</option>
                  <option value="Axis Bank">Axis Bank</option>
                  <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                  <option value="Bank of Maharashtra">Bank of Maharashtra</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Bank Account Number</label>
                <input
                  type="text"
                  value={bankForm.bankAccount}
                  onChange={(e) => setBankForm({ ...bankForm, bankAccount: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 outline-hidden focus:border-indigo-500"
                  placeholder="Enter Bank Account Number"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Bank IFSC Code</label>
                <input
                  type="text"
                  value={bankForm.bankIfsc}
                  onChange={(e) => setBankForm({ ...bankForm, bankIfsc: e.target.value.toUpperCase() })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 outline-hidden focus:border-indigo-500"
                  placeholder="e.g. HDFC0000123"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Disbursal Mode</label>
                <select
                  value={bankForm.paymentMode}
                  onChange={(e) => setBankForm({ ...bankForm, paymentMode: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 outline-hidden"
                >
                  <option value="Corporate NEFT / RTGS Disbursal">Corporate NEFT / RTGS Disbursal</option>
                  <option value="HDFC CMS Direct Transfer">HDFC CMS Direct Transfer</option>
                  <option value="ICICI Corporate API Disbursal">ICICI Corporate API Disbursal</option>
                  <option value="Account Payee Cheque">Account Payee Cheque</option>
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditBankModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Save Bank Details
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* UPLOAD DOCUMENT MODAL */}
      {isUploadDocModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden font-sans">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold flex items-center gap-2">
                  <Upload className="w-5 h-5 text-indigo-400" />
                  Upload Compliance Document
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Attach identity, tax or qualification document for {employee.fullName}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsUploadDocModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadDocument} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Document Title / Name</label>
                <input
                  type="text"
                  value={newDocName}
                  onChange={(e) => setNewDocName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 outline-hidden"
                  placeholder="e.g. Passport Copy / Relieving Certificate"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Document Type</label>
                <select
                  value={newDocType}
                  onChange={(e) => setNewDocType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 outline-hidden"
                >
                  <option value="Govt Identity">Govt Identity</option>
                  <option value="Tax ID">Tax ID</option>
                  <option value="HR Contract">HR Contract</option>
                  <option value="Qualification">Qualification</option>
                  <option value="Banking">Banking</option>
                  <option value="Medical Certificate">Medical Certificate</option>
                </select>
              </div>

              <div className="p-4 border-2 border-dashed border-slate-200 rounded-xl text-center hover:border-indigo-400 transition-colors cursor-pointer">
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-1" />
                <span className="font-semibold text-slate-700 block">Click to select PDF or Image file</span>
                <span className="text-[11px] text-slate-400">PDF, PNG, JPG up to 10 MB</span>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsUploadDocModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Save & Attach Document
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
