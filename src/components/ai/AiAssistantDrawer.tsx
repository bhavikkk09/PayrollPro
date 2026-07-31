import React, { useState } from 'react';
import { Sparkles, X, Send, Bot, User, FileText, ShieldCheck, Banknote, RefreshCw } from 'lucide-react';

interface AiAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  initialPrompt?: string;
}

export const AiAssistantDrawer: React.FC<AiAssistantDrawerProps> = ({
  isOpen,
  onClose,
  initialPrompt = ''
}) => {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<{ sender: 'user' | 'ai'; text: string; source?: string }[]>([
    {
      sender: 'ai',
      text: 'Hello! I am your **Frappe HR Copilot**. I can help you with Indian labor statutory rules (PF, ESIC, PT, TDS), draft HR document letters (Probation, Offer, Missing Punch warnings), analyze payroll variances, or explain Frappe DocType mappings. How can I assist you today?'
    }
  ]);

  if (!isOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const message = textToSend || prompt;
    if (!message.trim() || loading) return;

    // Add user message
    setChatHistory((prev) => [...prev, { sender: 'user', text: message }]);
    setPrompt('');
    setLoading(true);

    try {
      const response = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: message,
          context: 'Frappe HRMS Modern Redesign',
          type: 'general_hr_query'
        })
      });

      const data = await response.json();
      setChatHistory((prev) => [
        ...prev,
        { sender: 'ai', text: data.reply || 'No response returned.', source: data.source }
      ]);
    } catch (err) {
      setChatHistory((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: 'Apologies, I encountered an error communicating with the AI Assistant endpoint. Please check your connection.',
          source: 'error'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const samplePrompts = [
    "Draft a Probation Confirmation Letter for Karan Mehta",
    "Explain Maharashtra PT Slabs & EPFO ECR File rules",
    "Analyze July 2026 Payroll Variance vs June 2026",
    "Map Attendance & Leave DocTypes in ERPNext"
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg h-full shadow-2xl border-l border-slate-200 flex flex-col">
        {/* Drawer Header */}
        <div className="p-4 bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white flex items-center justify-between border-b border-purple-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-600 text-white shadow-md">
              <Sparkles className="w-5 h-5 text-yellow-300" />
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-tight">Frappe HR Copilot</h3>
              <p className="text-[11px] text-purple-200">AI Assistant for Indian HR & Payroll</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-lg text-purple-200 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Sample Prompts */}
        <div className="p-3 bg-slate-50 border-b border-slate-200/80 flex items-center gap-2 overflow-x-auto text-xs custom-scrollbar">
          {samplePrompts.map((sp, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(sp)}
              className="px-2.5 py-1 bg-white hover:bg-purple-50 text-slate-700 hover:text-purple-700 border border-slate-200 rounded-lg shrink-0 text-[11px] font-medium transition-colors"
            >
              {sp}
            </button>
          ))}
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {chatHistory.map((msg, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-3 text-xs ${
                msg.sender === 'user' ? 'flex-row-reverse' : ''
              }`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-purple-600 text-white'
                }`}
              >
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`p-3.5 rounded-2xl max-w-[85%] whitespace-pre-wrap leading-relaxed shadow-xs ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white font-medium rounded-tr-none'
                    : 'bg-slate-100 text-slate-800 border border-slate-200/80 rounded-tl-none'
                }`}
              >
                {msg.text}

                {msg.source && (
                  <div className="mt-2 pt-2 border-t border-slate-200/60 text-[10px] text-slate-400 font-mono">
                    Source: {msg.source}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-purple-700 font-medium p-3 bg-purple-50 rounded-xl animate-pulse">
              <RefreshCw className="w-4 h-4 animate-spin text-purple-600" />
              Thinking & generating response...
            </div>
          )}
        </div>

        {/* Chat Input Bar */}
        <div className="p-4 bg-white border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask anything about statutory compliance, letters, or payroll..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 outline-hidden focus:border-purple-500"
            />
            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              className="p-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl transition-all shadow-xs"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="text-[10px] text-slate-400 text-center mt-2">
            Powered by Gemini API (@google/genai) • Built for ERPNext / Frappe HRMS
          </div>
        </div>
      </div>
    </div>
  );
};
