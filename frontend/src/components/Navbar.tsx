import React from 'react';
import { Shield, Download } from 'lucide-react';
import { GithubIcon } from './GithubIcon';
import { AUTHOR_DETAILS } from '../data/dissertation';

interface NavbarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeSection, setActiveSection }) => {
  const navItems = [
    { id: 'playground', label: 'Live Playground' },
    { id: 'research', label: 'Research & Benchmarks' },
    { id: 'architecture', label: 'MLOps Architecture' },
    { id: 'about', label: 'About & Author' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-mocha-surface0/80 bg-mocha-crust/85 backdrop-blur-md transition-all">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-mocha-mauve to-mocha-lavender shadow-md shadow-mocha-mauve/20">
            <Shield className="h-5 w-5 text-mocha-crust stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-tight text-mocha-text text-base sm:text-lg">
                HateSpeech<span className="text-mocha-mauve">.AI</span>
              </span>
              <span className="rounded-md border border-mocha-mauve/30 bg-mocha-mauve/10 px-1.5 py-0.5 text-[10px] font-semibold text-mocha-mauve">
                DistilBERT
              </span>
            </div>
            <p className="text-[11px] text-mocha-subtext0 hidden sm:block">Production MLOps Platform</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 rounded-xl border border-mocha-surface0 bg-mocha-mantle/80 p-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveSection(item.id);
                document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
                activeSection === item.id
                  ? 'bg-mocha-mauve text-mocha-crust shadow-sm'
                  : 'text-mocha-subtext0 hover:bg-mocha-surface0 hover:text-mocha-text'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Live Cloud Status & External Links */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Pulsing Status Beacon */}
          <div className="hidden lg:flex items-center gap-2 rounded-full border border-mocha-green/25 bg-mocha-green/10 px-3 py-1 text-xs font-medium text-mocha-green">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-mocha-green opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-mocha-green"></span>
            </span>
            <span>AWS EKS Cluster • Online</span>
          </div>

          {/* Download Dissertation Button */}
          <a
            href={AUTHOR_DETAILS.pdfPath}
            download="Hate_Speech_Classification_Dissertation.pdf"
            className="flex items-center gap-1.5 rounded-lg border border-mocha-lavender/30 bg-mocha-lavender/10 px-3 py-1.5 text-xs font-semibold text-mocha-lavender transition-all hover:bg-mocha-lavender/20 hover:border-mocha-lavender/50"
            title="Download Full Dissertation PDF"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">PDF</span>
            <span className="text-[10px] opacity-75">({AUTHOR_DETAILS.pdfSize})</span>
          </a>

          {/* GitHub Repo Link */}
          <a
            href={AUTHOR_DETAILS.github}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-lg border border-mocha-surface0 bg-mocha-surface0/60 p-2 text-mocha-text transition-all hover:bg-mocha-surface1 hover:text-mocha-mauve"
            title="View GitHub Repository"
          >
            <GithubIcon className="h-4 w-4" />
          </a>
        </div>
      </div>
    </header>
  );
};
