import React, { useState } from 'react';
import { X, ThumbsUp, Sparkles, Check } from 'lucide-react';
import { api } from '../../services/api';
import { useLearner } from '../../context/LearnerContext';

export const FeedbackModal: React.FC = () => {
  const { activeFeedbackId, openFeedback, profile, refreshLearnerData } = useLearner();
  const [difficulty, setDifficulty] = useState<string>('Just Right');
  const [preference, setPreference] = useState<string>('More practice');
  const [comment, setComment] = useState<string>('');
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  if (!activeFeedbackId) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSubmitting(true);
    try {
      await api.submitFeedback({
        profile_id: profile.id,
        resource_id: activeFeedbackId,
        difficulty_feedback: difficulty,
        next_preference: preference,
        comment: comment.trim() || undefined
      });
      setSubmitted(true);
      await refreshLearnerData();
      setTimeout(() => {
        setSubmitted(false);
        openFeedback(null);
      }, 1500);
    } catch (err) {
      console.error('Failed to submit feedback:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="glass-panel-glow rounded-2xl w-full max-w-md p-6 relative border border-slate-700 text-slate-100 shadow-2xl">
        <button
          onClick={() => openFeedback(null)}
          className="absolute top-5 right-5 p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {submitted ? (
          <div className="py-8 flex flex-col items-center justify-center space-y-3 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Check className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Feedback Recorded!</h3>
            <p className="text-xs text-slate-400">
              PathFinder AI has adjusted your recommendation scoring and roadmap pacing.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Learning Adaptation Feedback</span>
              </div>
              <h2 className="text-lg font-bold text-white">How was this module?</h2>
              <p className="text-xs text-slate-400 mt-0.5">Your rating recalibrates future content difficulty.</p>
            </div>

            {/* Difficulty Options */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-300">Difficulty Assessment</label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {['Too Easy', 'Just Right', 'Too Difficult'].map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setDifficulty(opt)}
                    className={`py-2 px-2.5 rounded-xl border text-center transition-all ${
                      difficulty === opt
                        ? 'bg-emerald-500/15 border-emerald-500 text-emerald-400 font-bold shadow-sm'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Next Preference */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-300">What would you prefer next?</label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  'More practice',
                  'More theory',
                  'More projects',
                  'Shorter lessons',
                  'Advanced content'
                ].map((pref) => (
                  <button
                    key={pref}
                    type="button"
                    onClick={() => setPreference(pref)}
                    className={`py-2 px-2.5 rounded-xl border text-left transition-all ${
                      preference === pref
                        ? 'bg-blue-500/15 border-blue-500 text-blue-400 font-bold'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    {pref}
                  </button>
                ))}
              </div>
            </div>

            {/* Optional Comment */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Notes or Difficult Concepts (Optional)</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="e.g. Struggled with mathematical derivation of backprop..."
                rows={2}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            {/* Submit */}
            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => openFeedback(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-medium text-xs hover:bg-slate-700"
              >
                Skip
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition-all flex items-center space-x-1.5"
              >
                <span>Save Feedback</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
