import React, { useState } from 'react';
import { GitFork, ArrowRight, CheckCircle2, ShieldCheck, Database, Layers } from 'lucide-react';
import { frappeDoctypeMappings } from '../../data/mockData';
import { NavigationSection } from '../../types';

interface WorkflowJourneyProps {
  onSelectSection: (section: NavigationSection) => void;
}

export const WorkflowJourney: React.FC<WorkflowJourneyProps> = ({ onSelectSection }) => {
  const [activeStage, setActiveStage] = useState<number>(0);

  const journeySteps = [
    {
      stage: 1,
      title: 'Company Setup',
      desc: 'Corporate CIN, PAN, TAN, EPFO Est Code & Headquarters',
      section: 'masters' as NavigationSection,
      doctypes: 'Company, Branch',
      icon: '🏢'
    },
    {
      stage: 2,
      title: 'Organization Setup',
      desc: 'Branches (Mumbai, BLR, Delhi), Departments & Designations',
      section: 'masters' as NavigationSection,
      doctypes: 'Department, Designation, Cost Center',
      icon: '🏛️'
    },
    {
      stage: 3,
      title: 'Policy Setup',
      desc: 'Shift timings, Sandwich leave rules, OT rates, PT slabs & TDS regime',
      section: 'masters' as NavigationSection,
      doctypes: 'Shift Type, Leave Policy, Salary Component',
      icon: '📜'
    },
    {
      stage: 4,
      title: 'Employee Master',
      desc: '1-Page profile, Personal PAN/Aadhaar, Salary structure & Bank details',
      section: 'employees' as NavigationSection,
      doctypes: 'Employee, Bank Account',
      icon: '👤'
    },
    {
      stage: 5,
      title: 'Employee Onboarding',
      desc: 'Offer letter generation, Document vault upload & Asset allocation',
      section: 'employees' as NavigationSection,
      doctypes: 'Employee Onboarding',
      icon: '🚀'
    },
    {
      stage: 6,
      title: 'Attendance',
      desc: 'Excel-like 31-day bulk grid, Biometric sync & Missing punch resolver',
      section: 'attendance' as NavigationSection,
      doctypes: 'Attendance, Shift Assignment',
      icon: '📅'
    },
    {
      stage: 7,
      title: 'Leave & Holidays',
      desc: 'Inbox approvals, CL/SL/PL balance ledger & Sandwich rule check',
      section: 'leave' as NavigationSection,
      doctypes: 'Leave Application, Leave Ledger Entry',
      icon: '🏖️'
    },
    {
      stage: 8,
      title: 'Payroll Wizard',
      desc: '7-step guided wizard: OT, Loans, PF, ESIC, PT, TDS & Multi-tier approval',
      section: 'payroll' as NavigationSection,
      doctypes: 'Payroll Entry, Salary Slip',
      icon: '💰'
    },
    {
      stage: 9,
      title: 'Compliance (IN)',
      desc: 'EPFO PF ECR text file export, ESIC return, PT return & Form 24Q TDS',
      section: 'compliance' as NavigationSection,
      doctypes: 'PF Category, ESIC Category, Statutory Tax Slab',
      icon: '⚖️'
    },
    {
      stage: 10,
      title: 'Reports & Analytics',
      desc: 'Headcount growth, Attendance compliance & Payroll cost charts',
      section: 'reports' as NavigationSection,
      doctypes: 'Frappe Custom Reports & Analytics Dashboard',
      icon: '📊'
    },
    {
      stage: 11,
      title: 'Performance & KRA',
      desc: 'Annual KRA goals, Appraisal ratings (4.8/5.0) & Manager feedback',
      section: 'employees' as NavigationSection,
      doctypes: 'Appraisal, KRA Goal',
      icon: '🏆'
    },
    {
      stage: 12,
      title: 'Exit & Full & Final (F&F)',
      desc: 'Resignation approval, Asset recovery, Leave encashment & F&F settlement',
      section: 'employees' as NavigationSection,
      doctypes: 'Employee Separation, Full and Final Settlement',
      icon: '🏁'
    },
  ];

  const current = journeySteps[activeStage];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Workflow-First User Journey Map</h2>
            <span className="text-xs bg-indigo-100 text-indigo-800 font-bold px-2.5 py-0.5 rounded-full border border-indigo-200">
              Complete End-to-End HR Lifecycle
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Reorganized from module-first to workflow-first. Click any stage to jump into that operational view.
          </p>
        </div>

        <button
          onClick={() => onSelectSection(current.section)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-xs"
        >
          Jump to Stage {current.stage}: {current.title} →
        </button>
      </div>

      {/* Visual Journey Grid Steps */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {journeySteps.map((step, idx) => {
          const isActive = idx === activeStage;
          return (
            <div
              key={step.stage}
              onClick={() => setActiveStage(idx)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-2 relative ${
                isActive
                  ? 'bg-indigo-600 text-white border-indigo-700 shadow-md ring-2 ring-indigo-200 scale-105'
                  : 'bg-white text-slate-800 border-slate-200/80 hover:border-indigo-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-base">{step.icon}</span>
                <span
                  className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-xs ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  Step {step.stage}
                </span>
              </div>

              <div>
                <h4 className="text-xs font-bold tracking-tight">{step.title}</h4>
                <p className={`text-[10px] mt-0.5 line-clamp-2 ${isActive ? 'text-indigo-100' : 'text-slate-500'}`}>
                  {step.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Stage Detail Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{current.icon}</span>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Stage {current.stage}: {current.title}
              </h3>
              <p className="text-xs text-slate-500">{current.desc}</p>
            </div>
          </div>

          <button
            onClick={() => onSelectSection(current.section)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs"
          >
            Launch Section View →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <div className="space-y-2 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <Database className="w-4 h-4 text-indigo-600" /> Frappe / ERPNext DocType Mapping
            </div>
            <div className="font-mono text-indigo-700 font-bold bg-white p-2 rounded-lg border border-slate-200">
              {current.doctypes}
            </div>
            <p className="text-slate-600">
              All data read and written in this workflow stage seamlessly maps to standard Frappe framework DocTypes without requiring backend database schema migrations.
            </p>
          </div>

          <div className="space-y-2 p-4 bg-emerald-50/60 rounded-xl border border-emerald-100">
            <div className="font-bold text-emerald-950 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> UX Architecture Outcome
            </div>
            <p className="text-emerald-900">
              Reduces menu clicks from 8 down to 1. Contextual actions and pre-populated form fields maximize HR operational throughput.
            </p>
          </div>
        </div>
      </div>

      {/* Frappe DocType Mapping Matrix Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2">
          Complete ERPNext / Frappe Doctype Mapping Matrix
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3">Redesign Section</th>
                <th className="p-3">Frappe DocType(s)</th>
                <th className="p-3">Backend Role</th>
                <th className="p-3">UX Architecture Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {frappeDoctypeMappings.map((map, i) => (
                <tr key={i} className="hover:bg-slate-50">
                  <td className="p-3 font-bold text-slate-900">{map.redesignSection}</td>
                  <td className="p-3 font-mono text-indigo-700 font-bold">{map.frappeDoctype}</td>
                  <td className="p-3 text-slate-600">{map.backendRole}</td>
                  <td className="p-3 text-slate-500">{map.uxImprovementNote}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
