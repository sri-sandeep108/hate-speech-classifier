import React from 'react';
import { 
  BookOpen, 
  Download, 
  Award, 
  BarChart3, 
  Lightbulb, 
  Sparkles
} from 'lucide-react';
import { AUTHOR_DETAILS, BENCHMARK_DATA, DISSERTATION_KEY_POINTS } from '../data/dissertation';

export const DissertationSection: React.FC = () => {
  return (
    <section id="research" className="scroll-mt-20 border-t border-mocha-surface0/60 bg-mocha-mantle/40 py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Title Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-mocha-surface0">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-mocha-lavender">
              <BookOpen className="h-4 w-4" />
              <span>Academic Research &amp; Empirical Findings</span>
            </div>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-mocha-text sm:text-3xl">
              MSc Dissertation Research
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-mocha-subtext0">
              Comparative analysis of transformer architectures (BERT, DistilBERT, RoBERTa, ELECTRA) versus static word embeddings (GloVe) for hate speech detection.
            </p>
          </div>

          {/* Download Dissertation Button */}
          <div className="flex items-center gap-3">
            <a
              href={AUTHOR_DETAILS.pdfPath}
              download="Hate_Speech_Classification_Dissertation.pdf"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-mocha-lavender to-mocha-mauve px-5 py-2.5 text-xs font-bold text-mocha-crust shadow-lg shadow-mocha-lavender/15 transition-all hover:scale-[1.02] hover:shadow-mocha-lavender/25 active:scale-[0.98]"
            >
              <Download className="h-4 w-4" />
              <span>Download Dissertation (PDF • {AUTHOR_DETAILS.pdfSize})</span>
            </a>
          </div>
        </div>

        {/* Author & Dissertation Meta Card */}
        <div className="mt-8 rounded-2xl border border-mocha-surface0 bg-mocha-mantle p-6 shadow-md">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            
            <div className="md:col-span-2 space-y-3">
              <div className="inline-flex items-center gap-1.5 rounded-md border border-mocha-mauve/30 bg-mocha-mauve/10 px-2.5 py-0.5 text-xs font-semibold text-mocha-mauve">
                <Award className="h-3.5 w-3.5" />
                <span>Master of Science in Data Analytics</span>
              </div>
              
              <h3 className="text-lg font-extrabold text-mocha-text leading-snug">
                "{AUTHOR_DETAILS.dissertationTitle}"
              </h3>
              
              <p className="text-xs sm:text-sm text-mocha-subtext0 leading-relaxed">
                Authored by <span className="font-semibold text-mocha-text">{AUTHOR_DETAILS.name}</span> (ID: <span className="font-mono text-mocha-text">{AUTHOR_DETAILS.studentId}</span>). This research rigorously evaluates modern NLP models on an aggregated multi-source dataset (Kaggle &amp; GitHub) to resolve the trade-off between classification performance and production computational efficiency.
              </p>
            </div>

            <div className="flex flex-col justify-center rounded-xl border border-mocha-surface0 bg-mocha-crust/60 p-4 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-mocha-subtext0">Institution Degree:</span>
                <span className="font-semibold text-mocha-text">MSc Data Analytics</span>
              </div>
              <div className="flex justify-between">
                <span className="text-mocha-subtext0">Dataset Sources:</span>
                <span className="font-semibold text-mocha-text">Kaggle + GitHub Aggregated</span>
              </div>
              <div className="flex justify-between">
                <span className="text-mocha-subtext0">Evaluated Models:</span>
                <span className="font-semibold text-mocha-mauve">5 Architectures</span>
              </div>
              <div className="flex justify-between">
                <span className="text-mocha-subtext0">Selected Model:</span>
                <span className="font-bold text-mocha-green">DistilBERT (~66M)</span>
              </div>
            </div>

          </div>
        </div>

        {/* 5-Model Empirical Benchmark Comparison Table */}
        <div className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-mocha-text flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-mocha-sky" />
                <span>Multi-Model Architecture Comparison Matrix</span>
              </h3>
              <p className="text-xs text-mocha-subtext0">
                Evaluation results on held-out stratified test set under identical training splits.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-mocha-surface0 bg-mocha-mantle shadow-md">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-mocha-surface0 bg-mocha-crust/80 text-mocha-subtext1 uppercase tracking-wider font-semibold">
                  <th className="py-3.5 px-4">Architecture</th>
                  <th className="py-3.5 px-3">Parameters</th>
                  <th className="py-3.5 px-3">Footprint</th>
                  <th className="py-3.5 px-3">Macro AUC</th>
                  <th className="py-3.5 px-3">Macro F1</th>
                  <th className="py-3.5 px-3">Hate F1</th>
                  <th className="py-3.5 px-3">Latency / Speed</th>
                  <th className="py-3.5 px-4">Cloud Deployment Verdict</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-mocha-surface0/60 font-sans">
                {BENCHMARK_DATA.map((model) => (
                  <tr 
                    key={model.name} 
                    className={`transition-colors ${
                      model.highlight 
                        ? 'bg-mocha-mauve/10 hover:bg-mocha-mauve/15 font-medium' 
                        : 'hover:bg-mocha-surface0/40'
                    }`}
                  >
                    <td className="py-3.5 px-4 font-bold text-mocha-text">
                      <div className="flex items-center gap-2">
                        {model.highlight && <Sparkles className="h-3.5 w-3.5 text-mocha-mauve" />}
                        <span>{model.name}</span>
                      </div>
                      <span className="text-[10px] font-mono text-mocha-subtext0 block opacity-80">{model.baseModel}</span>
                    </td>
                    <td className="py-3.5 px-3 font-mono text-mocha-subtext1">{model.params}</td>
                    <td className="py-3.5 px-3 font-mono text-mocha-subtext1">{model.size}</td>
                    <td className="py-3.5 px-3 font-mono font-bold text-mocha-sky">{(model.macroAUC * 100).toFixed(1)}%</td>
                    <td className="py-3.5 px-3 font-mono font-bold text-mocha-mauve">{(model.macroF1 * 100).toFixed(1)}%</td>
                    <td className="py-3.5 px-3 font-mono text-mocha-peach">{(model.hatefulF1 * 100).toFixed(1)}%</td>
                    <td className="py-3.5 px-3 font-mono text-mocha-teal">{model.speedMultiplier}</td>
                    <td className="py-3.5 px-4 text-xs text-mocha-subtext0 max-w-xs leading-snug">
                      {model.highlight ? (
                        <span className="inline-block rounded-md border border-mocha-green/30 bg-mocha-green/10 px-2 py-0.5 font-semibold text-mocha-green text-[11px]">
                          🚀 Production Target: {model.verdict}
                        </span>
                      ) : (
                        model.verdict
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 4 Core Research Findings Grid */}
        <div className="mt-10">
          <h3 className="text-lg font-bold text-mocha-text mb-4 flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-mocha-yellow" />
            <span>Key Research Insights &amp; Ethical Considerations</span>
          </h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {DISSERTATION_KEY_POINTS.map((point, index) => (
              <div 
                key={index}
                className="rounded-2xl border border-mocha-surface0 bg-mocha-mantle p-5 shadow-sm hover:border-mocha-mauve/30 transition-all"
              >
                <div className="flex items-center gap-2 text-mocha-mauve text-xs font-bold uppercase tracking-wider mb-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-mocha-mauve/20 text-[10px]">
                    {index + 1}
                  </span>
                  <span>{point.title}</span>
                </div>
                <p className="text-xs sm:text-sm text-mocha-subtext0 leading-relaxed">
                  {point.description}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
