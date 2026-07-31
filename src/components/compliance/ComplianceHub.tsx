import React, { useState } from 'react';
import { ShieldCheck, Download, FileText, CheckCircle2, AlertCircle, Building2, Calculator } from 'lucide-react';
import { sampleComplianceItems } from '../../data/mockData';

export const ComplianceHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'pf' | 'esic' | 'pt' | 'tds'>('overview');

  const handleDownloadPfECR = async () => {
    const res = await fetch('/api/compliance/generate-pf-ecr', { method: 'POST' });
    const text = await res.text();
    const blob = new Blob([text], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'PF_ECR_JULY_2026.txt';
    a.click();
  };

  const handleDownloadEsicReturn = async () => {
    const res = await fetch('/api/compliance/generate-esic-return', { method: 'POST' });
    const csv = await res.text();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ESIC_Monthly_Return_July_2026.csv';
    a.click();
  };

  const handleDownloadPtReturn = async () => {
    const res = await fetch('/api/compliance/generate-pt-return', { method: 'POST' });
    const csv = await res.text();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Maharashtra_PT_Form_III_A_July_2026.csv';
    a.click();
  };

  const handleDownloadTds24Q = async () => {
    const res = await fetch('/api/compliance/generate-tds-24q', { method: 'POST' });
    const txt = await res.text();
    const blob = new Blob([txt], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Form24Q_Q1_2026_27.txt';
    a.click();
  };

  const handleDownloadBankFile = async () => {
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
  };

  const handleGenerateFiling = (itemId: string) => {
    if (itemId === 'comp-01') handleDownloadPfECR();
    else if (itemId === 'comp-02') handleDownloadEsicReturn();
    else if (itemId === 'comp-03') handleDownloadPtReturn();
    else if (itemId === 'comp-04') handleDownloadTds24Q();
    else handleDownloadPfECR();
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Indian Statutory Compliance Hub</h2>
            <span className="text-xs bg-purple-100 text-purple-800 font-bold px-2.5 py-0.5 rounded-full border border-purple-200">
              EPFO • ESIC • PT • TDS • BANK
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Automated statutory ECR file generator, ESIC contribution CSV, state PT slabs, Form 24Q TDS & Bank Disbursal File (.csv)
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleDownloadBankFile}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-xs cursor-pointer"
          >
            <Download className="w-4 h-4" /> Download Bank Disbursal File (.csv)
          </button>

          <button
            onClick={handleDownloadPfECR}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-xs cursor-pointer"
          >
            <Download className="w-4 h-4" /> Download EPFO PF ECR File
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-1.5 shadow-xs flex items-center gap-2 overflow-x-auto text-xs">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === 'overview' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Compliance Dashboard
        </button>
        <button
          onClick={() => setActiveTab('pf')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === 'pf' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Provident Fund (PF ECR)
        </button>
        <button
          onClick={() => setActiveTab('esic')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === 'esic' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          ESIC Return (CSV)
        </button>
        <button
          onClick={() => setActiveTab('pt')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === 'pt' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Professional Tax (Form III-A)
        </button>
        <button
          onClick={() => setActiveTab('tds')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === 'tds' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Income Tax TDS (Form 24Q)
        </button>
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2">
              Upcoming Statutory Filings & Deadlines
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sampleComplianceItems.map((item) => (
                <div key={item.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between font-bold text-slate-900">
                    <span>{item.title}</span>
                    <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-mono">
                      Due: {item.dueDate}
                    </span>
                  </div>
                  <p className="text-slate-600">{item.description}</p>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                    <span className="font-mono font-bold text-slate-900">Amount: ₹{item.amountDue.toLocaleString('en-IN')}</span>
                    <button
                      onClick={() => handleGenerateFiling(item.id)}
                      className="text-indigo-600 font-bold hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <Download className="w-3.5 h-3.5" /> Generate Filing File →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'pf' && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h3 className="text-sm font-bold text-slate-900">
                EPFO Unified Portal ECR File Rules & Format
              </h3>
              <button
                onClick={handleDownloadPfECR}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Download className="w-3.5 h-3.5" /> Download PF ECR Text File (.txt)
              </button>
            </div>
            <p className="text-slate-600">
              PF Statutory Wage limit: ₹15,000/month. 12% EE Contribution + 12% ER Contribution (split into 3.67% EPF + 8.33% EPS capped at ₹1,250). Delimited by <code className="bg-slate-100 font-bold px-1.5 py-0.5 rounded text-indigo-700">#~#</code>.
            </p>
            <div className="p-4 bg-slate-900 text-emerald-400 font-mono text-[11px] rounded-xl overflow-x-auto leading-relaxed border border-slate-800">
              # Official EPFO ECR Text Payload Format:<br />
              100912345678#~#RAHUL SHARMA#~#95000#~#15000#~#15000#~#15000#~#1800#~#1250#~#550#~#0#~#0<br />
              100987654321#~#PRIYA PATEL#~#78000#~#15000#~#15000#~#15000#~#1800#~#1250#~#550#~#1#~#0
            </div>
          </div>
        )}

        {activeTab === 'esic' && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h3 className="text-sm font-bold text-slate-900">
                ESIC Monthly Contribution Return Format (esic.gov.in)
              </h3>
              <button
                onClick={handleDownloadEsicReturn}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Download className="w-3.5 h-3.5" /> Download ESIC Return CSV (.csv)
              </button>
            </div>
            <p className="text-slate-600">
              Applies to covered employees grossing ≤ ₹21,000/month. EE Share: 0.75%, ER Share: 3.25%. Direct CSV upload for ESIC Employer Portal.
            </p>
            <div className="p-4 bg-slate-900 text-emerald-400 font-mono text-[11px] rounded-xl overflow-x-auto leading-relaxed border border-slate-800">
              IP Number,IP Name,No of Days Worked for which wages paid,Total Monthly Wages,Reason Code for Zero Working Days,Last Working Day<br />
              &quot;3100123456001&quot;,&quot;Rahul Sharma&quot;,26,95000,0,&quot;&quot;<br />
              &quot;3100987654002&quot;,&quot;Sneha Deshmukh&quot;,25,21000,0,&quot;&quot;
            </div>
          </div>
        )}

        {activeTab === 'pt' && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h3 className="text-sm font-bold text-slate-900">
                State-wise Professional Tax (PT) Slabs & Form III-A Export
              </h3>
              <button
                onClick={handleDownloadPtReturn}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Download className="w-3.5 h-3.5" /> Download PT Form III-A CSV (.csv)
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <div className="font-bold text-slate-900">Maharashtra</div>
                <div className="text-slate-600 font-mono">Gross ≤ ₹7,500: ₹0</div>
                <div className="text-slate-600 font-mono">Gross &gt; ₹10,000: ₹200 (Feb ₹300)</div>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <div className="font-bold text-slate-900">Karnataka</div>
                <div className="text-slate-600 font-mono">Gross &lt; ₹25,000: ₹0</div>
                <div className="text-slate-600 font-mono">Gross ≥ ₹25,000: ₹200 / month</div>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <div className="font-bold text-slate-900">Telangana</div>
                <div className="text-slate-600 font-mono">Gross ₹15k - ₹20k: ₹150</div>
                <div className="text-slate-600 font-mono">Gross &gt; ₹20k: ₹200 / month</div>
              </div>
            </div>
            <div className="p-4 bg-slate-900 text-emerald-400 font-mono text-[11px] rounded-xl overflow-x-auto leading-relaxed border border-slate-800">
              Registration Certificate No,Period Code,Taxpayer Name,Gross Salary Slab,Employee Count,Tax Rate per Employee (INR),Total PT Amount (INR)<br />
              &quot;27123456789P&quot;,&quot;202607&quot;,&quot;Apex Enterprises India Pvt. Ltd.&quot;,&quot;Gross Salary &gt; RS 10000&quot;,120,200,24000
            </div>
          </div>
        )}

        {activeTab === 'tds' && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h3 className="text-sm font-bold text-slate-900">
                Income Tax TDS Form 24Q Quarterly Return (NSDL FVU)
              </h3>
              <button
                onClick={handleDownloadTds24Q}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Download className="w-3.5 h-3.5" /> Download Form 24Q Text File (.txt)
              </button>
            </div>
            <p className="text-slate-600">
              Section 192 Salary Income Tax deduction quarterly return payload for NSDL RPU / FVU validation utility.
            </p>
            <div className="p-4 bg-slate-900 text-emerald-400 font-mono text-[11px] rounded-xl overflow-x-auto leading-relaxed border border-slate-800">
              FH#SL1#24Q#2026-07-31#1#P#MUMA12345B#AAACA1234F#Apex Enterprises India Pvt. Ltd.#Q1#2026-27<br />
              BH#1#142#Section 192#620000#0#0<br />
              CD#1#1#EMP-00101#ABCPS1234F#RAHUL SHARMA#95000#7600#0
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
