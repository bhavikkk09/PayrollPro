import React, { useState } from 'react';
import { Settings, Shield, Bell, User, Key, Save, CheckCircle2, ShieldCheck } from 'lucide-react';
import { AuditLogViewer } from './AuditLogViewer';

export const SettingsView: React.FC = () => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'settings' | 'audit'>('settings');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Frappe HRMS backend configuration settings saved successfully!');
  };

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto text-xs font-sans relative">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-indigo-500/40 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-medium">{toastMessage}</span>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">System Settings & Governance</h2>
          <p className="text-xs text-slate-500 mt-1">
            Configure system permissions, API integrations, and inspect immutable audit logs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'settings' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
            }`}
          >
            System Settings
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'audit' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Audit Logs
          </button>
        </div>
      </div>

      {activeTab === 'audit' ? (
        <AuditLogViewer />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6">
          <form onSubmit={handleSaveSettings} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2">
                Frappe Framework Backend API Credentials
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Frappe API Key</label>
                  <input
                    type="password"
                    defaultValue="b47a92c109283f1d"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono outline-hidden focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Frappe API Secret</label>
                  <input
                    type="password"
                    defaultValue="••••••••••••••••"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2">
                Security & Role Permissions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="font-bold text-slate-900">HR Manager</div>
                  <p className="text-slate-500 text-[11px]">Full access to Employee Master, Payroll Wizard, Compliance & Attendance Lock.</p>
                  <span className="inline-block px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[10px]">Active</span>
                </div>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="font-bold text-slate-900">Payroll Admin</div>
                  <p className="text-slate-500 text-[11px]">Access to Statutory Payroll calculation, Bank file generation & Compliance filing.</p>
                  <span className="inline-block px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[10px]">Active</span>
                </div>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="font-bold text-slate-900">Employee Self Service</div>
                  <p className="text-slate-500 text-[11px]">Read-only access to personal payslips, leave applications & attendance logs.</p>
                  <span className="inline-block px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[10px]">Active</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs shadow-xs cursor-pointer"
              >
                <Save className="w-4 h-4" /> Save System Settings
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
