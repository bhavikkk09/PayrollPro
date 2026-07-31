import React from 'react';
import { X, Database, ShieldCheck, Layers, BookOpen, ExternalLink, CheckCircle2 } from 'lucide-react';
import { frappeDoctypeMappings } from '../../data/mockData';

interface FrappeRationaleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FrappeRationaleModal: React.FC<FrappeRationaleModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 text-white rounded-xl">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base tracking-tight">Frappe / ERPNext HRMS UX Architecture Rationale</h3>
              <p className="text-xs text-slate-400">
                Seamless Backend Compatibility & DocType Mapping Specifications
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700 custom-scrollbar">
          {/* Executive Overview */}
          <div className="p-4 bg-indigo-50/60 rounded-xl border border-indigo-100 space-y-2">
            <h4 className="font-bold text-indigo-950 text-sm flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              1. Redesign Philosophy: Workflow-First vs. Module-First
            </h4>
            <p className="leading-relaxed text-slate-700">
              Legacy Frappe HRMS organizes navigation around isolated DocType modules (e.g., clicking into 'Attendance' doclist, then 'Leave Application' doclist, then 'Salary Slip' doclist). This creates excessive menu clutter and high cognitive overhead for Indian HR teams.
            </p>
            <p className="leading-relaxed text-slate-700">
              Our redesign preserves 100% of standard Frappe REST API contracts and underlying DocType business logic, but wraps them in guided operational workflows:
            </p>
            <ul className="list-disc pl-5 space-y-1 font-medium text-slate-800">
              <li><strong>1-Page Employee Master:</strong> Replaces 9 sprawling child tables with a single tabbed profile.</li>
              <li><strong>Excel-Like Monthly Attendance Grid:</strong> Replaces daily individual attendance forms with a 31-day bulk editor.</li>
              <li><strong>7-Step Payroll Wizard:</strong> Replaces manual multi-doc creation with a guided stepper.</li>
              <li><strong>Compliance Hub:</strong> Generates native EPFO ECR text files and Form 24Q TDS summaries.</li>
            </ul>
          </div>

          {/* DocType Mapping Matrix */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-2">
              2. Complete ERPNext DocType Mapping Specifications
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Redesign UI Component</th>
                    <th className="p-3">Target Frappe DocType</th>
                    <th className="p-3">REST API Endpoint</th>
                    <th className="p-3">Key Improvements</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {frappeDoctypeMappings.map((m, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-900">{m.redesignSection}</td>
                      <td className="p-3 font-mono font-bold text-indigo-700">{m.frappeDoctype}</td>
                      <td className="p-3 font-mono text-slate-500 text-[11px]">
                        /api/resource/{m.frappeDoctype.replace(/\s+/g, '')}
                      </td>
                      <td className="p-3 text-slate-600">{m.uxImprovementNote}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Indian Labor Compliance Rules */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              3. Built-in Indian Labor & Statutory Compliance Rules
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-600">
              <div>
                <strong>• Provident Fund (EPFO):</strong> Calculated at 12% of Basic + DA, capped at statutory wage limit of ₹15,000/month unless opted for higher pension.
              </div>
              <div>
                <strong>• Professional Tax (PT):</strong> State-wise slab calculations (Maharashtra, Karnataka, Telangana, Tamil Nadu).
              </div>
              <div>
                <strong>• Income Tax TDS:</strong> Supports both Old Regime (with 80C/80D deductions) and New Regime tax slabs.
              </div>
              <div>
                <strong>• Sandwich Leave Policy:</strong> Automatically counts intervening weekends/holidays when leave is taken on preceding Friday & succeeding Monday.
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-500">Documented for Frappe Framework v15 & ERPNext HRMS</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs"
          >
            Close Rationale Spec
          </button>
        </div>
      </div>
    </div>
  );
};
