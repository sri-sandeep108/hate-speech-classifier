export interface PredictResponse {
  label: 'Hateful' | 'Not-Hateful';
  hateful_score: number;
  not_hateful_score: number;
}

export interface ModelBenchmark {
  macro_f1: number;
  macro_auc: number;
  hateful_f1: number;
  not_hateful_f1: number;
}

export interface ModelInfo {
  name: string;
  architecture: string;
  base_model: string;
  labels: string[];
  benchmark: ModelBenchmark;
}

export interface PresetExample {
  id: string;
  category: string;
  label: string;
  tag: 'Benign' | 'Debate' | 'Hostile' | 'Severe';
  text: string;
  icon: string;
}

export interface BenchmarkComparison {
  name: string;
  type: 'Transformer' | 'Static Vectors' | 'Discriminator';
  baseModel: string;
  params: string;
  size: string;
  macroF1: number;
  macroAUC: number;
  hatefulF1: number;
  safeF1: number;
  speedMultiplier: string;
  highlight?: boolean;
  verdict: string;
}

export interface ArchitectureLayer {
  layer: number;
  title: string;
  subtitle: string;
  tech: string[];
  icon: string;
  description: string;
  highlights: string[];
  codeSnippet?: {
    filename: string;
    language: string;
    code: string;
  };
}
