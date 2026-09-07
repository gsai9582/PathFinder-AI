import React from 'react';
import { OnboardingWizard } from '../components/onboarding/OnboardingWizard';
import { Footer } from '../components/common/Footer';

export const OnboardingPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col justify-between">
      <main className="flex-1">
        <OnboardingWizard />
      </main>
      <Footer />
    </div>
  );
};
