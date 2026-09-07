import React, { useState, useEffect, useRef } from 'react';
import {
  X, Send, Sparkles, ArrowRight, Bot, User, BookOpen, CheckCircle2,
  FolderGit2, Award, Compass, RotateCcw, ExternalLink, Zap, Clock, TrendingUp
} from 'lucide-react';
import { useLearner } from '../../context/LearnerContext';
import { api } from '../../services/api';
import { ChatMessage, ChatCitation, ChatActionLink } from '../../types';
import { useNavigate } from 'react-router-dom';

export const AIAssistantDrawer: React.FC = () => {
  const { isChatOpen, toggleChat, profile, dashboard, toggleWhatIf } = useLearner();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickActionChips = [
    { label: "🎯 Next Best Action", prompt: "What should I learn next?" },
    { label: "⏱️ Plan My Day (2h)", prompt: "I only have 2 hours today." },
    { label: "📊 Explain My Gaps", prompt: "Explain my biggest skill gap." },
    { label: "🛠️ Give Me a Project", prompt: "Give me a project." },
    { label: "⚡ Can I Skip This?", prompt: "Can I skip this?" },
    { label: "📈 How Close Am I?", prompt: "How close am I to my goal?" },
    { label: "🔄 Review Roadmap", prompt: "Change my roadmap. Make it more project-based." }
  ];

  // Load history or initial welcome
  useEffect(() => {
    if (isChatOpen && profile) {
      const loadHistory = async () => {
        try {
          const res = await api.getChatHistory(profile.id);
          if (res.messages && res.messages.length > 0) {
            setMessages(res.messages);
          } else {
            const welcome: ChatMessage = {
              id: 0,
              role: 'assistant',
              content: `👋 Hello **${profile.full_name || 'Alex'}**! I am your **PathFinder AI Learning Companion**.\n\nI have live context on your goal (**${profile.career_goal_title || 'AI/ML Engineer'}**), current readiness score (**${Math.round(dashboard?.career_readiness_score || 48)}%**), and active roadmap phases.\n\nAsk me anything, or tap one of the quick actions below to optimize your study session.`,
              timestamp: new Date().toISOString(),
              suggested_quick_prompts: [
                "What should I learn next?",
                "I only have 2 hours today.",
                "Explain my biggest skill gap.",
                "Give me a project."
              ],
              action_links: [
                { label: "Continue Roadmap", action_type: "navigate", target_url: "/roadmap" },
                { label: "View Skill Gaps", action_type: "navigate", target_url: "/skill-gap" }
              ]
            };
            setMessages([welcome]);
          }
        } catch (err) {
          console.error("Failed to load chat history:", err);
        }
      };
      loadHistory();
    }
  }, [isChatOpen, profile]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  if (!isChatOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || !profile || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now(),
      role: 'user',
      content: text,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await api.sendMessage(profile.id, text);
      setMessages(prev => [...prev, response]);
    } catch (err) {
      console.error('Chat error:', err);
      const fallbackMsg: ChatMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: "*(AI service temporarily unavailable. PathFinder switched to its intelligent fallback.)*\n\nBased on your active roadmap, your top recommendation is **Decision Trees & Ensemble Methods** (Phase 3). Completing this module will boost your Machine Learning confidence and unlock your next portfolio capstone.",
        timestamp: new Date().toISOString(),
        is_fallback: true,
        action_links: [
          { label: "Go to Active Roadmap", action_type: "navigate", target_url: "/roadmap" }
        ]
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (!profile) return;
    try {
      await api.clearChatHistory(profile.id);
      setMessages([]);
      const welcome: ChatMessage = {
        id: Date.now(),
        role: 'assistant',
        content: `Conversation reset. How can I assist your learning path today, **${profile.full_name || 'Alex'}**?`,
        timestamp: new Date().toISOString()
      };
      setMessages([welcome]);
    } catch (err) {
      console.error("Failed to clear chat history:", err);
    }
  };

  const handleActionLinkClick = (action: ChatActionLink) => {
    toggleChat(false);
    if (action.action_type === 'modal' && action.params?.open_what_if) {
      toggleWhatIf(true);
    } else if (action.target_url) {
      navigate(action.target_url);
    }
  };

  const renderCitationIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'lesson':
        return <BookOpen className="w-3 h-3 text-cyan-400" />;
      case 'project':
        return <FolderGit2 className="w-3 h-3 text-purple-400" />;
      case 'assessment':
        return <Award className="w-3 h-3 text-amber-400" />;
      case 'simulator':
        return <Zap className="w-3 h-3 text-emerald-400" />;
      default:
        return <Compass className="w-3 h-3 text-slate-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-sm animate-fade-in flex justify-end">
      <div className="w-full max-w-xl bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl animate-slide-left">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/90 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-emerald-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold text-white">PathFinder AI Assistant</h3>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  LIVE CONTEXT
                </span>
              </div>
              <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <span>{profile?.career_goal_title || 'AI/ML Engineer'}</span>
                <span>•</span>
                <span className="text-emerald-400 font-semibold">{Math.round(dashboard?.career_readiness_score || 48)}% Readiness</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleClearHistory}
              title="Reset conversation"
              className="p-2 rounded-lg bg-slate-800/80 text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => toggleChat(false)}
              className="p-2 rounded-lg bg-slate-800/80 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Action Chips Horizontal Carousel */}
        <div className="px-4 py-2.5 bg-slate-950/50 border-b border-slate-800/60 overflow-x-auto no-scrollbar flex items-center gap-2">
          {quickActionChips.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(chip.prompt)}
              disabled={loading}
              className="text-[11px] font-medium whitespace-nowrap px-3 py-1.5 rounded-full bg-slate-800/90 text-slate-300 border border-slate-700 hover:border-emerald-500/60 hover:text-emerald-300 hover:bg-slate-800 transition-all shrink-0"
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex items-start space-x-2.5 ${m.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}
            >
              <div
                className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center ${
                  m.role === 'user'
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'bg-slate-800 text-emerald-400 border border-slate-700'
                }`}
              >
                {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[88%] rounded-2xl p-4 leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-slate-950/90 border border-slate-800/90 text-slate-200 shadow-sm'
                }`}
              >
                {/* Fallback Notice */}
                {m.is_fallback && (
                  <div className="mb-2.5 px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-300 flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                    <span>PathFinder intelligent fallback engine active</span>
                  </div>
                )}

                <div className="whitespace-pre-wrap font-sans text-xs space-y-2">
                  {m.content}
                </div>

                {/* Citations Card Grid */}
                {m.citations && m.citations.length > 0 && (
                  <div className="mt-3.5 pt-3 border-t border-slate-800/80">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <BookOpen className="w-3 h-3 text-emerald-400" />
                      <span>Context Citations & Resources</span>
                    </p>
                    <div className="space-y-1.5">
                      {m.citations.map((c, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 rounded-lg bg-slate-900/90 border border-slate-800 text-[11px] text-slate-300 hover:border-slate-700 transition-colors"
                        >
                          <div className="flex items-center space-x-2 truncate">
                            {renderCitationIcon(c.resource_type)}
                            <span className="truncate font-medium text-slate-200">{c.title}</span>
                            {c.skill_name && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                                {c.skill_name}
                              </span>
                            )}
                          </div>
                          {c.url && (
                            <a
                              href={c.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-emerald-400 hover:text-emerald-300 shrink-0 ml-2"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Links */}
                {m.action_links && m.action_links.length > 0 && (
                  <div className="mt-3.5 flex flex-wrap gap-2">
                    {m.action_links.map((link, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleActionLinkClick(link)}
                        className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 text-[11px] font-semibold transition-colors shadow-sm"
                      >
                        <span>{link.label}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Suggested follow-up prompt chips */}
                {m.suggested_quick_prompts && m.suggested_quick_prompts.length > 0 && (
                  <div className="mt-3.5 pt-2.5 border-t border-slate-800/60 flex flex-wrap gap-1.5">
                    {m.suggested_quick_prompts.slice(0, 3).map((prompt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSend(prompt)}
                        disabled={loading}
                        className="text-[10px] px-2.5 py-1 rounded-full bg-slate-800/80 text-slate-300 border border-slate-700/80 hover:border-emerald-500/50 hover:text-emerald-300 transition-colors text-left"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                )}

                <div className="mt-2 text-[9px] text-slate-400 flex items-center justify-end">
                  {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center space-x-3 text-slate-400 text-xs py-2 pl-9">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Analyzing learner graph, skill delta, and roadmap...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input */}
        <div className="p-3 border-t border-slate-800 bg-slate-950">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center space-x-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask: 'I only have 2 hours today', 'Give me a project', 'Explain my gaps'..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="p-2.5 rounded-xl bg-emerald-500 text-slate-950 hover:bg-emerald-400 disabled:opacity-40 transition-colors font-bold shadow-md shadow-emerald-500/20"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
