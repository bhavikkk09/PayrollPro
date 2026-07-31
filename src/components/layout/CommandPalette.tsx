import React, { useState, useEffect } from 'react';
import { Search, Users, Banknote, CalendarCheck, ShieldCheck, Sparkles, ArrowRight, X } from 'lucide-react';
import { sampleEmployees } from '../../data/mockData';
import { NavigationSection } from '../../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSection: (section: NavigationSection) => void;
  onSelectEmployee: (empId: string) => void;
  onOpenAiAssistant: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectSection,
  onSelectEmployee,
  onOpenAiAssistant
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(); // reset state
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredEmployees = sampleEmployees.filter(
    (e) =>
      e.fullName.toLowerCase().includes(query.toLowerCase()) ||
      e.id.toLowerCase().includes(query.toLowerCase()) ||
      e.department.toLowerCase().includes(query.toLowerCase()) ||
      e.designation.toLowerCase().includes(query.toLowerCase())
  );

  const sectionsList: { id: NavigationSection; title: string; desc: string; icon: any }[] = [
    { id: 'dashboard', title: 'Action Dashboard', desc: 'Real-time HR operational alerts & stats', icon: Search },
    { id: 'employees', title: 'Employee Directory', desc: '1-page employee profile & onboarding', icon: Users },
    { id: 'attendance', title: 'Monthly Attendance Grid', desc: 'Excel-like bulk 31-day check-in editor', icon: CalendarCheck },
    { id: 'payroll', title: 'Guided Payroll Wizard', desc: 'Lock attendance, calculate OT, PF, ESIC & TDS', icon: Banknote },
    { id: 'compliance', title: 'Indian Compliance Hub', desc: 'EPFO ECR generator, ESIC & Form 24Q TDS', icon: ShieldCheck },
  ];

  const filteredSections = sectionsList.filter(
    (s) => s.title.toLowerCase().includes(query.toLowerCase()) || s.desc.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-start justify-center pt-20 px-4 animate-in fade-in duration-200">
      <div
        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-200/80 flex items-center gap-3 bg-slate-50/50">
          <Search className="w-5 h-5 text-indigo-600 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search employees by name/ID, navigate to sections, or type a command..."
            className="w-full bg-transparent border-none outline-hidden text-sm font-medium text-slate-800 placeholder-slate-400"
            autoFocus
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 hover:bg-slate-200 rounded-full text-slate-400">
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-slate-600 bg-slate-200/80 px-2 py-1 rounded-md font-mono"
          >
            ESC
          </button>
        </div>

        {/* Results Container */}
        <div className="max-h-96 overflow-y-auto p-3 space-y-4">
          {/* AI Helper Suggestion */}
          {query && (
            <div
              onClick={() => {
                onOpenAiAssistant();
                onClose();
              }}
              className="p-3 rounded-xl bg-purple-50 hover:bg-purple-100/80 border border-purple-200/80 flex items-center justify-between cursor-pointer group transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-600 text-white">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-purple-900">Ask AI Copilot: "{query}"</div>
                  <div className="text-[11px] text-purple-700">Generate HR policy explanations, draft letters, or compute salary</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-purple-600 group-hover:translate-x-1 transition-transform" />
            </div>
          )}

          {/* Employee Results */}
          {filteredEmployees.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Employees ({filteredEmployees.length})
              </div>
              <div className="space-y-1 mt-1">
                {filteredEmployees.map((emp) => (
                  <div
                    key={emp.id}
                    onClick={() => {
                      onSelectEmployee(emp.id);
                      onClose();
                    }}
                    className="p-2.5 rounded-xl hover:bg-slate-100 flex items-center justify-between cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <img src={emp.avatarUrl} alt={emp.fullName} className="w-8 h-8 rounded-full object-cover" />
                      <div>
                        <div className="text-xs font-semibold text-slate-800 group-hover:text-indigo-600 flex items-center gap-2">
                          {emp.fullName}
                          <span className="text-[10px] text-slate-400 font-mono bg-slate-100 px-1.5 py-0.5 rounded-xs">
                            {emp.id}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {emp.designation} • {emp.department}
                        </div>
                      </div>
                    </div>
                    <span className="text-[11px] text-indigo-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      Open Profile →
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section Results */}
          {filteredSections.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Quick Navigation
              </div>
              <div className="space-y-1 mt-1">
                {filteredSections.map((sec) => {
                  const Icon = sec.icon;
                  return (
                    <div
                      key={sec.id}
                      onClick={() => {
                        onSelectSection(sec.id);
                        onClose();
                      }}
                      className="p-2.5 rounded-xl hover:bg-indigo-50 flex items-center justify-between cursor-pointer transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-slate-100 group-hover:bg-indigo-600 group-hover:text-white text-slate-600 transition-colors">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-slate-800 group-hover:text-indigo-600">
                            {sec.title}
                          </div>
                          <div className="text-[11px] text-slate-500">{sec.desc}</div>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-transform" />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {filteredEmployees.length === 0 && filteredSections.length === 0 && (
            <div className="text-center py-8 text-slate-400 text-xs">
              No matching records found for "{query}". Try searching for "Rahul", "Payroll", or "PF".
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-500">
          <span>Tip: Use ↑ ↓ arrow keys to navigate, Enter to select</span>
          <span className="font-mono text-[10px] text-slate-400">Frappe HRMS v15 UI</span>
        </div>
      </div>
    </div>
  );
};
