import React from 'react';
import { Zap, Activity, Cpu, Sparkles, ArrowRight, BookOpen } from 'lucide-react';
import { AUTHOR_DETAILS } from '../data/dissertation';

interface HeroProps {
  onExplorePlayground: () => void;
  onExploreDissertation: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onExplorePlayground, onExploreDissertation }) => {
  return (
    <section className="relative overflow-hidden pt-8 pb-12 sm:pt-12 sm:pb-16">
      {/* Background ambient gradient glow */}
      <div className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-mocha-mauve/10 via-mocha-sapphire/10 to-transparent blur-3xl" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center">
          
          {/* Top Pill Badge */}
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-mocha-mauve/30 bg-mocha-mauve/10 px-3.5 py-1 text-xs font-semibold text-mocha-mauve backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5" />
            <span>MSc Dissertation MLOps Operationalization</span>
          </div>

          {/* Main Title with Catppuccin Gradient */}
          <h1 className="max-w-4xl text-3xl font-extrabold tracking-tight text-mocha-text sm:text-5xl lg:text-6xl leading-[1.15]">
            DistilBERT Hate Speech{' '}
            <span className="bg-gradient-to-r from-mocha-mauve via-mocha-lavender to-mocha-sky bg-clip-text text-transparent">
              Classifier &amp; MLOps
            </span>
          </h1>

          {/* Subtitle with Author Research Recognition */}
          <p className="mt-4 max-w-2xl text-sm sm:text-base text-mocha-subtext0 leading-relaxed">
            Operationalizing fine-tuned transformer research by <span className="font-semibold text-mocha-text">{AUTHOR_DETAILS.name}</span> ({AUTHOR_DETAILS.degree}) into a production-grade, observable cloud-native classification engine on <span className="font-semibold text-mocha-lavender">AWS EKS</span>.
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={onExplorePlayground}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-mocha-mauve to-mocha-lavender px-5 py-2.5 text-sm font-bold text-mocha-crust shadow-lg shadow-mocha-mauve/20 transition-all hover:scale-[1.02] hover:shadow-mocha-mauve/30 active:scale-[0.98]"
            >
              <Zap className="h-4 w-4" />
              <span>Launch Live Inference Studio</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            <button
              onClick={onExploreDissertation}
              className="inline-flex items-center gap-2 rounded-xl border border-mocha-surface1 bg-mocha-mantle px-5 py-2.5 text-sm font-semibold text-mocha-text transition-all hover:bg-mocha-surface0 hover:border-mocha-mauve/40"
            >
              <BookOpen className="h-4 w-4 text-mocha-sapphire" />
              <span>Read Dissertation Research</span>
            </button>
          </div>

          {/* Technology Badges Ribbon */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-mocha-mauve/25 bg-mocha-mauve/10 px-2.5 py-1 font-medium text-mocha-mauve">
              <Cpu className="h-3.5 w-3.5" /> DistilBERT (~66M Params)
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-mocha-lavender/25 bg-mocha-lavender/10 px-2.5 py-1 font-medium text-mocha-lavender">
              ⚡ FastAPI Microservice
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-mocha-sky/25 bg-mocha-sky/10 px-2.5 py-1 font-medium text-mocha-sky">
              ☁️ AWS EKS v1.31
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-mocha-sapphire/25 bg-mocha-sapphire/10 px-2.5 py-1 font-medium text-mocha-sapphire">
              🏗️ Terraform IaC
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-mocha-peach/25 bg-mocha-peach/10 px-2.5 py-1 font-medium text-mocha-peach">
              🚀 GitHub Actions CI/CD
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-mocha-teal/25 bg-mocha-teal/10 px-2.5 py-1 font-medium text-mocha-teal">
              <Activity className="h-3.5 w-3.5" /> Prometheus &amp; Grafana
            </span>
          </div>

          {/* 4-Tile Stats Grid */}
          <div className="mt-10 grid w-full max-w-5xl grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            <div className="rounded-2xl border border-mocha-surface0 bg-mocha-mantle/70 p-4 text-center backdrop-blur-sm">
              <p className="text-2xl sm:text-3xl font-extrabold text-mocha-mauve">&lt; 15ms</p>
              <p className="mt-1 text-xs font-semibold text-mocha-subtext0 uppercase tracking-wider">Inference Latency</p>
            </div>

            <div className="rounded-2xl border border-mocha-surface0 bg-mocha-mantle/70 p-4 text-center backdrop-blur-sm">
              <p className="text-2xl sm:text-3xl font-extrabold text-mocha-lavender">92.8%</p>
              <p className="mt-1 text-xs font-semibold text-mocha-subtext0 uppercase tracking-wider">Macro ROC-AUC</p>
            </div>

            <div className="rounded-2xl border border-mocha-surface0 bg-mocha-mantle/70 p-4 text-center backdrop-blur-sm">
              <p className="text-2xl sm:text-3xl font-extrabold text-mocha-sky">66.3M</p>
              <p className="mt-1 text-xs font-semibold text-mocha-subtext0 uppercase tracking-wider">Model Parameters</p>
            </div>

            <div className="rounded-2xl border border-mocha-surface0 bg-mocha-mantle/70 p-4 text-center backdrop-blur-sm">
              <p className="text-2xl sm:text-3xl font-extrabold text-mocha-green">93.0%</p>
              <p className="mt-1 text-xs font-semibold text-mocha-subtext0 uppercase tracking-wider">Safe Content F1</p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
