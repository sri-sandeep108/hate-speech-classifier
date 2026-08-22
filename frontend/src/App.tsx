import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { InferenceStudio } from './components/InferenceStudio';
import { DissertationSection } from './components/DissertationSection';
import { ArchitectureSection } from './components/ArchitectureSection';
import { AboutSection } from './components/AboutSection';
import { Footer } from './components/Footer';

export const App: React.FC = () => {
  const [activeSection, setActiveSection] = useState('playground');

  // Determine API Base URL
  // Default to environment variable or proxy or live AWS EKS LoadBalancer
  const apiBaseUrl = import.meta.env.VITE_API_URL || '';

  const scrollTo = (id: string) => {
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-mocha-base text-mocha-text selection:bg-mocha-mauve/25 selection:text-mocha-rosewater flex flex-col">
      {/* Top Navbar */}
      <Navbar activeSection={activeSection} setActiveSection={setActiveSection} />

      {/* Main Content Area */}
      <main className="flex-1">
        <Hero
          onExplorePlayground={() => scrollTo('playground')}
          onExploreDissertation={() => scrollTo('research')}
        />

        <InferenceStudio apiBaseUrl={apiBaseUrl} />

        <DissertationSection />

        <ArchitectureSection />

        <AboutSection />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default App;
