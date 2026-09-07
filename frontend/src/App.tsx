import React from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { LearnerProvider } from './context/LearnerContext';
import { ToastProvider } from './components/ui/Toast';
import { MainLayout } from './layouts/MainLayout';
import { DashboardLayout } from './layouts/DashboardLayout';

// Pages
import { LandingPage } from './pages/LandingPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { DashboardPage } from './pages/DashboardPage';
import { SkillGapPage } from './pages/SkillGapPage';
import { RoadmapPage } from './pages/RoadmapPage';
import { RecommendationsPage } from './pages/RecommendationsPage';
import { AssessmentPage } from './pages/AssessmentPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';

const AppRoutes: React.FC = () => {
  const location = useLocation();
  const isFullWidthPage = location.pathname === '/' || location.pathname === '/onboarding';

  if (isFullWidthPage) {
    return (
      <MainLayout>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </MainLayout>
    );
  }

  return (
    <DashboardLayout>
      <Routes>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/skill-gap" element={<SkillGapPage />} />
        <Route path="/skills" element={<Navigate to="/skill-gap" replace />} />
        <Route path="/roadmap" element={<RoadmapPage />} />
        <Route path="/recommendations" element={<RecommendationsPage />} />
        <Route path="/assessments" element={<AssessmentPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/progress" element={<Navigate to="/analytics" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </DashboardLayout>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ToastProvider>
        <LearnerProvider>
          <AppRoutes />
        </LearnerProvider>
      </ToastProvider>
    </BrowserRouter>
  );
};

export default App;
