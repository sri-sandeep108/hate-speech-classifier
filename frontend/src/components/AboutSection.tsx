import React from 'react';
import { User, ExternalLink } from 'lucide-react';
import { GithubIcon } from './GithubIcon';
import { AUTHOR_DETAILS } from '../data/dissertation';

export const AboutSection: React.FC = () => {
  return (
    <section id="about" className="scroll-mt-20 border-t border-mocha-surface0/60 bg-mocha-mantle/30 py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-mocha-teal">
            <User className="h-4 w-4" />
            <span>Author &amp; Project Background</span>
          </div>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-mocha-text sm:text-3xl">
            About the Project &amp; Researcher
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          
          {/* Author Profile Card (7 Cols) */}
          <div className="rounded-2xl border border-mocha-surface0 bg-mocha-mantle p-6 shadow-md lg:col-span-7 space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-mocha-mauve to-mocha-lavender text-mocha-crust font-extrabold text-xl shadow-lg shadow-mocha-mauve/20">
                SS
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-mocha-text">{AUTHOR_DETAILS.name}</h3>
                <p className="text-xs font-semibold text-mocha-mauve">{AUTHOR_DETAILS.degree} • ID: {AUTHOR_DETAILS.studentId}</p>
                <p className="text-xs text-mocha-subtext0 mt-0.5">Cloud, DevOps &amp; MLOps Engineer</p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-mocha-subtext0 leading-relaxed pt-2">
              This project bridges academic research and enterprise production engineering. Originally developed as an MSc dissertation evaluating 5 NLP architectures for automated hate speech detection, this repository operationalizes the winning <strong className="text-mocha-text">DistilBERT TextCatEnsemble</strong> pipeline into a cloud-native, observable, highly available microservice system on <strong className="text-mocha-text">AWS EKS</strong>.
            </p>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 pt-2 text-xs">
              <div className="rounded-xl border border-mocha-surface0 bg-mocha-crust/60 p-3">
                <span className="font-bold text-mocha-lavender block mb-1">Academic Research</span>
                <span className="text-mocha-subtext0">Empirical comparison of transformer distillations vs. static embeddings under held-out NLP benchmarks.</span>
              </div>

              <div className="rounded-xl border border-mocha-surface0 bg-mocha-crust/60 p-3">
                <span className="font-bold text-mocha-sky block mb-1">DevOps / MLOps Engineering</span>
                <span className="text-mocha-subtext0">Reproducible IaC (Terraform), Kubernetes (EKS v1.31), Prometheus observability, and automated CI/CD.</span>
              </div>
            </div>
          </div>

          {/* Quick Links & Artifacts Card (5 Cols) */}
          <div className="rounded-2xl border border-mocha-surface0 bg-mocha-mantle p-6 shadow-md lg:col-span-5 flex flex-col justify-between space-y-4">
            <div>
              <h4 className="text-sm font-bold text-mocha-text uppercase tracking-wider mb-3">
                Project Repositories &amp; Artifacts
              </h4>

              <div className="space-y-2.5">
                <a
                  href={AUTHOR_DETAILS.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-xl border border-mocha-surface0 bg-mocha-crust/80 p-3 text-xs font-semibold text-mocha-text transition-all hover:bg-mocha-surface0 hover:border-mocha-mauve/40 hover:text-mocha-mauve"
                >
                  <div className="flex items-center gap-2.5">
                    <GithubIcon className="h-4 w-4 text-mocha-mauve" />
                    <div>
                      <p className="font-bold">GitHub Repository</p>
                      <p className="text-[10px] text-mocha-subtext0 font-mono">sri-sandeep108/hate-speech-classifier</p>
                    </div>
                  </div>
                  <ExternalLink className="h-3.5 w-3.5 text-mocha-subtext0" />
                </a>

                <a
                  href={AUTHOR_DETAILS.huggingFace}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-xl border border-mocha-surface0 bg-mocha-crust/80 p-3 text-xs font-semibold text-mocha-text transition-all hover:bg-mocha-surface0 hover:border-mocha-sky/40 hover:text-mocha-sky"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">🤗</span>
                    <div>
                      <p className="font-bold">Hugging Face Model Hub</p>
                      <p className="text-[10px] text-mocha-subtext0 font-mono">thenewguyhere/hate-speech-distilbert</p>
                    </div>
                  </div>
                  <ExternalLink className="h-3.5 w-3.5 text-mocha-subtext0" />
                </a>
              </div>
            </div>

            <div className="rounded-xl border border-mocha-mauve/20 bg-mocha-mauve/5 p-3.5 text-xs text-mocha-subtext1">
              <span className="font-bold text-mocha-mauve block mb-1">Production Deployment:</span>
              <span>Running live on AWS Elastic Kubernetes Service (EKS) provisioned entirely through Terraform IaC.</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
