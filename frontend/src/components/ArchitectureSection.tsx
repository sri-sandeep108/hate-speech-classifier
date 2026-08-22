import React, { useState } from 'react';
import { 
  Layers, 
  Zap, 
  Box, 
  Cpu, 
  Activity, 
  Cloud, 
  GitBranch, 
  Code2, 
  Check, 
  Copy,
  ChevronRight
} from 'lucide-react';
import { ARCHITECTURE_LAYERS } from '../data/architecture';

export const ArchitectureSection: React.FC = () => {
  const [selectedLayerIndex, setSelectedLayerIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const currentLayer = ARCHITECTURE_LAYERS[selectedLayerIndex];

  const getLayerIcon = (iconName: string) => {
    switch (iconName) {
      case 'Zap': return <Zap className="h-4 w-4" />;
      case 'Box': return <Box className="h-4 w-4" />;
      case 'Cpu': return <Cpu className="h-4 w-4" />;
      case 'Activity': return <Activity className="h-4 w-4" />;
      case 'Cloud': return <Cloud className="h-4 w-4" />;
      case 'GitBranch': return <GitBranch className="h-4 w-4" />;
      default: return <Layers className="h-4 w-4" />;
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="architecture" className="scroll-mt-20 py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-mocha-sky">
            <Layers className="h-4 w-4" />
            <span>End-to-End Cloud-Native Architecture</span>
          </div>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-mocha-text sm:text-3xl">
            6-Layer Production MLOps Blueprint
          </h2>
          <p className="mt-1 text-sm text-mocha-subtext0">
            Explore the incremental DevOps layers bridging research notebooks to an observable, resilient AWS Kubernetes deployment.
          </p>
        </div>

        {/* 6 Layer Selectors / Tabs */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {ARCHITECTURE_LAYERS.map((layer, idx) => (
            <button
              key={layer.layer}
              onClick={() => setSelectedLayerIndex(idx)}
              className={`flex flex-col items-start rounded-xl border p-3.5 text-left transition-all ${
                selectedLayerIndex === idx
                  ? 'border-mocha-mauve bg-mocha-mauve/10 shadow-md shadow-mocha-mauve/10 ring-1 ring-mocha-mauve'
                  : 'border-mocha-surface0 bg-mocha-mantle hover:bg-mocha-surface0/60 hover:border-mocha-surface1'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className={`text-[10px] font-bold uppercase ${
                  selectedLayerIndex === idx ? 'text-mocha-mauve' : 'text-mocha-subtext0'
                }`}>
                  Layer {layer.layer}
                </span>
                <span className={selectedLayerIndex === idx ? 'text-mocha-mauve' : 'text-mocha-subtext0'}>
                  {getLayerIcon(layer.icon)}
                </span>
              </div>
              <span className="mt-1 text-xs font-bold text-mocha-text line-clamp-1">
                {layer.title.split('(')[0]}
              </span>
            </button>
          ))}
        </div>

        {/* Active Layer Deep Dive Card */}
        <div className="mt-6 rounded-2xl border border-mocha-surface0 bg-mocha-mantle p-6 shadow-xl shadow-black/20">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            
            {/* Left Column: Details (7 Cols) */}
            <div className="space-y-4 lg:col-span-7">
              
              <div className="flex items-center gap-2">
                <span className="rounded-lg border border-mocha-mauve/30 bg-mocha-mauve/10 px-2.5 py-1 text-xs font-bold text-mocha-mauve">
                  Layer {currentLayer.layer}
                </span>
                <h3 className="text-xl font-extrabold text-mocha-text">
                  {currentLayer.title}
                </h3>
              </div>

              <p className="text-xs font-semibold text-mocha-lavender">
                {currentLayer.subtitle}
              </p>

              <p className="text-xs sm:text-sm text-mocha-subtext0 leading-relaxed">
                {currentLayer.description}
              </p>

              {/* Highlights List */}
              <div className="space-y-2 pt-2">
                <p className="text-xs font-bold text-mocha-text uppercase tracking-wider">Key Architectural Specs:</p>
                {currentLayer.highlights.map((highlight, hIdx) => (
                  <div key={hIdx} className="flex items-start gap-2 text-xs text-mocha-subtext1">
                    <ChevronRight className="h-4 w-4 shrink-0 text-mocha-mauve mt-0.5" />
                    <span>{highlight}</span>
                  </div>
                ))}
              </div>

              {/* Technology Badges */}
              <div className="pt-3">
                <p className="text-[11px] font-semibold text-mocha-subtext0 uppercase tracking-wider mb-2">Stack Components:</p>
                <div className="flex flex-wrap gap-1.5">
                  {currentLayer.tech.map((t, tIdx) => (
                    <span
                      key={tIdx}
                      className="rounded-md border border-mocha-surface0 bg-mocha-surface0/60 px-2.5 py-1 text-[11px] font-mono text-mocha-text"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

            </div>

            {/* Right Column: Code Snippet (5 Cols) */}
            {currentLayer.codeSnippet && (
              <div className="space-y-2 lg:col-span-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-mono text-mocha-subtext0">
                    <Code2 className="h-3.5 w-3.5 text-mocha-mauve" />
                    <span>{currentLayer.codeSnippet.filename}</span>
                  </div>

                  <button
                    onClick={() => handleCopyCode(currentLayer.codeSnippet!.code)}
                    className="flex items-center gap-1 rounded border border-mocha-surface0 bg-mocha-crust px-2 py-1 text-[11px] text-mocha-subtext0 transition-all hover:bg-mocha-surface0 hover:text-mocha-text"
                  >
                    {copied ? <Check className="h-3 w-3 text-mocha-green" /> : <Copy className="h-3 w-3" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                <div className="relative overflow-hidden rounded-xl border border-mocha-surface0 bg-mocha-crust">
                  <pre className="max-h-96 overflow-x-auto p-4 text-[11px] font-mono text-mocha-subtext1 leading-relaxed">
                    <code>{currentLayer.codeSnippet.code}</code>
                  </pre>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </section>
  );
};
