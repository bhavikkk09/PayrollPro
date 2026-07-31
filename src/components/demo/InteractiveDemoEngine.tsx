import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  X,
  MousePointer,
  Clock,
  FileText,
  Maximize2,
  Minimize2,
  Info,
  EyeOff,
  UserCheck
} from 'lucide-react';
import { NavigationSection } from '../../types';

export interface CursorStep {
  keyword: string; // Key phrase spoken in narration that triggers this cursor movement
  fallbackSec: number; // Fallback timer in seconds if boundary events are unavailable
  xPercentage: number;
  yPercentage: number;
  label: string;
  action?: 'switch_section' | 'click_employee' | 'open_ai' | 'switch_tab' | 'scroll';
  targetSection?: NavigationSection;
  employeeId?: string | null;
  aiQuery?: string;
}

export interface DemoScene {
  id: number;
  timeRange: string;
  title: string;
  subtitle: string;
  section: NavigationSection;
  cursorSteps: CursorStep[];
  scriptNarration: string;
  presenterTips: string;
  highlights: string[];
}

export const DEMO_SCENES: DemoScene[] = [
  {
    id: 1,
    timeRange: '0:00 - 0:30',
    title: 'Scene 1: Welcome & Executive Action Dashboard',
    subtitle: 'High-level operational metrics, urgent HR action items & shift overviews',
    section: 'dashboard',
    cursorSteps: [
      {
        keyword: 'executive action dashboard',
        fallbackSec: 1,
        xPercentage: 8,
        yPercentage: 12,
        label: 'Clicking Executive Dashboard Menu',
        action: 'switch_section',
        targetSection: 'dashboard'
      },
      {
        keyword: 'headcount across branches',
        fallbackSec: 7,
        xPercentage: 22,
        yPercentage: 28,
        label: 'Headcount Summary & Branch Switcher'
      },
      {
        keyword: 'pending leave requests',
        fallbackSec: 15,
        xPercentage: 62,
        yPercentage: 32,
        label: 'Urgent Pending Leave Approvals'
      },
      {
        keyword: 'statutory compliance alerts',
        fallbackSec: 22,
        xPercentage: 82,
        yPercentage: 30,
        label: 'Automated Statutory Compliance Alerts'
      }
    ],
    scriptNarration:
      "Hello everyone! Welcome to Bhavik HRMS... I am excited to take you on a detailed tour of our complete HR and Payroll platform... Right now... we are clicking on the Executive Action Dashboard... Here... you can monitor real-time headcount across branches... review urgent pending leave requests... and check live statutory compliance alerts... ensuring your HR operations stay perfectly organized every single day.",
    presenterTips: 'Point to the live branch switcher at top and the urgent action queue cards.',
    highlights: ['Real-time Headcount & Branch Switcher', 'Urgent Approval Queue', 'Statutory Alert Badges']
  },
  {
    id: 2,
    timeRange: '0:30 - 1:00',
    title: 'Scene 2: Employee Master Directory & 1-Page Profile',
    subtitle: 'Unified employee directory, document vault, CTC stack & shift assignments',
    section: 'employees',
    cursorSteps: [
      {
        keyword: 'employee directory menu',
        fallbackSec: 1,
        xPercentage: 8,
        yPercentage: 16,
        label: 'Clicking Employee Directory Menu',
        action: 'switch_section',
        targetSection: 'employees'
      },
      {
        keyword: 'select aarav sharma',
        fallbackSec: 9,
        xPercentage: 45,
        yPercentage: 38,
        label: 'Clicking Employee Profile: Aarav Sharma',
        action: 'click_employee',
        employeeId: 'EMP-001'
      },
      {
        keyword: '1-page profile',
        fallbackSec: 16,
        xPercentage: 75,
        yPercentage: 22,
        label: '1-Page Profile: Statutory & Salary CTC Stack'
      },
      {
        keyword: 'document vault',
        fallbackSec: 23,
        xPercentage: 78,
        yPercentage: 45,
        label: 'Document Vault & Verified Bank Details'
      }
    ],
    scriptNarration:
      "Now... let us open the Employee Directory menu... Here... HR teams can search... filter by department or location... and manage full employee records... Watch what happens when we select Aarav Sharma... His full 1-page profile opens smoothly... displaying his statutory details... detailed salary CTC breakdown... bank accounts... and verified document vault all in one place.",
    presenterTips: 'Highlight the tabs inside the 1-Page profile drawer (Salary CTC, Attendance, Vault).',
    highlights: ['Multi-branch Filtering', '1-Page Profile Drawer', 'Document Vault & CTC View']
  },
  {
    id: 3,
    timeRange: '1:00 - 1:30',
    title: 'Scene 3: 31-Day Attendance Grid & Shift Overrides',
    subtitle: 'Excel-like bulk attendance editor, late marks, OT & Sandwich policy rules',
    section: 'attendance',
    cursorSteps: [
      {
        keyword: 'attendance management menu',
        fallbackSec: 1,
        xPercentage: 8,
        yPercentage: 20,
        label: 'Clicking Attendance Management Menu',
        action: 'switch_section',
        targetSection: 'attendance'
      },
      {
        keyword: 'excel-style grid',
        fallbackSec: 9,
        xPercentage: 48,
        yPercentage: 38,
        label: '31-Day Interactive Attendance Grid'
      },
      {
        keyword: 'biometric punch logs',
        fallbackSec: 16,
        xPercentage: 70,
        yPercentage: 25,
        label: 'Biometric Punch Log Sync'
      },
      {
        keyword: 'sandwich leave rules',
        fallbackSec: 23,
        xPercentage: 85,
        yPercentage: 25,
        label: 'Sandwich Leave Policy Configuration'
      }
    ],
    scriptNarration:
      "Next... let us navigate to the Attendance management menu... Handling monthly shift schedules is quick and simple using our 31-day Excel-style grid... It syncs automatically with biometric punch logs... calculates late marks and overtime hours... and accurately applies your company's sandwich leave rules without any manual tracking.",
    presenterTips: 'Click a grid cell to demonstrate quick inline attendance status modification.',
    highlights: ['Excel-style Bulk Editing', 'Biometric Punch Sync', 'Sandwich Policy & OT Calculator']
  },
  {
    id: 4,
    timeRange: '1:30 - 2:00',
    title: 'Scene 4: 7-Step Indian Payroll Wizard',
    subtitle: 'Automated PF, ESIC, Professional Tax, Income Tax TDS & Bank Payout Files',
    section: 'payroll',
    cursorSteps: [
      {
        keyword: 'payroll wizard module',
        fallbackSec: 1,
        xPercentage: 8,
        yPercentage: 28,
        label: 'Clicking Payroll Wizard Menu',
        action: 'switch_section',
        targetSection: 'payroll'
      },
      {
        keyword: 'payable days',
        fallbackSec: 9,
        xPercentage: 35,
        yPercentage: 22,
        label: 'Step 2: Attendance Payable Days Lock'
      },
      {
        keyword: 'provident fund',
        fallbackSec: 16,
        xPercentage: 58,
        yPercentage: 22,
        label: 'Step 4: PF Statutory Ceiling & ESIC Deductions'
      },
      {
        keyword: 'bank payout files',
        fallbackSec: 23,
        xPercentage: 82,
        yPercentage: 80,
        label: 'Step 7: Bank Payout File Export'
      }
    ],
    scriptNarration:
      "Now... let us enter the Payroll Wizard module... Our 7-step Indian Payroll Wizard makes monthly processing stress-free... It locks in attendance payable days... calculates Provident Fund with statutory ceiling caps... ESIC deductions... Professional Tax... and Income Tax TDS under both tax regimes... generating ready-to-upload bank payout files in just a few clicks.",
    presenterTips: 'Walk through the wizard steps to showcase statutory deductions and bank file export.',
    highlights: ['PF & ESIC Ceiling Compliance', 'Old vs New Tax Regime TDS', 'Bank Salary File Export']
  },
  {
    id: 5,
    timeRange: '2:00 - 2:30',
    title: 'Scene 5: AI HR Copilot & Policy Assistant',
    subtitle: 'Instant appointment letters, policy drafting & compliance audit queries',
    section: 'dashboard',
    cursorSteps: [
      {
        keyword: 'ai copilot button',
        fallbackSec: 1,
        xPercentage: 8,
        yPercentage: 52,
        label: 'Clicking AI HR Copilot Menu',
        action: 'open_ai',
        aiQuery: 'Draft a salary revision letter for Senior Developer and check PF ceiling compliance.'
      },
      {
        keyword: 'plain english prompts',
        fallbackSec: 9,
        xPercentage: 88,
        yPercentage: 85,
        label: 'Submitting Prompt: Salary Revision & Statutory Audit'
      },
      {
        keyword: 'policy-compliant letters',
        fallbackSec: 17,
        xPercentage: 88,
        yPercentage: 40,
        label: 'AI Output: Formatted Letter & PF Audit Report'
      }
    ],
    scriptNarration:
      "One of our most helpful features is the integrated AI HR Copilot... As an HR manager... you can click on the AI Copilot button... type plain English prompts... like 'Draft a salary revision letter for Senior Developer'... or 'Verify PF compliance'... and our AI copilot creates fully formatted... policy-compliant letters and statutory reports immediately.",
    presenterTips: 'Demonstrate sending a query in the right-side AI Copilot slide-over drawer.',
    highlights: ['Natural Language HR Queries', 'Policy & Letter Generator', 'Instant Compliance Check']
  },
  {
    id: 6,
    timeRange: '2:30 - 3:00',
    title: 'Scene 6: Statutory Compliance Hub & Analytics',
    subtitle: 'EPFO PF ECR text files, Form 24Q TDS, headcount trends & C-suite charts',
    section: 'compliance',
    cursorSteps: [
      {
        keyword: 'statutory compliance hub',
        fallbackSec: 1,
        xPercentage: 8,
        yPercentage: 32,
        label: 'Clicking Statutory Compliance Menu',
        action: 'switch_section',
        targetSection: 'compliance'
      },
      {
        keyword: 'epfo ecr text files',
        fallbackSec: 9,
        xPercentage: 32,
        yPercentage: 35,
        label: 'EPFO PF ECR Text File Generator'
      },
      {
        keyword: 'form 24q',
        fallbackSec: 16,
        xPercentage: 68,
        yPercentage: 35,
        label: 'Form 24Q TDS Return Reports'
      },
      {
        keyword: 'thank you',
        fallbackSec: 23,
        xPercentage: 50,
        yPercentage: 75,
        label: 'Executive Analytics & C-Suite Charts'
      }
    ],
    scriptNarration:
      "Finally... let us open the Statutory Compliance Hub... Here... you can generate official EPFO ECR text files and Form 24Q quarterly TDS returns... ready for direct uploading to government portals... Combined with our executive analytics... Bhavik HRMS transforms complex HR work into a smooth strategic advantage... Thank you so much for watching!",
    presenterTips: 'Wrap up by highlighting government file export buttons and general platform value.',
    highlights: ['EPFO PF ECR File Output', 'Form 24Q Return Support', 'Executive Analytics & Reports']
  }
];

interface InteractiveDemoEngineProps {
  isActive: boolean;
  onClose: () => void;
  onSelectSection: (section: NavigationSection) => void;
  onSelectEmployee: (empId: string | null) => void;
  onOpenAiAssistant: (context: string) => void;
}

export const InteractiveDemoEngine: React.FC<InteractiveDemoEngineProps> = ({
  isActive,
  onClose,
  onSelectSection,
  onSelectEmployee,
  onOpenAiAssistant
}) => {
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isVoiceoverEnabled, setIsVoiceoverEnabled] = useState(true);
  const [isCursorVisible, setIsCursorVisible] = useState(true);
  const [isCleanRecordingMode, setIsCleanRecordingMode] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(30);
  const [isExpandedTeleprompter, setIsExpandedTeleprompter] = useState(true);
  const [isClicking, setIsClicking] = useState(false);

  // Female voice selection state
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);

  // Smooth cursor position state
  const [cursorPos, setCursorPos] = useState({ xPercentage: 8, yPercentage: 12, label: 'Ready' });

  // Track triggered steps to avoid re-triggering within same scene
  const triggeredStepsRef = useRef<Set<number>>(new Set());
  const speechUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const currentScene = DEMO_SCENES[currentSceneIndex];

  // 1. Fetch available Web Speech voices & prioritize natural female voice
  useEffect(() => {
    if (!('speechSynthesis' in window)) return;

    const updateVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices);

      if (voices.length > 0) {
        // Priority search for natural female voice
        const femaleVoice = voices.find(v => {
          const name = v.name.toLowerCase();
          return (
            name.includes('female') ||
            name.includes('google uk english female') ||
            name.includes('google us english') ||
            name.includes('samantha') ||
            name.includes('victoria') ||
            name.includes('zira') ||
            name.includes('karen') ||
            name.includes('fiona') ||
            name.includes('siri') ||
            name.includes('veena') ||
            name.includes('moira')
          );
        }) || voices.find(v => v.lang.startsWith('en')) || voices[0];

        setSelectedVoice(femaleVoice || null);
      }
    };

    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;
  }, []);

  // 2. Hotkey shortcut: Press 'H' to toggle Clean Recording Mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isActive) return;
      if (e.key === 'h' || e.key === 'H') {
        setIsCleanRecordingMode((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive]);

  // Function to move cursor to a specific step and execute actions precisely when cursor reaches target!
  const applyCursorStep = (step: CursorStep, stepIndex: number) => {
    if (triggeredStepsRef.current.has(stepIndex)) return;
    triggeredStepsRef.current.add(stepIndex);

    // Click visual feedback on cursor
    setIsClicking(true);
    setTimeout(() => setIsClicking(false), 450);

    setCursorPos({
      xPercentage: step.xPercentage,
      yPercentage: step.yPercentage,
      label: step.label
    });

    // Execute corresponding action EXACTLY when cursor clicks!
    if (step.action === 'switch_section' && step.targetSection) {
      onSelectEmployee(null); // Close employee drawer if open
      onSelectSection(step.targetSection);
    } else if (step.action === 'click_employee' && step.employeeId) {
      onSelectEmployee(step.employeeId);
    } else if (step.action === 'open_ai' && step.aiQuery) {
      onOpenAiAssistant(step.aiQuery);
    }
  };

  // 3. Apply scene navigation, speech synthesis & synchronized word-boundary tracking
  useEffect(() => {
    if (!isActive) return;

    const scene = DEMO_SCENES[currentSceneIndex];
    triggeredStepsRef.current.clear();

    // Move cursor to step 0 immediately
    if (scene.cursorSteps && scene.cursorSteps.length > 0) {
      const firstStep = scene.cursorSteps[0];
      setCursorPos({
        xPercentage: firstStep.xPercentage,
        yPercentage: firstStep.yPercentage,
        label: firstStep.label
      });
      // Execute step 0 action (e.g. clicking the menu item)
      applyCursorStep(firstStep, 0);
    }

    setSecondsRemaining(30);

    // Speech synthesis with word-boundary event listener for PERFECT cursor synchronization
    if (isVoiceoverEnabled && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(scene.scriptNarration);
      speechUtteranceRef.current = utterance;

      if (selectedVoice) utterance.voice = selectedVoice;
      utterance.rate = 0.78;  // Relaxed, natural human conversational speed
      utterance.pitch = 1.05; // Friendly warm tone

      // Word boundary listener
      utterance.onboundary = (event) => {
        if (event.name === 'word' || event.name === 'sentence') {
          const charIndex = event.charIndex;
          const spokenSoFar = scene.scriptNarration.substring(0, charIndex + 25).toLowerCase();

          scene.cursorSteps.forEach((step, idx) => {
            if (step.keyword && spokenSoFar.includes(step.keyword.toLowerCase())) {
              applyCursorStep(step, idx);
            }
          });
        }
      };

      window.speechSynthesis.speak(utterance);
    }

  }, [currentSceneIndex, isActive]);

  // 4. Fallback Timers to guarantee cursor movement and menu opening
  useEffect(() => {
    if (!isActive || !currentScene.cursorSteps) return;

    const timers: NodeJS.Timeout[] = [];

    currentScene.cursorSteps.forEach((step, idx) => {
      const timer = setTimeout(() => {
        applyCursorStep(step, idx);
      }, step.fallbackSec * 1000);

      timers.push(timer);
    });

    return () => timers.forEach((t) => clearTimeout(t));
  }, [currentSceneIndex, isActive]);

  // 5. Auto-play scene timer (30 seconds per scene = 3 Minutes Total Demo)
  useEffect(() => {
    if (!isActive || !isPlaying) return;

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          setCurrentSceneIndex((idx) => {
            if (idx >= DEMO_SCENES.length - 1) {
              setIsPlaying(false);
              return 0;
            }
            return idx + 1;
          });
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, isPlaying]);

  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    };
  }, []);

  if (!isActive) return null;

  const handleTogglePlay = () => {
    const nextPlay = !isPlaying;
    setIsPlaying(nextPlay);

    if (nextPlay && isVoiceoverEnabled && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(currentScene.scriptNarration);
      if (selectedVoice) utterance.voice = selectedVoice;
      utterance.rate = 0.78;
      utterance.pitch = 1.05;
      
      utterance.onboundary = (event) => {
        if (event.name === 'word') {
          const spokenSoFar = currentScene.scriptNarration.substring(0, event.charIndex + 25).toLowerCase();
          currentScene.cursorSteps.forEach((step, idx) => {
            if (step.keyword && spokenSoFar.includes(step.keyword.toLowerCase())) {
              applyCursorStep(step, idx);
            }
          });
        }
      };

      window.speechSynthesis.speak(utterance);
    } else if (!nextPlay && 'speechSynthesis' in window) {
      window.speechSynthesis.pause();
    }
  };

  const handleNextScene = () => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setCurrentSceneIndex(idx => (idx < DEMO_SCENES.length - 1 ? idx + 1 : 0));
  };

  const handlePrevScene = () => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setCurrentSceneIndex(idx => (idx > 0 ? idx - 1 : DEMO_SCENES.length - 1));
  };

  return (
    <>
      {/* 1. Synchronized Animated Pointer Cursor with Click Ring Feedback */}
      {isCursorVisible && (
        <div
          className="fixed z-50 pointer-events-none transition-all duration-700 ease-out flex items-center gap-2"
          style={{
            top: `${cursorPos.yPercentage}%`,
            left: `${cursorPos.xPercentage}%`,
            transform: 'translate(-50%, -50%)'
          }}
        >
          <div className="relative">
            {/* Click Ripple Effect */}
            {isClicking && (
              <span className="absolute -inset-3 rounded-full border-2 border-indigo-400 bg-indigo-500/30 animate-ping pointer-events-none" />
            )}
            <MousePointer className={`w-7 h-7 text-indigo-600 fill-indigo-500 drop-shadow-xl transition-transform duration-200 ${isClicking ? 'scale-90' : 'scale-100 animate-bounce'}`} />
            <span className="absolute top-8 left-4 whitespace-nowrap bg-slate-900/95 text-white text-[11px] font-semibold px-2.5 py-1 rounded-md shadow-2xl border border-indigo-500/60 backdrop-blur-xs flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              {cursorPos.label}
            </span>
          </div>
        </div>
      )}

      {/* 2. Pristine Clean Recording floating button (Shown ONLY during Clean Recording Mode) */}
      {isCleanRecordingMode && (
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 bg-slate-900/90 backdrop-blur-md text-white text-xs px-3.5 py-2 rounded-full border border-slate-700 shadow-2xl hover:bg-slate-900 transition-all">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
          <span className="font-semibold text-slate-200">Clean Recording Active</span>
          <button
            onClick={() => setIsCleanRecordingMode(false)}
            className="ml-2 bg-indigo-600 hover:bg-indigo-500 text-white px-2.5 py-1 rounded-full text-[10px] font-bold shadow-sm"
            title="Show Teleprompter & Controls (Hotkey: H)"
          >
            Show Menu (H)
          </button>
        </div>
      )}

      {/* 3. Top Banner & Control Bar (Hidden in Clean Recording Mode) */}
      {!isCleanRecordingMode && (
        <div className="fixed top-0 left-0 right-0 z-40 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white px-4 py-2 border-b border-indigo-500/30 shadow-md flex items-center justify-between text-xs font-sans">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-red-500/20 text-red-300 px-2.5 py-0.5 rounded-full border border-red-500/40 font-semibold animate-pulse">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              DEMO WALKTHROUGH MODE
            </div>
            <div className="hidden sm:flex items-center gap-2 text-slate-300">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              <span>Scene {currentScene.id} of {DEMO_SCENES.length}</span>
              <span className="text-slate-500">•</span>
              <span className="font-mono text-indigo-300">{currentScene.timeRange}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Female Voice Indicator */}
            {availableVoices.length > 0 && (
              <div className="hidden lg:flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded border border-slate-700 text-[11px] text-indigo-200">
                <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
                <span className="truncate max-w-[130px]">
                  {selectedVoice ? selectedVoice.name : 'Female Voice'}
                </span>
              </div>
            )}

            {/* Voiceover Toggle */}
            <button
              onClick={() => {
                const nextVal = !isVoiceoverEnabled;
                setIsVoiceoverEnabled(nextVal);
                if (!nextVal && 'speechSynthesis' in window) {
                  window.speechSynthesis.cancel();
                }
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                isVoiceoverEnabled
                  ? 'bg-indigo-600/80 text-white border border-indigo-400/50'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
              title="Toggle Web Speech Voiceover"
            >
              {isVoiceoverEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span className="hidden md:inline">Voiceover {isVoiceoverEnabled ? 'ON' : 'OFF'}</span>
            </button>

            {/* Pointer Cursor Toggle */}
            <button
              onClick={() => setIsCursorVisible(!isCursorVisible)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                isCursorVisible
                  ? 'bg-indigo-600/80 text-white border border-indigo-400/50'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
              title="Toggle Cursor Pointer"
            >
              <MousePointer className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Cursor</span>
            </button>

            {/* Hide All Controls for Pristine Screen Recording */}
            <button
              onClick={() => setIsCleanRecordingMode(true)}
              className="flex items-center gap-1.5 px-3 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-md text-[11px] font-bold transition-all shadow-md"
              title="Hide all overlay menus & scripts for clean screen recording (Hotkey: H)"
            >
              <EyeOff className="w-3.5 h-3.5" />
              <span>Clean Record View</span>
            </button>

            {/* Exit Demo Mode */}
            <button
              onClick={() => {
                if ('speechSynthesis' in window) window.speechSynthesis.cancel();
                onClose();
              }}
              className="p-1 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 transition-colors ml-2"
              title="Exit Demo Mode"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 4. Floating Bottom Teleprompter & Interactive Control Bar (Hidden in Clean Recording Mode) */}
      {!isCleanRecordingMode && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-4xl transition-all duration-300">
          <div className="bg-slate-900/95 backdrop-blur-md text-white rounded-2xl border border-slate-700/80 shadow-2xl overflow-hidden p-4 sm:p-5">
            {/* Scene Header & Timeline Switcher */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 min-w-0">
                <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[11px] font-mono font-semibold border border-indigo-500/40 shrink-0">
                  {currentScene.timeRange}
                </span>
                <h3 className="text-sm sm:text-base font-bold text-white truncate">
                  {currentScene.title}
                </h3>
              </div>

              {/* Scene Selector Pills */}
              <div className="flex items-center gap-1.5 shrink-0 overflow-x-auto py-1">
                {DEMO_SCENES.map((scene, idx) => (
                  <button
                    key={scene.id}
                    onClick={() => {
                      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
                      setCurrentSceneIndex(idx);
                    }}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                      currentSceneIndex === idx
                        ? 'bg-indigo-600 text-white font-bold ring-2 ring-indigo-400/50 scale-105'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                    }`}
                    title={`Jump to Scene ${scene.id}: ${scene.title}`}
                  >
                    Scene {scene.id}
                  </button>
                ))}
              </div>
            </div>

            {/* Teleprompter Script Narration */}
            {isExpandedTeleprompter && (
              <div className="py-3 px-1 my-2 bg-slate-950/60 rounded-xl border border-slate-800/80 px-4 text-xs sm:text-sm leading-relaxed text-indigo-100 font-sans tracking-wide">
                <div className="flex items-center justify-between text-[10px] font-semibold text-indigo-400 uppercase tracking-wider mb-1">
                  <span className="flex items-center gap-1">
                    <FileText className="w-3 h-3" /> Voiceover Script & Human Narration (3-Min Full Demo)
                  </span>
                  <span className="text-slate-500">Auto-Timer: {secondsRemaining}s</span>
                </div>
                <p className="italic font-medium text-slate-200">
                  "{currentScene.scriptNarration}"
                </p>

                {/* Presenter Tip */}
                <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-amber-300">
                  <span className="flex items-center gap-1">
                    <Info className="w-3 h-3 text-amber-400 shrink-0" />
                    <strong>Presenter Cue:</strong> {currentScene.presenterTips}
                  </span>
                  <div className="hidden sm:flex items-center gap-2 text-slate-400 text-[10px]">
                    {currentScene.highlights.map((h, i) => (
                      <span key={i} className="bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">
                        ✓ {h}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Main Transport Controls & Playback Slider */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevScene}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-colors"
                  title="Previous Scene"
                >
                  <SkipBack className="w-4 h-4" />
                </button>

                <button
                  onClick={handleTogglePlay}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs shadow-md transition-all ${
                    isPlaying
                      ? 'bg-amber-500 hover:bg-amber-600 text-slate-950'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                  }`}
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-4 h-4 fill-current" />
                      <span>Pause Walkthrough</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current" />
                      <span>Auto Play 3-Min Walkthrough</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleNextScene}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-colors"
                  title="Next Scene"
                >
                  <SkipForward className="w-4 h-4" />
                </button>
              </div>

              {/* Progress Bar across scenes */}
              <div className="hidden md:flex flex-1 items-center gap-3 px-3">
                <span className="text-[10px] font-mono text-slate-400">0:00</span>
                <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden relative">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                    style={{
                      width: `${((currentSceneIndex + 1) / DEMO_SCENES.length) * 100}%`
                    }}
                  />
                </div>
                <span className="text-[10px] font-mono text-slate-400">3:00</span>
              </div>

              {/* Collapse/Expand Teleprompter Button */}
              <button
                onClick={() => setIsExpandedTeleprompter(!isExpandedTeleprompter)}
                className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-xl transition-colors text-xs flex items-center gap-1"
                title="Toggle Script Box"
              >
                {isExpandedTeleprompter ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
