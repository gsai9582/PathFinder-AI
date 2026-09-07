import React, { useState } from 'react';
import { Assessment, AssessmentResult } from '../../types';
import { api } from '../../services/api';
import { useLearner } from '../../context/LearnerContext';
import {
  CheckCircle2,
  XCircle,
  Sparkles,
  AlertTriangle,
  Award,
  ArrowRight,
  RotateCcw,
  Check,
  Zap,
  HelpCircle,
  BrainCircuit,
  Compass,
  TrendingUp,
  Target
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface AssessmentRunnerProps {
  assessment: Assessment;
  onComplete?: () => void;
}

export const AssessmentRunner: React.FC<AssessmentRunnerProps> = ({ assessment, onComplete }) => {
  const { profile, refreshLearnerData } = useLearner();
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [activeQuestionIdx, setActiveQuestionIdx] = useState<number>(0);

  const questions = assessment.questions || [];
  const currentQ = questions[activeQuestionIdx];
  const allAnswered = questions.length > 0 && questions.every(q => !!answers[q.id]);

  const handleSelectOption = (questionId: number, option: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: option }));
  };

  const handleSubmit = async () => {
    if (!profile || submitting) return;
    setSubmitting(true);
    try {
      const res = await api.submitAssessment({
        profile_id: profile.id,
        assessment_id: assessment.id,
        answers
      });
      setResult(res);
      await refreshLearnerData();

      if (res.passed) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    } catch (err) {
      console.error('Submission failed:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetake = () => {
    setAnswers({});
    setResult(null);
    setActiveQuestionIdx(0);
  };

  const getQuestionTypeBadge = (type?: string) => {
    const t = (type || '').toLowerCase();
    if (t === 'scenario') {
      return (
        <span className="px-2.5 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-[10px] font-bold uppercase tracking-wider flex items-center space-x-1">
          <Compass className="w-3 h-3 text-purple-400" />
          <span>Practical Scenario</span>
        </span>
      );
    }
    if (t === 'conceptual') {
      return (
        <span className="px-2.5 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300 text-[10px] font-bold uppercase tracking-wider flex items-center space-x-1">
          <BrainCircuit className="w-3 h-3 text-blue-400" />
          <span>Conceptual Principle</span>
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold uppercase tracking-wider flex items-center space-x-1">
        <HelpCircle className="w-3 h-3 text-emerald-400" />
        <span>Multiple Choice (MCQ)</span>
      </span>
    );
  };

  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-6">
      {/* Assessment Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Diagnostic Knowledge & Skill Calibration</span>
          </div>
          <h2 className="text-xl font-bold text-white">{assessment.title}</h2>
          <p className="text-xs text-slate-400 mt-1">{assessment.description}</p>
        </div>

        <div className="flex items-center space-x-3 text-xs shrink-0">
          <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 font-mono">
            Passing: {assessment.passing_score}%
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-medium">
            {assessment.difficulty}
          </span>
        </div>
      </div>

      {!result ? (
        <div className="space-y-6">
          {/* Question Navigation Tabs */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1">
            {questions.map((q, idx) => (
              <button
                key={q.id}
                onClick={() => setActiveQuestionIdx(idx)}
                className={`w-8 h-8 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center justify-center ${
                  activeQuestionIdx === idx
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : answers[q.id]
                    ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30'
                    : 'bg-slate-900 text-slate-400 border border-slate-800 hover:border-slate-700'
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>

          {/* Current Question */}
          {currentQ && (
            <div className="space-y-4 p-5 rounded-xl bg-slate-950/80 border border-slate-800/80">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center space-x-2">
                  <span>Question {activeQuestionIdx + 1} of {questions.length}</span>
                  {getQuestionTypeBadge(currentQ.question_type)}
                </div>
                <span className="font-mono text-emerald-400">{currentQ.points} points</span>
              </div>

              <h3 className="text-base font-bold text-slate-100 leading-snug pt-1">
                {currentQ.question_text}
              </h3>

              {/* Options */}
              <div className="space-y-2.5 pt-2">
                {currentQ.options.map((option, idx) => {
                  const isSelected = answers[currentQ.id] === option;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(currentQ.id, option)}
                      className={`w-full p-3.5 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-emerald-500/15 border-emerald-500 text-white font-medium shadow-sm'
                          : 'bg-slate-900/90 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
                      }`}
                    >
                      <span>{option}</span>
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          isSelected ? 'border-emerald-500 bg-emerald-500 text-slate-950' : 'border-slate-700'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Question Nav Controls */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => setActiveQuestionIdx(prev => Math.max(0, prev - 1))}
              disabled={activeQuestionIdx === 0}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-medium text-xs disabled:opacity-30 hover:bg-slate-700"
            >
              Previous
            </button>

            {activeQuestionIdx < questions.length - 1 ? (
              <button
                onClick={() => setActiveQuestionIdx(prev => prev + 1)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-200 font-medium text-xs hover:bg-slate-700"
              >
                Next Question
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!allAnswered || submitting}
                className="px-6 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 disabled:opacity-40 transition-all flex items-center space-x-1.5 shadow-lg shadow-emerald-500/20"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{submitting ? 'Calibrating Skill Mastery...' : 'Submit Assessment'}</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Assessment Results Display */
        <div className="space-y-6 animate-slide-up">
          {/* Result Score Banner */}
          <div
            className={`p-6 rounded-2xl border text-center space-y-3 ${
              result.passed
                ? 'bg-gradient-to-b from-emerald-950/40 to-slate-950 border-emerald-500/40'
                : 'bg-gradient-to-b from-rose-950/40 to-slate-950 border-rose-500/40'
            }`}
          >
            <div className="inline-flex p-3 rounded-2xl bg-slate-900 border border-slate-800">
              {result.passed ? (
                <Award className="w-8 h-8 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-8 h-8 text-rose-400" />
              )}
            </div>

            <div>
              <span className={`text-xs font-bold uppercase tracking-wider ${result.passed ? 'text-emerald-400' : 'text-rose-400'}`}>
                {result.passed ? 'Assessment Milestone Achieved' : 'Remedial Reinforcement Scheduled'}
              </span>
              <h3 className="text-4xl font-black text-white mt-1">
                {Math.round(result.percentage)}%
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Score: {result.score} / {result.max_score} points (Passing threshold: {assessment.passing_score}%)
              </p>
            </div>

            {/* Skill Impact & Confidence Transition */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-xs">
                <span className="text-slate-400">{result.skill_name} Proficiency:</span>
                <span className="font-bold text-slate-300">{result.previous_proficiency}%</span>
                <span>→</span>
                <span className="font-bold text-emerald-400">{result.new_proficiency}%</span>
                <span className={`font-bold ${result.proficiency_delta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  ({result.proficiency_delta >= 0 ? '+' : ''}{result.proficiency_delta}%)
                </span>
              </div>

              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-purple-500/30 text-xs">
                <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
                <span className="text-slate-400">{result.skill_name} Confidence:</span>
                <span className="font-bold text-slate-300">{Math.round(result.previous_confidence * 100)}</span>
                <span>→</span>
                <span className="font-bold text-purple-300">{Math.round(result.new_confidence * 100)}</span>
              </div>
            </div>
          </div>

          {/* Recommended Action Card */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/30 to-slate-950 border border-emerald-500/30 space-y-2">
            <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
              <Target className="w-4 h-4 text-emerald-400" />
              <span>Recommended Action</span>
            </div>
            <p className="text-sm font-semibold text-white">
              "{result.recommended_action}"
            </p>
            <p className="text-xs text-slate-300 leading-relaxed font-sans pt-1">
              {result.ai_feedback_advice}
            </p>
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-400 flex items-center space-x-2 mt-2">
              <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span><strong className="text-slate-300">Adaptive Roadmap Mutation:</strong> {result.adaptive_action_taken}</span>
            </div>
          </div>

          {/* Detailed Question Review */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Question-by-Question Review</h4>
            <div className="space-y-2.5">
              {result.question_results.map((q, idx) => (
                <div
                  key={q.question_id}
                  className={`p-4 rounded-xl border text-xs space-y-2.5 ${
                    q.is_correct ? 'bg-slate-950/60 border-emerald-500/30' : 'bg-slate-950/60 border-rose-500/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-200">Question {idx + 1}</span>
                        {getQuestionTypeBadge(q.question_type)}
                      </div>
                      <p className="text-sm font-medium text-white pt-1">{q.question_text}</p>
                    </div>
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full shrink-0 ${
                      q.is_correct ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                    }`}>
                      {q.is_correct ? '+10 pts' : '0 pts'}
                    </span>
                  </div>

                  <div className="text-[12px] space-y-1.5 pt-1">
                    <p className="text-slate-300">
                      Your answer: <strong className={q.is_correct ? 'text-emerald-400' : 'text-rose-400'}>{q.user_answer || 'None'}</strong>
                    </p>
                    {!q.is_correct && (
                      <p className="text-emerald-400 font-medium">
                        Correct answer: <strong>{q.correct_answer}</strong>
                      </p>
                    )}
                    <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-[11px] text-slate-300 leading-relaxed">
                      💡 <strong className="text-slate-200">Explanation:</strong> {q.explanation}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Retake / Continue */}
          <div className="flex justify-end space-x-3 pt-2">
            <button
              onClick={handleRetake}
              className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 flex items-center space-x-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retake Diagnostic</span>
            </button>
            <button
              onClick={onComplete}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold hover:bg-emerald-400 flex items-center space-x-1.5 transition-all shadow-md shadow-emerald-500/20"
            >
              <span>Return to Roadmap</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
