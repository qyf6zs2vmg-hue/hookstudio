export type ViralMode = 'normal' | 'viral' | 'aggressive';
export type ContentPack = 'tiktok' | 'reels' | 'shorts' | 'ad' | 'educational';
export type ContentTone = 'emotional' | 'educational' | 'storytelling' | 'shock' | 'humor' | 'sales';
export type ToolType = 'generator' | 'improver' | 'analyzer' | 'remix';
export type AlgorithmMode = 'tiktok' | 'instagram' | 'youtube';
export type ContentGoal = 'views' | 'followers' | 'sales' | 'engagement';

export interface ViralAnalytics {
  hookStrength: number;
  viralityScore: number;
  engagementPotential: 'Low' | 'Medium' | 'High';
  retentionPrediction: string;
}

export interface ABHook {
  text: string;
  score: number;
  reasoning: string;
  triggers: string[];
}

export interface GenerationResult {
  id: string;
  timestamp: number;
  idea: string;
  mode: ViralMode;
  pack: ContentPack;
  tone: ContentTone;
  tool: ToolType;
  hooks: string[];
  captions: string[];
  titles: string[];
  algorithm?: AlgorithmMode;
  targetAudience?: string;
  goal?: ContentGoal;
  isABMode?: boolean;
  abHooks?: ABHook[];
  analytics?: ViralAnalytics;
  analysis?: {
    score: number;
    potential: string;
    problems: string[];
    improved: string;
  };
  improvement?: {
    improved: string;
    variations: string[];
    explanation: string;
  };
}

export interface HistoryItem {
  id: string;
  title: string;
  timestamp: number;
  idea: string;
  mode: ViralMode;
  tool: ToolType;
}

export type UILanguage = 'ru' | 'uz';
export type ThemeMode = 'light' | 'dark' | 'system';

export interface AppSettings {
  language: UILanguage;
  theme: ThemeMode;
}
