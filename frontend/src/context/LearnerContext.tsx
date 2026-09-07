import React, { createContext, useContext, useState, useEffect } from 'react';
import { LearnerProfile, DashboardData } from '../types';
import { api } from '../services/api';

interface LearnerContextType {
  profile: LearnerProfile | null;
  dashboard: DashboardData | null;
  isLoading: boolean;
  error: string | null;
  isChatOpen: boolean;
  isWhatIfOpen: boolean;
  isDailyPlanOpen: boolean;
  isFocusModeOpen: boolean;
  isCareerCompareOpen: boolean;
  isExportPathOpen: boolean;
  isAchievementsOpen: boolean;
  isCommandPaletteOpen: boolean;
  focusTaskTitle: string;
  isDemoMode: boolean;
  activeWhyThisId: number | null;
  activeFeedbackId: number | null;
  loadDemoLearner: () => Promise<void>;
  resetToNewLearner: () => Promise<void>;
  refreshLearnerData: () => Promise<void>;
  setProfile: (profile: LearnerProfile) => void;
  toggleChat: (open?: boolean) => void;
  toggleWhatIf: (open?: boolean) => void;
  toggleDailyPlan: (open?: boolean) => void;
  toggleFocusMode: (open?: boolean, taskTitle?: string) => void;
  toggleCareerCompare: (open?: boolean) => void;
  toggleExportPath: (open?: boolean) => void;
  toggleAchievements: (open?: boolean) => void;
  toggleCommandPalette: (open?: boolean) => void;
  openWhyThis: (resourceId: number | null) => void;
  openFeedback: (resourceId: number | null) => void;
}

const LearnerContext = createContext<LearnerContextType | undefined>(undefined);

export const LearnerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<LearnerProfile | null>(null);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);

  // Global Modals / Drawers
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [isWhatIfOpen, setIsWhatIfOpen] = useState<boolean>(false);
  const [isDailyPlanOpen, setIsDailyPlanOpen] = useState<boolean>(false);
  const [isFocusModeOpen, setIsFocusModeOpen] = useState<boolean>(false);
  const [isCareerCompareOpen, setIsCareerCompareOpen] = useState<boolean>(false);
  const [isExportPathOpen, setIsExportPathOpen] = useState<boolean>(false);
  const [isAchievementsOpen, setIsAchievementsOpen] = useState<boolean>(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
  const [focusTaskTitle, setFocusTaskTitle] = useState<string>('Decision Trees & Ensemble Methods');
  const [activeWhyThisId, setActiveWhyThisId] = useState<number | null>(null);
  const [activeFeedbackId, setActiveFeedbackId] = useState<number | null>(null);

  // Keyboard shortcut listener for / and Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid triggering when user is actively typing in an input or textarea
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      } else if (e.key === '/' && !isInput) {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const refreshLearnerData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const prof = await api.getProfile();
      setProfile(prof);
      setIsDemoMode(prof?.email?.includes('demo') || false);
      const dash = await api.getDashboard(prof.id);
      setDashboard(dash);
    } catch (err: any) {
      console.warn('Initial profile load fallback:', err);
      try {
        const demoProf = await api.initDemoLearner();
        setProfile(demoProf);
        setIsDemoMode(true);
        const dash = await api.getDashboard(demoProf.id);
        setDashboard(dash);
      } catch (innerErr: any) {
        setError(innerErr.message || 'Failed to initialize learner');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loadDemoLearner = async () => {
    try {
      setIsLoading(true);
      const demoProf = await api.initDemoLearner();
      setProfile(demoProf);
      setIsDemoMode(true);
      const dash = await api.getDashboard(demoProf.id);
      setDashboard(dash);
    } catch (err: any) {
      setError(err.message || 'Failed to switch to Demo Learner');
    } finally {
      setIsLoading(false);
    }
  };

  const resetToNewLearner = async () => {
    try {
      setIsLoading(true);
      const newProf = await api.createProfile({
        full_name: 'New Learner',
        email: `learner.${Date.now()}@example.com`,
        career_goal_id: 1,
        experience_level: 'Beginner',
        weekly_hours: 10,
        target_timeline_months: 6,
        preferred_learning_style: 'Mixed',
        skills: []
      });
      setProfile(newProf);
      setIsDemoMode(false);
      const dash = await api.getDashboard(newProf.id);
      setDashboard(dash);
    } catch (err: any) {
      setError(err.message || 'Failed to reset profile');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshLearnerData();
  }, []);

  return (
    <LearnerContext.Provider
      value={{
        profile,
        dashboard,
        isLoading,
        error,
        isChatOpen,
        isWhatIfOpen,
        isDailyPlanOpen,
        isFocusModeOpen,
        isCareerCompareOpen,
        isExportPathOpen,
        isAchievementsOpen,
        isCommandPaletteOpen,
        focusTaskTitle,
        isDemoMode,
        activeWhyThisId,
        activeFeedbackId,
        loadDemoLearner,
        resetToNewLearner,
        refreshLearnerData,
        setProfile,
        toggleChat: (open) => setIsChatOpen(prev => (open !== undefined ? open : !prev)),
        toggleWhatIf: (open) => setIsWhatIfOpen(prev => (open !== undefined ? open : !prev)),
        toggleDailyPlan: (open) => setIsDailyPlanOpen(prev => (open !== undefined ? open : !prev)),
        toggleFocusMode: (open, taskTitle) => {
          if (taskTitle) setFocusTaskTitle(taskTitle);
          setIsFocusModeOpen(prev => (open !== undefined ? open : !prev));
        },
        toggleCareerCompare: (open) => setIsCareerCompareOpen(prev => (open !== undefined ? open : !prev)),
        toggleExportPath: (open) => setIsExportPathOpen(prev => (open !== undefined ? open : !prev)),
        toggleAchievements: (open) => setIsAchievementsOpen(prev => (open !== undefined ? open : !prev)),
        toggleCommandPalette: (open) => setIsCommandPaletteOpen(prev => (open !== undefined ? open : !prev)),
        openWhyThis: (id) => setActiveWhyThisId(id),
        openFeedback: (id) => setActiveFeedbackId(id)
      }}
    >
      {children}
    </LearnerContext.Provider>
  );
};

export const useLearner = () => {
  const context = useContext(LearnerContext);
  if (!context) {
    throw new Error('useLearner must be used within a LearnerProvider');
  }
  return context;
};
