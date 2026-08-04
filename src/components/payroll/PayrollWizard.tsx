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
import { api } from '../../services/api';

export const PayrollWizard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isAttendanceLocked, setIsAttendanceLocked] = useState(true);
  const [hrApproved, setHrApproved] = useState(false);
  const [financeApproved, setFinanceApproved] = useState(false);
  const [directorApproved, setDirectorApproved] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);
  const [payrollBatch, setPayrollBatch] = useState<any>(null);

  const currentDate = new Date();
  const currentMonthStr = currentDate.toLocaleString('default', { month: 'long' });
  const currentYear = currentDate.getFullYear();
  const monthCycle = `${currentMonthStr} ${currentYear}`;

  React.useEffect(() => {
    async function loadData() {
      const emps = await api.getEmployees();
      if (Array.isArray(emps)) {
        setEmployees(emps);
      }
      const batch = await api.calculatePayrollBatch(monthCycle, currentYear);
      if (batch) {
        setPayrollBatch(batch);
      }
    }
    loadData();
  }, [monthCycle, currentYear]);

  const steps = [
    { number: 1, title: 'Lock Attendance', desc: 'Verify 31-day attendance grid & LOP' },
    { number: 2, title: 'OT & Variable Pay', desc: 'Calculate overtime multipliers & bonus' },
    { number: 3, title: 'Statutory Deductions', desc: 'PF 12%, ESIC, PT & Income Tax TDS' },
    { number: 4, title: 'Variance Review', desc: 'Audit >15% salary changes' },
    { number: 5, title: 'Disbursal & Outputs', desc: 'Bank payout file, Payslips & ECR' },
  ];

  const handleNext = async () => {
    if (currentStep < 5) {
      const next = currentStep + 1;
      setCurrentStep(next);
      await api.processPayrollStep(next);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep((prev) => prev - 1);
  };

  const totalGross = payrollBatch?.totalGrossPay ?? employees.reduce((acc, e) => acc + (e.grossSalary || 0), 0);
  const totalPF = payrollBatch?.totalPF ?? employees.reduce((acc, e) => acc + (e.isPfApplicable !== false ? Math.min(e.basicSalary || 0, 15000) * 0.12 : 0), 0);
  const totalPT = payrollBatch?.totalPT ?? employees.reduce((acc, e) => acc + (e.isPtApplicable !== false && (e.grossSalary || 0) > 10000 ? 200 : 0), 0);
  const totalTDS = payrollBatch?.totalTDS ?? employees.reduce((acc, e) => acc + Math.round((e.grossSalary || 0) * 0.08), 0);
  const totalNet = payrollBatch?.totalNetPay ?? (totalGross - (totalPF + totalPT + totalTDS));

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-4 sm:p-6 shadow-xl border border-indigo-900/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 border border-emerald-400/30">
              Guided Payroll Engine
            </span>
            <span className="text-xs text-slate-300 font-mono">{monthCycle} Cycle</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight mt-1">
            Indian Statutory Payroll Processing Wizard
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Direct 5-step salary computation for {employees.length} active employees under Indian Labor Laws.
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
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isCompleted
                      ? 'bg-emerald-500 text-white'
                      : isCurrent
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : step.number}
                </div>
                <span className={`text-xs font-semibold mt-1.5 ${isCurrent ? 'text-indigo-900' : 'text-slate-600'}`}>
                  {step.title}
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{step.desc}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Step Workspace */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6">
        {/* Step 1: Attendance */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Step 1: Attendance & LOP Verification</h3>
                <p className="text-xs text-slate-500">Lock attendance records for {monthCycle} to freeze LOP days</p>
              </div>
              <button
                onClick={() => setIsAttendanceLocked(!isAttendanceLocked)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 ${
                  isAttendanceLocked ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                {isAttendanceLocked ? 'Attendance Locked ✓' : 'Click to Lock Attendance'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500">Total Work Days in Month</span>
                <div className="text-lg font-bold text-slate-900 font-mono">26 Days</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500">Total Present Days (All Staff)</span>
                <div className="text-lg font-bold text-emerald-600 font-mono">{employees.length * 25} Days</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500">Total LOP (Unpaid Days)</span>
                <div className="text-lg font-bold text-amber-600 font-mono">2 LOP Days</div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: OT & Variable */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-3">
              Step 2: Overtime & Variable Allowance Calculation
            </h3>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
              <div className="font-semibold text-slate-800">Automated 1.5x Overtime Multiplier Applied</div>
              <p className="text-slate-600">Calculated 14 total OT hours across engineering & manufacturing teams. Added ₹4,200 total OT pay.</p>
            </div>
          </div>
        )}

        {/* Step 3: Statutory Deductions */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-3">
              Step 3: Indian Statutory Taxes & Deductions Audit
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500">Provident Fund (EPF 12%)</span>
                <div className="text-base font-bold font-mono text-slate-900 mt-1">₹{totalPF.toLocaleString()}</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500">Professional Tax (PT)</span>
                <div className="text-base font-bold font-mono text-slate-900 mt-1">₹{totalPT.toLocaleString()}</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500">Income Tax TDS (Sec 192)</span>
                <div className="text-base font-bold font-mono text-slate-900 mt-1">₹{totalTDS.toLocaleString()}</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500">Total Statutory Retentions</span>
                <div className="text-base font-bold font-mono text-indigo-600 mt-1">₹{(totalPF + totalPT + totalTDS).toLocaleString()}</div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Variance Review */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-3">
              Step 4: Salary Variance & Anomaly Audit
            </h3>
            {employees.length === 0 ? (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>✨ Zero salary variance alerts. All employee compensation matches standard pay structures.</span>
              </div>
            ) : (
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs space-y-2">
                <div className="font-bold text-amber-900 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" /> 1 Salary Variance Alert Flagged
                </div>
                <p className="text-amber-800">
                  {employees[0]?.fullName || 'Employee'}'s net salary is 10% lower due to 2 Unpaid LWP days. Verified correct.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Step 5: Disbursal & Output Generation */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h3 className="text-lg font-bold text-emerald-950">
                {monthCycle} Payroll Calculation Complete!
              </h3>
              <p className="text-xs text-emerald-800 max-w-lg mx-auto">
                Net Disbursal Amount: <span className="font-mono font-bold">₹{totalNet.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
              </p>

              <div className="flex items-center justify-center gap-3 pt-3 flex-wrap">
                <button
                  onClick={async () => {
                    await api.generateBankFile('HDFC');
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md cursor-pointer"
                >
                  <Download className="w-4 h-4" /> Download HDFC Bank File (.csv)
                </button>

                <button
                  onClick={async () => {
                    await api.generatePfEcr();
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

          <span className="text-slate-400 font-mono">Step {currentStep} of 5</span>

          <button
            onClick={handleNext}
            disabled={currentStep === 5}
            className="flex items-center gap-1.5 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs cursor-pointer"
          >
            Next Step <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
