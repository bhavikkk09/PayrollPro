import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Search,
  Filter,
  Download,
  Upload,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  FileText
} from 'lucide-react';
import { sampleAttendanceGrid, sampleEmployees } from '../../data/mockData';
import { api } from '../../services/api';

export const AttendanceGrid: React.FC = () => {
  const [gridData, setGridData] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [selectedDayCell, setSelectedDayCell] = useState<{ empId: string; day: number; currentStatus: string } | null>(null);
  const [isBioModalOpen, setIsBioModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importCsvText, setImportCsvText] = useState('');
  const [weekoffRule, setWeekoffRule] = useState<string>('Sunday');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1);

  React.useEffect(() => {
    async function loadAttendance() {
      const employees = await api.getEmployees();
      if (Array.isArray(employees)) {
        if (employees.length === 0) {
          setGridData([]);
        } else {
          const rows = employees.map((emp) => {
            const defaultDays: Record<number, string> = {};
            daysInMonth.forEach((d) => {
              const isSun = d % 7 === 5;
              defaultDays[d] = isSun ? 'WO' : 'P';
            });
            return {
              employeeId: emp.id,
              employeeName: emp.fullName,
              department: emp.department,
              days: defaultDays,
              totalPresent: emp.attendanceSummaryMtd?.present || 26,
              totalAbsent: emp.attendanceSummaryMtd?.absent || 0,
              totalLate: emp.attendanceSummaryMtd?.lateComing || 0
            };
          });
          setGridData(rows);
        }
      }
    }
    loadAttendance();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleApplyWeekoff = () => {
    setGridData(prev => prev.map(row => {
      const updatedDays = { ...row.days };
      daysInMonth.forEach(day => {
        const isSunday = (day % 7 === 5);
        const isSaturday = (day % 7 === 4);

        if (weekoffRule === 'Sunday' && isSunday) {
          updatedDays[day] = 'WO';
        } else if (weekoffRule === 'Saturday & Sunday' && (isSunday || isSaturday)) {
          updatedDays[day] = 'WO';
        } else if (weekoffRule === '2nd & 4th Saturday + Sunday' && (isSunday || day === 11 || day === 25)) {
          updatedDays[day] = 'WO';
        } else if (weekoffRule === 'Friday' && (day % 7 === 3)) {
          updatedDays[day] = 'WO';
        }
      });
      return { ...row, days: updatedDays };
    }));
    showToast(`Applied '${weekoffRule}' weekly off rule across monthly attendance roster!`);
  };

  const handleCellClick = (empId: string, day: number, currentStatus: string) => {
    setSelectedDayCell({ empId, day, currentStatus });
  };

  const handleStatusChange = async (newStatus: string, otHours: number = 0) => {
    if (!selectedDayCell) return;

    const { empId, day } = selectedDayCell;

    setGridData(prev => prev.map(row => {
      if (row.employeeId === empId) {
        return {
          ...row,
          days: {
            ...row.days,
            [day]: newStatus
          }
        };
      }
      return row;
    }));

    await api.updateAttendanceCell({
      employeeId: empId,
      day: String(day),
      status: newStatus,
      otHours
    });

    showToast(`Day ${day} status updated to '${newStatus}' for ${empId}`);
    setSelectedDayCell(null);
  };

  const handleSimulateBiometricSync = async () => {
    await api.importBiometrics();
    showToast("Successfully synchronized 138 attendance logs from Matrix Biometric hardware!");
    setIsBioModalOpen(false);
  };

  // Download Monthly Template CSV
  const handleDownloadTemplate = () => {
    let csv = `Employee ID,Employee Name,${daysInMonth.map(d => `Day ${d}`).join(',')}\n`;
    sampleEmployees.forEach(emp => {
      const defaultDays = daysInMonth.map(() => 'P').join(',');
      csv += `"${emp.id}","${emp.fullName}",${defaultDays}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Monthly_Attendance_Template_July2026.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Downloaded Monthly Attendance Template CSV!");
  };

  // Handle File Upload or Raw CSV Text Import
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) {
          setImportCsvText(text);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleProcessMonthlyImport = async () => {
    if (!importCsvText.trim()) {
      alert("Please upload a CSV file or paste monthly attendance CSV content.");
      return;
    }

    const lines = importCsvText.trim().split('\n');
    if (lines.length < 2) {
      alert("CSV file must contain a header line and at least 1 employee row.");
      return;
    }

    const recordsForApi: Array<{ employeeId: string; dayStatuses: Record<string, string> }> = [];
    let updatedCount = 0;

    // Parse CSV lines
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const cols = line.split(',').map(c => c.replace(/^"|"$/g, '').trim());
      if (cols.length >= 2) {
        const empId = cols[0];
        const dayStatuses: Record<string, string> = {};

        daysInMonth.forEach((day, idx) => {
          const colVal = cols[2 + idx];
          if (colVal && ['P', 'A', 'L', 'HD', 'WO', 'HO'].includes(colVal.toUpperCase())) {
            dayStatuses[String(day)] = colVal.toUpperCase();
          } else {
            dayStatuses[String(day)] = 'P';
          }
        });

        recordsForApi.push({ employeeId: empId, dayStatuses });

        // Update local grid data
        setGridData(prev => prev.map(row => {
          if (row.employeeId === empId) {
            updatedCount++;
            return {
              ...row,
              days: {
                ...row.days,
                ...dayStatuses
              }
            };
          }
          return row;
        }));
      }
    }

    await api.importMonthlyAttendanceCSV(recordsForApi);

    setIsImportModalOpen(false);
    setImportCsvText('');
    showToast(`Bulk monthly attendance imported successfully for ${updatedCount || recordsForApi.length} employees!`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'P':
        return <span className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-[11px] shadow-2xs">P</span>;
      case 'A':
        return <span className="w-6 h-6 rounded-md bg-rose-100 text-rose-800 font-bold flex items-center justify-center text-[11px] shadow-2xs">A</span>;
      case 'L':
        return <span className="w-6 h-6 rounded-md bg-amber-100 text-amber-800 font-bold flex items-center justify-center text-[11px] shadow-2xs">L</span>;
      case 'HD':
        return <span className="w-6 h-6 rounded-md bg-orange-100 text-orange-800 font-bold flex items-center justify-center text-[10px] shadow-2xs">HD</span>;
      case 'WO':
        return <span className="w-6 h-6 rounded-md bg-slate-100 text-slate-500 font-bold flex items-center justify-center text-[10px]">WO</span>;
      case 'HO':
        return <span className="w-6 h-6 rounded-md bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-[10px]">HO</span>;
      default:
        return <span className="w-6 h-6 rounded-md bg-slate-50 text-slate-400 font-medium flex items-center justify-center text-[10px]">-</span>;
    }
  };

  const filteredGridData = gridData.filter(row => {
    const matchesSearch = row.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          row.employeeId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = departmentFilter === 'All' || row.department === departmentFilter;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-indigo-600" />
            Monthly Attendance Grid & Shift Roster
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            31-Day Attendance Roster for <span className="font-bold text-slate-800">July 2026</span> • Real-time Biometric & Bulk CSV Import
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadTemplate}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs shadow-xs cursor-pointer transition-all border border-slate-200"
            title="Download Monthly Attendance CSV Template"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            Download Template (.csv)
          </button>

          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs shadow-xs cursor-pointer transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Bulk Import Month
          </button>

          <button
            onClick={() => setIsBioModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs shadow-xs cursor-pointer transition-all"
          >
            <Upload className="w-4 h-4" />
            Sync Biometrics
          </button>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search employee name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-hidden w-64"
            />
          </div>

          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-semibold focus:ring-2 focus:ring-indigo-500 outline-hidden"
          >
            <option value="All">All Departments</option>
            <option value="Engineering">Engineering</option>
            <option value="Product & Design">Product & Design</option>
            <option value="Human Resources">Human Resources</option>
            <option value="Finance & Accounts">Finance & Accounts</option>
          </select>

          {/* Weekoff Selector & Applicator */}
          <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-500 pl-2">Weekoff:</span>
            <select
              value={weekoffRule}
              onChange={(e) => setWeekoffRule(e.target.value)}
              className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-indigo-900 focus:ring-2 focus:ring-indigo-500 outline-hidden"
            >
              <option value="Sunday">Sunday (Standard)</option>
              <option value="Saturday & Sunday">Saturday & Sunday (5-Day)</option>
              <option value="2nd & 4th Saturday + Sunday">2nd & 4th Sat + Sunday</option>
              <option value="Friday">Friday (Gulf Shift)</option>
            </select>
            <button
              onClick={handleApplyWeekoff}
              className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold cursor-pointer transition-all shadow-2xs"
            >
              Set Weekoff
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs overflow-x-auto">
          <span className="font-semibold text-slate-400 text-[11px]">Legend:</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Present (P)</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Absent (A)</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Late (L)</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span> Half Day (HD)</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span> Off (WO)</span>
        </div>
      </div>

      {/* Grid Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[1200px]">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 text-[11px] sticky top-0 z-10">
              <tr>
                <th className="p-3 sticky left-0 bg-slate-50 z-20 min-w-[180px] shadow-xs">Employee Details</th>
                {daysInMonth.map(day => (
                  <th key={day} className="p-2 text-center min-w-[36px] font-mono border-l border-slate-200/60">
                    {day}
                  </th>
                ))}
                <th className="p-3 text-center min-w-[60px] bg-emerald-50 text-emerald-800 font-bold border-l border-slate-200">P</th>
                <th className="p-3 text-center min-w-[60px] bg-rose-50 text-rose-800 font-bold">A</th>
                <th className="p-3 text-center min-w-[60px] bg-amber-50 text-amber-800 font-bold">L</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredGridData.length === 0 ? (
                <tr>
                  <td colSpan={35} className="py-12 text-center text-slate-500 bg-slate-50/50">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <FileSpreadsheet className="w-8 h-8 text-slate-400" />
                      <span className="font-semibold text-sm text-slate-700">No Attendance Records Found</span>
                      <span className="text-xs text-slate-400">This tenant has 0 employees. Add employees in Directory to populate the monthly attendance roster.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredGridData.map((row) => (
                <tr key={row.employeeId} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3 sticky left-0 bg-white hover:bg-slate-50 z-10 shadow-xs border-r border-slate-200/80">
                    <div className="font-bold text-slate-900 leading-tight">{row.employeeName}</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">{row.employeeId} • {row.department}</div>
                  </td>

                  {daysInMonth.map(day => {
                    const status = row.days[day] || '-';
                    return (
                      <td
                        key={day}
                        onClick={() => handleCellClick(row.employeeId, day, status)}
                        className="p-1 text-center border-l border-slate-100 cursor-pointer hover:bg-indigo-50/50 transition-colors"
                        title={`Click to edit Day ${day} for ${row.employeeName}`}
                      >
                        <div className="flex justify-center">
                          {getStatusBadge(status)}
                        </div>
                      </td>
                    );
                  })}

                  <td className="p-3 text-center font-bold text-emerald-700 bg-emerald-50/40 border-l border-slate-200">
                    {row.totalPresent}
                  </td>
                  <td className="p-3 text-center font-bold text-rose-700 bg-rose-50/40">
                    {row.totalAbsent}
                  </td>
                  <td className="p-3 text-center font-bold text-amber-700 bg-amber-50/40">
                    {row.totalLate}
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>

      {/* BULK MONTHLY ATTENDANCE CSV IMPORT MODAL */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                  Bulk Monthly Attendance CSV Import
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Upload CSV or paste attendance matrix for 31 days (P, A, L, HD, WO, HO)
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                <div>
                  <span className="font-bold text-emerald-900 block">Need the standard CSV format?</span>
                  <p className="text-emerald-700 text-[11px]">Download sample template populated with active employees.</p>
                </div>
                <button
                  onClick={handleDownloadTemplate}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> Template
                </button>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select CSV File from Computer</label>
                <input
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleFileUpload}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 cursor-pointer"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Or Paste CSV Content Directly</label>
                <textarea
                  rows={6}
                  value={importCsvText}
                  onChange={(e) => setImportCsvText(e.target.value)}
                  placeholder={`Employee ID,Employee Name,Day 1,Day 2,...,Day 31\nEMP-00101,Rahul Sharma,P,P,P,A,P,P,P,...`}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px] focus:ring-2 focus:ring-emerald-500 outline-hidden"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleProcessMonthlyImport}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-yellow-300" />
                  Parse & Import Monthly Roster
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BIOMETRIC LOG IMPORT MODAL */}
      {isBioModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold flex items-center gap-2">
                  <Upload className="w-5 h-5 text-indigo-400" />
                  Import Biometric Hardware Punch Logs
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Supports ZKTeco, Matrix, Essl & eTimeTrack CSV / DAT logs
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsBioModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl space-y-1">
                <span className="font-bold text-indigo-900 block">Biometric Devices Detected:</span>
                <p className="text-slate-600">
                  • Mumbai HQ Gate 01 (192.168.1.105) - Online
                  <br />
                  • Bengaluru Hub Main Entrance (192.168.2.210) - Online
                </p>
              </div>

              <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center space-y-2 hover:bg-slate-50 cursor-pointer">
                <Upload className="w-8 h-8 text-indigo-600 mx-auto" />
                <div className="font-bold text-slate-800">Drop Biometric Punch DAT / CSV File Here</div>
                <p className="text-slate-400 text-[11px]">Automatically parses Employee Card No, Timestamp & Gate Direction</p>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsBioModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSimulateBiometricSync}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-yellow-300" />
                  Sync & Resolve Missing Punches
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SINGLE CELL STATUS EDIT MODAL */}
      {selectedDayCell && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-xs w-full shadow-2xl border border-slate-200 p-5 space-y-4 text-xs">
            <h4 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              Edit Attendance: Day {selectedDayCell.day}
            </h4>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleStatusChange('P')}
                className="p-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-xl border border-emerald-200 flex items-center justify-center gap-1 cursor-pointer"
              >
                Present (P)
              </button>
              <button
                onClick={() => handleStatusChange('A')}
                className="p-2.5 bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold rounded-xl border border-rose-200 flex items-center justify-center gap-1 cursor-pointer"
              >
                Absent (A)
              </button>
              <button
                onClick={() => handleStatusChange('L')}
                className="p-2.5 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold rounded-xl border border-amber-200 flex items-center justify-center gap-1 cursor-pointer"
              >
                Late (L)
              </button>
              <button
                onClick={() => handleStatusChange('HD')}
                className="p-2.5 bg-orange-50 hover:bg-orange-100 text-orange-800 font-bold rounded-xl border border-orange-200 flex items-center justify-center gap-1 cursor-pointer"
              >
                Half Day (HD)
              </button>
              <button
                onClick={() => handleStatusChange('WO')}
                className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold rounded-xl border border-slate-200 flex items-center justify-center gap-1 cursor-pointer"
              >
                Weekly Off (WO)
              </button>
              <button
                onClick={() => handleStatusChange('HO')}
                className="p-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 font-bold rounded-xl border border-indigo-200 flex items-center justify-center gap-1 cursor-pointer"
              >
                Holiday (HO)
              </button>
            </div>

            <button
              onClick={() => setSelectedDayCell(null)}
              className="w-full py-1.5 text-center text-slate-500 hover:text-slate-700 font-medium cursor-pointer"
            >
              Cancel
            </button>
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
