import React from 'react';
import { Navbar } from '../components/common/Navbar';
import { AskPathfinderButton } from '../components/ui/AskPathfinderButton';
import { AIAssistantDrawer } from '../components/chat/AIAssistantDrawer';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans">
      <Navbar />
      <main className="flex-1 w-full max-w-7xl mx-auto">
        {children}
      </main>
      <AskPathfinderButton />
      <AIAssistantDrawer />
    </div>
  );
};
