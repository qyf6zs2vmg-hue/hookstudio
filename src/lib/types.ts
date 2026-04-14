export type ViralMode = 'normal' | 'viral' | 'aggressive';
export type ContentPack = 'tiktok' | 'reels' | 'shorts' | 'ad' | 'educational';
export type ContentTone = 'emotional' | 'educational' | 'storytelling' | 'shock' | 'humor' | 'sales';
export type ToolType = 'generator' | 'improver' | 'analyzer';

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
