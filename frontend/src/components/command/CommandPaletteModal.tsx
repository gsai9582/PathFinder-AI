import React, { useState, useEffect, useRef } from 'react';
import {
  Search, X, Compass, Bot, Award, Target, Sliders, Calendar,
  Printer, Trophy, Zap, ArrowRight, FolderGit2, BookOpen, Layers, CheckCircle2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLearner } from '../../context/LearnerContext';

interface CommandOption {
  id: string;
  title: string;
  category: 'Navigation' | 'Actions' | 'Tools' | 'Search Result';
  icon: React.ReactNode;
  shortcut?: string;
  perform: () => void;
}

export const CommandPaletteModal: React.FC = () => {
  const {
    isCommandPaletteOpen,
    toggleCommandPalette,
    toggleChat,
    toggleWhatIf,
    toggleDailyPlan,
    toggleFocusMode,
    toggleCareerCompare,
    toggleExportPath,
    toggleAchievements,
    focusTaskTitle
  } = useLearner();

  const navigate = useNavigate();
  const [query, setQuery] = useState<string>('');
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isCommandPaletteOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  const baseCommands: CommandOption[] = [
    // Navigation
    {
      id: 'nav-roadmap',
      title: 'Go to Adaptive Roadmap',
      category: 'Navigation',
      icon: <Compass className="w-4 h-4 text-emerald-400" />,
      perform: () => {
        toggleCommandPalette(false);
        navigate('/roadmap');
      }
    },
    {
      id: 'nav-skill-gaps',
      title: 'View Skill Gaps & Radar Analysis',
      category: 'Navigation',
      icon: <Target className="w-4 h-4 text-cyan-400" />,
      perform: () => {
        toggleCommandPalette(false);
        navigate('/skill-gap');
      }
    },
    {
      id: 'nav-assessments',
      title: 'Start Diagnostic Assessment',
      category: 'Navigation',
      icon: <Award className="w-4 h-4 text-amber-400" />,
      perform: () => {
        toggleCommandPalette(false);
        navigate('/assessments');
      }
    },
    {
      id: 'nav-projects',
      title: 'Explore Recommended Projects',
      category: 'Navigation',
      icon: <FolderGit2 className="w-4 h-4 text-purple-400" />,
      perform: () => {
        toggleCommandPalette(false);
        navigate('/projects');
      }
    },
    {
      id: 'nav-recommendations',
      title: 'Explore Learning Resources & Courses',
      category: 'Navigation',
      icon: <BookOpen className="w-4 h-4 text-emerald-400" />,
      perform: () => {
        toggleCommandPalette(false);
        navigate('/recommendations');
      }
    },
    {
      id: 'nav-analytics',
      title: 'View Career Readiness Analytics',
      category: 'Navigation',
      icon: <Layers className="w-4 h-4 text-indigo-400" />,
      perform: () => {
        toggleCommandPalette(false);
        navigate('/analytics');
      }
    },

    // Actions & Tools
    {
      id: 'act-focus',
      title: `Start Focus Mode: ${focusTaskTitle || 'Decision Trees'}`,
      category: 'Actions',
      icon: <Zap className="w-4 h-4 text-emerald-400" />,
      shortcut: 'F',
      perform: () => {
        toggleCommandPalette(false);
        toggleFocusMode(true);
      }
    },
    {
      id: 'act-daily-plan',
      title: 'Generate & View Daily Learning Plan',
      category: 'Actions',
      icon: <Calendar className="w-4 h-4 text-cyan-400" />,
      shortcut: 'D',
      perform: () => {
        toggleCommandPalette(false);
        toggleDailyPlan(true);
      }
    },
    {
      id: 'act-what-if',
      title: 'Simulate My Path (What-If Roadmap Simulator)',
      category: 'Tools',
      icon: <Sliders className="w-4 h-4 text-purple-400" />,
      shortcut: 'W',
      perform: () => {
        toggleCommandPalette(false);
        toggleWhatIf(true);
      }
    },
    {
      id: 'act-career-compare',
      title: 'Compare Career Goals & Pivot Analysis',
      category: 'Tools',
      icon: <Target className="w-4 h-4 text-indigo-400" />,
      perform: () => {
        toggleCommandPalette(false);
        toggleCareerCompare(true);
      }
    },
    {
      id: 'act-export-path',
      title: 'Export My Path (PDF & Printable Audit)',
      category: 'Tools',
      icon: <Printer className="w-4 h-4 text-blue-400" />,
      perform: () => {
        toggleCommandPalette(false);
        toggleExportPath(true);
      }
    },
    {
      id: 'act-achievements',
      title: 'View Milestone Achievements',
      category: 'Tools',
      icon: <Trophy className="w-4 h-4 text-amber-400" />,
      perform: () => {
        toggleCommandPalette(false);
        toggleAchievements(true);
      }
    },
    {
      id: 'act-chat-ai',
      title: 'Ask PathFinder AI Assistant',
      category: 'Actions',
      icon: <Bot className="w-4 h-4 text-emerald-400" />,
      shortcut: 'A',
      perform: () => {
        toggleCommandPalette(false);
        toggleChat(true);
      }
    }
  ];

  // Dynamic searchable items across skills, projects, courses
  const searchResults: CommandOption[] = [
    {
      id: 'res-dt',
      title: 'Course: Decision Trees & Information Gain (Scikit-Learn)',
      category: 'Search Result',
      icon: <BookOpen className="w-4 h-4 text-cyan-400" />,
      perform: () => {
        toggleCommandPalette(false);
        navigate('/roadmap');
      }
    },
    {
      id: 'res-churn',
      title: 'Project: Customer Churn Prediction & Model Explainability',
      category: 'Search Result',
      icon: <FolderGit2 className="w-4 h-4 text-purple-400" />,
      perform: () => {
        toggleCommandPalette(false);
        navigate('/projects');
      }
    },
    {
      id: 'res-rag',
      title: 'Project: Production RAG Document Assistant with Vector Indexing',
      category: 'Search Result',
      icon: <FolderGit2 className="w-4 h-4 text-purple-400" />,
      perform: () => {
        toggleCommandPalette(false);
        navigate('/projects');
      }
    },
    {
      id: 'res-stats',
      title: 'Skill: Statistics & Hypothesis Testing Diagnostic Check',
      category: 'Search Result',
      icon: <Award className="w-4 h-4 text-amber-400" />,
      perform: () => {
        toggleCommandPalette(false);
        navigate('/assessments');
      }
    },
    {
      id: 'res-python',
      title: 'Skill: Python Core Foundations & Data Structures',
      category: 'Search Result',
      icon: <Target className="w-4 h-4 text-emerald-400" />,
      perform: () => {
        toggleCommandPalette(false);
        navigate('/skill-gap');
      }
    }
  ];

  const allItems = [...baseCommands, ...searchResults];
  const filtered = query.trim()
    ? allItems.filter(i =>
        i.title.toLowerCase().includes(query.toLowerCase()) ||
        i.category.toLowerCase().includes(query.toLowerCase())
      )
    : baseCommands;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % Math.max(1, filtered.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filtered.length) % Math.max(1, filtered.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        filtered[selectedIndex].perform();
      }
    } else if (e.key === 'Escape') {
      toggleCommandPalette(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-start justify-center p-4 pt-20 animate-fade-in">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-scale-in">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center space-x-3">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search skills, projects, roadmap, assessments... (Press Esc to close)"
            className="flex-1 bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
          />
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
            ESC
          </span>
        </div>

        {/* Filtered Command List */}
        <div className="p-2 space-y-1 max-h-[60vh] overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No matching commands or resources found for "{query}".
            </div>
          ) : (
            filtered.map((cmd, idx) => (
              <button
                key={cmd.id}
                onClick={cmd.perform}
                onMouseEnter={() => setSelectedIndex(idx)}
                className={`w-full p-3 rounded-xl flex items-center justify-between text-left text-xs transition-colors ${
                  selectedIndex === idx
                    ? 'bg-emerald-500/10 text-white border border-emerald-500/30'
                    : 'text-slate-300 hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                <div className="flex items-center space-x-3 truncate">
                  <div className="p-1.5 rounded-lg bg-slate-800/80 shrink-0">
                    {cmd.icon}
                  </div>
                  <span className="truncate font-medium">{cmd.title}</span>
                </div>

                <div className="flex items-center space-x-2 shrink-0 ml-3">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">
                    {cmd.category}
                  </span>
                  {cmd.shortcut && (
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                      {cmd.shortcut}
                    </span>
                  )}
                  <ArrowRight className={`w-3.5 h-3.5 ${selectedIndex === idx ? 'text-emerald-400' : 'text-slate-600'}`} />
                </div>
              </button>
            ))
          )}
        </div>

        {/* Footer shortcuts hint */}
        <div className="p-3 bg-slate-950/70 border-t border-slate-800/80 text-[11px] text-slate-500 flex items-center justify-between px-4">
          <div className="flex items-center space-x-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>Esc Close</span>
          </div>
          <span className="text-emerald-400 font-semibold">PathFinder Command Center</span>
        </div>
      </div>
    </div>
  );
};
