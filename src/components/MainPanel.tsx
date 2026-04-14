import { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { ViralMode, ContentPack, ContentTone, ToolType } from '../lib/types';
import { Mic, MicOff, Image as ImageIcon, Loader2, Wand2, Search, Zap } from 'lucide-react';
import { cn } from '../lib/utils';
import { toast } from 'sonner';
import { useSettings } from '../context/SettingsContext';

interface MainPanelProps {
  onGenerate: (input: string, mode: ViralMode, pack: ContentPack, tone: ContentTone, tool: ToolType) => Promise<void>;
  isGenerating: boolean;
}

export function MainPanel({ onGenerate, isGenerating }: MainPanelProps) {
  const { t } = useSettings();
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<ViralMode>('viral');
  const [pack, setPack] = useState<ContentPack>('tiktok');
  const [tone, setTone] = useState<ContentTone>('emotional');
  const [tool, setTool] = useState<ToolType>('generator');
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join('');
        setInput(transcript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsRecording(false);
        toast.error('Speech recognition failed. Please check permissions.');
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }
  }, []);

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
    } else {
      if (!recognitionRef.current) {
        toast.error('Speech recognition not supported in this browser.');
        return;
      }
      recognitionRef.current.start();
      setIsRecording(true);
      toast.info('Listening...');
    }
  };

  const handleSubmit = () => {
    if (!input.trim()) {
      toast.error(t.ideaPlaceholder);
      return;
    }
    onGenerate(input, mode, pack, tone, tool);
  };

  return (
    <div className="max-w-5xl mx-auto w-full space-y-12 py-16 px-6">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-muted border border-accent-custom/20 text-[10px] font-black uppercase tracking-[0.2em] text-accent-custom mb-2">
          <Zap className="w-3 h-3" />
          Powered by AI
        </div>
        <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-text-primary">
          {t.appName}
        </h1>
        <p className="text-text-secondary text-lg max-w-2xl mx-auto leading-relaxed">
          {tool === 'generator' ? t.helpGeneratorDesc : tool === 'improver' ? t.helpImproverDesc : t.helpAnalyzerDesc}
        </p>
      </div>

      {/* Tool Selector */}
      <div className="flex justify-center">
        <div className="flex bg-bg-card/50 backdrop-blur-sm border border-border-custom p-1 rounded-2xl shadow-xl max-w-full overflow-x-auto no-scrollbar">
          {(['generator', 'improver', 'analyzer'] as const).map((T) => (
            <button
              key={T}
              onClick={() => setTool(T)}
              className={cn(
                "flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl text-[11px] sm:text-xs font-black transition-all uppercase tracking-wider whitespace-nowrap",
                tool === T 
                  ? "bg-bg-surface text-text-primary shadow-lg border border-border-custom" 
                  : "text-text-muted hover:text-text-primary"
              )}
            >
              {T === 'generator' && <Zap className="w-3.5 h-3.5 shrink-0" />}
              {T === 'improver' && <Wand2 className="w-3.5 h-3.5 shrink-0" />}
              {T === 'analyzer' && <Search className="w-3.5 h-3.5 shrink-0" />}
              <span>{t[T]}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-bg-card border border-border-custom rounded-[2rem] p-10 shadow-2xl space-y-10 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent-custom to-transparent opacity-20" />
        
        {/* Input Area */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-[11px] uppercase tracking-widest font-bold text-text-muted">
              {tool === 'generator' ? t.workspace : t[tool]}
            </Label>
            <div className="flex bg-bg-deep p-1 rounded-lg border border-border-custom">
              {(['normal', 'viral', 'aggressive'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={cn(
                    "px-4 py-1.5 rounded-md text-xs font-semibold transition-all capitalize",
                    mode === m 
                      ? "bg-bg-surface text-text-primary shadow-sm" 
                      : "text-text-secondary hover:text-text-primary"
                  )}
                >
                  {t[m]}
                </button>
              ))}
            </div>
          </div>
          
          <div className="relative group">
            <Textarea
              placeholder={tool === 'generator' ? t.ideaPlaceholder : t.weakHookPlaceholder}
              className="min-h-[160px] bg-bg-deep border-border-custom text-text-primary placeholder:text-text-muted focus:border-accent-custom/50 focus:ring-0 rounded-2xl p-6 text-lg leading-relaxed resize-none transition-all"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-focus-within:opacity-100 transition-opacity">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest bg-bg-surface px-2 py-1 rounded border border-border-custom">
                {input.length} chars
              </span>
            </div>
          </div>
        </div>

        {/* Selectors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <Label className="text-[11px] uppercase tracking-widest font-black text-accent-custom">{t.contentPack}</Label>
            <div className="grid grid-cols-3 gap-2">
              {(['tiktok', 'reels', 'shorts', 'ad', 'educational'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPack(p)}
                  className={cn(
                    "py-2.5 px-1.5 rounded-xl border text-[9px] font-black uppercase tracking-wider transition-all whitespace-nowrap overflow-hidden",
                    pack === p 
                      ? "bg-accent-muted border-accent-custom/50 text-accent-custom shadow-sm" 
                      : "bg-bg-deep border-border-custom text-text-muted hover:border-text-muted/50 hover:text-text-secondary"
                  )}
                >
                  <span className="block w-full">{p}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <Label className="text-[11px] uppercase tracking-widest font-black text-accent-custom">{t.tone}</Label>
            <div className="grid grid-cols-3 gap-2">
              {(['emotional', 'educational', 'storytelling', 'shock', 'humor', 'sales'] as const).map((tn) => (
                <button
                  key={tn}
                  onClick={() => setTone(tn)}
                  className={cn(
                    "py-2.5 px-1.5 rounded-xl border text-[9px] font-black uppercase tracking-wider transition-all whitespace-nowrap overflow-hidden",
                    tone === tn 
                      ? "bg-accent-muted border-accent-custom/50 text-accent-custom shadow-sm" 
                      : "bg-bg-deep border-border-custom text-text-muted hover:border-border-muted/50 hover:text-text-secondary"
                  )}
                >
                  <span className="block w-full">{t[tn]}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 border-t border-border-custom">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "h-11 px-5 gap-2.5 bg-bg-surface border-border-custom text-text-secondary hover:text-text-primary hover:bg-bg-surface/80 rounded-xl transition-all flex-1 sm:flex-none",
                isRecording && "text-accent-custom border-accent-custom/50 bg-accent-muted"
              )}
              onClick={toggleRecording}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              <span className="text-[10px] font-black uppercase tracking-widest">{isRecording ? 'Stop' : t.voice}</span>
            </Button>
          </div>

          <Button
            className="h-12 w-full sm:w-auto px-8 text-[11px] font-black bg-accent-custom hover:opacity-90 text-white shadow-[0_8px_20px_rgba(255,78,0,0.25)] rounded-xl transition-all gap-3 uppercase tracking-widest whitespace-nowrap"
            onClick={handleSubmit}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{t.generating}</span>
              </>
            ) : (
              <span>
                {tool === 'generator' ? t.generateBtn : tool === 'improver' ? t.improveBtn : t.analyzeBtn}
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
