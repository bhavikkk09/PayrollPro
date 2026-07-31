import React, { useState, useEffect } from 'react';
import { CalendarDays, CheckCircle2, XCircle, Plus, Info, ShieldCheck, Clock } from 'lucide-react';
import { sampleLeaveRequests, sampleEmployees } from '../../data/mockData';
import { LeaveRequest } from '../../types';
import { api } from '../../services/api';

export const LeaveManagement: React.FC = () => {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [activeTab, setActiveTab] = useState<'requests' | 'ledger' | 'policy' | 'holidays'>('requests');
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [leaveForm, setLeaveForm] = useState({
    employeeId: 'EMP-00101',
    leaveType: 'Casual Leave (CL)' as any,
    fromDate: new Date().toISOString().split('T')[0],
    toDate: new Date().toISOString().split('T')[0],
    reason: ''
  });

  useEffect(() => {
    async function loadRequests() {
      const data = await api.getLeaveRequests();
      if (Array.isArray(data)) {
        setRequests(data);
      }
    }
    loadRequests();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleApprove = async (id: string) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'Approved' } : r))
    );
    await api.updateLeaveStatus(id, 'Approved');
    showToast('Leave request approved & employee leave balance updated!');
  };

  const handleReject = async (id: string) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'Rejected' } : r))
    );
    await api.updateLeaveStatus(id, 'Rejected');
    showToast('Leave request rejected.');
  };

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveForm.reason.trim()) {
      alert('Please enter a reason for the leave application');
      return;
    }

    const emp = sampleEmployees.find((e) => e.id === leaveForm.employeeId) || sampleEmployees[0];
    const from = new Date(leaveForm.fromDate);
    const to = new Date(leaveForm.toDate);
    const diffTime = Math.abs(to.getTime() - from.getTime());
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const newReq: LeaveRequest = {
      id: `LV-2026-0${Math.floor(100 + Math.random() * 900)}`,
      employeeId: emp.id,
      employeeName: emp.fullName,
      leaveType: leaveForm.leaveType,
      fromDate: leaveForm.fromDate,
      toDate: leaveForm.toDate,
      totalDays,
      reason: leaveForm.reason,
      status: 'Pending HR Approval',
      appliedOn: new Date().toISOString().split('T')[0]
    };

    setRequests((prev) => [newReq, ...prev]);
    setIsApplyModalOpen(false);

    // Call REST API
    await api.createLeaveRequest(newReq);

    setLeaveForm({
      employeeId: sampleEmployees[0]?.id || 'EMP-00101',
      leaveType: 'Casual Leave (CL)',
      fromDate: new Date().toISOString().split('T')[0],
      toDate: new Date().toISOString().split('T')[0],
      reason: ''
    });
    showToast(`Leave application submitted for ${emp.fullName} (${totalDays} day${totalDays > 1 ? 's' : ''})!`);
  };

  const holidays = [
    { date: "2026-01-26", day: "Monday", name: "Republic Day", type: "National Holiday" },
    { date: "2026-03-25", day: "Wednesday", name: "Holi", type: "Gazetted Holiday" },
    { date: "2026-08-15", day: "Saturday", name: "Independence Day", type: "National Holiday" },
    { date: "2026-10-02", day: "Friday", name: "Gandhi Jayanti", type: "National Holiday" },
    { date: "2026-11-08", day: "Sunday", name: "Diwali Laxmi Pujan", type: "Festival Holiday" },
    { date: "2026-12-25", day: "Friday", name: "Christmas Day", type: "Gazetted Holiday" },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Leave & Holiday Management</h2>
          <p className="text-xs text-slate-500 mt-1">
            Approvals, leave balance ledgers, sandwich policy rules & holiday lists
          </p>
        </div>

        <button
          onClick={() => setIsApplyModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Apply Leave
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-1.5 shadow-xs flex items-center gap-2">
        <button
          onClick={() => setActiveTab('requests')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'requests' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Leave Applications Inbox ({requests.filter((r) => r.status.includes('Pending')).length})
        </button>
        <button
          onClick={() => setActiveTab('ledger')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'ledger' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Leave Balance Ledgers
        </button>
        <button
          onClick={() => setActiveTab('policy')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'policy' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Sandwich Policy Rules
        </button>
        <button
          onClick={() => setActiveTab('holidays')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'holidays' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Holiday List 2026
        </button>
      </div>

      {/* Tab 1: Requests Inbox */}
      {activeTab === 'requests' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2">
            Leave Requests Requiring Approval
          </h3>

          <div className="space-y-3">
            {requests.map((req) => (
              <div
                key={req.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{req.employeeName}</span>
                    <span className="text-slate-400 font-mono">({req.employeeId})</span>
                    <span className="px-2 py-0.5 rounded-full font-bold bg-indigo-100 text-indigo-800 text-[10px]">
                      {req.leaveType}
                    </span>
                  </div>

                  <div className="text-slate-600">
                    Duration: <span className="font-semibold text-slate-800">{req.fromDate}</span> to{' '}
                    <span className="font-semibold text-slate-800">{req.toDate}</span> ({req.totalDays} days)
                  </div>

                  <p className="text-slate-500 italic">"Reason: {req.reason}"</p>
                </div>

                <div className="flex items-center gap-3">
                  {req.status.includes('Pending') ? (
                    <>
                      <button
                        onClick={() => handleApprove(req.id)}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(req.id)}
                        className="px-3.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl"
                      >
                        Reject
                      </button>
                    </>
                  ) : (
                    <span
                      className={`font-bold px-3 py-1 rounded-full text-xs ${
                        req.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {req.status}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Balance Ledgers */}
      {activeTab === 'ledger' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2">
            Employee Leave Balances (Annual Entitlement)
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3">Employee</th>
                  <th className="p-3">Casual Leave (CL)</th>
                  <th className="p-3">Sick Leave (SL)</th>
                  <th className="p-3">Privilege Leave (PL)</th>
                  <th className="p-3">Comp Off</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {sampleEmployees.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-900">{e.fullName} ({e.id})</td>
                    <td className="p-3 font-mono text-indigo-700 font-bold">{e.leaveBalance.casual} Days</td>
                    <td className="p-3 font-mono text-indigo-700 font-bold">{e.leaveBalance.sick} Days</td>
                    <td className="p-3 font-mono text-indigo-700 font-bold">{e.leaveBalance.privilege} Days</td>
                    <td className="p-3 font-mono text-indigo-700 font-bold">{e.leaveBalance.compOff} Days</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Policy */}
      {activeTab === 'policy' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4 text-xs">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2">
            Indian Sandwich Leave Policy Configuration
          </h3>

          <div className="p-4 bg-indigo-50/60 rounded-xl border border-indigo-100 space-y-2">
            <div className="font-bold text-indigo-900">What is the Sandwich Rule?</div>
            <p className="text-slate-700">
              If an employee takes leave on both Friday and the following Monday, the intervening weekend (Saturday and Sunday) will be automatically counted as Leave Days.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <span className="font-bold text-slate-800">Sandwich Rule Status:</span>
              <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full text-[10px]">
                ENABLED (ERPNext Frappe Rules)
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Holidays */}
      {activeTab === 'holidays' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4 text-xs">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2">
            Official Holiday Calendar 2026
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {holidays.map((h, i) => (
              <div key={i} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900 text-sm">{h.name}</div>
                  <div className="text-slate-500">{h.date} • {h.day}</div>
                </div>
                <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2.5 py-1 rounded-full">
                  {h.type}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* APPLY LEAVE MODAL */}
      {isApplyModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold flex items-center gap-2">
                  <CalendarDays className="w-5 h-5 text-indigo-400" />
                  Apply Leave Record
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Submits leave application into Frappe HR Leave Request workflow
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsApplyModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleApplySubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Employee *</label>
                <select
                  value={leaveForm.employeeId}
                  onChange={(e) => setLeaveForm({ ...leaveForm, employeeId: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-hidden font-medium text-slate-900"
                >
                  {sampleEmployees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.fullName} ({e.id}) — {e.department}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Leave Type *</label>
                <select
                  value={leaveForm.leaveType}
                  onChange={(e) => setLeaveForm({ ...leaveForm, leaveType: e.target.value as any })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-hidden font-medium text-slate-900"
                >
                  <option value="Casual Leave (CL)">Casual Leave (CL)</option>
                  <option value="Sick Leave (SL)">Sick Leave (SL)</option>
                  <option value="Privilege Leave (PL)">Privilege Leave (PL / Earned)</option>
                  <option value="Comp Off">Compensatory Off (Comp Off)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">From Date *</label>
                  <input
                    type="date"
                    value={leaveForm.fromDate}
                    onChange={(e) => setLeaveForm({ ...leaveForm, fromDate: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-hidden font-medium text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">To Date *</label>
                  <input
                    type="date"
                    value={leaveForm.toDate}
                    onChange={(e) => setLeaveForm({ ...leaveForm, toDate: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-hidden font-medium text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Reason / Description *</label>
                <textarea
                  rows={3}
                  value={leaveForm.reason}
                  onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                  placeholder="e.g. Attending family function in Pune / Medical checkup"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-hidden font-medium text-slate-900"
                ></textarea>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsApplyModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Submit Leave Request
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
