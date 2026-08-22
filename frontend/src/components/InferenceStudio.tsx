import React, { useState } from 'react';
import { 
  Zap, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Code2, 
  Copy, 
  Check, 
  ExternalLink,
  Cpu
} from 'lucide-react';
import { PRESET_EXAMPLES } from '../data/dissertation';
import { PredictResponse } from '../types';

interface InferenceStudioProps {
  apiBaseUrl: string;
}

export const InferenceStudio: React.FC<InferenceStudioProps> = ({ apiBaseUrl }) => {
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictResponse | null>(null);
  const [durationMs, setDurationMs] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeCodeTab, setActiveCodeTab] = useState<'curl' | 'python' | 'ts'>('curl');
  const [copied, setCopied] = useState(false);

  const handlePredict = async (textToAnalyze?: string) => {
    const targetText = (textToAnalyze ?? inputText).trim();
    if (!targetText) return;

    setLoading(true);
    setErrorMsg(null);
    const start = performance.now();

    try {
      const endpoint = apiBaseUrl.endsWith('/') ? `${apiBaseUrl}predict` : `${apiBaseUrl}/predict`;
      
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: targetText }),
      });

      if (!res.ok) {
        throw new Error(`Inference service returned status ${res.status}: ${res.statusText}`);
      }

      const data: PredictResponse = await res.json();
      const elapsed = performance.now() - start;
      setDurationMs(elapsed);
      setResult(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to connect to inference microservice');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setInputText('');
    setResult(null);
    setDurationMs(null);
    setErrorMsg(null);
  };

  const handleApplyPreset = (text: string) => {
    setInputText(text);
    handlePredict(text);
  };

  const getCodeSnippet = () => {
    const textEscaped = inputText ? inputText.replace(/"/g, '\\"') : "What a wonderful day to collaborate on open source!";
    const host = apiBaseUrl.startsWith('http') ? apiBaseUrl : window.location.origin;

    switch (activeCodeTab) {
      case 'curl':
        return `curl -X POST "${host}/predict" \\
  -H "Content-Type: application/json" \\
  -d '{"text": "${textEscaped}"}'`;
      case 'python':
        return `import requests

url = "${host}/predict"
payload = {"text": "${textEscaped}"}

response = requests.post(url, json=payload)
data = response.json()

print(f"Classification: {data['label']}")
print(f"Hate Score: {data['hateful_score']:.2%}")
print(f"Safe Score: {data['not_hateful_score']:.2%}")`;
      case 'ts':
        return `const response = await fetch("${host}/predict", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ text: "${textEscaped}" }),
});

const data = await response.json();
console.log("Prediction:", data);`;
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(getCodeSnippet());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const charCount = inputText.length;
  const wordCount = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;

  return (
    <section id="playground" className="scroll-mt-20 py-8 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-mocha-mauve">
            <Zap className="h-4 w-4" />
            <span>Interactive Inference Studio</span>
          </div>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-mocha-text sm:text-3xl">
            Live Hate Speech Analysis
          </h2>
          <p className="mt-1 text-sm text-mocha-subtext0">
            Submit any custom text or click sample scenarios below to evaluate hate speech probability via the DistilBERT transformer.
          </p>
        </div>

        {/* Main 2-Column Studio Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          
          {/* Left Column: Input & Results (7 Cols) */}
          <div className="space-y-5 lg:col-span-7">
            
            {/* Input Studio Card */}
            <div className="rounded-2xl border border-mocha-surface0 bg-mocha-mantle p-5 shadow-lg shadow-black/20">
              
              {/* Preset Chips */}
              <div className="mb-4">
                <span className="text-xs font-semibold text-mocha-subtext1">Sample Test Inputs:</span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {PRESET_EXAMPLES.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleApplyPreset(item.text)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-mocha-surface0 bg-mocha-surface0/50 px-3 py-1.5 text-xs font-medium text-mocha-text transition-all hover:bg-mocha-surface1 hover:border-mocha-mauve/40 hover:text-mocha-mauve active:scale-[0.98]"
                    >
                      <span>{item.label}</span>
                      <span className={`rounded px-1.5 py-0.2 text-[9px] font-bold uppercase ${
                        item.tag === 'Severe' 
                          ? 'bg-mocha-maroon/20 text-mocha-maroon border border-mocha-maroon/30' 
                          : item.tag === 'Hostile'
                          ? 'bg-mocha-peach/20 text-mocha-peach border border-mocha-peach/30'
                          : 'bg-mocha-teal/20 text-mocha-teal border border-mocha-teal/30'
                      }`}>
                        {item.tag}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Text Input Area */}
              <div className="relative">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type or paste social media text, comment, or statement to analyze..."
                  rows={4}
                  maxLength={2000}
                  className="w-full rounded-xl border border-mocha-surface0 bg-mocha-crust p-4 text-sm text-mocha-text placeholder-mocha-overlay1 transition-all focus:border-mocha-mauve focus:outline-none focus:ring-1 focus:ring-mocha-mauve resize-none font-sans"
                />
              </div>

              {/* Bottom Actions Bar */}
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3 text-xs text-mocha-subtext0 font-mono">
                  <span>{charCount} / 2000 chars</span>
                  <span>•</span>
                  <span>{wordCount} words</span>
                </div>

                <div className="flex items-center gap-2">
                  {inputText && (
                    <button
                      onClick={handleClear}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-mocha-surface0 bg-mocha-surface0/40 px-3 py-2 text-xs font-semibold text-mocha-subtext0 transition-all hover:bg-mocha-surface1 hover:text-mocha-text"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      <span>Clear</span>
                    </button>
                  )}

                  <button
                    onClick={() => handlePredict()}
                    disabled={loading || !inputText.trim()}
                    className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-mocha-mauve to-mocha-lavender px-4 py-2 text-xs font-bold text-mocha-crust shadow-md shadow-mocha-mauve/20 transition-all hover:opacity-95 hover:shadow-mocha-mauve/30 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {loading ? (
                      <>
                        <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-mocha-crust border-t-transparent" />
                        <span>Analyzing Transformer...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="h-3.5 w-3.5 fill-current" />
                        <span>Classify Text</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Connection Error Banner */}
              {errorMsg && (
                <div className="mt-4 rounded-xl border border-mocha-red/30 bg-mocha-red/10 p-3.5 text-xs text-mocha-red flex items-start gap-2.5">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Inference Error</p>
                    <p className="opacity-90">{errorMsg}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Dynamic Result Card */}
            {result && (
              <div className={`rounded-2xl border p-5 transition-all animate-in fade-in slide-in-from-top-2 duration-300 ${
                result.label === 'Hateful'
                  ? 'border-mocha-maroon/40 bg-mocha-maroon/10 shadow-lg shadow-mocha-maroon/5'
                  : 'border-mocha-green/40 bg-mocha-green/10 shadow-lg shadow-mocha-green/5'
              }`}>
                
                {/* Result Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    {result.label === 'Hateful' ? (
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-mocha-maroon/20 text-mocha-maroon border border-mocha-maroon/30">
                        <AlertTriangle className="h-5 w-5 stroke-[2.5]" />
                      </div>
                    ) : (
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-mocha-green/20 text-mocha-green border border-mocha-green/30">
                        <CheckCircle2 className="h-5 w-5 stroke-[2.5]" />
                      </div>
                    )}
                    <div>
                      <h3 className={`text-base font-extrabold tracking-tight ${
                        result.label === 'Hateful' ? 'text-mocha-maroon' : 'text-mocha-green'
                      }`}>
                        {result.label === 'Hateful' ? 'HATE SPEECH DETECTED' : 'SAFE • CIVIL CONTENT'}
                      </h3>
                      <p className="text-xs text-mocha-subtext0">
                        {result.label === 'Hateful'
                          ? 'Flagged for violating community conduct policies.'
                          : 'Classified as standard discourse or non-hateful expression.'}
                      </p>
                    </div>
                  </div>

                  {/* Latency Tag */}
                  {durationMs && (
                    <div className="flex items-center gap-1.5 rounded-lg border border-mocha-surface0 bg-mocha-crust/80 px-2.5 py-1 text-xs font-mono text-mocha-subtext1">
                      <Clock className="h-3.5 w-3.5 text-mocha-sky" />
                      <span>{durationMs.toFixed(1)} ms</span>
                    </div>
                  )}
                </div>

                {/* Probability Split Meters */}
                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  
                  {/* Hate Speech Meter */}
                  <div className="rounded-xl border border-mocha-surface0 bg-mocha-crust/60 p-3.5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-mocha-maroon">Hateful Probability</span>
                      <span className="font-mono text-mocha-text">{(result.hateful_score * 100).toFixed(2)}%</span>
                    </div>
                    <div className="mt-2 h-2.5 w-full rounded-full bg-mocha-surface0 overflow-hidden">
                      <div 
                        className="h-full rounded-full bg-gradient-to-r from-mocha-peach to-mocha-maroon transition-all duration-500"
                        style={{ width: `${Math.min(100, Math.max(0, result.hateful_score * 100))}%` }}
                      />
                    </div>
                  </div>

                  {/* Safe Meter */}
                  <div className="rounded-xl border border-mocha-surface0 bg-mocha-crust/60 p-3.5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-mocha-green">Safe / Benign Probability</span>
                      <span className="font-mono text-mocha-text">{(result.not_hateful_score * 100).toFixed(2)}%</span>
                    </div>
                    <div className="mt-2 h-2.5 w-full rounded-full bg-mocha-surface0 overflow-hidden">
                      <div 
                        className="h-full rounded-full bg-gradient-to-r from-mocha-teal to-mocha-green transition-all duration-500"
                        style={{ width: `${Math.min(100, Math.max(0, result.not_hateful_score * 100))}%` }}
                      />
                    </div>
                  </div>

                </div>

              </div>
            )}

          </div>

          {/* Right Column: Model Specs & API Integration (5 Cols) */}
          <div className="space-y-5 lg:col-span-5">
            
            {/* Model Architecture Specs Card */}
            <div className="rounded-2xl border border-mocha-surface0 bg-mocha-mantle p-5 shadow-lg shadow-black/20">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-mocha-lavender">
                <Cpu className="h-4 w-4" />
                <span>Model Architecture</span>
              </div>
              
              <h3 className="mt-1 text-lg font-bold text-mocha-text">
                DistilBERT TextCatEnsemble
              </h3>
              
              <p className="mt-1 text-xs text-mocha-subtext0 leading-relaxed">
                Fine-tuned transformer pipeline combining deep bidirectional contextual self-attention with a linear bag-of-words residual component.
              </p>

              <div className="mt-4 space-y-2 text-xs">
                <div className="flex justify-between border-b border-mocha-surface0/60 pb-2">
                  <span className="text-mocha-subtext1">Base Weights</span>
                  <span className="font-mono font-semibold text-mocha-mauve">distilbert-base-uncased</span>
                </div>
                <div className="flex justify-between border-b border-mocha-surface0/60 pb-2">
                  <span className="text-mocha-subtext1">Parameter Count</span>
                  <span className="font-mono font-semibold text-mocha-sky">66,362,880 params</span>
                </div>
                <div className="flex justify-between border-b border-mocha-surface0/60 pb-2">
                  <span className="text-mocha-subtext1">Artifact Footprint</span>
                  <span className="font-mono font-semibold text-mocha-teal">~265 MB (Compressed)</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-mocha-subtext1">Serving Runtime</span>
                  <span className="font-mono font-semibold text-mocha-peach">FastAPI + PyTorch + Uvicorn</span>
                </div>
              </div>

              {/* Hugging Face Hub Link */}
              <a
                href="https://huggingface.co/thenewguyhere/hate-speech-distilbert"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 flex items-center justify-between rounded-xl border border-mocha-surface0 bg-mocha-surface0/40 p-3 text-xs font-semibold text-mocha-text transition-all hover:bg-mocha-surface0 hover:border-mocha-mauve/40 hover:text-mocha-mauve"
              >
                <div className="flex items-center gap-2">
                  <span>🤗</span>
                  <span>thenewguyhere/hate-speech-distilbert</span>
                </div>
                <ExternalLink className="h-3.5 w-3.5 text-mocha-subtext0" />
              </a>
            </div>

            {/* Developer Code Snippets Card */}
            <div className="rounded-2xl border border-mocha-surface0 bg-mocha-mantle p-5 shadow-lg shadow-black/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-mocha-sky">
                  <Code2 className="h-4 w-4" />
                  <span>API Integration</span>
                </div>

                {/* Language Selectors */}
                <div className="flex rounded-lg border border-mocha-surface0 bg-mocha-crust p-0.5 text-[11px]">
                  {(['curl', 'python', 'ts'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveCodeTab(tab)}
                      className={`rounded px-2 py-0.5 font-mono uppercase transition-all ${
                        activeCodeTab === tab
                          ? 'bg-mocha-mauve text-mocha-crust font-bold shadow-sm'
                          : 'text-mocha-subtext0 hover:text-mocha-text'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Code Box with Copy Button */}
              <div className="relative mt-3">
                <pre className="max-h-48 overflow-x-auto rounded-xl border border-mocha-surface0 bg-mocha-crust p-3.5 text-[11px] font-mono text-mocha-subtext1 leading-relaxed">
                  <code>{getCodeSnippet()}</code>
                </pre>
                
                <button
                  onClick={handleCopyCode}
                  className="absolute right-2.5 top-2.5 rounded-md border border-mocha-surface0 bg-mocha-mantle/90 p-1.5 text-mocha-subtext0 transition-all hover:bg-mocha-surface1 hover:text-mocha-text"
                  title="Copy code snippet"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-mocha-green" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
