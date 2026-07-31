import React, { useState, useEffect } from 'react';
import {
  Database,
  Building2,
  MapPin,
  Users,
  Clock,
  Banknote,
  ShieldCheck,
  Plus,
  CheckCircle2,
  Sliders,
  Calendar,
  Check,
  Edit3,
  Copy,
  Layers,
  Settings2,
  FileText,
  Search,
  Sparkles,
  Trash2,
  X,
  Upload
} from 'lucide-react';
import { companyDetails, salaryComponentsList as initialSalaryComponents } from '../../data/mockData';
import { SalaryComponent } from '../../types';
import { api } from '../../services/api';

export interface PolicyModule {
  id: string;
  name: string;
  category: 'Attendance' | 'Leave' | 'Payroll';
  description: string;
  assignmentScope: string;
  isDefault: boolean;
  status: 'Active' | 'Draft' | 'Archived';
  lastUpdated: string;
  rules: {
    weeklyOffDays?: string;
    gracePeriodMins?: number;
    halfDayLateThresholdMins?: number;
    minHoursFullDay?: number;
    minHoursHalfDay?: number;
    overtimeMultiplier?: string;
    autoRegularization?: boolean;
    sandwichRuleWeekend?: boolean;
    earnedLeaveDaysPerYear?: number;
    casualLeaveDaysPerYear?: number;
    sickLeaveDaysPerYear?: number;
    maxCarryForwardDays?: number;
    encashmentAllowed?: boolean;
    minNoticeDays?: number;
    lopBasis?: string;
    pfCeilingCap?: string;
    taxRegimeDefault?: string;
    overtimeRate?: string;
    disbursementDay?: string;
  };
}

const initialPolicyModules: PolicyModule[] = [
  {
    id: 'POL-ATT-001',
    name: 'Standard Corporate Attendance Policy v2.1',
    category: 'Attendance',
    description: 'Defines 15-min grace period, late arrival half-day rules, and automated attendance regularization for corporate offices.',
    assignmentScope: 'All Corporate & IT Branches',
    isDefault: true,
    status: 'Active',
    lastUpdated: '2026-07-20',
    rules: {
      weeklyOffDays: 'Sunday',
      gracePeriodMins: 15,
      halfDayLateThresholdMins: 45,
      minHoursFullDay: 8.0,
      minHoursHalfDay: 4.0,
      overtimeMultiplier: '1.5x Hourly Rate',
      autoRegularization: true,
      sandwichRuleWeekend: false,
    }
  },
  {
    id: 'POL-ATT-002',
    name: 'Plant & Manufacturing Shift Attendance Rules',
    category: 'Attendance',
    description: 'Strict clock-in windows for manufacturing plants with 2.0x overtime rate and weekend sandwich rule enforcement.',
    assignmentScope: 'Manufacturing & Warehouse Operations',
    isDefault: false,
    status: 'Active',
    lastUpdated: '2026-07-15',
    rules: {
      weeklyOffDays: 'Saturday & Sunday',
      gracePeriodMins: 10,
      halfDayLateThresholdMins: 30,
      minHoursFullDay: 8.5,
      minHoursHalfDay: 4.5,
      overtimeMultiplier: '2.0x Double Time',
      autoRegularization: false,
      sandwichRuleWeekend: true,
    }
  },
  {
    id: 'POL-LEV-001',
    name: 'India Statutory Leave Policy 2026',
    category: 'Leave',
    description: 'Standard Earned, Casual, and Sick Leave allocation rules aligned with Indian Shops & Establishment Act.',
    assignmentScope: 'All Entities in India',
    isDefault: true,
    status: 'Active',
    lastUpdated: '2026-07-18',
    rules: {
      earnedLeaveDaysPerYear: 18,
      casualLeaveDaysPerYear: 12,
      sickLeaveDaysPerYear: 10,
      maxCarryForwardDays: 15,
      encashmentAllowed: true,
      minNoticeDays: 3,
    }
  },
  {
    id: 'POL-PAY-001',
    name: 'Standard India Statutory Payroll Policy',
    category: 'Payroll',
    description: '30-day LOP calculation basis, ₹15k statutory Provident Fund ceiling cap, and default New Tax Regime setup.',
    assignmentScope: 'All Full-Time On-Roll Employees',
    isDefault: true,
    status: 'Active',
    lastUpdated: '2026-07-22',
    rules: {
      lopBasis: '30 Days Fixed Month Basis',
      pfCeilingCap: '₹15,000 Statutory Ceiling',
      taxRegimeDefault: 'New Tax Regime (Sec 115BAC)',
      overtimeRate: '1.5x Standard Hourly Wage',
      disbursementDay: '1st Day of Every Month',
    }
  },
  {
    id: 'POL-PAY-002',
    name: 'Executive & Leadership Payroll Policy',
    category: 'Payroll',
    description: 'Actual calendar day LOP computation with uncapped PF calculation on actual basic salary.',
    assignmentScope: 'Executive & C-Suite Leadership',
    isDefault: false,
    status: 'Active',
    lastUpdated: '2026-07-10',
    rules: {
      lopBasis: 'Actual Calendar Days in Month',
      pfCeilingCap: 'Uncapped (Actual Basic Pay)',
      taxRegimeDefault: 'New Tax Regime (Sec 115BAC)',
      overtimeRate: 'Exempt (Salaried)',
      disbursementDay: 'Last Working Day of Month',
    }
  }
];

export const ConsolidatedMasters: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'policies' | 'company' | 'branches' | 'shifts' | 'components' | 'approval'>('policies');
  const [policies, setPolicies] = useState<PolicyModule[]>(initialPolicyModules);
  const [salaryComponents, setSalaryComponents] = useState<SalaryComponent[]>(initialSalaryComponents);
  const [policyCategoryFilter, setPolicyCategoryFilter] = useState<'All' | 'Attendance' | 'Leave' | 'Payroll'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);
  const [isComponentModalOpen, setIsComponentModalOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<PolicyModule | null>(null);
  const [editingComponent, setEditingComponent] = useState<SalaryComponent | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Master Entry Form State
  const [masterForm, setMasterForm] = useState({
    type: 'Branch' as 'Branch' | 'Department' | 'Shift Type',
    title: '',
    subtitle: '',
    code: ''
  });

  // Salary Component Form State
  const [componentForm, setComponentForm] = useState<Partial<SalaryComponent>>({
    name: '',
    category: 'Earning',
    type: 'Fixed',
    formula: '',
    isStatutory: false,
    statutoryType: undefined,
    taxExempt: false
  });

  // Policy Form State
  const [policyForm, setPolicyForm] = useState<Partial<PolicyModule>>({
    name: '',
    category: 'Attendance',
    description: '',
    assignmentScope: 'All Employees',
    status: 'Active',
    isDefault: false,
    rules: {
      gracePeriodMins: 15,
      halfDayLateThresholdMins: 45,
      minHoursFullDay: 8.0,
      minHoursHalfDay: 4.0,
      overtimeMultiplier: '1.5x Hourly Rate',
      autoRegularization: true,
      earnedLeaveDaysPerYear: 18,
      casualLeaveDaysPerYear: 12,
      sickLeaveDaysPerYear: 10,
      maxCarryForwardDays: 15,
      encashmentAllowed: true,
      minNoticeDays: 3,
      lopBasis: '30 Days Fixed Month Basis',
      pfCeilingCap: '₹15,000 Statutory Ceiling',
      taxRegimeDefault: 'New Tax Regime (Sec 115BAC)',
      overtimeRate: '1.5x Standard Hourly Wage',
      disbursementDay: '1st Day of Every Month',
    }
  });

  const [activeCompanyDetails, setActiveCompanyDetails] = useState(companyDetails);

  useEffect(() => {
    async function loadMasterInfo() {
      const info = await api.getTenantInfo();
      if (info && info.companyName) {
        setActiveCompanyDetails((prev) => ({
          ...prev,
          name: info.companyName
        }));
      }
      const data = await api.getSalaryComponents();
      if (data && data.length > 0) {
        setSalaryComponents(data);
      }
    }
    loadMasterInfo();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Salary Component Handlers
  const handleOpenAddCompModal = () => {
    setEditingComponent(null);
    setComponentForm({
      name: '',
      category: 'Earning',
      type: 'Fixed',
      formula: '',
      isStatutory: false,
      statutoryType: undefined,
      taxExempt: false
    });
    setIsComponentModalOpen(true);
  };

  const handleOpenEditCompModal = (comp: SalaryComponent) => {
    setEditingComponent(comp);
    setComponentForm({
      name: comp.name,
      category: comp.category,
      type: comp.type,
      formula: comp.formula || '',
      isStatutory: comp.isStatutory,
      statutoryType: comp.statutoryType,
      taxExempt: comp.taxExempt
    });
    setIsComponentModalOpen(true);
  };

  const handleSaveComponent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!componentForm.name?.trim()) {
      alert('Please enter a component name');
      return;
    }

    if (editingComponent) {
      const updatedList = salaryComponents.map(c => c.id === editingComponent.id ? { ...c, ...componentForm } as SalaryComponent : c);
      setSalaryComponents(updatedList);
      await api.updateSalaryComponent(editingComponent.id, componentForm);
      showToast(`Salary Component "${componentForm.name}" updated!`);
    } else {
      const newComp: SalaryComponent = {
        id: `SC-0${salaryComponents.length + 1}`,
        name: componentForm.name!,
        category: componentForm.category as 'Earning' | 'Deduction',
        type: componentForm.type as 'Fixed' | 'Formula' | 'Variable',
        formula: componentForm.formula || undefined,
        isStatutory: Boolean(componentForm.isStatutory),
        statutoryType: componentForm.isStatutory ? (componentForm.statutoryType as any) : undefined,
        taxExempt: Boolean(componentForm.taxExempt)
      };
      setSalaryComponents([newComp, ...salaryComponents]);
      await api.createSalaryComponent(newComp);
      showToast(`Salary Component "${newComp.name}" created!`);
    }
    setIsComponentModalOpen(false);
  };

  const handleDeleteComponent = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove salary component "${name}"?`)) return;

    setSalaryComponents(prev => prev.filter(c => c.id !== id));
    await api.deleteSalaryComponent(id);
    showToast(`Salary Component "${name}" removed.`);
  };

  // Master Submission
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!masterForm.title.trim()) {
      alert('Please enter a name / title for the master record');
      return;
    }

    if (masterForm.type === 'Branch') {
      await api.createBranch({
        code: masterForm.code || `BR-${Date.now().toString().slice(-4)}`,
        name: masterForm.title,
        city: 'Mumbai',
        state: 'Maharashtra'
      });
    } else if (masterForm.type === 'Department') {
      await api.createDepartment(masterForm.title);
    }

    setIsAddModalOpen(false);
    showToast(`New ${masterForm.type} record "${masterForm.title}" added to masters via REST API!`);
  };

  // Policy Engine Handlers
  const handleOpenNewPolicyModal = () => {
    setEditingPolicy(null);
    setPolicyForm({
      name: '',
      category: 'Attendance',
      description: '',
      assignmentScope: 'All Employees',
      status: 'Active',
      isDefault: false,
      rules: {
        gracePeriodMins: 15,
        halfDayLateThresholdMins: 45,
        minHoursFullDay: 8.0,
        minHoursHalfDay: 4.0,
        overtimeMultiplier: '1.5x Hourly Rate',
        autoRegularization: true,
        earnedLeaveDaysPerYear: 18,
        casualLeaveDaysPerYear: 12,
        sickLeaveDaysPerYear: 10,
        maxCarryForwardDays: 15,
        encashmentAllowed: true,
        minNoticeDays: 3,
        lopBasis: '30 Days Fixed Month Basis',
        pfCeilingCap: '₹15,000 Statutory Ceiling',
        taxRegimeDefault: 'New Tax Regime (Sec 115BAC)',
        overtimeRate: '1.5x Standard Hourly Wage',
        disbursementDay: '1st Day of Every Month',
      }
    });
    setIsPolicyModalOpen(true);
  };

  const handleOpenEditPolicyModal = (policy: PolicyModule) => {
    setEditingPolicy(policy);
    setPolicyForm({
      name: policy.name,
      category: policy.category,
      description: policy.description,
      assignmentScope: policy.assignmentScope,
      status: policy.status,
      isDefault: policy.isDefault,
      rules: { ...policy.rules }
    });
    setIsPolicyModalOpen(true);
  };

  const handleSavePolicy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!policyForm.name?.trim()) {
      alert('Please enter a Policy Module Name');
      return;
    }

    if (editingPolicy) {
      setPolicies(prev => prev.map(p => {
        if (p.id === editingPolicy.id) {
          return {
            ...p,
            name: policyForm.name!,
            category: policyForm.category as any,
            description: policyForm.description || '',
            assignmentScope: policyForm.assignmentScope || 'All Employees',
            status: policyForm.status as any || 'Active',
            isDefault: policyForm.isDefault || false,
            lastUpdated: new Date().toISOString().split('T')[0],
            rules: policyForm.rules || {}
          };
        }
        return p;
      }));
      showToast(`Policy Module "${policyForm.name}" updated!`);
    } else {
      const newPolicy: PolicyModule = {
        id: `POL-${policyForm.category?.substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
        name: policyForm.name!,
        category: policyForm.category as any || 'Attendance',
        description: policyForm.description || 'Custom configured HR policy module.',
        assignmentScope: policyForm.assignmentScope || 'All Employees',
        isDefault: policyForm.isDefault || false,
        status: (policyForm.status as any) || 'Active',
        lastUpdated: new Date().toISOString().split('T')[0],
        rules: policyForm.rules || {}
      };

      setPolicies(prev => [newPolicy, ...prev]);
      showToast(`New Policy Module "${policyForm.name}" created successfully!`);
    }

    setIsPolicyModalOpen(false);
  };

  const handleDuplicatePolicy = (policy: PolicyModule) => {
    const duplicated: PolicyModule = {
      ...policy,
      id: `POL-${policy.category.substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
      name: `${policy.name} (Copy)`,
      isDefault: false,
      lastUpdated: new Date().toISOString().split('T')[0],
    };
    setPolicies(prev => [duplicated, ...prev]);
    showToast(`Policy module "${policy.name}" duplicated.`);
  };

  const handleSetDefaultPolicy = (policyId: string) => {
    const target = policies.find(p => p.id === policyId);
    if (!target) return;

    setPolicies(prev => prev.map(p => {
      if (p.category === target.category) {
        return { ...p, isDefault: p.id === policyId };
      }
      return p;
    }));

    showToast(`"${target.name}" set as primary default policy.`);
  };

  const filteredPolicies = policies.filter(p => {
    const matchesCategory = policyCategoryFilter === 'All' || p.category === policyCategoryFilter;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.assignmentScope.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Database className="w-5 h-5 text-indigo-600" />
            Masters & Centralized Policy Setup
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Unified setup for Company, Branches, Attendance/Leave/Payroll Policy Modules, Shifts & Approval Matrix
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'policies' ? (
            <button
              onClick={handleOpenNewPolicyModal}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs shadow-xs cursor-pointer transition-all"
            >
              <Sliders className="w-4 h-4" /> Create Policy Module
            </button>
          ) : activeTab === 'components' ? (
            <button
              onClick={handleOpenAddCompModal}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs shadow-xs cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4" /> Add Salary Component
            </button>
          ) : (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs shadow-xs cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4" /> Add Master Entry
            </button>
          )}
        </div>
      </div>

      {/* Main Tabs (Original Order Restored) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-1.5 shadow-xs flex items-center gap-2 overflow-x-auto custom-scrollbar">
        <button
          onClick={() => setActiveTab('policies')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 ${
            activeTab === 'policies'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-indigo-700 bg-indigo-50/80 hover:bg-indigo-100'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          Policy Setup Engine
          <span className="bg-white/20 text-current text-[10px] px-1.5 py-0.2 rounded-md font-extrabold">
            {policies.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('company')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'company' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Company Profile
        </button>

        <button
          onClick={() => setActiveTab('branches')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'branches' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Branches & Depts
        </button>

        <button
          onClick={() => setActiveTab('shifts')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'shifts' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Shift Types
        </button>

        <button
          onClick={() => setActiveTab('components')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'components' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Salary Components ({salaryComponents.length})
        </button>

        <button
          onClick={() => setActiveTab('approval')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'approval' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Approval Matrix
        </button>
      </div>

      {/* TAB 1: CENTRALIZED POLICY SETUP (ORIGINAL CARDS GRID RESTORED) */}
      {activeTab === 'policies' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-indigo-600" />
                  Centralized Policy Modules & Configuration Rules
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Define reusable Attendance, Leave, and Payroll policies. Assigned policies govern automation rules across departments and branches.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search policy name or scope..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-hidden w-64"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto text-xs">
              <span className="font-semibold text-slate-500 text-[11px] mr-1">Policy Category:</span>
              {(['All', 'Attendance', 'Leave', 'Payroll'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setPolicyCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                    policyCategoryFilter === cat
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat === 'All' ? 'All Policies' : `${cat} Policies`}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredPolicies.map((pol) => {
              const isAttendance = pol.category === 'Attendance';
              const isLeave = pol.category === 'Leave';
              const isPayroll = pol.category === 'Payroll';

              return (
                <div
                  key={pol.id}
                  className="bg-white rounded-2xl border border-slate-200/90 hover:border-indigo-300 p-5 shadow-xs hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`flex items-center gap-1 font-bold px-2.5 py-1 rounded-full text-[10px] ${
                            isAttendance
                              ? 'bg-emerald-100 text-emerald-800'
                              : isLeave
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-indigo-100 text-indigo-800'
                          }`}
                        >
                          {isAttendance && <Clock className="w-3 h-3" />}
                          {isLeave && <Calendar className="w-3 h-3" />}
                          {isPayroll && <Banknote className="w-3 h-3" />}
                          {pol.category} Policy
                        </span>

                        {pol.isDefault && (
                          <span className="bg-slate-900 text-white font-extrabold px-2 py-0.5 rounded-full text-[9px] uppercase tracking-wider flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5 text-amber-400" /> Default
                          </span>
                        )}
                      </div>

                      <span className="text-[10px] font-mono font-bold text-slate-400">{pol.id}</span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{pol.name}</h4>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">{pol.description}</p>
                    </div>

                    <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Assignment Scope:</span>
                      <span className="font-bold text-slate-800">{pol.assignmentScope}</span>
                    </div>

                    <div className="p-3 bg-slate-50/70 border border-slate-200/80 rounded-xl space-y-2 text-xs">
                      <div className="font-bold text-[11px] text-slate-700 uppercase tracking-wider border-b border-slate-200 pb-1 flex items-center gap-1.5">
                        <Settings2 className="w-3.5 h-3.5 text-indigo-600" />
                        Configured Rule Parameters
                      </div>

                      {isAttendance && (
                        <div className="grid grid-cols-2 gap-2 text-[11px]">
                          <div>
                            <span className="text-slate-400 block">Weekly Off Days:</span>
                            <span className="font-bold text-indigo-700">{pol.rules.weeklyOffDays || 'Sunday'}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block">Grace Period:</span>
                            <span className="font-bold text-slate-800">{pol.rules.gracePeriodMins} Mins</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block">Late Half-Day Threshold:</span>
                            <span className="font-bold text-slate-800">&gt;{pol.rules.halfDayLateThresholdMins} Mins</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block">Full / Half Day Min Hrs:</span>
                            <span className="font-bold text-slate-800">{pol.rules.minHoursFullDay}h / {pol.rules.minHoursHalfDay}h</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block">Overtime Rate:</span>
                            <span className="font-bold text-emerald-700">{pol.rules.overtimeMultiplier}</span>
                          </div>
                        </div>
                      )}

                      {isLeave && (
                        <div className="grid grid-cols-2 gap-2 text-[11px]">
                          <div>
                            <span className="text-slate-400 block">Earned Leave (EL):</span>
                            <span className="font-bold text-slate-800">{pol.rules.earnedLeaveDaysPerYear} Days/Yr</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block">Casual Leave (CL):</span>
                            <span className="font-bold text-slate-800">{pol.rules.casualLeaveDaysPerYear} Days/Yr</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block">Sick Leave (SL):</span>
                            <span className="font-bold text-slate-800">{pol.rules.sickLeaveDaysPerYear} Days/Yr</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block">Max Carry-Forward:</span>
                            <span className="font-bold text-indigo-700">{pol.rules.maxCarryForwardDays} Days</span>
                          </div>
                        </div>
                      )}

                      {isPayroll && (
                        <div className="grid grid-cols-2 gap-2 text-[11px]">
                          <div>
                            <span className="text-slate-400 block">LOP Calculation Basis:</span>
                            <span className="font-bold text-slate-800">{pol.rules.lopBasis}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block">PF Ceiling Cap:</span>
                            <span className="font-bold text-indigo-700">{pol.rules.pfCeilingCap}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-[10px] text-slate-400">Updated: {pol.lastUpdated}</span>

                    <div className="flex items-center gap-1.5">
                      {!pol.isDefault && (
                        <button
                          onClick={() => handleSetDefaultPolicy(pol.id)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-semibold cursor-pointer transition-colors"
                        >
                          Set Default
                        </button>
                      )}

                      <button
                        onClick={() => handleDuplicatePolicy(pol)}
                        className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg cursor-pointer transition-colors"
                        title="Duplicate Policy Module"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleOpenEditPolicyModal(pol)}
                        className="flex items-center gap-1 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[11px] font-bold shadow-xs cursor-pointer transition-colors"
                      >
                        <Edit3 className="w-3 h-3" /> Edit Module
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: COMPANY PROFILE */}
      {activeTab === 'company' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6 text-xs">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-indigo-600" />
                Corporate Entity Master & Brand Identity
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage company details and upload your official logo for background watermark rendering.
              </p>
            </div>
          </div>

          {/* Company Logo Upload & Watermark Control Box */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-white border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden shrink-0 shadow-2xs relative group">
                {localStorage.getItem('payrollpro_company_logo') ? (
                  <img
                    src={localStorage.getItem('payrollpro_company_logo') || ''}
                    alt="Uploaded Company Logo"
                    className="w-full h-full object-contain p-1"
                  />
                ) : (
                  <Building2 className="w-8 h-8 text-slate-400" />
                )}
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-xs">Official Corporate Logo & Document Watermark</h4>
                <p className="text-[11px] text-slate-500 mt-0.5 max-w-lg">
                  Uploaded logo is automatically applied as a subtle 10% opacity background watermark across all statutory registers (Form IV, PF ECR, ESIC), summary reports, salary slips, and HR letters.
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <label className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-[11px] cursor-pointer transition-colors inline-flex items-center gap-1.5 shadow-2xs">
                    <Upload className="w-3.5 h-3.5" />
                    Upload Company Logo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            const base64 = reader.result as string;
                            localStorage.setItem('payrollpro_company_logo', base64);
                            showToast('Company logo uploaded & saved! Watermark applied across all registers, salary slips, and HR letters.');
                            window.location.reload();
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="hidden"
                    />
                  </label>

                  {localStorage.getItem('payrollpro_company_logo') && (
                    <button
                      onClick={() => {
                        localStorage.removeItem('payrollpro_company_logo');
                        showToast('Company logo removed.');
                        window.location.reload();
                      }}
                      className="px-3 py-1.5 bg-slate-200 hover:bg-rose-100 text-slate-700 hover:text-rose-700 rounded-xl font-semibold text-[11px] transition-colors cursor-pointer"
                    >
                      Remove Logo
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div>
              <span className="text-slate-400">Company Name</span>
              <div className="font-bold text-slate-900 mt-0.5">{activeCompanyDetails.name}</div>
            </div>
            <div>
              <span className="text-slate-400">Company CIN</span>
              <div className="font-mono font-bold text-slate-900 mt-0.5">{companyDetails.cin}</div>
            </div>
            <div>
              <span className="text-slate-400">Company PAN</span>
              <div className="font-mono font-bold text-slate-900 mt-0.5">{companyDetails.pan}</div>
            </div>
            <div>
              <span className="text-slate-400">EPFO Establishment Code</span>
              <div className="font-mono font-bold text-indigo-700 mt-0.5">{companyDetails.epfoEstCode}</div>
            </div>
            <div>
              <span className="text-slate-400">ESIC Establishment Code</span>
              <div className="font-mono font-bold text-indigo-700 mt-0.5">{companyDetails.esicEstCode}</div>
            </div>
            <div>
              <span className="text-slate-400">TAN Number</span>
              <div className="font-mono font-bold text-slate-900 mt-0.5">{companyDetails.tan}</div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: BRANCHES & DEPTS */}
      {activeTab === 'branches' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4 text-xs">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2">
            Branch Offices & Locations
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {companyDetails.branches.map((b) => (
              <div key={b.code} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <div className="font-bold text-slate-900">{b.name}</div>
                <div className="text-slate-500">{b.city}, {b.state}</div>
                <div className="text-[10px] font-mono text-indigo-700 font-bold">Code: {b.code}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: SHIFT TYPES */}
      {activeTab === 'shifts' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4 text-xs">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2">
            Configured Shift Timings & Grace Periods
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <div className="font-bold text-slate-900">General Day Shift</div>
              <div className="text-slate-600">09:30 AM to 06:30 PM (9.0 Hrs)</div>
              <div className="text-[11px] text-emerald-700 font-semibold">15 Mins Grace Period (09:45 AM)</div>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <div className="font-bold text-slate-900">Morning Shift (Production)</div>
              <div className="text-slate-600">07:00 AM to 03:30 PM (8.5 Hrs)</div>
              <div className="text-[11px] text-emerald-700 font-semibold">10 Mins Grace Period</div>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <div className="font-bold text-slate-900">Night Shift</div>
              <div className="text-slate-600">09:00 PM to 05:30 AM (8.5 Hrs)</div>
              <div className="text-[11px] text-indigo-700 font-semibold">+₹250 Night Shift Allowance</div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: SALARY COMPONENTS (FULLY EDITABLE CRUD) */}
      {activeTab === 'components' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4 text-xs">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Banknote className="w-4 h-4 text-indigo-600" />
                Configured Salary Components (Earnings & Deductions)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Add, rename, edit formulas/statutory parameters or remove component masters across company salary structures.
              </p>
            </div>

            <button
              onClick={handleOpenAddCompModal}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Component
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3">Component Name</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Calculation Type</th>
                  <th className="p-3">Formula / Default Rule</th>
                  <th className="p-3">Statutory Status</th>
                  <th className="p-3">Tax Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {salaryComponents.map((sc) => (
                  <tr key={sc.id} className="hover:bg-slate-50">
                    <td className="p-3">
                      <div className="font-bold text-slate-900">{sc.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{sc.id}</div>
                    </td>
                    <td className="p-3">
                      <span
                        className={`font-bold px-2.5 py-0.5 rounded-full text-[10px] ${
                          sc.category === 'Earning' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {sc.category}
                      </span>
                    </td>
                    <td className="p-3">{sc.type}</td>
                    <td className="p-3 font-mono text-slate-600">{sc.formula || 'Fixed Amount'}</td>
                    <td className="p-3">
                      {sc.isStatutory ? (
                        <span className="bg-purple-100 text-purple-800 font-bold px-2.5 py-0.5 rounded-full text-[10px]">
                          {sc.statutoryType}
                        </span>
                      ) : (
                        <span className="text-slate-400">Non-statutory</span>
                      )}
                    </td>
                    <td className="p-3">
                      {sc.taxExempt ? (
                        <span className="text-emerald-700 font-semibold">Tax Exempt</span>
                      ) : (
                        <span className="text-slate-500">Taxable</span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEditCompModal(sc)}
                          className="p-1.5 hover:bg-indigo-50 text-indigo-600 rounded-lg cursor-pointer transition-colors"
                          title="Rename / Edit Component"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteComponent(sc.id, sc.name)}
                          className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-lg cursor-pointer transition-colors"
                          title="Delete Component"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: APPROVAL MATRIX */}
      {activeTab === 'approval' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4 text-xs">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2">
            Multi-Level Workflow Approval Matrix
          </h3>
          <div className="space-y-3">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <div className="font-bold text-slate-900">Leave Approval Chain</div>
              <div className="text-slate-600">Level 1: Reporting Manager → Level 2: HR Business Partner</div>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <div className="font-bold text-slate-900">Payroll Final Disbursal Chain</div>
              <div className="text-slate-600">Level 1: Payroll Specialist → Level 2: Finance Head → Level 3: Managing Director</div>
            </div>
          </div>
        </div>
      )}

      {/* SALARY COMPONENT MODAL (ADD / EDIT / RENAME) */}
      {isComponentModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold flex items-center gap-2">
                  <Banknote className="w-5 h-5 text-indigo-400" />
                  {editingComponent ? 'Edit / Rename Salary Component' : 'Add New Salary Component'}
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Configure calculation type, statutory category, and formula rules
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsComponentModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveComponent} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Component Name *</label>
                <input
                  type="text"
                  required
                  value={componentForm.name}
                  onChange={(e) => setComponentForm({ ...componentForm, name: e.target.value })}
                  placeholder="e.g. Performance Incentive / Medical Allowance"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-hidden font-medium text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category *</label>
                  <select
                    value={componentForm.category}
                    onChange={(e) => setComponentForm({ ...componentForm, category: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-hidden font-medium text-slate-900"
                  >
                    <option value="Earning">Earning (+)</option>
                    <option value="Deduction">Deduction (-)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Type *</label>
                  <select
                    value={componentForm.type}
                    onChange={(e) => setComponentForm({ ...componentForm, type: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-hidden font-medium text-slate-900"
                  >
                    <option value="Fixed">Fixed Amount</option>
                    <option value="Formula">Formula Based</option>
                    <option value="Variable">Variable / Recurring</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Formula / Rate Description</label>
                <input
                  type="text"
                  value={componentForm.formula || ''}
                  onChange={(e) => setComponentForm({ ...componentForm, formula: e.target.value })}
                  placeholder="e.g. 50% of Basic / 12% of PF Basic"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-hidden font-mono text-slate-900"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={componentForm.isStatutory}
                    onChange={(e) => setComponentForm({ ...componentForm, isStatutory: e.target.checked })}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="font-bold text-slate-800">Is Indian Statutory Component?</span>
                </label>

                {componentForm.isStatutory && (
                  <div className="pt-2">
                    <label className="block font-semibold text-slate-700 mb-1">Statutory Type</label>
                    <select
                      value={componentForm.statutoryType || 'PF'}
                      onChange={(e) => setComponentForm({ ...componentForm, statutoryType: e.target.value as any })}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg outline-hidden font-semibold text-slate-900"
                    >
                      <option value="PF">Provident Fund (PF)</option>
                      <option value="ESIC">ESIC</option>
                      <option value="PT">Professional Tax (PT)</option>
                      <option value="TDS">Income Tax (TDS)</option>
                      <option value="LWF">Labor Welfare Fund (LWF)</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsComponentModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Save Salary Component
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POLICY MODULE EDIT / CREATE MODAL */}
      {isPolicyModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[90vh] flex flex-col">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-base font-bold flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-indigo-400" />
                  {editingPolicy ? 'Edit Policy Module' : 'Create New Policy Module'}
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Configure policy automation rules, parameters, and assignment scope
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsPolicyModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePolicy} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Policy Module Name *</label>
                <input
                  type="text"
                  required
                  value={policyForm.name || ''}
                  onChange={(e) => setPolicyForm({ ...policyForm, name: e.target.value })}
                  placeholder="e.g. Corporate Standard Attendance Rules v2"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-hidden font-medium text-slate-900 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Policy Category *</label>
                  <select
                    value={policyForm.category}
                    onChange={(e) => setPolicyForm({ ...policyForm, category: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-hidden font-medium text-slate-900 text-xs"
                  >
                    <option value="Attendance">Attendance Policy</option>
                    <option value="Leave">Leave Policy</option>
                    <option value="Payroll">Payroll Policy</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Assignment Scope *</label>
                  <input
                    type="text"
                    value={policyForm.assignmentScope || ''}
                    onChange={(e) => setPolicyForm({ ...policyForm, assignmentScope: e.target.value })}
                    placeholder="e.g. All Corporate & IT Branches"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-hidden font-medium text-slate-900 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={policyForm.description || ''}
                  onChange={(e) => setPolicyForm({ ...policyForm, description: e.target.value })}
                  placeholder="Describe policy scope, grace period, and rules..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-hidden text-slate-900 text-xs"
                />
              </div>

              {/* CATEGORY SPECIFIC RULES EDITOR */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <span className="font-bold text-slate-800 block text-[11px] uppercase tracking-wider">
                  {policyForm.category} Rule Parameters & Configuration
                </span>

                {policyForm.category === 'Attendance' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Weekly Off Days Dropdown *</label>
                      <select
                        value={policyForm.rules?.weeklyOffDays || 'Sunday'}
                        onChange={(e) => setPolicyForm({
                          ...policyForm,
                          rules: { ...policyForm.rules, weeklyOffDays: e.target.value }
                        })}
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-hidden font-bold text-indigo-900 text-xs"
                      >
                        <option value="Sunday">Sunday (Standard 6-Day Workweek)</option>
                        <option value="Saturday & Sunday">Saturday & Sunday (5-Day Corporate Week)</option>
                        <option value="2nd & 4th Saturday + Sunday">2nd & 4th Saturday + Sunday (Banking Pattern)</option>
                        <option value="Friday">Friday (Middle East / Gulf Shift)</option>
                        <option value="Thursday & Friday">Thursday & Friday (Gulf 5-Day Week)</option>
                        <option value="Rotational / Off by Roster">Rotational / Off by Roster (24/7 Operations)</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Grace Period (Mins)</label>
                        <input
                          type="number"
                          value={policyForm.rules?.gracePeriodMins ?? 15}
                          onChange={(e) => setPolicyForm({
                            ...policyForm,
                            rules: { ...policyForm.rules, gracePeriodMins: Number(e.target.value) }
                          })}
                          className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Late Half-Day Threshold (Mins)</label>
                        <input
                          type="number"
                          value={policyForm.rules?.halfDayLateThresholdMins ?? 45}
                          onChange={(e) => setPolicyForm({
                            ...policyForm,
                            rules: { ...policyForm.rules, halfDayLateThresholdMins: Number(e.target.value) }
                          })}
                          className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Min Hours Full Day</label>
                        <input
                          type="number"
                          step="0.5"
                          value={policyForm.rules?.minHoursFullDay ?? 8.0}
                          onChange={(e) => setPolicyForm({
                            ...policyForm,
                            rules: { ...policyForm.rules, minHoursFullDay: Number(e.target.value) }
                          })}
                          className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Overtime Multiplier</label>
                        <select
                          value={policyForm.rules?.overtimeMultiplier || '1.5x Hourly Rate'}
                          onChange={(e) => setPolicyForm({
                            ...policyForm,
                            rules: { ...policyForm.rules, overtimeMultiplier: e.target.value }
                          })}
                          className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold"
                        >
                          <option value="1.5x Hourly Rate">1.5x Hourly Rate</option>
                          <option value="2.0x Double Time">2.0x Double Time</option>
                          <option value="1.0x Single Rate">1.0x Single Rate</option>
                          <option value="Exempt (No OT)">Exempt (No OT)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {policyForm.category === 'Leave' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Earned Leave (EL) / Yr</label>
                      <input
                        type="number"
                        value={policyForm.rules?.earnedLeaveDaysPerYear ?? 18}
                        onChange={(e) => setPolicyForm({
                          ...policyForm,
                          rules: { ...policyForm.rules, earnedLeaveDaysPerYear: Number(e.target.value) }
                        })}
                        className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Casual Leave (CL) / Yr</label>
                      <input
                        type="number"
                        value={policyForm.rules?.casualLeaveDaysPerYear ?? 12}
                        onChange={(e) => setPolicyForm({
                          ...policyForm,
                          rules: { ...policyForm.rules, casualLeaveDaysPerYear: Number(e.target.value) }
                        })}
                        className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Sick Leave (SL) / Yr</label>
                      <input
                        type="number"
                        value={policyForm.rules?.sickLeaveDaysPerYear ?? 10}
                        onChange={(e) => setPolicyForm({
                          ...policyForm,
                          rules: { ...policyForm.rules, sickLeaveDaysPerYear: Number(e.target.value) }
                        })}
                        className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Max Carry Forward</label>
                      <input
                        type="number"
                        value={policyForm.rules?.maxCarryForwardDays ?? 15}
                        onChange={(e) => setPolicyForm({
                          ...policyForm,
                          rules: { ...policyForm.rules, maxCarryForwardDays: Number(e.target.value) }
                        })}
                        className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold"
                      />
                    </div>
                  </div>
                )}

                {policyForm.category === 'Payroll' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">LOP Calculation Basis</label>
                      <select
                        value={policyForm.rules?.lopBasis || '30 Days Fixed Month Basis'}
                        onChange={(e) => setPolicyForm({
                          ...policyForm,
                          rules: { ...policyForm.rules, lopBasis: e.target.value }
                        })}
                        className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold"
                      >
                        <option value="30 Days Fixed Month Basis">30 Days Fixed Month Basis</option>
                        <option value="Actual Calendar Days in Month">Actual Calendar Days in Month</option>
                        <option value="Working Days (Excluding Weekoffs)">Working Days (Excluding Weekoffs)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">PF Ceiling Cap</label>
                      <select
                        value={policyForm.rules?.pfCeilingCap || '₹15,000 Statutory Ceiling'}
                        onChange={(e) => setPolicyForm({
                          ...policyForm,
                          rules: { ...policyForm.rules, pfCeilingCap: e.target.value }
                        })}
                        className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold"
                      >
                        <option value="₹15,000 Statutory Ceiling">₹15,000 Statutory Ceiling</option>
                        <option value="Uncapped (Actual Basic Pay)">Uncapped (Actual Basic Pay)</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800 text-xs">
                  <input
                    type="checkbox"
                    checked={policyForm.isDefault || false}
                    onChange={(e) => setPolicyForm({ ...policyForm, isDefault: e.target.checked })}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  Set as Primary Default Policy Module
                </label>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsPolicyModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {editingPolicy ? 'Update Policy Module' : 'Save & Deploy Policy'}
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
