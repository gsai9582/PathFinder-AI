import React, { useState } from 'react';
import { AppSidebar } from '../components/common/AppSidebar';
import { TopNav } from '../components/common/TopNav';
import { MobileBottomNav } from '../components/common/MobileBottomNav';
import { AskPathfinderButton } from '../components/ui/AskPathfinderButton';
import { WhyThisModal } from '../components/common/WhyThisModal';
import { FeedbackModal } from '../components/common/FeedbackModal';
import { WhatIfDrawer } from '../components/roadmap/WhatIfDrawer';
import { AIAssistantDrawer } from '../components/chat/AIAssistantDrawer';
import { WhatIfSimulatorModal } from '../components/modals/WhatIfSimulatorModal';
import { FocusModeModal } from '../components/modals/FocusModeModal';
import { DailyPlanModal } from '../components/modals/DailyPlanModal';
import { CareerGoalComparisonModal } from '../components/modals/CareerGoalComparisonModal';
import { ExportPathModal } from '../components/modals/ExportPathModal';
import { AchievementsModal } from '../components/modals/AchievementsModal';
import { CommandPaletteModal } from '../components/command/CommandPaletteModal';
import { X } from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100 font-sans">
      {/* Desktop & Tablet Sidebar */}
      <div className="hidden md:block">
        <AppSidebar />
      </div>

      {/* Mobile Drawer Backdrop & Sidebar */}
      {isMobileDrawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm animate-fade-in"
            onClick={() => setIsMobileDrawerOpen(false)}
          />
          <div className="relative z-10 w-72 bg-slate-950 h-full flex flex-col justify-between border-r border-slate-800 animate-slide-up">
            <button
              onClick={() => setIsMobileDrawerOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <div onClick={() => setIsMobileDrawerOpen(false)}>
              <AppSidebar />
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <TopNav onMobileMenuToggle={() => setIsMobileDrawerOpen(true)} />
        
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-20 md:pb-8">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav />

      {/* Global Floating AI Action Button */}
      <AskPathfinderButton />

      {/* Global Modals & Persistent AI Drawers */}
      <WhyThisModal />
      <FeedbackModal />
      <WhatIfDrawer />
      <AIAssistantDrawer />

      {/* Advanced UX Modals */}
      <WhatIfSimulatorModal />
      <FocusModeModal />
      <DailyPlanModal />
      <CareerGoalComparisonModal />
      <ExportPathModal />
      <AchievementsModal />
      <CommandPaletteModal />
    </div>
  );
};
