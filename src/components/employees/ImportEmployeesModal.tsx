import React, { useState, useRef } from 'react';
import Papa from 'papaparse';
import { Upload, FileSpreadsheet, Download, AlertCircle, CheckCircle2, X, RefreshCw, AlertTriangle, UserCheck, ArrowRight } from 'lucide-react';
import { Employee, EmploymentType, EmploymentStatus } from '../../types';

interface ImportEmployeesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBulkImport: (newEmployees: Employee[]) => void;
  existingEmails?: string[];
}

interface CSVRowData {
  fullName?: string;
  'Full Name'?: string;
  email?: string;
  'Email'?: string;
  'Email Address'?: string;
  phone?: string;
  'Phone'?: string;
  'Mobile'?: string;
  designation?: string;
  'Designation'?: string;
  department?: string;
  'Department'?: string;
  branch?: string;
  'Branch'?: string;
  doj?: string;
  'Date of Joining'?: string;
  'DOJ'?: string;
  employmentType?: string;
  'Employment Type'?: string;
  basicSalary?: string | number;
  'Basic Salary'?: string | number;
  grossSalary?: string | number;
  'Gross Salary'?: string | number;
  panNumber?: string;
  'PAN'?: string;
  'PAN Number'?: string;
  aadhaarNumber?: string;
  'Aadhaar'?: string;
  'Aadhaar Number'?: string;
  status?: string;
  'Status'?: string;
  managerName?: string;
  'Manager Name'?: string;
  [key: string]: any;
}

interface ParsedRecord {
  rowIndex: number;
  rawData: Record<string, string>;
  mappedEmployee: Partial<Employee>;
  isValid: boolean;
  errors: string[];
}

export const ImportEmployeesModal: React.FC<ImportEmployeesModalProps> = ({
  isOpen,
  onClose,
  onBulkImport,
  existingEmails = []
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [parsedRecords, setParsedRecords] = useState<ParsedRecord[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [skipInvalid, setSkipInvalid] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Download Sample CSV Template
  const handleDownloadTemplate = () => {
    const csvContent = `Full Name,Email,Phone,Designation,Department,Branch,Date of Joining,Employment Type,Basic Salary,Gross Salary,PAN Number,Aadhaar Number,Status
Rajesh Sharma,rajesh.sharma@apexenterprises.in,+91 98765 43210,Lead Engineer,Engineering,Mumbai Headquarters,2025-04-15,Full-Time,45000,95000,ABCDE1234F,1234-5678-9012,Active
Priya Verma,priya.verma@apexenterprises.in,+91 98123 45678,HR Specialist,Human Resources,Bengaluru Tech Hub,2025-06-01,Full-Time,30000,65000,FGHIJ5678K,9876-5432-1098,Active
Amit Patel,amit.patel@apexenterprises.in,+91 99887 76655,Financial Analyst,Finance & Accounts,Mumbai Headquarters,2026-01-10,Probation,28000,60000,KLMNO9012P,4567-8901-2345,Probation`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Employee_Import_Template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper to get string value from row ignoring case
  const getFieldValue = (row: Record<string, any>, possibleKeys: string[]): string => {
    for (const k of possibleKeys) {
      if (row[k] !== undefined && row[k] !== null && String(row[k]).trim() !== '') {
        return String(row[k]).trim();
      }
    }
    // Also try case-insensitive match against row keys
    const rowKeys = Object.keys(row);
    for (const k of possibleKeys) {
      const matchKey = rowKeys.find((rk) => rk.trim().toLowerCase() === k.trim().toLowerCase());
      if (matchKey && row[matchKey] !== undefined && row[matchKey] !== null && String(row[matchKey]).trim() !== '') {
        return String(row[matchKey]).trim();
      }
    }
    return '';
  };

  // Parse CSV File using PapaParse
  const processCSVFile = (selectedFile: File) => {
    setFile(selectedFile);
    setIsParsing(true);

    Papa.parse<Record<string, string>>(selectedFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const records: ParsedRecord[] = [];
        const seenEmailsInFile = new Set<string>();

        results.data.forEach((row, idx) => {
          const errors: string[] = [];

          const fullName = getFieldValue(row, ['Full Name', 'fullName', 'Name', 'Employee Name']);
          const email = getFieldValue(row, ['Email', 'email', 'Email Address', 'Company Email']);
          const phone = getFieldValue(row, ['Phone', 'phone', 'Mobile', 'Mobile Phone', 'Contact']);
          const designation = getFieldValue(row, ['Designation', 'designation', 'Role', 'Job Title']) || 'Associate';
          const department = getFieldValue(row, ['Department', 'department', 'Dept']) || 'General Administration';
          const branch = getFieldValue(row, ['Branch', 'branch', 'Work Location', 'Location']) || 'Mumbai Headquarters';
          const doj = getFieldValue(row, ['Date of Joining', 'doj', 'DOJ', 'Joining Date']) || new Date().toISOString().split('T')[0];
          const employmentTypeStr = getFieldValue(row, ['Employment Type', 'employmentType', 'Type']) || 'Full-Time';
          const basicSalaryStr = getFieldValue(row, ['Basic Salary', 'basicSalary', 'Basic']);
          const grossSalaryStr = getFieldValue(row, ['Gross Salary', 'grossSalary', 'Gross']);
          const panNumber = getFieldValue(row, ['PAN Number', 'panNumber', 'PAN']) || 'ABCDE1234F';
          const aadhaarNumber = getFieldValue(row, ['Aadhaar Number', 'aadhaarNumber', 'Aadhaar']) || '1234-5678-9012';
          const statusStr = getFieldValue(row, ['Status', 'status']) || 'Active';
          const managerName = getFieldValue(row, ['Manager Name', 'managerName', 'Manager']) || 'Vikramaditya Rao';

          // Validation Rules
          if (!fullName) {
            errors.push('Full Name is required');
          }

          if (!email) {
            errors.push('Email is required');
          } else {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
              errors.push('Invalid email format');
            } else if (seenEmailsInFile.has(email.toLowerCase())) {
              errors.push('Duplicate email found in CSV file');
            } else if (existingEmails.map((e) => e.toLowerCase()).includes(email.toLowerCase())) {
              errors.push('Email already exists in system');
            }
          }

          if (email) {
            seenEmailsInFile.add(email.toLowerCase());
          }

          const basicSalary = parseFloat(basicSalaryStr.replace(/[^0-9.]/g, '')) || 35000;
          const grossSalary = parseFloat(grossSalaryStr.replace(/[^0-9.]/g, '')) || 75000;

          if (grossSalary < basicSalary) {
            errors.push('Gross salary should be greater than or equal to Basic salary');
          }

          let empType: EmploymentType = 'Full-Time';
          if (['Part-Time', 'Contract', 'Intern', 'Probation'].includes(employmentTypeStr)) {
            empType = employmentTypeStr as EmploymentType;
          }

          let status: EmploymentStatus = 'Active';
          if (['Active', 'On Leave', 'Probation', 'Notice Period', 'Exited'].includes(statusStr)) {
            status = statusStr as EmploymentStatus;
          }

          const mappedEmployee: Partial<Employee> = {
            fullName,
            email,
            phone: phone || '+91 98200 00000',
            designation,
            department,
            branch,
            doj,
            employmentType: empType,
            status,
            managerName,
            basicSalary,
            grossSalary,
            ctc: grossSalary * 12 * 1.2,
            panNumber,
            aadhaarNumber
          };

          records.push({
            rowIndex: idx + 1,
            rawData: row,
            mappedEmployee,
            isValid: errors.length === 0,
            errors
          });
        });

        setParsedRecords(records);
        setIsParsing(false);
      },
      error: (error) => {
        alert(`Failed to parse CSV file: ${error.message}`);
        setIsParsing(false);
      }
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processCSVFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === 'text/csv' || droppedFile.name.endsWith('.csv')) {
        processCSVFile(droppedFile);
      } else {
        alert('Please upload a valid .csv file');
      }
    }
  };

  const handleReset = () => {
    setFile(null);
    setParsedRecords([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Submit Import
  const handleConfirmImport = () => {
    const validRecords = parsedRecords.filter((r) => r.isValid);

    if (validRecords.length === 0) {
      alert('No valid employee records to import');
      return;
    }

    const newEmployees: Employee[] = validRecords.map((r, i) => {
      const empData = r.mappedEmployee;
      const generatedId = `EMP-${Math.floor(10000 + Math.random() * 90000)}`;

      return {
        id: generatedId,
        fullName: empData.fullName || 'Unknown Name',
        avatarUrl: `https://images.unsplash.com/photo-${1530000000000 + (i * 12345) % 1000000}?w=150&auto=format&fit=crop&q=80`,
        designation: empData.designation || 'Associate',
        department: empData.department || 'General',
        branch: empData.branch || 'Mumbai Headquarters',
        email: empData.email || `employee${i}@company.com`,
        phone: empData.phone || '+91 98200 00000',
        doj: empData.doj || new Date().toISOString().split('T')[0],
        status: empData.status || 'Active',
        employmentType: empData.employmentType || 'Full-Time',
        managerName: empData.managerName || 'Vikramaditya Rao',
        costCenter: `${(empData.department || 'GEN').slice(0, 3).toUpperCase()}-MUM-01`,
        panNumber: empData.panNumber || 'ABCDE1234F',
        aadhaarNumber: empData.aadhaarNumber || '1234-5678-9012',
        uanNumber: `1009${Math.floor(10000000 + Math.random() * 90000000)}`,
        esicNumber: `3100${Math.floor(10000000 + Math.random() * 90000000)}`,
        bankAccount: `100${Math.floor(10000007 + Math.random() * 90000000)}`,
        bankIfsc: 'HDFC0000123',
        bankName: 'HDFC Bank',
        basicSalary: empData.basicSalary || 35000,
        grossSalary: empData.grossSalary || 75000,
        ctc: empData.ctc || 900000,
        noticePeriodDays: 60,
        leaveBalance: { casual: 7, sick: 7, privilege: 15, compOff: 0 },
        attendanceSummaryMtd: { present: 1, absent: 0, halfDay: 0, lateComing: 0, otHours: 0 }
      };
    });

    onBulkImport(newEmployees);
    onClose();
  };

  const validCount = parsedRecords.filter((r) => r.isValid).length;
  const invalidCount = parsedRecords.filter((r) => !r.isValid).length;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] sm:max-h-[88vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="pr-2">
            <h3 className="text-sm sm:text-base font-bold flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400 shrink-0" />
              Bulk Import Employees (CSV)
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-300 mt-0.5">
              Upload a formatted CSV file to bulk-create Employee DocType records with validation
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 text-xs">
          {/* Top Bar with Template Download */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-indigo-50/60 border border-indigo-100 rounded-xl p-3.5">
            <div className="flex items-center gap-2.5">
              <Download className="w-4 h-4 text-indigo-600 shrink-0" />
              <div>
                <span className="font-bold text-slate-900 text-xs block">Need the standard CSV format?</span>
                <span className="text-[11px] text-slate-600 block">
                  Download our pre-formatted employee import template with column headers
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="px-3.5 py-1.5 bg-white hover:bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              Download Template (.csv)
            </button>
          </div>

          {/* Upload Area */}
          {!file ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
                isDragging
                  ? 'border-indigo-500 bg-indigo-50/50 scale-[0.99]'
                  : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <span className="font-bold text-slate-800 text-sm block">
                  Click to browse or drag & drop your employee CSV file here
                </span>
                <span className="text-slate-500 text-xs block mt-1">
                  Supports .csv files with headers like Full Name, Email, Designation, Department, Salary
                </span>
              </div>
            </div>
          ) : (
            /* File Loaded & Parsed Review Section */
            <div className="space-y-4">
              {/* File Info Header */}
              <div className="flex items-center justify-between bg-slate-100 p-3 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2.5">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                  <div>
                    <span className="font-bold text-slate-900 block text-xs">{file.name}</span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {(file.size / 1024).toFixed(1)} KB • {parsedRecords.length} records parsed
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-2.5 py-1 text-slate-600 hover:text-slate-900 border border-slate-300 hover:bg-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Change File
                </button>
              </div>

              {/* Validation Summary Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3">
                  <UserCheck className="w-5 h-5 text-indigo-600 shrink-0" />
                  <div>
                    <span className="text-[10px] font-semibold text-slate-500 uppercase block">Total Records</span>
                    <span className="text-base font-bold text-slate-900">{parsedRecords.length}</span>
                  </div>
                </div>

                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <span className="text-[10px] font-semibold text-emerald-700 uppercase block">Ready to Import</span>
                    <span className="text-base font-bold text-emerald-900">{validCount}</span>
                  </div>
                </div>

                <div className={`p-3 rounded-xl border flex items-center gap-3 ${invalidCount > 0 ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200'}`}>
                  <AlertTriangle className={`w-5 h-5 shrink-0 ${invalidCount > 0 ? 'text-amber-600' : 'text-slate-400'}`} />
                  <div>
                    <span className={`text-[10px] font-semibold uppercase block ${invalidCount > 0 ? 'text-amber-700' : 'text-slate-500'}`}>
                      Invalid / Errors
                    </span>
                    <span className={`text-base font-bold ${invalidCount > 0 ? 'text-amber-900' : 'text-slate-800'}`}>
                      {invalidCount}
                    </span>
                  </div>
                </div>
              </div>

              {/* Data Preview Table */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <span className="font-bold text-slate-800 text-xs">Parsed Records Validation Preview</span>
                  {invalidCount > 0 && (
                    <label className="flex items-center gap-2 text-xs text-slate-700 font-medium cursor-pointer">
                      <input
                        type="checkbox"
                        checked={skipInvalid}
                        onChange={(e) => setSkipInvalid(e.target.checked)}
                        className="rounded-xs border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      Skip invalid records during import
                    </label>
                  )}
                </div>

                <div className="overflow-x-auto max-h-60">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-600 font-semibold sticky top-0 border-b border-slate-200">
                      <tr>
                        <th className="p-2.5 pl-4 w-12">Row</th>
                        <th className="p-2.5">Status</th>
                        <th className="p-2.5">Employee Name</th>
                        <th className="p-2.5">Email</th>
                        <th className="p-2.5">Designation & Dept</th>
                        <th className="p-2.5">Branch</th>
                        <th className="p-2.5">Gross Salary</th>
                        <th className="p-2.5 pr-4">Validation Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {parsedRecords.map((r) => (
                        <tr key={r.rowIndex} className={r.isValid ? 'hover:bg-slate-50/80' : 'bg-amber-50/40 hover:bg-amber-50/80'}>
                          <td className="p-2.5 pl-4 font-mono text-slate-400 font-semibold">{r.rowIndex}</td>
                          <td className="p-2.5">
                            {r.isValid ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                                <CheckCircle2 className="w-3 h-3" /> Valid
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
                                <AlertCircle className="w-3 h-3" /> Invalid
                              </span>
                            )}
                          </td>
                          <td className="p-2.5 font-bold text-slate-900">
                            {r.mappedEmployee.fullName || <span className="text-rose-500 italic">Missing</span>}
                          </td>
                          <td className="p-2.5 font-mono text-slate-700">
                            {r.mappedEmployee.email || <span className="text-rose-500 italic">Missing</span>}
                          </td>
                          <td className="p-2.5 text-slate-700">
                            <span className="font-medium block">{r.mappedEmployee.designation}</span>
                            <span className="text-[10px] text-slate-500 block">{r.mappedEmployee.department}</span>
                          </td>
                          <td className="p-2.5 text-slate-600">{r.mappedEmployee.branch}</td>
                          <td className="p-2.5 font-mono font-semibold text-slate-900">
                            ₹{(r.mappedEmployee.grossSalary || 0).toLocaleString('en-IN')}
                          </td>
                          <td className="p-2.5 pr-4">
                            {r.isValid ? (
                              <span className="text-[11px] text-emerald-600 font-medium">Ready for import</span>
                            ) : (
                              <div className="text-[11px] text-rose-600 font-semibold space-y-0.5">
                                {r.errors.map((err, idx) => (
                                  <div key={idx}>• {err}</div>
                                ))}
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          {file && parsedRecords.length > 0 && (
            <button
              type="button"
              onClick={handleConfirmImport}
              disabled={validCount === 0}
              className={`px-5 py-2.5 rounded-xl font-semibold text-white shadow-xs flex items-center gap-2 cursor-pointer transition-all ${
                validCount > 0
                  ? 'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800'
                  : 'bg-slate-300 text-slate-500 cursor-not-allowed'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              Import {validCount} Employee{validCount !== 1 ? 's' : ''} Record{validCount !== 1 ? 's' : ''}
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
