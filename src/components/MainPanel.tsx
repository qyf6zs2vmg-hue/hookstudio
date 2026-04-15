import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ViralMode, ContentPack, ContentTone, ToolType, AlgorithmMode, ContentGoal } from '@/lib/types';
import { Mic, MicOff, Image as ImageIcon, Loader2, Wand2, Search, Zap, AlertCircle, Target, Users, Trophy, Layers, Sparkles, Info, ChevronDown, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useSettings } from '@/context/SettingsContext';
import { getSystemStatus } from '@/services/queueService';
import { motion, AnimatePresence } from 'motion/react';

interface MainPanelProps {
  onGenerate: (
    input: string, 
    mode: ViralMode, 
    pack: ContentPack, 
    tone: ContentTone, 
    tool: ToolType,
    options?: {
      algorithm?: AlgorithmMode;
      targetAudience?: string;
      goal?: ContentGoal;
      isABMode?: boolean;
    }
  ) => Promise<void>;
  isGenerating: boolean;
}

export function MainPanel({ onGenerate, isGenerating }: MainPanelProps) {
  const { t } = useSettings();
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<ViralMode>('viral');
  const [pack, setPack] = useState<ContentPack>('tiktok');
  const [tone, setTone] = useState<ContentTone>('emotional');
  const [tool, setTool] = useState<ToolType>('generator');
  const [algorithm, setAlgorithm] = useState<AlgorithmMode>('tiktok');
  const [targetAudience, setTargetAudience] = useState('');
  const [goal, setGoal] = useState<ContentGoal>('views');
  const [isABMode, setIsABMode] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
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
    onGenerate(input, mode, pack, tone, tool, {
      algorithm,
      targetAudience,
      goal,
      isABMode
    });
  };

  const templates = [
    t.template1,
    t.template2,
    t.template3,
    t.template4
  ];

  const handleSelectTemplate = (template: string) => {
    setInput(template);
    setShowTemplates(false);
    toast.success('Template applied');
  };

  return (
    <div className="w-full space-y-6 py-2 px-1">
      <div className="text-center space-y-3 mb-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-muted border border-accent-custom/20 text-[9px] font-black uppercase tracking-[0.2em] text-accent-custom mb-1">
          <Zap className="w-3 h-3" />
          Powered by Advanced AI
        </div>
        <h1 className="text-3xl md:text-6xl font-black tracking-tighter text-text-primary">
          {t.appName}
        </h1>
        <p className="text-text-secondary text-xs md:text-base max-w-md mx-auto leading-relaxed px-4">
          {tool === 'generator' ? t.helpGeneratorDesc : 
           tool === 'improver' ? t.helpImproverDesc : 
           tool === 'analyzer' ? t.helpAnalyzerDesc :
           t.remixMode}
        </p>
      </div>

      {/* Tool Selector */}
      <div className="flex justify-center max-w-2xl mx-auto px-2">
        <div className="flex flex-wrap bg-bg-deep border border-border-custom p-1 rounded-2xl shadow-sm w-full gap-1">
          {(['generator', 'improver', 'analyzer', 'remix'] as const).map((T) => (
            <button
              key={T}
              onClick={() => setTool(T)}
              className={cn(
                "flex-1 min-w-[80px] flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[10px] font-black transition-all uppercase tracking-wider",
                tool === T 
                  ? "bg-bg-card text-text-primary shadow-md border border-border-custom" 
                  : "text-text-muted hover:text-text-primary"
              )}
            >
              {T === 'generator' && <Zap className="w-3.5 h-3.5 shrink-0" />}
              {T === 'improver' && <Wand2 className="w-3.5 h-3.5 shrink-0" />}
              {T === 'analyzer' && <Search className="w-3.5 h-3.5 shrink-0" />}
              {T === 'remix' && <Sparkles className="w-3.5 h-3.5 shrink-0" />}
              <span className="truncate">{t[T] || T}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-bg-card border border-border-custom rounded-[2rem] p-5 md:p-12 shadow-2xl space-y-6 relative overflow-hidden max-w-4xl mx-auto w-full">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-accent-custom to-transparent opacity-30" />
        
        {/* Viral Template Library Toggle */}
        <div className="flex justify-end">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-accent-custom gap-2"
            onClick={() => setShowTemplates(!showTemplates)}
          >
            <BookOpen className="w-3.5 h-3.5" />
            {t.templates}
            <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", showTemplates && "rotate-180")} />
          </Button>
        </div>

        {showTemplates && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-4"
          >
            {templates.map((template, i) => (
              <button
                key={i}
                onClick={() => handleSelectTemplate(template)}
                className="text-left p-4 rounded-xl bg-bg-deep border border-border-custom hover:border-accent-custom/50 transition-all text-xs font-medium text-text-secondary hover:text-text-primary"
              >
                "{template}"
              </button>
            ))}
          </motion.div>
        )}

        {/* Input Area */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Label className="text-[10px] uppercase tracking-widest font-black text-accent-custom">
                {tool === 'generator' ? t.workspace : t[tool]}
              </Label>
              <div className="group relative">
                <Info className="w-3.5 h-3.5 text-text-muted cursor-help" />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-bg-deep border border-border-custom rounded-lg text-[10px] text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                  {t.whatMakesHookViralDesc}
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
              {/* A/B Mode Toggle */}
              <div className="flex items-center gap-2 bg-bg-deep p-1 rounded-xl border border-border-custom w-full sm:w-auto">
                <button
                  onClick={() => setIsABMode(!isABMode)}
                  className={cn(
                    "flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2",
                    isABMode ? "bg-accent-custom text-white shadow-sm" : "text-text-muted hover:text-text-primary"
                  )}
                >
                  <Layers className="w-3 h-3" />
                  {t.abMode}
                </button>
              </div>

              <div className="flex flex-wrap bg-bg-deep p-1 rounded-xl border border-border-custom w-full sm:w-auto gap-1">
                {(['normal', 'viral', 'aggressive'] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={cn(
                      "flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-[9px] font-bold transition-all capitalize",
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
          </div>
          
          <div className="relative group">
            <Textarea
              placeholder={
                tool === 'generator' ? t.ideaPlaceholder : 
                tool === 'improver' ? t.weakHookPlaceholder : 
                tool === 'remix' ? t.remixPlaceholder :
                t.weakHookPlaceholder
              }
              className="min-h-[120px] md:min-h-[180px] bg-bg-deep border-border-custom text-text-primary placeholder:text-text-muted focus:border-accent-custom/50 focus:ring-0 rounded-2xl p-6 text-lg leading-relaxed resize-none transition-all shadow-inner"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          </div>
        </div>

        {/* Advanced Context Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 pt-2 md:pt-4">
          <div className="space-y-2 md:space-y-3">
            <Label className="text-[10px] uppercase tracking-widest font-black text-accent-custom flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5" />
              {t.algorithmMode}
            </Label>
            <div className="grid grid-cols-1 gap-2">
              {(['tiktok', 'instagram', 'youtube'] as const).map((a) => (
                <button
                  key={a}
                  onClick={() => setAlgorithm(a)}
                  className={cn(
                    "px-4 py-2.5 rounded-xl border text-[9px] font-black uppercase tracking-wider transition-all text-left flex items-center justify-between",
                    algorithm === a 
                      ? "bg-accent-muted border-accent-custom/50 text-accent-custom shadow-sm" 
                      : "bg-bg-deep border-border-custom text-text-muted hover:text-text-secondary"
                  )}
                >
                  {t[`${a}Algo` as keyof typeof t] || a}
                  {algorithm === a && <div className="w-1.5 h-1.5 rounded-full bg-accent-custom" />}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-[10px] uppercase tracking-widest font-black text-accent-custom flex items-center gap-2">
              <Users className="w-3.5 h-3.5" />
              {t.targetAudience}
            </Label>
            <input 
              type="text"
              placeholder={t.targetAudiencePlaceholder}
              className="w-full bg-bg-deep border border-border-custom rounded-xl px-4 py-3 text-xs text-text-primary placeholder:text-text-muted focus:border-accent-custom/50 outline-none transition-all"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
            />
          </div>

          <div className="space-y-3">
            <Label className="text-[10px] uppercase tracking-widest font-black text-accent-custom flex items-center gap-2">
              <Trophy className="w-3.5 h-3.5" />
              {t.goal}
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {(['views', 'followers', 'sales', 'engagement'] as const).map((g) => (
                <button
                  key={g}
                  onClick={() => setGoal(g)}
                  className={cn(
                    "py-2.5 rounded-xl border text-[9px] font-black uppercase tracking-wider transition-all",
                    goal === g 
                      ? "bg-accent-muted border-accent-custom/50 text-accent-custom shadow-sm" 
                      : "bg-bg-deep border-border-custom text-text-muted hover:text-text-secondary"
                  )}
                >
                  {t[g as keyof typeof t] || g}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Selectors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
          <div className="space-y-2 md:space-y-4">
            <Label className="text-[10px] uppercase tracking-widest font-black text-accent-custom">{t.contentPack}</Label>
            <div className="grid grid-cols-3 gap-2">
              {(['tiktok', 'reels', 'shorts', 'ad', 'educational'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPack(p)}
                  className={cn(
                    "py-3 rounded-xl border text-[9px] font-black uppercase tracking-wider transition-all whitespace-nowrap overflow-hidden",
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

          <div className="space-y-4">
            <Label className="text-[10px] uppercase tracking-widest font-black text-accent-custom">{t.tone}</Label>
            <div className="grid grid-cols-3 gap-2">
              {(['emotional', 'educational', 'storytelling', 'shock', 'humor', 'sales'] as const).map((tn) => (
                <button
                  key={tn}
                  onClick={() => setTone(tn)}
                  className={cn(
                    "py-3 rounded-xl border text-[9px] font-black uppercase tracking-wider transition-all whitespace-nowrap overflow-hidden",
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
        <div className="flex flex-col gap-4 pt-6 border-t border-border-custom">
          <Button
            className={cn(
              "h-16 w-full text-sm font-black shadow-[0_10px_30px_rgba(255,78,0,0.3)] rounded-2xl transition-all gap-3 uppercase tracking-[0.2em] whitespace-nowrap",
              isLimited && !isGenerating ? "bg-bg-surface text-text-muted cursor-not-allowed border border-border-custom" : "bg-accent-custom hover:opacity-90 text-white"
            )}
            onClick={handleSubmit}
            disabled={isGenerating || isLimited}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>{t.generating}</span>
              </>
            ) : isLimited ? (
              <>
                <AlertCircle className="w-5 h-5" />
                <span>{systemStatus.cooldown.isCoolingDown ? t.cooldownActive.replace('{time}', Math.ceil(systemStatus.cooldown.remainingTime / 1000).toString()) : t.upgrade}</span>
              </>
            ) : (
              <span className="text-base">
                {tool === 'generator' ? t.generateBtn : 
                 tool === 'improver' ? t.improveBtn : 
                 tool === 'remix' ? t.remixMode :
                 t.analyzeBtn}
              </span>
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            className={cn(
              "h-14 w-full gap-3 bg-bg-deep border-border-custom text-text-secondary hover:text-text-primary rounded-2xl transition-all",
              isRecording && "text-accent-custom border-accent-custom/50 bg-accent-muted"
            )}
            onClick={toggleRecording}
          >
            {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            <span className="text-[10px] font-black uppercase tracking-widest">{isRecording ? 'Stop' : t.voice}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
