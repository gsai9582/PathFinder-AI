import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Assessment, Skill } from '../types';
import { useLearner } from '../context/LearnerContext';
import { AssessmentRunner } from '../components/assessment/AssessmentRunner';
import { StatusBadge } from '../components/common/StatusBadge';
import {
  CheckSquare,
  Sparkles,
  Plus,
  BrainCircuit,
  Award,
  Zap,
  HelpCircle,
  X,
  Compass,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AssessmentPage: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useLearner();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [activeAssessment, setActiveAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Generate Modal State
  const [generateModalOpen, setGenerateModalOpen] = useState<boolean>(false);
  const [selectedSkillId, setSelectedSkillId] = useState<number | undefined>(undefined);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('Intermediate');
  const [generating, setGenerating] = useState<boolean>(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [list, skillsList] = await Promise.all([
        api.getAssessments(),
        api.getSkills()
      ]);
      setAssessments(list);
      setSkills(skillsList);
      if (list.length > 0) {
        const full = await api.getAssessment(list[0].id);
        setActiveAssessment(full);
      }
    } catch (err) {
      console.error('Failed to load assessment data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAssessment = async (id: number) => {
    setLoading(true);
    try {
      const full = await api.getAssessment(id);
      setActiveAssessment(full);
    } catch (err) {
      console.error('Failed to load assessment:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAssessment = async () => {
    setGenerating(true);
    try {
      const selectedSkill = skills.find(s => s.id === selectedSkillId);
      const generated = await api.generateAssessment({
        skill_id: selectedSkillId,
        skill_name: selectedSkill?.name || 'Machine Learning',
        difficulty: selectedDifficulty,
        career_goal: profile?.career_goal_title || 'AI/ML Engineer',
        question_count: 4
      });
      setAssessments(prev => [generated, ...prev]);
      setActiveAssessment(generated);
      setGenerateModalOpen(false);
    } catch (err) {
      console.error('Failed to generate assessment:', err);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-8 pb-16 animate-fade-in">
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-2xl glass-panel border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden">
        <div className="space-y-2 relative z-10 max-w-2xl">
          <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
            <CheckSquare className="w-4 h-4" />
            <span>Adaptive Diagnostic Hub & Skill Verification</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Skill Verification & Diagnostic Engine
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Diagnose skill mastery, calibrate confidence scores, and trigger real-time roadmap adaptations. Scoring &ge;85% triggers accelerated progression; scoring &lt;60% triggers targeted remediation.
          </p>
        </div>

        <button
          onClick={() => setGenerateModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold text-xs hover:brightness-110 transition-all flex items-center space-x-2 shrink-0 shadow-lg shadow-emerald-500/20"
        >
          <Sparkles className="w-4 h-4" />
          <span>Generate AI Assessment</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Assessment Selection List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Available Diagnostic Tests</h3>
            <span className="text-xs text-slate-500 font-mono">{assessments.length} Tests</span>
          </div>

          <div className="space-y-2.5">
            {assessments.map((a) => {
              const isSelected = activeAssessment?.id === a.id;
              return (
                <div
                  key={a.id}
                  onClick={() => handleSelectAssessment(a.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all space-y-2.5 ${
                    isSelected
                      ? 'bg-emerald-500/10 border-emerald-500 shadow-md shadow-emerald-950/40'
                      : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400">{a.skill_name}</span>
                    <StatusBadge status={a.difficulty} size="sm" />
                  </div>
                  <h4 className="text-sm font-bold text-white leading-snug">{a.title}</h4>
                  <div className="flex justify-between text-[11px] text-slate-400 font-mono pt-1 border-t border-slate-800/80">
                    <span>{a.questions_count || 4} Questions (MCQ / Scenario)</span>
                    <span>Pass: {a.passing_score}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Assessment Runner Area */}
        <div className="lg:col-span-2">
          {loading ? (
            <div className="py-24 flex flex-col items-center justify-center space-y-3 glass-panel rounded-2xl border border-slate-800">
              <Sparkles className="w-8 h-8 text-emerald-400 animate-spin" />
              <p className="text-sm text-slate-400 font-medium">Loading Diagnostic Assessment...</p>
            </div>
          ) : activeAssessment ? (
            <AssessmentRunner
              assessment={activeAssessment}
              onComplete={() => navigate('/roadmap')}
            />
          ) : null}
        </div>
      </div>

      {/* Generate AI Assessment Modal */}
      {generateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="glass-panel w-full max-w-lg rounded-2xl p-6 border border-slate-800 space-y-5 bg-slate-900 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Generate AI Diagnostic Assessment</h3>
              </div>
              <button
                onClick={() => setGenerateModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              PathFinder AI dynamically formulates challenging conceptual and scenario-based questions tailored to your career goal.
            </p>

            {/* Select Skill */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Target Skill</label>
              <select
                value={selectedSkillId || ''}
                onChange={(e) => setSelectedSkillId(Number(e.target.value) || undefined)}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="">Select a skill to test...</option>
                {skills.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.category})</option>
                ))}
              </select>
            </div>

            {/* Select Difficulty */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Difficulty Level</label>
              <div className="grid grid-cols-3 gap-2">
                {['Beginner', 'Intermediate', 'Advanced'].map(diff => (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => setSelectedDifficulty(diff)}
                    className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                      selectedDifficulty === diff
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end space-x-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setGenerateModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleGenerateAssessment}
                disabled={generating}
                className="px-5 py-2 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold hover:bg-emerald-400 disabled:opacity-40 flex items-center space-x-1.5 shadow-md shadow-emerald-500/20"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{generating ? 'Generating Questions...' : 'Generate & Start'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
