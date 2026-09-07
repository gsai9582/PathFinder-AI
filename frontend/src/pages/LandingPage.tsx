import React from 'react';
import { HeroSection } from '../components/landing/HeroSection';
import { FeaturesGrid } from '../components/landing/FeaturesGrid';
import { Footer } from '../components/common/Footer';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col justify-between">
      <main className="flex-1">
        <HeroSection />
        <FeaturesGrid />
      </main>
      <Footer />
    </div>
  );
};
