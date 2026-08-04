import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Users,
  Banknote,
  Download,
  CheckCircle2,
  FileSpreadsheet,
  FileText,
  Printer,
  ShieldCheck,
  Building2
} from 'lucide-react';
import { api } from '../../services/api';
import { Employee } from '../../types';
import { sampleEmployees } from '../../data/mockData';


export const ReportsAnalytics: React.FC = () => {
  const [activeReportTab, setActiveReportTab] = useState<'overview' | 'payRegister' | 'salarySlip' | 'pfSummary' | 'esiSummary' | 'ptSummary' | 'bankFile'>('payRegister');
  const [payRegisterData, setPayRegisterData] = useState<any[]>([]);
  const [pfSummaryData, setPfSummaryData] = useState<any[]>([]);
  const [esiSummaryData, setEsiSummaryData] = useState<any[]>([]);
  const [ptSummaryData, setPtSummaryData] = useState<any[]>([]);
  
  const [selectedSlipEmployeeId, setSelectedSlipEmployeeId] = useState('EMP-00101');
  const [salarySlipData, setSalarySlipData] = useState<any | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [companyProfile, setCompanyProfile] = useState<any>(null);

  useEffect(() => {
    async function loadReports() {
      const comp = await api.getCompany();
      if (comp) setCompanyProfile(comp);

      const payReg = await api.getPayRegisterReport();
      if (payReg && payReg.payRegister) setPayRegisterData(payReg.payRegister);

      const pf = await api.getPfSummaryReport();
      if (pf && pf.pfSummary) setPfSummaryData(pf.pfSummary);

      const esi = await api.getEsiSummaryReport();
      if (esi && esi.esiSummary) setEsiSummaryData(esi.esiSummary);

      const pt = await api.getPtSummaryReport();
      if (pt && pt.ptSummary) setPtSummaryData(pt.ptSummary);
    }
    loadReports();
  }, [window.location.pathname]);

  useEffect(() => {
    async function loadData() {
      const data = await api.getEmployees();
      if (Array.isArray(data)) {
        setEmployees(data);
      }
    }
    loadData();
  }, []);

  // Handle Loading Salary Slip for selected employee
  useEffect(() => {
    async function loadSlip() {
      try {
        const data = await api.getSalarySlips(selectedSlipEmployeeId);
        if (data && data.salarySlip) setSalarySlipData(data.salarySlip);
      } catch {
        const emp = employees.find(e => e.id === selectedSlipEmployeeId) || employees[0];
        if (!emp) {
          setSalarySlipData(null);
          return;
        }
        setSalarySlipData({
          slipId: `SLIP-2026-07-${emp.id}`,
          employee: emp,
          month: "July 2026",
          workingDays: 26,
          paidDays: 26,
          earnings: [
            { name: "Basic Salary", amount: emp.basicSalary },
            { name: "House Rent Allowance (HRA)", amount: Math.round(emp.basicSalary * 0.5) },
            { name: "Special Allowance", amount: Math.max(0, emp.grossSalary - (emp.basicSalary + Math.round(emp.basicSalary * 0.5))) }
          ],
          deductions: [
            { name: "Employee Provident Fund (EPF)", amount: Math.min(emp.basicSalary, 15000) * 0.12 },
            { name: "Professional Tax (PT)", amount: 200 },
            { name: "Income Tax (TDS)", amount: Math.round(emp.grossSalary * 0.08) }
          ],
          totalEarnings: emp.grossSalary,
          totalDeductions: Math.min(emp.basicSalary, 15000) * 0.12 + 200 + Math.round(emp.grossSalary * 0.08),
          netPay: emp.grossSalary - (Math.min(emp.basicSalary, 15000) * 0.12 + 200 + Math.round(emp.grossSalary * 0.08))
        });
      }
    }
    loadSlip();
  }, [selectedSlipEmployeeId]);

  const downloadCSV = (headers: string[], rows: (string | number)[][], filename: string) => {
    let csv = headers.join(',') + '\n';
    rows.forEach(r => {
      csv += r.map(v => `"${v}"`).join(',') + '\n';
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Downloaded ${filename} successfully!`);
  };

  const exportPayRegisterCSV = () => {
    const headers = ['Employee ID', 'Name', 'Department', 'Bank Account', 'Basic Salary', 'HRA', 'Special Allowance', 'Gross Pay', 'PF', 'PT', 'TDS', 'Total Deductions', 'Net Salary'];
    const rows = payRegisterData.map(r => [
      r.employeeId, r.employeeName, r.department, r.bankAccount, r.basic, r.hra, r.special, r.grossPay, r.pfDeduction, r.ptDeduction, r.tdsDeduction, r.totalDeductions, r.netPay
    ]);
    downloadCSV(headers, rows, 'Pay_Register_July_2026.csv');
  };

  const exportPfSummaryCSV = () => {
    const headers = ['Employee ID', 'Name', 'UAN Number', 'Gross Wages', 'PF Qualifying Basic', 'Employee 12%', 'Employer EPS 8.33%', 'Employer EPF 3.67%', 'Total Deposit'];
    const rows = pfSummaryData.map(r => [
      r.employeeId, r.employeeName, r.uanNumber, r.grossWages, r.pfQualifyingWages, r.eeContribution12, r.erEps833, r.erEpf367, r.totalPfDeposit
    ]);
    downloadCSV(headers, rows, 'EPFO_PF_Summary_July_2026.csv');
  };

  const exportEsiSummaryCSV = () => {
    const headers = ['Employee ID', 'Name', 'ESIC IP Number', 'Gross Wages', 'Coverage Status', 'Employee 0.75%', 'Employer 3.25%', 'Total ESIC Deposit'];
    const rows = esiSummaryData.map(r => [
      r.employeeId, r.employeeName, r.esicNumber, r.grossWages, r.coverageStatus, r.eeContribution075, r.erContribution325, r.totalEsiDeposit
    ]);
    downloadCSV(headers, rows, 'ESIC_Summary_July_2026.csv');
  };

  const exportPtSummaryCSV = () => {
    const headers = ['Employee ID', 'Name', 'Branch', 'State', 'Gross Salary', 'PT Slab', 'PT Deduction'];
    const rows = ptSummaryData.map(r => [
      r.employeeId, r.employeeName, r.branch, r.state, r.grossSalary, r.ptSlab, r.ptDeduction
    ]);
    downloadCSV(headers, rows, 'Professional_Tax_PT_Summary_July_2026.csv');
  };

  const exportBankFileCSV = async () => {
    await api.generateBankFile('HDFC');
    showToast('Downloaded HDFC_Corporate_Salary_Disbursal_July_2026.csv successfully!');
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
            Statutory Reports & Payroll Analytics
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Generate Pay Register, Salary Slips, EPFO PF Summary, ESIC Return Summary & Bank Disbursal File (.csv)
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs shadow-xs cursor-pointer"
        >
          <Printer className="w-4 h-4" /> Print / Export Report PDF
        </button>
      </div>

      {/* Tabs Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-1.5 shadow-xs flex items-center gap-2 overflow-x-auto custom-scrollbar text-xs font-bold">
        <button
          onClick={() => setActiveReportTab('payRegister')}
          className={`px-4 py-2.5 rounded-xl transition-all shrink-0 flex items-center gap-2 ${
            activeReportTab === 'payRegister' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" /> Pay Register Report
        </button>

        <button
          onClick={() => setActiveReportTab('bankFile')}
          className={`px-4 py-2.5 rounded-xl transition-all shrink-0 flex items-center gap-2 ${
            activeReportTab === 'bankFile' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Building2 className="w-4 h-4 text-emerald-300" /> Bank Disbursal File (.csv)
        </button>

        <button
          onClick={() => setActiveReportTab('salarySlip')}
          className={`px-4 py-2.5 rounded-xl transition-all shrink-0 flex items-center gap-2 ${
            activeReportTab === 'salarySlip' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4" /> Salary Slip Viewer
        </button>

        <button
          onClick={() => setActiveReportTab('pfSummary')}
          className={`px-4 py-2.5 rounded-xl transition-all shrink-0 flex items-center gap-2 ${
            activeReportTab === 'pfSummary' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ShieldCheck className="w-4 h-4" /> EPFO PF Summary
        </button>

        <button
          onClick={() => setActiveReportTab('esiSummary')}
          className={`px-4 py-2.5 rounded-xl transition-all shrink-0 flex items-center gap-2 ${
            activeReportTab === 'esiSummary' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Building2 className="w-4 h-4" /> ESI Return Summary
        </button>

        <button
          onClick={() => setActiveReportTab('ptSummary')}
          className={`px-4 py-2.5 rounded-xl transition-all shrink-0 flex items-center gap-2 ${
            activeReportTab === 'ptSummary' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Banknote className="w-4 h-4" /> PT Tax Summary
        </button>

        <button
          onClick={() => setActiveReportTab('overview')}
          className={`px-4 py-2.5 rounded-xl transition-all shrink-0 flex items-center gap-2 ${
            activeReportTab === 'overview' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <TrendingUp className="w-4 h-4" /> HR Analytics Overview
        </button>
      </div>

      {/* TAB 0: BANK PAYOUT ADVICE FILE */}
      {activeReportTab === 'bankFile' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4 text-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-600" />
                Corporate Bank Salary Disbursal Advice File
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Formatted NEFT/RTGS salary payout file for HDFC Enet, ICICI Corporate Banking, SBI CMP & Kotak
              </p>
            </div>

            <button
              onClick={exportBankFileCSV}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-xs cursor-pointer"
            >
              <Download className="w-4 h-4" /> Download Bank Advice CSV (.csv)
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 text-[11px]">
                <tr>
                  <th className="p-3">Employee</th>
                  <th className="p-3">Bank Name</th>
                  <th className="p-3">Account Number</th>
                  <th className="p-3">IFSC Code</th>
                  <th className="p-3 text-right">Gross Pay</th>
                  <th className="p-3 text-right font-bold text-emerald-700">Net Disbursal Pay</th>
                  <th className="p-3">Reference No</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {payRegisterData.map((row, idx) => (
                  <tr key={row.employeeId} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-900">{row.employeeName}</td>
                    <td className="p-3 text-slate-700">HDFC Bank</td>
                    <td className="p-3 font-mono text-slate-700">{row.bankAccount || '1002938481'}</td>
                    <td className="p-3 font-mono text-slate-700">{row.bankIfsc || 'HDFC0000123'}</td>
                    <td className="p-3 text-right font-mono">₹{row.grossPay?.toLocaleString()}</td>
                    <td className="p-3 text-right font-mono font-bold text-emerald-700">₹{row.netPay?.toLocaleString()}</td>
                    <td className="p-3 font-mono text-slate-500">SAL-JUL26-00{idx + 1}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 1: PAY REGISTER REPORT */}
      {activeReportTab === 'payRegister' && (
        <div className="relative bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4 text-xs overflow-hidden">
          {localStorage.getItem('payrollpro_company_logo') && (
            <div className="print-watermark hidden print:flex absolute inset-0 items-center justify-center pointer-events-none z-0 opacity-10 select-none">
              <img
                src={localStorage.getItem('payrollpro_company_logo') || ''}
                alt="Company Logo Watermark"
                className="max-w-[380px] max-h-[380px] object-contain filter grayscale"
              />
            </div>
          )}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
                Monthly Pay Register Report (July 2026)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Itemized breakdown of earnings (Basic, HRA, Special) and statutory deductions (PF, PT, TDS) for all employees
              </p>
            </div>

            <button
              onClick={exportPayRegisterCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" /> Export Pay Register (.CSV)
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 text-[11px]">
                <tr>
                  <th className="p-3">Employee</th>
                  <th className="p-3">Dept</th>
                  <th className="p-3 text-right">Basic</th>
                  <th className="p-3 text-right">HRA</th>
                  <th className="p-3 text-right">Special Allow</th>
                  <th className="p-3 text-right bg-emerald-50 text-emerald-900 font-bold">Gross Pay</th>
                  <th className="p-3 text-right">PF (EE)</th>
                  <th className="p-3 text-right">PT</th>
                  <th className="p-3 text-right">TDS</th>
                  <th className="p-3 text-right text-rose-700 font-bold">Deductions</th>
                  <th className="p-3 text-right bg-indigo-50 text-indigo-900 font-bold">Net Salary</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {payRegisterData.map((row) => (
                  <tr key={row.employeeId} className="hover:bg-slate-50">
                    <td className="p-3">
                      <div className="font-bold text-slate-900">{row.employeeName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{row.employeeId}</div>
                    </td>
                    <td className="p-3">{row.department}</td>
                    <td className="p-3 text-right font-mono">₹{row.basic?.toLocaleString()}</td>
                    <td className="p-3 text-right font-mono">₹{row.hra?.toLocaleString()}</td>
                    <td className="p-3 text-right font-mono">₹{row.special?.toLocaleString()}</td>
                    <td className="p-3 text-right font-mono font-bold text-emerald-700 bg-emerald-50/50">
                      ₹{row.grossPay?.toLocaleString()}
                    </td>
                    <td className="p-3 text-right font-mono">₹{row.pfDeduction?.toLocaleString()}</td>
                    <td className="p-3 text-right font-mono">₹{row.ptDeduction?.toLocaleString()}</td>
                    <td className="p-3 text-right font-mono">₹{row.tdsDeduction?.toLocaleString()}</td>
                    <td className="p-3 text-right font-mono font-bold text-rose-600">
                      ₹{row.totalDeductions?.toLocaleString()}
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-indigo-700 bg-indigo-50/50">
                      ₹{row.netPay?.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: SALARY SLIP VIEWER & GENERATOR */}
      {activeReportTab === 'salarySlip' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6 text-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                Employee Salary Slip Viewer & PDF Generator
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Select an employee to generate, view and download their official formatted payslip for July 2026
              </p>
            </div>

            <div className="flex items-center gap-3">
              <label className="font-semibold text-slate-700">Select Employee:</label>
              <select
                value={selectedSlipEmployeeId}
                onChange={(e) => setSelectedSlipEmployeeId(e.target.value)}
                className="p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-hidden"
              >
                {employees.length === 0 ? (
                  <option value="">No employees available in workspace</option>
                ) : (
                  employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.fullName} ({emp.id})</option>
                  ))
                )}
              </select>

              <button
                onClick={() => window.print()}
                className="flex items-center gap-1 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" /> Print Payslip
              </button>
            </div>
          </div>

          {/* Formatted Payslip Printable Card */}
          {salarySlipData && (
            <div className="max-w-3xl mx-auto bg-white border border-slate-300 rounded-2xl p-8 shadow-sm space-y-6 text-slate-800">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div>
                  <h2 className="text-lg font-black text-slate-900 tracking-tight">{companyProfile?.name || 'ABC Manufacturing Pvt. Ltd.'}</h2>
                  <p className="text-[11px] text-slate-500">{companyProfile?.headquarters || 'Plot 42, Hadapsar Industrial Estate, Pune, Maharashtra 411013'}</p>
                  <p className="text-[10px] text-slate-400 font-mono">CIN: {companyProfile?.cin || 'U28990MH2015PTC268901'} • TAN: {companyProfile?.tan || 'MUMA98765C'}</p>
                </div>
                <div className="text-right">
                  <div className="inline-block px-3 py-1 bg-indigo-100 text-indigo-900 font-extrabold rounded-lg text-xs uppercase tracking-wider">
                    PAYSLIP - JULY 2026
                  </div>
                  <div className="text-[10px] font-mono text-slate-400 mt-1">Slip ID: {salarySlipData.slipId}</div>
                </div>
              </div>

              {/* Employee Summary Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl text-[11px]">
                <div>
                  <span className="text-slate-400 block">Employee Name</span>
                  <span className="font-bold text-slate-900">{salarySlipData.employee.fullName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Employee ID</span>
                  <span className="font-mono font-bold text-indigo-700">{salarySlipData.employee.id}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Designation</span>
                  <span className="font-bold text-slate-800">{salarySlipData.employee.designation}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Department</span>
                  <span className="font-bold text-slate-800">{salarySlipData.employee.department}</span>
                </div>

                <div>
                  <span className="text-slate-400 block">UAN Number</span>
                  <span className="font-mono font-bold text-slate-800">{salarySlipData.employee.uanNumber || '100912345678'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Bank Account</span>
                  <span className="font-mono font-bold text-slate-800">{salarySlipData.employee.bankAccount || '1002938481'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Bank Name & IFSC</span>
                  <span className="font-bold text-slate-800">{salarySlipData.employee.bankName || 'HDFC Bank'} ({salarySlipData.employee.bankIfsc || 'HDFC0000123'})</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Days Paid / Total</span>
                  <span className="font-bold text-emerald-700">{salarySlipData.paidDays} / {salarySlipData.workingDays} Days</span>
                </div>
              </div>

              {/* Earnings & Deductions Tables */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Earnings */}
                <div className="space-y-2">
                  <div className="p-2 bg-emerald-50 border-b border-emerald-200 font-bold text-emerald-900 text-[11px] rounded-t-xl">
                    EARNINGS (GROSS)
                  </div>
                  <table className="w-full text-left text-[11px]">
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {salarySlipData.earnings.map((e: any, idx: number) => (
                        <tr key={idx}>
                          <td className="py-2 text-slate-700">{e.name}</td>
                          <td className="py-2 text-right font-mono font-bold">₹{Number(e.amount).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="border-t border-slate-200 font-bold text-emerald-900">
                      <tr>
                        <td className="py-2">TOTAL GROSS EARNINGS</td>
                        <td className="py-2 text-right font-mono text-xs">₹{Number(salarySlipData.totalEarnings).toLocaleString()}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Deductions */}
                <div className="space-y-2">
                  <div className="p-2 bg-rose-50 border-b border-rose-200 font-bold text-rose-900 text-[11px] rounded-t-xl">
                    STATUTORY DEDUCTIONS
                  </div>
                  <table className="w-full text-left text-[11px]">
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {salarySlipData.deductions.map((d: any, idx: number) => (
                        <tr key={idx}>
                          <td className="py-2 text-slate-700">{d.name}</td>
                          <td className="py-2 text-right font-mono font-bold text-rose-700">₹{Number(d.amount).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="border-t border-slate-200 font-bold text-rose-900">
                      <tr>
                        <td className="py-2">TOTAL DEDUCTIONS</td>
                        <td className="py-2 text-right font-mono text-xs">₹{Number(salarySlipData.totalDeductions).toLocaleString()}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Net Pay Banner */}
              <div className="p-4 bg-indigo-900 text-white rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-indigo-200 uppercase font-bold tracking-wider">NET TAKE HOME SALARY</span>
                  <div className="text-2xl font-extrabold font-mono">₹{Number(salarySlipData.netPay).toLocaleString()}</div>
                </div>
                <div className="text-right text-[11px] text-indigo-200">
                  Transferred to HDFC Bank Account<br />
                  <span className="font-mono text-white font-bold">{salarySlipData.employee.bankAccount}</span>
                </div>
              </div>

              <div className="text-[10px] text-slate-400 text-center pt-2">
                This is a computer-generated salary slip and does not require a physical signature.
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: EPFO PF SUMMARY */}
      {activeReportTab === 'pfSummary' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4 text-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                EPFO Provident Fund (PF) Summary Statement
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                UAN-wise qualifying wages, employee 12% contribution, employer EPS (8.33%) & EPF (3.67%) breakdown
              </p>
            </div>

            <button
              onClick={exportPfSummaryCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" /> Export PF Summary (.CSV)
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 text-[11px]">
                <tr>
                  <th className="p-3">Employee</th>
                  <th className="p-3">UAN Number</th>
                  <th className="p-3">PF Number</th>
                  <th className="p-3 text-right">Gross Wages</th>
                  <th className="p-3 text-right">Qualifying PF Basic</th>
                  <th className="p-3 text-right font-bold text-emerald-700">EE PF (12%)</th>
                  <th className="p-3 text-right font-bold text-indigo-700">ER EPS (8.33%)</th>
                  <th className="p-3 text-right font-bold text-purple-700">ER EPF (3.67%)</th>
                  <th className="p-3 text-right font-bold bg-slate-100 text-slate-900">Total PF Deposit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {pfSummaryData.map((row) => (
                  <tr key={row.employeeId} className="hover:bg-slate-50">
                    <td className="p-3">
                      <div className="font-bold text-slate-900">{row.employeeName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{row.employeeId}</div>
                    </td>
                    <td className="p-3 font-mono text-slate-700">{row.uanNumber || 'N/A'}</td>
                    <td className="p-3 font-mono text-slate-700">{row.pfNumber || 'MH/BAN/0049281/000/101'}</td>
                    <td className="p-3 text-right font-mono">₹{row.grossWages?.toLocaleString()}</td>
                    <td className="p-3 text-right font-mono">₹{row.pfQualifyingWages?.toLocaleString()}</td>
                    <td className="p-3 text-right font-mono font-bold text-emerald-700">₹{row.eeContribution12?.toLocaleString()}</td>
                    <td className="p-3 text-right font-mono font-bold text-indigo-700">₹{row.erEps833?.toLocaleString()}</td>
                    <td className="p-3 text-right font-mono font-bold text-purple-700">₹{row.erEpf367?.toLocaleString()}</td>
                    <td className="p-3 text-right font-mono font-bold bg-slate-50">₹{row.totalPfDeposit?.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: ESIC SUMMARY */}
      {activeReportTab === 'esiSummary' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4 text-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-indigo-600" />
                Employee State Insurance (ESIC) Summary Report
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Gross wages eligibility (₹21,000 cap), IP number, employee 0.75% and employer 3.25% contribution
              </p>
            </div>

            <button
              onClick={exportEsiSummaryCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" /> Export ESI Summary (.CSV)
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 text-[11px]">
                <tr>
                  <th className="p-3">Employee</th>
                  <th className="p-3">ESIC IP Number</th>
                  <th className="p-3 text-right">Gross Wages</th>
                  <th className="p-3">Coverage Status</th>
                  <th className="p-3 text-right font-bold text-emerald-700">EE ESI (0.75%)</th>
                  <th className="p-3 text-right font-bold text-indigo-700">ER ESI (3.25%)</th>
                  <th className="p-3 text-right font-bold bg-slate-100 text-slate-900">Total ESI Deposit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {esiSummaryData.map((row) => (
                  <tr key={row.employeeId} className="hover:bg-slate-50">
                    <td className="p-3">
                      <div className="font-bold text-slate-900">{row.employeeName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{row.employeeId}</div>
                    </td>
                    <td className="p-3 font-mono text-slate-700">{row.esicNumber}</td>
                    <td className="p-3 text-right font-mono">₹{row.grossWages?.toLocaleString()}</td>
                    <td className="p-3 font-semibold">{row.coverageStatus}</td>
                    <td className="p-3 text-right font-mono font-bold text-emerald-700">₹{row.eeContribution075?.toLocaleString()}</td>
                    <td className="p-3 text-right font-mono font-bold text-indigo-700">₹{row.erContribution325?.toLocaleString()}</td>
                    <td className="p-3 text-right font-mono font-bold bg-slate-50">₹{row.totalEsiDeposit?.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: PT SUMMARY */}
      {activeReportTab === 'ptSummary' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4 text-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Banknote className="w-4 h-4 text-indigo-600" />
                State Professional Tax (PT) Summary Report
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                State slab applicability and monthly PT deduction returns across branches
              </p>
            </div>

            <button
              onClick={exportPtSummaryCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" /> Export PT Summary (.CSV)
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 text-[11px]">
                <tr>
                  <th className="p-3">Employee</th>
                  <th className="p-3">Branch Location</th>
                  <th className="p-3">State</th>
                  <th className="p-3 text-right">Gross Salary</th>
                  <th className="p-3">PT Slab Rule</th>
                  <th className="p-3 text-right font-bold text-indigo-700">PT Monthly Deduction</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {ptSummaryData.map((row) => (
                  <tr key={row.employeeId} className="hover:bg-slate-50">
                    <td className="p-3">
                      <div className="font-bold text-slate-900">{row.employeeName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{row.employeeId}</div>
                    </td>
                    <td className="p-3">{row.branch}</td>
                    <td className="p-3 font-semibold">{row.state}</td>
                    <td className="p-3 text-right font-mono">₹{row.grossSalary?.toLocaleString()}</td>
                    <td className="p-3 text-slate-600">{row.ptSlab}</td>
                    <td className="p-3 text-right font-mono font-bold text-indigo-700">₹{row.ptDeduction?.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: HR OVERVIEW ANALYTICS */}
      {activeReportTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
              <div className="text-xs text-slate-500 font-semibold">Total Active Headcount</div>
              <div className="text-2xl font-bold text-slate-900">142 Employees</div>
              <div className="text-[11px] text-emerald-600 font-medium">▲ +4 Joiners in July</div>
            </div>
            <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
              <div className="text-xs text-slate-500 font-semibold">Monthly Gross Payroll Cost</div>
              <div className="text-2xl font-bold text-slate-900">₹84,50,000</div>
              <div className="text-[11px] text-emerald-600 font-medium">▲ +3.2% vs June</div>
            </div>
            <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
              <div className="text-xs text-slate-500 font-semibold">Average Attendance Rate</div>
              <div className="text-2xl font-bold text-slate-900">95.8%</div>
              <div className="text-[11px] text-slate-500 font-medium">Target: 95.0%</div>
            </div>
            <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
              <div className="text-xs text-slate-500 font-semibold">Annual Attrition Rate</div>
              <div className="text-2xl font-bold text-slate-900">6.2%</div>
              <div className="text-[11px] text-emerald-600 font-medium">Below Industry Avg (12%)</div>
            </div>
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
