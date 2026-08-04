import React, { useState } from 'react';
import { 
  Shield, Clock, Calendar, Wallet, Layers, AlertCircle, TrendingUp, 
  MapPin, Plane, DollarSign, CreditCard, Award, LogOut, FileText, 
  UserCheck, CheckCircle2, Save, RefreshCw, Sliders
} from 'lucide-react';

export interface PolicyDomain {
  id: string;
  name: string;
  category: 'attendance' | 'payroll' | 'leave' | 'governance';
  icon: any;
  description: string;
  settings: Record<string, any>;
}

export const DEFAULT_POLICIES: PolicyDomain[] = [
  {
    id: 'attendance',
    name: 'Attendance Policy',
    category: 'attendance',
    icon: Clock,
    description: 'Grace periods, late mark penalties, and half-day thresholds',
    settings: {
      gracePeriodMins: 15,
      lateMarkPenaltyThreshold: 3, // 3 late marks = 0.5 LOP
      halfDayHoursThreshold: 4,
      fullDayHoursThreshold: 8,
      requireGeofence: true,
      maxPunchDistanceM: 500,
    }
  },
  {
    id: 'leave',
    name: 'Leave Policy',
    category: 'leave',
    icon: Calendar,
    description: 'Accrual rates, carry-forward caps, and encashment rules',
    settings: {
      casualLeaveAnnual: 12,
      sickLeaveAnnual: 12,
      earnedLeaveAccrualRate: 1.5, // per month
      maxEarnedLeaveAccumulation: 45,
      allowLeaveEncashmentOnExit: true,
      sandwichPolicyEnabled: true, // weekend between leaves counted as leave
    }
  },
  {
    id: 'payroll',
    name: 'Payroll Policy',
    category: 'payroll',
    icon: Wallet,
    description: 'Pay cycle dates, LOP deduction formulas, and statutory caps',
    settings: {
      payCycleStartDay: 1,
      payCycleEndDay: 30,
      lopFormula: 'actual_days', // 'actual_days' vs '30_days'
      roundOffNetPay: true,
      epfWageCeilingINR: 15000,
      esicGrossCeilingINR: 21000,
      defaultTaxRegime: 'new_regime',
    }
  },
  {
    id: 'shift',
    name: 'Shift Policy',
    category: 'attendance',
    icon: Layers,
    description: 'Shift rotation rules, night shift allowance, and break times',
    settings: {
      allowFlexibleShifts: true,
      nightShiftAllowanceINR: 250,
      breakDurationMins: 45,
      autoShiftAssignment: true,
    }
  },
  {
    id: 'late_coming',
    name: 'Late Coming Policy',
    category: 'attendance',
    icon: AlertCircle,
    description: 'Automated LOP deductions for repeated late arrivals',
    settings: {
      maxAllowedLateComingsPerMonth: 3,
      deductionPerLateComings: 0.5, // LOP days
      autoNotifyManager: true,
    }
  },
  {
    id: 'early_going',
    name: 'Early Going Policy',
    category: 'attendance',
    icon: LogOut,
    description: 'Rules for early departures before shift completion time',
    settings: {
      earlyDepartureThresholdMins: 30,
      treatEarlyDepartureAsHalfDay: true,
      preApprovalRequired: true,
    }
  },
  {
    id: 'overtime',
    name: 'Overtime Policy',
    category: 'payroll',
    icon: TrendingUp,
    description: 'Overtime rate multipliers and pre-approval requirements',
    settings: {
      otMultiplierWeekday: 1.5,
      otMultiplierWeekend: 2.0,
      otMultiplierHoliday: 2.0,
      preApprovalMandatory: true,
      maxOtHoursPerMonth: 40,
    }
  },
  {
    id: 'holiday',
    name: 'Holiday Policy',
    category: 'leave',
    icon: MapPin,
    description: 'Mandatory vs optional holiday selections per state/location',
    settings: {
      mandatoryHolidaysCount: 10,
      optionalHolidaysAllowed: 2,
      restrictedHolidayAdvanceNoticeDays: 7,
    }
  },
  {
    id: 'travel',
    name: 'Travel Policy',
    category: 'governance',
    icon: Plane,
    description: 'Daily allowance per grade, flight/train class eligibility',
    settings: {
      dailyAllowanceMetroINR: 1500,
      dailyAllowanceNonMetroINR: 1000,
      flightEligibilityGradeMin: 'M3',
      advanceRequestLeadDays: 3,
    }
  },
  {
    id: 'expense',
    name: 'Expense Reimbursement Policy',
    category: 'payroll',
    icon: DollarSign,
    description: 'Category limits, receipt upload thresholds, and approval SLAs',
    settings: {
      receiptUploadMandatoryAboveINR: 500,
      approvalSlaDays: 5,
      maxMonthlyMiscellaneousExpenseINR: 5000,
    }
  },
  {
    id: 'loan',
    name: 'Employee Loan Policy',
    category: 'payroll',
    icon: CreditCard,
    description: 'Max loan entitlement relative to CTC, EMI tenure caps',
    settings: {
      maxLoanPercentOfCtc: 25,
      maxEmiTenureMonths: 24,
      interestRatePercent: 6.5,
      minTenureMonthsInCompany: 12,
    }
  },
  {
    id: 'reimbursement',
    name: 'Reimbursement Policy',
    category: 'payroll',
    icon: Sliders,
    description: 'Tax-free vs taxable ceiling rules for claims',
    settings: {
      taxFreeTelephoneCeilingMonthlyINR: 2000,
      taxFreeFuelCeilingMonthlyINR: 5000,
      requireOriginalBills: true,
    }
  },
  {
    id: 'exit',
    name: 'Exit Policy',
    category: 'governance',
    icon: LogOut,
    description: 'Resignation approval steps, exit interview requirement',
    settings: {
      requireExitInterview: true,
      clearanceDepartmentsCount: 5,
      fullAndFinalSettlementSlaDays: 30,
    }
  },
  {
    id: 'notice_period',
    name: 'Notice Period Policy',
    category: 'governance',
    icon: FileText,
    description: 'Notice days per grade, buyout calculation rate',
    settings: {
      standardNoticeDays: 60,
      probationNoticeDays: 30,
      executiveNoticeDays: 90,
      allowNoticeBuyout: true,
    }
  },
  {
    id: 'probation',
    name: 'Probation Policy',
    category: 'governance',
    icon: UserCheck,
    description: 'Standard probation duration, auto-confirmation vs extension',
    settings: {
      standardProbationMonths: 6,
      maxProbationExtensionMonths: 3,
      autoConfirmIfNoFeedback: false,
    }
  },
  {
    id: 'confirmation',
    name: 'Confirmation Policy',
    category: 'governance',
    icon: Award,
    description: 'Performance score minimum requirement for confirmation',
    settings: {
      minPerformanceScoreForConfirmation: 75, // %
      requireManagerRecommendation: true,
      confirmationBonusEligible: true,
    }
  }
];

export const CentralizedPolicyHub: React.FC = () => {
  const [policies, setPolicies] = useState<PolicyDomain[]>(DEFAULT_POLICIES);
  const [activePolicyId, setActivePolicyId] = useState<string>('attendance');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [isSaved, setIsSaved] = useState<boolean>(false);

  const activePolicy = policies.find(p => p.id === activePolicyId) || policies[0];

  const handleSettingChange = (key: string, value: any) => {
    setPolicies(prev => prev.map(p => {
      if (p.id === activePolicyId) {
        return {
          ...p,
          settings: {
            ...p.settings,
            [key]: value
          }
        };
      }
      return p;
    }));
    setIsSaved(false);
  };

  const handleSaveAll = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const filteredPolicies = policies.filter(p => 
    filterCategory === 'all' || p.category === filterCategory
  );

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 p-6 rounded-2xl border border-slate-800 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400">
            <Shield className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
              Centralized Policy Engine
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                16 Policy Domains Active
              </span>
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Configure company-wide operational policies dynamically. Zero hardcoded rules.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isSaved && (
            <div className="flex items-center gap-2 text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-xl">
              <CheckCircle2 className="w-4 h-4" />
              Policies Saved Successfully
            </div>
          )}
          <button 
            onClick={handleSaveAll}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-medium rounded-xl shadow-lg shadow-indigo-600/20 transition-all text-sm"
          >
            <Save className="w-4 h-4" />
            Save All Policies
          </button>
        </div>
      </div>

      {/* Main Grid: Policy Menu Sidebar + Settings Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Selector Sidebar */}
        <div className="lg:col-span-4 space-y-4">
          {/* Category Filter */}
          <div className="flex items-center justify-between p-1.5 bg-slate-900/60 rounded-xl border border-slate-800 text-xs font-medium text-slate-400">
            {['all', 'attendance', 'payroll', 'leave', 'governance'].map(cat => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-2.5 py-1.5 rounded-lg capitalize transition-all ${
                  filterCategory === cat 
                    ? 'bg-indigo-600 text-white font-semibold shadow' 
                    : 'hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Policy Item List */}
          <div className="space-y-2 max-h-[620px] overflow-y-auto pr-1">
            {filteredPolicies.map(policy => {
              const Icon = policy.icon;
              const isActive = policy.id === activePolicyId;
              return (
                <button
                  key={policy.id}
                  onClick={() => setActivePolicyId(policy.id)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start gap-3.5 ${
                    isActive 
                      ? 'bg-indigo-600/10 border-indigo-500/40 text-slate-100 shadow-md' 
                      : 'bg-slate-900/40 border-slate-800/80 text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
                  }`}
                >
                  <div className={`p-2 rounded-lg mt-0.5 ${isActive ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-800 text-slate-400'}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm truncate text-slate-100">{policy.name}</span>
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                        {policy.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{policy.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Active Policy Editor */}
        <div className="lg:col-span-8 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-md space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              {React.createElement(activePolicy.icon, { className: 'w-6 h-6 text-indigo-400' })}
              <div>
                <h2 className="text-xl font-bold text-slate-100">{activePolicy.name}</h2>
                <p className="text-xs text-slate-400">{activePolicy.description}</p>
              </div>
            </div>
            <button 
              onClick={() => handleSettingChange(Object.keys(activePolicy.settings)[0], activePolicy.settings[Object.keys(activePolicy.settings)[0]])}
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg text-xs flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset Defaults
            </button>
          </div>

          {/* Form Fields for Active Policy */}
          <div className="space-y-5">
            {Object.entries(activePolicy.settings).map(([key, val]) => {
              const formattedLabel = key
                .replace(/([A-Z])/g, ' $1')
                .replace(/^./, str => str.toUpperCase());
              
              const isBoolean = typeof val === 'boolean';
              const isNumber = typeof val === 'number';

              return (
                <div key={key} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-800/40 rounded-xl border border-slate-800">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium text-slate-200 block">{formattedLabel}</label>
                    <span className="text-xs text-slate-400 font-mono">key: {key}</span>
                  </div>

                  <div className="sm:w-64">
                    {isBoolean ? (
                      <button
                        type="button"
                        onClick={() => handleSettingChange(key, !val)}
                        className={`w-full py-2 px-4 rounded-xl text-xs font-semibold border transition-all flex items-center justify-center gap-2 ${
                          val 
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                            : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${val ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                        {val ? 'Enabled / Active' : 'Disabled / Inactive'}
                      </button>
                    ) : isNumber ? (
                      <input
                        type="number"
                        value={val}
                        onChange={(e) => handleSettingChange(key, parseFloat(e.target.value) || 0)}
                        className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm font-mono text-slate-100 focus:outline-none focus:border-indigo-500 transition-all text-right"
                      />
                    ) : (
                      <input
                        type="text"
                        value={val}
                        onChange={(e) => handleSettingChange(key, e.target.value)}
                        className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm font-mono text-slate-100 focus:outline-none focus:border-indigo-500 transition-all"
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
export default CentralizedPolicyHub;
