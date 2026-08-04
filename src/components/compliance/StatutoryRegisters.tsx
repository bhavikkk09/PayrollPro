import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Printer, 
  Download, 
  RefreshCw, 
  Building2, 
  Calendar, 
  ShieldCheck, 
  CheckCircle2, 
  Percent, 
  Sparkles,
  Info
} from 'lucide-react';
import { api } from '../../services/api';

interface RegisterOption {
  key: string;
  label: string;
  period: 'month' | 'year';
  orientation: 'Portrait' | 'Landscape';
}

export const StatutoryRegisters: React.FC = () => {
  const [registers, setRegisters] = useState<RegisterOption[]>([
    { key: "pay_slip", label: "Pay Slips — Form IV B [Rule 26(2)]", period: "month", orientation: "Portrait" },
    { key: "pay_register", label: "Pay Register — Equal Remuneration & Contract Labour", period: "month", orientation: "Landscape" },
    { key: "muster_roll", label: "Muster Roll — Form XVI [Rule 78(2)(a)]", period: "month", orientation: "Landscape" },
    { key: "pf_statement", label: "P.F. Challan Statement", period: "month", orientation: "Portrait" },
    { key: "esi_statement", label: "ESI Challan Statement — Form 7", period: "month", orientation: "Portrait" },
    { key: "pt_statement", label: "P.T. Statement", period: "month", orientation: "Portrait" },
    { key: "bonus_register", label: "Bonus Register — Form C [Payment of Bonus]", period: "year", orientation: "Landscape" },
    { key: "leave_register", label: "Earn Leave Register", period: "year", orientation: "Portrait" }
  ]);

  const [selectedRegister, setSelectedRegister] = useState<string>("pay_register");
  const [selectedCompany, setSelectedCompany] = useState<string>("Apex Enterprises India Pvt. Ltd.");
  const [companies, setCompanies] = useState<string[]>(["Apex Enterprises India Pvt. Ltd."]);
  const [selectedMonth, setSelectedMonth] = useState<string>("2026-07");
  const [selectedYear, setSelectedYear] = useState<string>("2026");
  const [bonusPercent, setBonusPercent] = useState<number>(8.33);
  const [renderedHtml, setRenderedHtml] = useState<string>("");
  const [orientation, setOrientation] = useState<'Portrait' | 'Landscape'>("Landscape");
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    async function loadTenantCompany() {
      const company = await api.getCompany();
      if (company && company.name) {
        setSelectedCompany(company.name);
        setCompanies([company.name]);
      } else {
        const info = await api.getTenantInfo();
        if (info && info.companyName) {
          setSelectedCompany(info.companyName);
          setCompanies([info.companyName]);
        }
      }
    }
    loadTenantCompany();
    loadOptions();
  }, []);

  const loadOptions = async () => {
    const res = await api.getStatutoryRegisterOptions();
    if (res && res.success) {
      if (res.registers && res.registers.length > 0) setRegisters(res.registers);
      if (res.companies && res.companies.length > 0) {
        setCompanies(res.companies);
        setSelectedCompany(res.companies[0]);
      }
      if (res.defaultMonth) setSelectedMonth(res.defaultMonth);
    }
    handleGenerate("pay_register");
  };

  const handleGenerate = async (targetRegister?: string) => {
    const regKey = targetRegister || selectedRegister;
    setLoading(true);
    const res = await api.renderStatutoryRegister({
      register: regKey,
      company: selectedCompany,
      month: selectedMonth,
      year: selectedYear,
      bonusPercent: bonusPercent
    });
    setLoading(false);
    if (res && res.html) {
      setRenderedHtml(res.html);
      if (res.orientation) setOrientation(res.orientation);
    }
  };

  const currentRegisterObj = registers.find(r => r.key === selectedRegister) || registers[0];

  const handlePrint = () => {
    if (!renderedHtml) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${currentRegisterObj.label}</title>
          <style>
            @page {
              size: A4 ${orientation === 'Landscape' ? 'landscape' : 'portrait'};
              margin: 10mm;
            }
            body {
              font-family: system-ui, -apple-system, sans-serif;
              margin: 0;
              padding: 10px;
              color: #111;
            }
          </style>
        </head>
        <body>
          ${renderedHtml}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 400);
  };

  const handleDownloadCSV = () => {
    const blob = new Blob([renderedHtml.replace(/<[^>]*>/g, ' ')], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${selectedRegister}_${selectedMonth || selectedYear}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div>
          <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Indian Labour Laws & Compliance Engine</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            Statutory Registers
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Pay slips (Form IV B), pay register, muster roll (Form XVI), PF/ESI/PT statements, and bonus registers — computed live from real payroll & attendance.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handlePrint}
            className="flex items-center space-x-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print Register</span>
          </button>
          <button
            onClick={handleDownloadCSV}
            className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium shadow-sm transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export File</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Controls vs Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Controls Card */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm space-y-5">
          <div className="border-b border-slate-100 dark:border-slate-700 pb-3 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              Register Configuration
            </h2>
            <span className="text-xs bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-semibold px-2.5 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
              {currentRegisterObj.orientation} Layout
            </span>
          </div>

          {/* Format dropdown */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Select Statutory Format
            </label>
            <select
              value={selectedRegister}
              onChange={(e) => {
                setSelectedRegister(e.target.value);
                handleGenerate(e.target.value);
              }}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 font-medium"
            >
              {registers.map((r) => (
                <option key={r.key} value={r.key}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          {/* Company dropdown */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              Company / Establishment
            </label>
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 font-medium"
            >
              {companies.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Period selector */}
          {currentRegisterObj.period === 'month' ? (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Select Salary Month
              </label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 font-medium"
              />
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Financial Year (April – March)
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 font-medium"
              >
                <option value="2026">2026–27</option>
                <option value="2025">2025–26</option>
                <option value="2024">2024–25</option>
              </select>
            </div>
          )}

          {/* Bonus % input */}
          {selectedRegister === 'bonus_register' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Percent className="w-3.5 h-3.5 text-slate-400" />
                Payment of Bonus % (8.33% to 20%)
              </label>
              <input
                type="number"
                step="0.01"
                min="8.33"
                max="20"
                value={bonusPercent}
                onChange={(e) => setBonusPercent(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 font-medium"
              />
            </div>
          )}

          {/* Generate Button */}
          <button
            onClick={() => handleGenerate()}
            disabled={loading}
            className="w-full flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg text-sm shadow-md transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Generating Register...' : 'Generate & Refresh Register'}</span>
          </button>

          {/* Info callout */}
          <div className="bg-indigo-50/70 dark:bg-slate-900/60 rounded-lg p-3.5 border border-indigo-100 dark:border-slate-700 flex items-start space-x-2.5">
            <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Company name, address, EPFO EST code (<strong>{selectedCompany}</strong>) are attached automatically to every statutory header.
            </div>
          </div>
        </div>

        {/* Live Preview Pane */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-4 mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Live Register Preview
              </h2>
            </div>
            <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Compliant with Indian Labour Standards</span>
            </div>
          </div>

          {/* Embedded Render Container */}
          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-4 min-h-[500px] overflow-x-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 space-y-3 text-slate-400">
                <RefreshCw className="w-8 h-8 animate-spin text-indigo-500" />
                <p className="text-sm font-medium">Computing statutory registers from live payroll data...</p>
              </div>
            ) : renderedHtml ? (
              <div className="relative bg-white text-slate-900 rounded shadow-sm p-4 text-xs overflow-x-auto">
                {localStorage.getItem('payrollpro_company_logo') && (
                  <div className="print-watermark hidden print:flex absolute inset-0 items-center justify-center pointer-events-none z-0 overflow-hidden opacity-10 select-none">
                    <img
                      src={localStorage.getItem('payrollpro_company_logo') || ''}
                      alt="Watermark Logo"
                      className="max-w-[350px] max-h-[350px] object-contain filter grayscale"
                    />
                  </div>
                )}
                <div
                  className="relative z-10"
                  dangerouslySetInnerHTML={{ __html: renderedHtml }}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-slate-400">
                <FileText className="w-12 h-12 stroke-1 mb-2" />
                <p className="text-sm">Click "Generate & Refresh Register" to render the document.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
