import React from 'react';
import { Shield } from 'lucide-react';
import { GithubIcon } from './GithubIcon';
import { AUTHOR_DETAILS } from '../data/dissertation';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-mocha-surface0 bg-mocha-crust py-8 text-xs text-mocha-subtext0">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
        
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-mocha-mauve" />
          <span className="font-semibold text-mocha-text">HateSpeech.AI</span>
          <span>&bull;</span>
          <span>MSc Dissertation Research by {AUTHOR_DETAILS.name}</span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <span>FastAPI</span>
          <span>&bull;</span>
          <span>spaCy DistilBERT</span>
          <span>&bull;</span>
          <span>AWS EKS</span>
          <span>&bull;</span>
          <span>Terraform</span>
          <span>&bull;</span>
          <span>Prometheus</span>
          <span>&bull;</span>
          <span>GitHub Actions</span>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={AUTHOR_DETAILS.github}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-mocha-subtext1 hover:text-mocha-mauve transition-colors"
          >
            <GithubIcon className="h-3.5 w-3.5" />
            <span>GitHub</span>
          </a>
        </div>

      </div>
    </footer>
  );
};
