import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ViralMode, ContentPack, ContentTone, ToolType } from '@/lib/types';
import { Mic, MicOff, Image as ImageIcon, Loader2, Wand2, Search, Zap, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useSettings } from '@/context/SettingsContext';
import { getSystemStatus } from '@/services/queueService';

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
  
  const systemStatus = getSystemStatus();
  const isLimited = systemStatus.limits.isUserLimited || systemStatus.limits.isGlobalLimited || systemStatus.cooldown.isCoolingDown;

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
    <div className="w-full space-y-8 py-4 px-2">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-muted border border-accent-custom/20 text-[9px] font-black uppercase tracking-[0.2em] text-accent-custom mb-1">
          <Zap className="w-3 h-3" />
          Powered by AI
        </div>
        <h1 className="text-4xl font-black tracking-tighter text-text-primary">
          {t.appName}
        </h1>
        <p className="text-text-secondary text-sm max-w-xs mx-auto leading-relaxed">
          {tool === 'generator' ? t.helpGeneratorDesc : tool === 'improver' ? t.helpImproverDesc : t.helpAnalyzerDesc}
        </p>
      </div>

      {/* Tool Selector */}
      <div className="flex justify-center">
        <div className="flex bg-bg-deep border border-border-custom p-1 rounded-xl shadow-sm w-full">
          {(['generator', 'improver', 'analyzer'] as const).map((T) => (
            <button
              key={T}
              onClick={() => setTool(T)}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[10px] font-black transition-all uppercase tracking-wider",
                tool === T 
                  ? "bg-bg-card text-text-primary shadow-sm border border-border-custom" 
                  : "text-text-muted hover:text-text-primary"
              )}
            >
              {T === 'generator' && <Zap className="w-3 h-3 shrink-0" />}
              {T === 'improver' && <Wand2 className="w-3 h-3 shrink-0" />}
              {T === 'analyzer' && <Search className="w-3 h-3 shrink-0" />}
              <span>{t[T]}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-bg-card border border-border-custom rounded-3xl p-6 shadow-xl space-y-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent-custom to-transparent opacity-20" />
        
        {/* Input Area */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-[9px] uppercase tracking-widest font-bold text-text-muted">
              {tool === 'generator' ? t.workspace : t[tool]}
            </Label>
            <div className="flex bg-bg-deep p-0.5 rounded-lg border border-border-custom">
              {(['normal', 'viral', 'aggressive'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={cn(
                    "px-3 py-1 rounded-md text-[9px] font-bold transition-all capitalize",
                    mode === m 
                      ? "bg-bg-card text-text-primary shadow-sm" 
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
              className="min-h-[140px] bg-bg-deep border-border-custom text-text-primary placeholder:text-text-muted focus:border-accent-custom/50 focus:ring-0 rounded-xl p-4 text-base leading-relaxed resize-none transition-all"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          </div>
        </div>

        {/* Selectors Grid */}
        <div className="space-y-6">
          <div className="space-y-3">
            <Label className="text-[9px] uppercase tracking-widest font-black text-accent-custom">{t.contentPack}</Label>
            <div className="grid grid-cols-3 gap-1.5">
              {(['tiktok', 'reels', 'shorts', 'ad', 'educational'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPack(p)}
                  className={cn(
                    "py-2 rounded-lg border text-[8px] font-black uppercase tracking-wider transition-all whitespace-nowrap overflow-hidden",
                    pack === p 
                      ? "bg-accent-muted border-accent-custom/50 text-accent-custom shadow-sm" 
                      : "bg-bg-deep border-border-custom text-text-muted hover:text-text-secondary"
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-[9px] uppercase tracking-widest font-black text-accent-custom">{t.tone}</Label>
            <div className="grid grid-cols-3 gap-1.5">
              {(['emotional', 'educational', 'storytelling', 'shock', 'humor', 'sales'] as const).map((tn) => (
                <button
                  key={tn}
                  onClick={() => setTone(tn)}
                  className={cn(
                    "py-2 rounded-lg border text-[8px] font-black uppercase tracking-wider transition-all whitespace-nowrap overflow-hidden",
                    tone === tn 
                      ? "bg-accent-muted border-accent-custom/50 text-accent-custom shadow-sm" 
                      : "bg-bg-deep border-border-custom text-text-muted hover:text-text-secondary"
                  )}
                >
                  {t[tn]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 pt-4 border-t border-border-custom">
          <Button
            className={cn(
              "h-12 w-full text-[11px] font-black shadow-[0_8px_20px_rgba(255,78,0,0.25)] rounded-xl transition-all gap-3 uppercase tracking-widest whitespace-nowrap",
              isLimited && !isGenerating ? "bg-bg-surface text-text-muted cursor-not-allowed border border-border-custom" : "bg-accent-custom hover:opacity-90 text-white"
            )}
            onClick={handleSubmit}
            disabled={isGenerating || isLimited}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{t.generating}</span>
              </>
            ) : isLimited ? (
              <>
                <AlertCircle className="w-4 h-4" />
                <span>{systemStatus.cooldown.isCoolingDown ? t.cooldownActive.replace('{time}', Math.ceil(systemStatus.cooldown.remainingTime / 1000).toString()) : t.upgrade}</span>
              </>
            ) : (
              <span>
                {tool === 'generator' ? t.generateBtn : tool === 'improver' ? t.improveBtn : t.analyzeBtn}
              </span>
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            className={cn(
              "h-10 w-full gap-2 bg-bg-deep border-border-custom text-text-secondary hover:text-text-primary rounded-xl transition-all",
              isRecording && "text-accent-custom border-accent-custom/50 bg-accent-muted"
            )}
            onClick={toggleRecording}
          >
            {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
            <span className="text-[9px] font-black uppercase tracking-widest">{isRecording ? 'Stop' : t.voice}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
