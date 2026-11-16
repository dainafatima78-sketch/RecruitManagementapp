import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Bot,
  Send,
  X,
  Minimize2,
  Maximize2,
  RefreshCw,
  Lightbulb,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  FileQuestion,
  UserCheck
} from 'lucide-react';
import { api } from '../../api/client';
import { useToast } from '../../context/ToastContext';

interface AiAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCandidateId?: string;
  selectedCandidateName?: string;
  selectedJobId?: string;
  selectedJobTitle?: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  model?: string;
  suggestions?: string[];
}

export const AiAssistantDrawer: React.FC<AiAssistantDrawerProps> = ({
  isOpen,
  onClose,
  selectedCandidateId,
  selectedCandidateName,
  selectedJobId,
  selectedJobTitle
}) => {
  const { addToast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome',
      role: 'assistant',
      content: `👋 Hello! I am your **RecruitAI Talent Assistant** powered by **ChatGPT 6 Astra** via AgentRouter.

I can help you:
- **Analyze candidate matching**: Explain strengths, missing skills, and scoring breakdowns.
- **Formulate interview questions**: Tailor behavioral, technical, or situational prompts.
- **Review resumes**: Summarize candidate profiles or spot potential red flags.
- **Draft outreach**: Write personalized interview invitations or candidate feedback.

How can I assist your hiring pipeline today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      model: 'ChatGPT 6 Astra',
      suggestions: [
        'Explain how candidate matching scoring works',
        'Suggest 3 behavioral questions for a Senior Developer',
        'What are the most in-demand skills in our open jobs?'
      ]
    }
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [status, setStatus] = useState<{ configured: boolean; model: string; latency?: number } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      checkStatus();
    }
  }, [isOpen, messages]);

  const checkStatus = async () => {
    try {
      const res = await api.getAiStatus();
      setStatus({
        configured: res.configured,
        model: res.model,
        latency: res.latencyMs
      });
    } catch {
      setStatus({
        configured: false,
        model: 'gpt-6-astra'
      });
    }
  };

  const handleSend = async (questionText?: string) => {
    const textToSend = (questionText || input).trim();
    if (!textToSend || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await api.askAiAssistant({
        question: textToSend,
        candidateId: selectedCandidateId,
        jobId: selectedJobId
      });

      if (res.success) {
        const assistantMsg: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: res.answer,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          model: res.model,
          suggestions: res.suggestions
        };
        setMessages(prev => [...prev, assistantMsg]);
      } else {
        throw new Error(res.error || 'Failed to get AI response');
      }
    } catch (err: any) {
      addToast('error', 'AI Assistant Error', err.message || 'Error communicating with AgentRouter API.');
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `⚠️ **Error communicating with AgentRouter API:** ${err.message || 'Server timeout or network issue.'}\n\nPlease check that your AgentRouter API key is active and has sufficient quota.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden pointer-events-none flex justify-end">
      {/* Backdrop for mobile */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs pointer-events-auto md:hidden"
        onClick={onClose}
      />

      {/* Slide-out Drawer Container */}
      <div
        className={`pointer-events-auto flex flex-col h-full bg-[#121724] border-l border-slate-800 text-slate-200 shadow-2xl transition-all duration-300 ${
          isExpanded ? 'w-full md:w-[650px]' : 'w-full md:w-[440px]'
        }`}
      >
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-800 bg-[#151B2B] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#3978F6] to-cyan-400 p-[1px] shadow-sm">
              <div className="w-full h-full bg-[#151B2B] rounded-[11px] flex items-center justify-center text-cyan-400">
                <Sparkles className="w-4.5 h-4.5" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-white tracking-tight">AI Talent Assistant</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                  ChatGPT 6 Astra
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  AgentRouter Live
                </span>
                {status?.latency && (
                  <span className="text-slate-500">• {status.latency}ms</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 text-slate-400">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 hover:text-white hover:bg-slate-800 rounded-lg transition-colors hidden md:block"
              title={isExpanded ? 'Collapse width' : 'Expand width'}
            >
              {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="Close Assistant"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Workspace Context Chip (if candidate or job selected) */}
        {(selectedCandidateName || selectedJobTitle) && (
          <div className="px-4 py-2 bg-slate-900/90 border-b border-slate-800/80 text-[11px] flex items-center gap-2 shrink-0">
            <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Context:</span>
            {selectedJobTitle && (
              <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20 truncate max-w-[150px]">
                🎯 {selectedJobTitle}
              </span>
            )}
            {selectedCandidateName && (
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 truncate max-w-[150px]">
                👤 {selectedCandidateName}
              </span>
            )}
          </div>
        )}

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[90%] rounded-2xl px-4 py-3 text-xs sm:text-[13px] leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-[#3978F6] text-white rounded-br-xs shadow-md'
                    : 'bg-slate-900/90 border border-slate-800 text-slate-200 rounded-bl-xs shadow-sm'
                }`}
              >
                {/* Render Markdown text line breaks & bullets cleanly */}
                <div className="whitespace-pre-wrap space-y-1.5">
                  {msg.content}
                </div>

                <div
                  className={`mt-2 flex items-center justify-between text-[10px] ${
                    msg.role === 'user' ? 'text-blue-200' : 'text-slate-400'
                  }`}
                >
                  <span>{msg.timestamp}</span>
                  {msg.model && (
                    <span className="font-mono text-[9px] bg-slate-800/60 px-1.5 py-0.2 rounded border border-white/5">
                      {msg.model}
                    </span>
                  )}
                </div>
              </div>

              {/* Interactive suggestion pills */}
              {msg.suggestions && msg.suggestions.length > 0 && (
                <div className="mt-2.5 space-y-1.5 max-w-[90%]">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider flex items-center gap-1">
                    <Lightbulb className="w-3 h-3 text-amber-400" />
                    Suggested follow-ups:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {msg.suggestions.map((sug, sIdx) => (
                      <button
                        key={sIdx}
                        onClick={() => handleSend(sug)}
                        className="text-left text-[11px] px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-cyan-300 hover:text-white border border-slate-700/60 transition-colors"
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-start gap-2">
              <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 rounded-bl-xs flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-cyan-400/40 border-t-cyan-400 rounded-full animate-spin" />
                <span className="text-xs text-slate-400">ChatGPT 6 Astra is analyzing...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Drawer Input Box */}
        <div className="p-3 border-t border-slate-800 bg-[#151B2B] shrink-0">
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask about candidates, jobs, or interview questions..."
              disabled={isLoading}
              className="flex-1 bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-[#3978F6] to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold text-xs flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-blue-500/20"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400 px-1">
            <span>Powered by AgentRouter API</span>
            <span className="text-emerald-400 font-medium">Model: gpt-6-astra</span>
          </div>
        </div>
      </div>
    </div>
  );
};

