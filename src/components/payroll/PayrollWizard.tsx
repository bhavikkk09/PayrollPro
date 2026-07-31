import React, { useState } from 'react';
import {
  Banknote,
  CheckCircle2,
  Lock,
  Calculator,
  ShieldCheck,
  AlertTriangle,
  Download,
  FileSpreadsheet,
  ArrowRight,
  ArrowLeft,
  Check,
  Building2,
  FileText
} from 'lucide-react';
import { sampleEmployees } from '../../data/mockData';
import { api } from '../../services/api';

export const PayrollWizard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isAttendanceLocked, setIsAttendanceLocked] = useState(true);
  const [hrApproved, setHrApproved] = useState(false);
  const [financeApproved, setFinanceApproved] = useState(false);
  const [directorApproved, setDirectorApproved] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);

  React.useEffect(() => {
    async function loadEmps() {
      const data = await api.getEmployees();
      if (Array.isArray(data)) {
        setEmployees(data);
      }
    }
    loadEmps();
  }, []);

  const steps = [
    { number: 1, title: 'Lock Attendance', desc: 'Verify 31-day attendance grid & LOP' },
    { number: 2, title: 'OT & Variable Pay', desc: 'Calculate overtime multipliers & bonus' },
    { number: 3, title: 'Loan Recovery', desc: 'Deduct active salary advances' },
    { number: 4, title: 'Statutory Deductions', desc: 'PF 12%, ESIC, PT & Income Tax TDS' },
    { number: 5, title: 'Variance Review', desc: 'Audit >15% salary changes' },
    { number: 6, title: 'Multi-Tier Approvals', desc: 'HR, Finance & Director signoff' },
    { number: 7, title: 'Disbursal & Outputs', desc: 'Bank payout file, Payslips & ECR' },
  ];

  const handleNext = async () => {
    if (currentStep < 7) {
      const next = currentStep + 1;
      setCurrentStep(next);
      await api.processPayrollStep(next);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep((prev) => prev - 1);
  };

  const totalGross = employees.reduce((acc, e) => acc + (e.grossSalary || 0), 0);
  const totalPF = employees.reduce((acc, e) => acc + (e.isPfApplicable !== false ? Math.min(e.basicSalary || 0, 15000) * 0.12 : 0), 0);
  const totalPT = employees.reduce((acc, e) => acc + (e.isPtApplicable !== false && (e.grossSalary || 0) > 10000 ? 200 : 0), 0);
  const totalTDS = employees.reduce((acc, e) => acc + Math.round((e.grossSalary || 0) * 0.08), 0);
  const totalNet = totalGross - (totalPF + totalPT + totalTDS);

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-4 sm:p-6 shadow-xl border border-indigo-900/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 border border-emerald-400/30">
              Guided Payroll Engine
            </span>
            <span className="text-xs text-slate-300 font-mono">July 2026 Cycle</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight mt-1">
            Indian Statutory Payroll Processing Wizard
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Automated 7-step salary computation for {sampleEmployees.length} active employees under Indian Labor Laws.
          </p>
        </div>

        <div className="text-right text-xs">
          <div className="text-slate-400 font-medium">Estimated Net Disbursal</div>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            ₹{totalNet.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </div>
        </div>
      </div>

      {/* Stepper Navigation Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs overflow-x-auto custom-scrollbar">
        <div className="flex items-center justify-between min-w-[700px] gap-2">
          {steps.map((step) => {
            const isCompleted = step.number < currentStep;
            const isCurrent = step.number === currentStep;

            return (
              <div
                key={step.number}
                onClick={async () => {
                  setCurrentStep(step.number);
                  await api.processPayrollStep(step.number);
                }}
                className={`flex-1 flex flex-col items-center cursor-pointer group text-center px-2 py-1 rounded-xl transition-all ${
                  isCurrent ? 'bg-indigo-50 border border-indigo-200' : ''
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                    isCompleted
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : isCurrent
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30 ring-4 ring-indigo-100'
                      : 'bg-slate-100 text-slate-500 border border-slate-200'
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : step.number}
                </div>
                <span
                  className={`text-xs font-bold mt-1.5 truncate max-w-[100px] ${
                    isCurrent ? 'text-indigo-700' : isCompleted ? 'text-slate-800' : 'text-slate-400'
                  }`}
                >
                  {step.title}
                </span>
                <span className="text-[10px] text-slate-400 truncate max-w-[90px]">{step.desc}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content Container */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6">
        {/* Step 1: Lock Attendance */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Lock className="w-4 h-4 text-indigo-600" />
                Step 1: Attendance & Loss of Pay (LOP) Lock
              </h3>
              <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full">
                Attendance Lock Status: ACTIVE
              </span>
            </div>

            <p className="text-xs text-slate-600">
              Review monthly check-in logs. 0 unapproved missing punches detected. Total Loss of Pay (LOP) days: 3 across company.
            </p>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
              <div className="font-bold text-slate-800">Attendance Verification Checklist</div>
              <div className="flex items-center gap-2 text-emerald-700 font-semibold">
                <CheckCircle2 className="w-4 h-4" /> 31 Days Monthly Grid imported from Biometric Devices
              </div>
              <div className="flex items-center gap-2 text-emerald-700 font-semibold">
                <CheckCircle2 className="w-4 h-4" /> All Leave Applications Approved by Line Managers
              </div>
            </div>
          </div>
        )}

        {/* Step 2: OT & Variable */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-3">
              Step 2: Overtime Hours & Performance Bonus / Incentives
            </h3>
            <p className="text-xs text-slate-600">
              Overtime rate multiplier set to 1.5x hourly basic pay as per Factories Act / Shops & Establishment Act.
            </p>
            <div className="p-4 bg-indigo-50/60 rounded-xl border border-indigo-100 text-xs space-y-1">
              <div className="font-bold text-indigo-900">Calculated OT Payout for July 2026: ₹12,450</div>
              <div className="text-slate-600">Rahul Sharma (4 hrs) • Priya Patel (2 hrs) • Amit Verma (6 hrs)</div>
            </div>
          </div>
        )}

        {/* Step 3: Loan Recovery */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-3">
              Step 3: Employee Loan & Salary Advance Recovery
            </h3>
            <p className="text-xs text-slate-600">
              Automated deduction of active salary advances from Net Salary.
            </p>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
              No active loan deductions pending for July 2026 cycle.
            </div>
          </div>
        )}

        {/* Step 4: Statutory Deductions */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-3">
              Step 4: Statutory Compliance Deductions (PF, ESIC, PT, TDS)
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="font-semibold text-slate-500">Employee EPF (12%)</div>
                <div className="text-lg font-bold font-mono text-slate-900 mt-1">₹{totalPF.toLocaleString('en-IN')}</div>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="font-semibold text-slate-500">Professional Tax (PT)</div>
                <div className="text-lg font-bold font-mono text-slate-900 mt-1">₹{totalPT.toLocaleString('en-IN')}</div>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="font-semibold text-slate-500">Income Tax TDS</div>
                <div className="text-lg font-bold font-mono text-slate-900 mt-1">₹{totalTDS.toLocaleString('en-IN')}</div>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="font-semibold text-slate-500">Employer EPF/EPS Share</div>
                <div className="text-lg font-bold font-mono text-slate-900 mt-1">₹{totalPF.toLocaleString('en-IN')}</div>
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Variance Review */}
        {currentStep === 5 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-3">
              Step 5: Salary Variance & Anomaly Audit
            </h3>
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs space-y-2">
              <div className="font-bold text-amber-900 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" /> 1 Salary Variance Alert Flagged
              </div>
              <p className="text-amber-800">
                Karan Mehta's net salary is 10% lower due to 2 Unpaid LWP days during probation. Verified correct.
              </p>
            </div>
          </div>
        )}

        {/* Step 6: Multi-tier Approvals */}
        {currentStep === 6 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-3">
              Step 6: Multi-Tier Approval Matrix
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-800">1. HR Operations Approval</div>
                  <div className="text-slate-500">Sneha Deshmukh (HR Manager)</div>
                </div>
                <button
                  onClick={() => setHrApproved(!hrApproved)}
                  className={`px-3 py-1.5 rounded-xl font-bold ${
                    hrApproved ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {hrApproved ? 'Approved ✓' : 'Click to Signoff'}
                </button>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-800">2. Finance Controller Approval</div>
                  <div className="text-slate-500">Amit Verma (Finance Manager)</div>
                </div>
                <button
                  onClick={() => setFinanceApproved(!financeApproved)}
                  className={`px-3 py-1.5 rounded-xl font-bold ${
                    financeApproved ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {financeApproved ? 'Approved ✓' : 'Click to Signoff'}
                </button>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-800">3. Managing Director Final Signoff</div>
                  <div className="text-slate-500">Vikramaditya Rao (MD)</div>
                </div>
                <button
                  onClick={() => setDirectorApproved(!directorApproved)}
                  className={`px-3 py-1.5 rounded-xl font-bold ${
                    directorApproved ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {directorApproved ? 'Approved ✓' : 'Click to Signoff'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 7: Disbursal & Output Generation */}
        {currentStep === 7 && (
          <div className="space-y-6">
            <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h3 className="text-lg font-bold text-emerald-950">
                July 2026 Payroll Calculation Complete!
              </h3>
              <p className="text-xs text-emerald-800 max-w-lg mx-auto">
                All 3 approvals granted. Net Disbursal Amount: <span className="font-mono font-bold">₹{totalNet.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
              </p>

              <div className="flex items-center justify-center gap-3 pt-3 flex-wrap">
                <button
                  onClick={async () => {
                    const res = await fetch('/api/payroll/generate-bank-file', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ format: 'HDFC' })
                    });
                    const csv = await res.text();
                    const blob = new Blob([csv], { type: 'text/csv' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'HDFC_Corporate_Salary_Disbursal_July_2026.csv';
                    a.click();
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md cursor-pointer"
                >
                  <Download className="w-4 h-4" /> Download HDFC Bank File (.csv)
                </button>

                <button
                  onClick={async () => {
                    const res = await fetch('/api/compliance/generate-ecr', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ month: '07', year: '2026' })
                    });
                    const text = await res.text();
                    const blob = new Blob([text], { type: 'text/plain' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'PF_ECR_July_2026.txt';
                    a.click();
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-md cursor-pointer"
                >
                  <FileText className="w-4 h-4" /> Export EPFO PF ECR File
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stepper Footer Controls */}
        <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-xs">
          <button
            onClick={handlePrev}
            disabled={currentStep === 1}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 font-semibold rounded-xl cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Previous Step
          </button>

          <span className="text-slate-400 font-mono">Step {currentStep} of 7</span>

          <button
            onClick={handleNext}
            disabled={currentStep === 7}
            className="flex items-center gap-1.5 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs cursor-pointer"
          >
            Next Step <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
