import React, { useState, useEffect } from 'react';
import {
  FileText,
  Printer,
  Download,
  Users,
  Edit3,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  Building2,
  Mail,
  Calendar,
  FileCheck,
  Plus
} from 'lucide-react';
import { Employee } from '../../types';
import { api } from '../../services/api';

interface HrLettersProps {
  companyName?: string;
  companyLogo?: string;
}

interface LetterTemplate {
  id: string;
  title: string;
  subject: string;
  category: 'Onboarding' | 'Offboarding' | 'Compensation' | 'Disciplinary';
  content: string;
}

const DEFAULT_TEMPLATES: LetterTemplate[] = [
  {
    id: 'appointment',
    title: 'Appointment & Joining Letter',
    category: 'Onboarding',
    subject: 'Appointment Order for the position of {Designation}',
    content: `Dear {Employee_Name},

We are pleased to offer you the position of {Designation} in the {Department} department at {Company_Name}. 

Your employment with us will be effective from your Date of Joining: {Date_of_Joining}.

Key Terms of Appointment:
1. Compensation: Your Annual Cost to Company (CTC) will be INR {CTC} per annum (Gross Monthly Salary: INR {Gross_Salary}).
2. Probation Period: You will be on probation for a period of 6 (Six) months from your joining date.
3. Work Location & Hours: You will be based out of our {Branch} office. Standard working hours are 9:30 AM to 6:30 PM.
4. Confidentiality: You shall not disclose any proprietary trade secrets, customer records, or financial information of {Company_Name} to any third party.

Please sign and return the duplicate copy of this letter as confirmation of your acceptance.

We welcome you to {Company_Name} and wish you a successful career ahead!

Yours sincerely,
For {Company_Name}`
  },
  {
    id: 'offer',
    title: 'Employment Offer Letter',
    category: 'Onboarding',
    subject: 'Formal Offer of Employment - {Designation}',
    content: `Dear {Employee_Name},

Following our recent interviews and discussion, we are delighted to extend a formal offer of employment to join {Company_Name} as {Designation}.

Position Details:
- Role & Title: {Designation}
- Department: {Department}
- Proposed Joining Date: {Date_of_Joining}
- Total Annual Package (CTC): INR {CTC}

This offer is subject to satisfactory reference checks and submission of required statutory documents (PAN Card, Aadhaar Card, Previous Relieving Letter).

Please confirm your acceptance of this offer by signing below within 3 working days.

Warm regards,
HR Operations Team
{Company_Name}`
  },
  {
    id: 'relieving',
    title: 'Relieving & Experience Certificate',
    category: 'Offboarding',
    subject: 'Relieving Letter & Certificate of Service - {Employee_Name}',
    content: `TO WHOMSOEVER IT MAY CONCERN

This is to certify that {Employee_Name} (Employee ID: {Employee_ID}) was employed with {Company_Name} from {Date_of_Joining} to {Current_Date}.

During their tenure with us, they served as {Designation} in the {Department} department.

We confirm that {Employee_Name} has successfully handed over all company assets, cleared all outstanding dues, and stands relieved from their duties with effect from the close of working hours on {Current_Date}.

During their service, we found them to be industrious, sincere, and honest in performing their assigned responsibilities.

We wish {Employee_Name} all the best in their future endeavors!

For {Company_Name}

Authorized Signatory`
  },
  {
    id: 'increment',
    title: 'Salary Revision & Increment Letter',
    category: 'Compensation',
    subject: 'Annual Appraisal & Compensation Revision - FY 2026-27',
    content: `Dear {Employee_Name},

In recognition of your valuable contributions, performance, and commitment to {Company_Name}, we are pleased to revise your compensation package with effect from July 1st, 2026.

Revised Compensation Details:
- Employee ID: {Employee_ID}
- Designation: {Designation}
- Revised Annual CTC: INR {CTC}
- Revised Monthly Gross Salary: INR {Gross_Salary}

All other terms and conditions of your employment contract remain unchanged.

We thank you for your dedication and look forward to your continued contribution toward the company's growth.

Best regards,
Head of Human Resources
{Company_Name}`
  },
  {
    id: 'warning',
    title: 'Attendance Advisory / Warning Notice',
    category: 'Disciplinary',
    subject: 'Official Advisory Notice: Attendance & Punctuality Expectations',
    content: `MEMORANDUM

To: {Employee_Name} ({Employee_ID})
Designation: {Designation}
Department: {Department}
Date: {Current_Date}

Subject: Attendance & Punctuality Advisory

Dear {Employee_Name},

This memorandum serves as an official advisory regarding your attendance record and biometric clock-in logs for the current month.

It has been observed that there have been multiple instances of unscheduled absences and late arrivals beyond the permitted 15-minute grace period.

As per {Company_Name} attendance guidelines, punctual attendance is essential to maintain workflow discipline.

You are hereby advised to adhere to office timings strictly. Failure to maintain required attendance standards may result in loss of pay (LOP) and further administrative review.

Sincerely,
HR Department
{Company_Name}`
  }
];

export const HrLetters: React.FC<HrLettersProps> = ({
  companyName = 'PayrollPro Pvt. Ltd.',
  companyLogo
}) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmpId, setSelectedEmpId] = useState<string>('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('appointment');
  const [customSubject, setCustomSubject] = useState<string>('');
  const [editableContent, setEditableContent] = useState<string>('');
  const [letterDate, setLetterDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [refNumber, setRefNumber] = useState<string>(`PPRO/HR/2026/${Math.floor(1000 + Math.random() * 9000)}`);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadEmployees() {
      const data = await api.getEmployees();
      if (Array.isArray(data) && data.length > 0) {
        setEmployees(data);
        setSelectedEmpId(data[0].id);
      }
    }
    loadEmployees();
  }, []);

  const activeTemplate = DEFAULT_TEMPLATES.find((t) => t.id === selectedTemplateId) || DEFAULT_TEMPLATES[0];
  const activeEmployee = employees.find((e) => e.id === selectedEmpId);

  useEffect(() => {
    if (activeTemplate) {
      setCustomSubject(activeTemplate.subject);
      setEditableContent(activeTemplate.content);
    }
  }, [selectedTemplateId]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const getMergedText = (rawText: string) => {
    let result = rawText;
    const empName = activeEmployee ? activeEmployee.fullName : 'John Doe';
    const desig = activeEmployee ? activeEmployee.designation : 'Software Engineer';
    const dept = activeEmployee ? activeEmployee.department : 'Engineering';
    const branch = activeEmployee ? activeEmployee.branch : 'Headquarters';
    const empId = activeEmployee ? activeEmployee.id : 'EMP-00101';
    const doj = activeEmployee ? activeEmployee.doj : '2026-01-15';
    const gross = activeEmployee ? activeEmployee.grossSalary.toLocaleString('en-IN') : '65,000';
    const ctc = activeEmployee ? (activeEmployee.ctc || activeEmployee.grossSalary * 12).toLocaleString('en-IN') : '7,80,000';

    result = result.replace(/\{Employee_Name\}/g, empName);
    result = result.replace(/\{Designation\}/g, desig);
    result = result.replace(/\{Department\}/g, dept);
    result = result.replace(/\{Branch\}/g, branch);
    result = result.replace(/\{Employee_ID\}/g, empId);
    result = result.replace(/\{Date_of_Joining\}/g, doj);
    result = result.replace(/\{Gross_Salary\}/g, gross);
    result = result.replace(/\{CTC\}/g, ctc);
    result = result.replace(/\{Company_Name\}/g, companyName);
    result = result.replace(/\{Current_Date\}/g, letterDate);

    return result;
  };

  const handlePrint = () => {
    window.print();
  };

  const insertPlaceholder = (placeholder: string) => {
    setEditableContent((prev) => prev + ` ${placeholder} `);
  };

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-4 sm:p-6 shadow-xl border border-indigo-900/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
              PayrollPro HR Suite
            </span>
            <span className="text-xs text-slate-300 font-mono">Template & Merge Engine</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight mt-1 text-white">
            HR Letters & Service Certificates Generator
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Select a letter template, customize the body text, select an employee to merge live data, and print with your official company watermark.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setEditableContent(activeTemplate.content);
              showToast('Reset letter content to default template!');
            }}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs border border-slate-700 transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset Content
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-xs shadow-lg transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Print / Export PDF
          </button>
        </div>
      </div>

      {/* Configuration & Selection Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Select Letter Template
          </label>
          <select
            value={selectedTemplateId}
            onChange={(e) => setSelectedTemplateId(e.target.value)}
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-hidden"
          >
            {DEFAULT_TEMPLATES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title} ({t.category})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Merge Employee Record
          </label>
          <select
            value={selectedEmpId}
            onChange={(e) => setSelectedEmpId(e.target.value)}
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-hidden"
          >
            {employees.length === 0 ? (
              <option value="">No employees found (Manual Entry)</option>
            ) : (
              employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.fullName} ({emp.designation})
                </option>
              ))
            )}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Issue Date
          </label>
          <input
            type="date"
            value={letterDate}
            onChange={(e) => setLetterDate(e.target.value)}
            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-hidden"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Reference Number
          </label>
          <input
            type="text"
            value={refNumber}
            onChange={(e) => setRefNumber(e.target.value)}
            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-hidden"
          />
        </div>
      </div>

      {/* Main Grid: Left Editor & Right Live Document Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Editable Template Editor */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-indigo-600" />
              Editable Template Content
            </h3>
            <span className="text-[11px] text-slate-500 font-mono">Live Sync</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Letter Subject Line
            </label>
            <input
              type="text"
              value={customSubject}
              onChange={(e) => setCustomSubject(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-hidden"
            />
          </div>

          {/* Variable Insert Tags Toolbar */}
          <div>
            <span className="block text-[11px] font-semibold text-slate-500 mb-1.5">
              Click to insert dynamic variable tag:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {[
                '{Employee_Name}',
                '{Designation}',
                '{Department}',
                '{Branch}',
                '{Employee_ID}',
                '{Date_of_Joining}',
                '{Gross_Salary}',
                '{CTC}',
                '{Company_Name}'
              ].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => insertPlaceholder(tag)}
                  className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-[10px] font-mono font-semibold border border-indigo-200/60 cursor-pointer transition-colors"
                >
                  + {tag}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 flex flex-col min-h-[350px]">
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Letter Body Paragraphs (Editable)
            </label>
            <textarea
              value={editableContent}
              onChange={(e) => setEditableContent(e.target.value)}
              rows={14}
              className="w-full flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-sans leading-relaxed text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-hidden resize-none font-mono"
            />
          </div>
        </div>

        {/* Right Column: Live Printable Document Preview with Watermark */}
        <div className="bg-slate-200/60 p-4 sm:p-6 rounded-2xl border border-slate-300/80 shadow-inner flex flex-col items-center overflow-auto">
          <div className="text-xs font-bold text-slate-500 mb-3 flex items-center gap-1.5 self-start">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            Official Letterhead Live Preview
          </div>

          {/* Printable A4 Paper Container */}
          <div
            id="printable-hr-letter"
            className="relative bg-white w-full max-w-[595px] min-h-[842px] p-8 sm:p-12 shadow-2xl rounded-sm border border-slate-300 text-slate-900 font-serif text-xs leading-relaxed flex flex-col justify-between"
          >
            {/* Subtle Centered Background Logo Watermark - PRINT / PDF ONLY */}
            {companyLogo ? (
              <div className="print-watermark hidden print:flex absolute inset-0 items-center justify-center pointer-events-none z-0 overflow-hidden opacity-10 select-none">
                <img
                  src={companyLogo}
                  alt="Company Logo Watermark"
                  className="max-w-[320px] max-h-[320px] object-contain filter grayscale"
                />
              </div>
            ) : (
              <div className="print-watermark hidden print:flex absolute inset-0 items-center justify-center pointer-events-none z-0 overflow-hidden opacity-5 select-none">
                <Building2 className="w-72 h-72 text-slate-900" />
              </div>
            )}

            {/* Letter Content Layer */}
            <div className="relative z-10 space-y-6">
              {/* Header Letterhead */}
              <div className="flex items-start justify-between border-b-2 border-indigo-900 pb-4">
                <div className="flex items-center gap-3">
                  {companyLogo ? (
                    <img src={companyLogo} alt="Company Logo" className="w-12 h-12 object-contain" />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-indigo-900 text-white font-bold flex items-center justify-center text-lg font-sans">
                      {companyName.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h1 className="text-base font-bold font-sans text-indigo-950 tracking-tight">
                      {companyName}
                    </h1>
                    <p className="text-[10px] font-sans text-slate-500">Corporate Office • Mumbai, Maharashtra</p>
                  </div>
                </div>
                <div className="text-right font-sans text-[10px] text-slate-500">
                  <p><strong className="text-slate-800">Ref:</strong> {refNumber}</p>
                  <p><strong className="text-slate-800">Date:</strong> {letterDate}</p>
                </div>
              </div>

              {/* Subject */}
              <div className="font-sans font-bold text-xs text-indigo-950 underline">
                SUBJECT: {getMergedText(customSubject)}
              </div>

              {/* Merged Letter Body Content */}
              <div className="whitespace-pre-line text-slate-800 leading-relaxed font-sans text-[11px]">
                {getMergedText(editableContent)}
              </div>
            </div>

            {/* Signature Footer */}
            <div className="relative z-10 pt-10 border-t border-slate-200 mt-12 flex items-end justify-between font-sans text-xs">
              <div>
                <p className="font-bold text-slate-900">Authorized HR Signatory</p>
                <p className="text-[10px] text-slate-500">{companyName}</p>
                <div className="mt-3 w-28 h-10 border-b border-dashed border-slate-400 flex items-end justify-center pb-1 text-[10px] text-slate-400 italic">
                  (Official Seal / Sign)
                </div>
              </div>

              <div className="text-right text-[9px] text-slate-400 font-mono">
                Generated via PayrollPro HR Suite • Document ID: {refNumber}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
