import React, { useState } from 'react';
import { Search, UserPlus, Filter, LayoutGrid, List, ChevronRight, Mail, Phone, Building2, X, CheckCircle2, DollarSign, Calendar, Shield, FileSpreadsheet } from 'lucide-react';
import { Employee } from '../../types';
import { ImportEmployeesModal } from './ImportEmployeesModal';

interface EmployeeDirectoryProps {
  employees: Employee[];
  onAddEmployee: (employee: Employee) => void;
  onSelectEmployee: (empId: string) => void;
  onOpenAiAssistant: (context: string) => void;
}

export const EmployeeDirectory: React.FC<EmployeeDirectoryProps> = ({
  employees,
  onAddEmployee,
  onSelectEmployee,
  onOpenAiAssistant
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Add & Import Employee Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    department: 'Engineering',
    designation: 'Software Engineer',
    branch: 'Mumbai Headquarters',
    doj: new Date().toISOString().split('T')[0],
    employmentType: 'Full-Time' as Employee['employmentType'],
    basicSalary: 35000,
    grossSalary: 75000,
    panNumber: '',
    aadhaarNumber: '',
    isPfApplicable: true,
    isEsiApplicable: true,
    isPtApplicable: true,
    uanNumber: '',
    pfNumber: '',
    esicNumber: ''
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleBulkImport = (newEmps: Employee[]) => {
    newEmps.forEach((emp) => onAddEmployee(emp));
    showToast(`Successfully imported ${newEmps.length} employee records from CSV!`);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullName || !formData.email) {
      alert('Please fill out Employee Name and Email Address');
      return;
    }

    const generatedId = `EMP-${Math.floor(10000 + Math.random() * 90000)}`;

    const newEmp: Employee = {
      id: generatedId,
      fullName: formData.fullName,
      avatarUrl: `https://images.unsplash.com/photo-${1530000000000 + Math.floor(Math.random() * 1000000)}?w=150&auto=format&fit=crop&q=80`,
      designation: formData.designation,
      department: formData.department,
      branch: formData.branch,
      email: formData.email,
      phone: formData.phone || '+91 98200 00000',
      doj: formData.doj,
      status: 'Active',
      employmentType: formData.employmentType,
      managerName: 'Vikramaditya Rao',
      costCenter: `${formData.department.slice(0, 3).toUpperCase()}-MUM-01`,
      panNumber: formData.panNumber || 'ABCDE1234F',
      aadhaarNumber: formData.aadhaarNumber || '1234-5678-9012',
      isPfApplicable: formData.isPfApplicable,
      isEsiApplicable: formData.isEsiApplicable,
      isPtApplicable: formData.isPtApplicable,
      uanNumber: formData.isPfApplicable ? (formData.uanNumber || `1009${Math.floor(10000000 + Math.random() * 90000000)}`) : 'N/A (Exempt)',
      pfNumber: formData.isPfApplicable ? (formData.pfNumber || `MH/BAN/0049281/000/${Math.floor(100 + Math.random() * 900)}`) : 'N/A (Exempt)',
      esicNumber: formData.isEsiApplicable ? (formData.esicNumber || `3100${Math.floor(10000000 + Math.random() * 90000000)}`) : 'N/A (Exempt)',
      bankAccount: `100${Math.floor(10000007 + Math.random() * 90000000)}`,
      bankIfsc: 'HDFC0000123',
      bankName: 'HDFC Bank',
      basicSalary: Number(formData.basicSalary),
      grossSalary: Number(formData.grossSalary),
      ctc: Number(formData.grossSalary) * 12 * 1.2,
      noticePeriodDays: 60,
      leaveBalance: { casual: 7, sick: 7, privilege: 15, compOff: 0 },
      attendanceSummaryMtd: { present: 1, absent: 0, halfDay: 0, lateComing: 0, otHours: 0 }
    };

    onAddEmployee(newEmp);
    setIsAddModalOpen(false);
    showToast(`New Employee ${newEmp.fullName} (${newEmp.id}) added successfully!`);

    // Reset form
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      department: 'Engineering',
      designation: 'Software Engineer',
      branch: 'Mumbai Headquarters',
      doj: new Date().toISOString().split('T')[0],
      employmentType: 'Full-Time',
      basicSalary: 35000,
      grossSalary: 75000,
      panNumber: '',
      aadhaarNumber: '',
      isPfApplicable: true,
      isEsiApplicable: true,
      isPtApplicable: true,
      uanNumber: '',
      pfNumber: '',
      esicNumber: ''
    });
  };

  const filtered = employees.filter((e) => {
    const matchesSearch =
      e.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.designation.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDept = selectedDept === 'ALL' || e.department === selectedDept;
    const matchesStatus = selectedStatus === 'ALL' || e.status === selectedStatus;

    return matchesSearch && matchesDept && matchesStatus;
  });

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto font-sans relative">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-indigo-500/40 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Top Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Employee Master & Directory</h2>
          <p className="text-xs text-slate-500 mt-1">
            Showing <span className="font-bold text-slate-800">{filtered.length}</span> workforce records
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => onOpenAiAssistant('Help me onboard a new employee or draft a job offer letter')}
            className="px-3.5 py-2 bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 rounded-xl text-xs font-semibold transition-all cursor-pointer"
          >
            AI Onboarding Assistant
          </button>

          <button
            onClick={() => {
              showToast("PII Data Protection Active: PAN, Aadhaar & Bank Account Numbers masked for general security.");
            }}
            className="flex items-center gap-1.5 px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl text-xs font-semibold transition-all cursor-pointer"
          >
            <Shield className="w-4 h-4 text-amber-600" />
            PII Protected
          </button>

          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-semibold rounded-xl text-xs shadow-2xs transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            Import CSV
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs shadow-xs transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            Add Employee
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, ID or designation..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs font-medium text-slate-800 placeholder-slate-400 outline-hidden focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
          {/* Department Filter */}
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <Filter className="w-3.5 h-3.5" />
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-800 outline-hidden"
            >
              <option value="ALL">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Product & Design">Product & Design</option>
              <option value="Human Resources">Human Resources</option>
              <option value="Finance & Accounts">Finance & Accounts</option>
              <option value="Sales & Business Dev">Sales & Business Dev</option>
            </select>
          </div>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-800 outline-hidden"
          >
            <option value="ALL">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Probation">Probation</option>
            <option value="Notice Period">Notice Period</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                viewMode === 'table' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                viewMode === 'cards' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Directory Table View */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-semibold">
                <tr>
                  <th className="p-3.5 pl-6">Employee</th>
                  <th className="p-3.5">Designation & Dept</th>
                  <th className="p-3.5">Branch</th>
                  <th className="p-3.5">Gross Pay</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right pr-6">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((emp) => (
                  <tr
                    key={emp.id}
                    onClick={() => onSelectEmployee(emp.id)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                  >
                    <td className="p-3.5 pl-6">
                      <div className="flex items-center gap-3">
                        <img src={emp.avatarUrl} alt={emp.fullName} className="w-9 h-9 rounded-full object-cover border border-slate-200" />
                        <div>
                          <div className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors flex items-center gap-2">
                            {emp.fullName}
                            <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-xs">
                              {emp.id}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500">{emp.email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5">
                      <div className="font-semibold text-slate-800">{emp.designation}</div>
                      <div className="text-[11px] text-slate-500">{emp.department}</div>
                    </td>

                    <td className="p-3.5 text-slate-600 font-medium">{emp.branch}</td>

                    <td className="p-3.5 font-mono font-bold text-slate-900">
                      ₹{emp.grossSalary.toLocaleString('en-IN')}
                    </td>

                    <td className="p-3.5">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          emp.status === 'Active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : emp.status === 'Probation'
                            ? 'bg-indigo-100 text-indigo-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {emp.status}
                      </span>
                    </td>

                    <td className="p-3.5 text-right pr-6">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectEmployee(emp.id);
                        }}
                        className="p-1.5 hover:bg-indigo-50 text-indigo-600 rounded-lg transition-colors inline-flex items-center gap-1 text-xs font-semibold"
                      >
                        Profile <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Cards Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((emp) => (
            <div
              key={emp.id}
              onClick={() => onSelectEmployee(emp.id)}
              className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <img src={emp.avatarUrl} alt={emp.fullName} className="w-12 h-12 rounded-2xl object-cover border border-slate-200" />
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors">
                      {emp.fullName}
                    </h3>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-xs">
                      {emp.id}
                    </span>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    emp.status === 'Active'
                      ? 'bg-emerald-100 text-emerald-800'
                      : emp.status === 'Probation'
                      ? 'bg-indigo-100 text-indigo-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {emp.status}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="font-medium text-slate-800">{emp.designation}</div>
                <div className="text-slate-500 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  {emp.department} • {emp.branch}
                </div>
                <div className="text-slate-500 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {emp.email}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Gross Pay</span>
                  <div className="font-mono font-bold text-slate-900">₹{emp.grossSalary.toLocaleString('en-IN')}</div>
                </div>
                <button className="text-indigo-600 font-semibold text-xs flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                  View Profile →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADD EMPLOYEE MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] sm:max-h-[88vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="pr-2">
                <h3 className="text-sm sm:text-base font-bold flex items-center gap-2">
                  <UserPlus className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400 shrink-0" />
                  Add New Employee Master Record
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-300 mt-0.5">
                  Creates Frappe HRMS Employee DocType record & initializes statutory fields
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form */}
            <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="e.g. Vikramaditya Sen"
                    className="w-full p-2.5 sm:p-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-hidden font-medium text-slate-900 text-sm sm:text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Company Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="vikram@apexenterprises.in"
                    className="w-full p-2.5 sm:p-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-hidden font-medium text-slate-900 text-sm sm:text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mobile Phone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98200 12345"
                    className="w-full p-2.5 sm:p-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-hidden font-medium text-slate-900 text-sm sm:text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full p-2.5 sm:p-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-hidden font-medium text-slate-900 text-sm sm:text-xs"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Product & Design">Product & Design</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Finance & Accounts">Finance & Accounts</option>
                    <option value="Sales & Business Dev">Sales & Business Dev</option>
                    <option value="Customer Success">Customer Success</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Designation</label>
                  <input
                    type="text"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    placeholder="e.g. Senior Software Engineer"
                    className="w-full p-2.5 sm:p-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-hidden font-medium text-slate-900 text-sm sm:text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Work Branch</label>
                  <select
                    value={formData.branch}
                    onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                    className="w-full p-2.5 sm:p-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-hidden font-medium text-slate-900 text-sm sm:text-xs"
                  >
                    <option value="Mumbai Headquarters">Mumbai Headquarters</option>
                    <option value="Bengaluru Tech Hub">Bengaluru Tech Hub</option>
                    <option value="Delhi NCR Regional Office">Delhi NCR Regional Office</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date of Joining</label>
                  <input
                    type="date"
                    value={formData.doj}
                    onChange={(e) => setFormData({ ...formData, doj: e.target.value })}
                    className="w-full p-2.5 sm:p-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-hidden font-medium text-slate-900 text-sm sm:text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Employment Type</label>
                  <select
                    value={formData.employmentType}
                    onChange={(e) => setFormData({ ...formData, employmentType: e.target.value as any })}
                    className="w-full p-2.5 sm:p-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-hidden font-medium text-slate-900 text-sm sm:text-xs"
                  >
                    <option value="Full-Time">Full-Time</option>
                    <option value="Probation">Probation</option>
                    <option value="Contract">Contract</option>
                    <option value="Intern">Intern</option>
                  </select>
                </div>
              </div>

              <div className="p-3.5 sm:p-4 bg-slate-50 rounded-xl border border-slate-200/90 space-y-3">
                <span className="font-bold text-slate-800 block text-[11px] uppercase tracking-wider">Salary Structure & Statutory Information</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Basic Salary (Monthly ₹)</label>
                    <input
                      type="number"
                      value={formData.basicSalary}
                      onChange={(e) => setFormData({ ...formData, basicSalary: Number(e.target.value) })}
                      className="w-full p-2.5 sm:p-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-hidden font-mono text-slate-900 text-sm sm:text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Gross Salary (Monthly ₹)</label>
                    <input
                      type="number"
                      value={formData.grossSalary}
                      onChange={(e) => setFormData({ ...formData, grossSalary: Number(e.target.value) })}
                      className="w-full p-2.5 sm:p-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-hidden font-mono text-slate-900 text-sm sm:text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">PAN Number</label>
                    <input
                      type="text"
                      value={formData.panNumber}
                      onChange={(e) => setFormData({ ...formData, panNumber: e.target.value.toUpperCase() })}
                      placeholder="ABCDE1234F"
                      className="w-full p-2.5 sm:p-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-hidden font-mono text-slate-900 text-sm sm:text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Aadhaar Number</label>
                    <input
                      type="text"
                      value={formData.aadhaarNumber}
                      onChange={(e) => setFormData({ ...formData, aadhaarNumber: e.target.value })}
                      placeholder="1234-5678-9012"
                      className="w-full p-2.5 sm:p-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-hidden font-mono text-slate-900 text-sm sm:text-xs"
                    />
                  </div>
                </div>

                {/* Statutory Deductions Applicability Toggles */}
                <div className="pt-3 border-t border-slate-200 space-y-3">
                  <span className="font-bold text-slate-800 block text-[11px] uppercase tracking-wider">Statutory Deductions Applicability & Numbers</span>

                  <div className="space-y-3 bg-white p-3.5 rounded-xl border border-slate-200">
                    {/* PF Toggle */}
                    <div>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-semibold text-slate-800 text-xs">Provident Fund (PF / EPF)</span>
                          <p className="text-[11px] text-slate-500">Applies 12% EPF deduction on qualifying basic</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, isPfApplicable: !formData.isPfApplicable })}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                            formData.isPfApplicable ? 'bg-indigo-600' : 'bg-slate-300'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                              formData.isPfApplicable ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>

                      {formData.isPfApplicable && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-100 animate-in fade-in duration-150">
                          <div>
                            <label className="block font-semibold text-slate-700 mb-1">UAN Number *</label>
                            <input
                              type="text"
                              value={formData.uanNumber}
                              onChange={(e) => setFormData({ ...formData, uanNumber: e.target.value })}
                              placeholder="100912345678"
                              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-xs focus:ring-2 focus:ring-indigo-500 outline-hidden"
                            />
                          </div>
                          <div>
                            <label className="block font-semibold text-slate-700 mb-1">PF Number (Member ID) *</label>
                            <input
                              type="text"
                              value={formData.pfNumber}
                              onChange={(e) => setFormData({ ...formData, pfNumber: e.target.value })}
                              placeholder="MH/BAN/0049281/000/101"
                              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-xs focus:ring-2 focus:ring-indigo-500 outline-hidden"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* ESI Toggle */}
                    <div className="pt-3 border-t border-slate-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-semibold text-slate-800 text-xs">Employee State Insurance (ESI)</span>
                          <p className="text-[11px] text-slate-500">Applies 0.75% ESIC contribution for covered employees</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, isEsiApplicable: !formData.isEsiApplicable })}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                            formData.isEsiApplicable ? 'bg-indigo-600' : 'bg-slate-300'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                              formData.isEsiApplicable ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>

                      {formData.isEsiApplicable && (
                        <div className="mt-3 pt-3 border-t border-slate-100 animate-in fade-in duration-150">
                          <label className="block font-semibold text-slate-700 mb-1">ESI Number (IP Number) *</label>
                          <input
                            type="text"
                            value={formData.esicNumber}
                            onChange={(e) => setFormData({ ...formData, esicNumber: e.target.value })}
                            placeholder="3100123456001"
                            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-xs focus:ring-2 focus:ring-indigo-500 outline-hidden"
                          />
                        </div>
                      )}
                    </div>

                    {/* PT Toggle */}
                    <div className="pt-3 border-t border-slate-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-semibold text-slate-800 text-xs">Professional Tax (PT)</span>
                          <p className="text-[11px] text-slate-500">Deducts state Professional Tax (₹200 / ₹250 slab)</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, isPtApplicable: !formData.isPtApplicable })}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                            formData.isPtApplicable ? 'bg-indigo-600' : 'bg-slate-300'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                              formData.isPtApplicable ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                      <div className="mt-1.5 text-[11px] font-medium">
                        {formData.isPtApplicable ? (
                          <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block">✓ Employee is applicable for monthly PT deduction</span>
                        ) : (
                          <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 inline-block">✕ Employee is EXEMPT from Professional Tax deduction</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 border-t border-slate-100 mt-4">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="w-full sm:w-auto px-4 py-2.5 sm:py-2 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-100 active:bg-slate-200 transition-colors cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-5 py-2.5 sm:py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl font-semibold shadow-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Save & Create Employee Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* IMPORT EMPLOYEES MODAL */}
      <ImportEmployeesModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onBulkImport={handleBulkImport}
        existingEmails={employees.map((e) => e.email)}
      />
    </div>
  );
};
