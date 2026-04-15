import { GenerationResult, ABHook, ViralAnalytics } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Share2, Download, Star, AlertCircle, ArrowRight, CheckCircle2, ArrowLeft, Copy, BarChart3, Zap, Sparkles, RefreshCcw, Wand2, TrendingUp, Users, Clock } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { useSettings } from '@/context/SettingsContext';

interface OutputDisplayProps {
  result: GenerationResult;
  onBack: () => void;
  onRegenerate?: (idea: string) => void;
}

export function OutputDisplay({ result, onBack, onRegenerate }: OutputDisplayProps) {
  const { t } = useSettings();
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to top when a new result is displayed
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [result.id]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    toast.success(t.copied);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const downloadResults = () => {
    let content = `${t.ideaLabel}: ${result.idea}\n${t.modeLabel}: ${result.mode}\n${t.toolLabel}: ${result.tool}\n\n`;
    
    if (result.tool === 'generator') {
      content += `${t.hooks.toUpperCase()}:\n${result.hooks.map((h, i) => `${i + 1}. ${h}`).join('\n')}\n\n`;
      content += `${t.captions.toUpperCase()}:\n${result.captions.map((c, i) => `${i + 1}. ${c}`).join('\n')}\n\n`;
      content += `${t.titles.toUpperCase()}:\n${result.titles.map((t, i) => `${i + 1}. ${t}`).join('\n')}`;
    } else if (result.tool === 'analyzer' && result.analysis) {
      content += `${t.score.toUpperCase()}: ${result.analysis.score}/10\n${t.potential.toUpperCase()}: ${result.analysis.potential}\n\n${t.problems.toUpperCase()}:\n${result.analysis.problems.join('\n')}\n\n${t.improvedVersion.toUpperCase()}: ${result.analysis.improved}`;
    } else if (result.tool === 'improver' && result.improvement) {
      content += `${t.improvedVersion.toUpperCase()}: ${result.improvement.improved}\n\n${t.variations.toUpperCase()}:\n${result.improvement.variations.join('\n')}\n\n${t.explanation.toUpperCase()}: ${result.improvement.explanation}`;
    }

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hooks-${result.id.substring(0, 8)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div 
      ref={containerRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full space-y-6 pb-20"
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-text-muted hover:text-text-primary h-8 w-8"
            onClick={onBack}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h2 className="text-xl font-bold text-text-primary tracking-tight">{t.results}</h2>
            <p className="text-text-secondary text-[11px] mt-0.5 max-w-[200px] truncate">
              {result.idea}
            </p>
          </div>
        </div>

        {/* Viral Analytics Card */}
        {result.analytics && (
          <Card className="bg-bg-card border border-border-custom p-6 rounded-[2rem] shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <TrendingUp className="w-24 h-24" />
            </div>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-accent-custom/20 flex items-center justify-center text-accent-custom">
                <BarChart3 className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-black uppercase tracking-widest text-text-primary">
                {t.viralAnalytics}
              </h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">{t.hookStrength}</p>
                <div className="flex items-end gap-1">
                  <span className="text-2xl font-black text-text-primary leading-none">{result.analytics.hookStrength}</span>
                  <span className="text-[10px] font-bold text-text-muted mb-1">/100</span>
                </div>
                <div className="w-full h-1 bg-bg-deep rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${result.analytics.hookStrength}%` }}
                    className="h-full bg-accent-custom"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">{t.viralityScore}</p>
                <div className="flex items-end gap-1">
                  <span className="text-2xl font-black text-text-primary leading-none">{result.analytics.viralityScore}</span>
                  <span className="text-[10px] font-bold text-text-muted mb-1">%</span>
                </div>
                <div className="w-full h-1 bg-bg-deep rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${result.analytics.viralityScore}%` }}
                    className="h-full bg-purple-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">{t.engagementPotential}</p>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider",
                    result.analytics.engagementPotential === 'High' ? "bg-green-500/20 text-green-500" :
                    result.analytics.engagementPotential === 'Medium' ? "bg-yellow-500/20 text-yellow-500" :
                    "bg-red-500/20 text-red-500"
                  )}>
                    {t[result.analytics.engagementPotential.toLowerCase() as keyof typeof t] || result.analytics.engagementPotential}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">{t.retentionPrediction}</p>
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-accent-custom" />
                  <span className="text-xs font-bold text-text-primary">{result.analytics.retentionPrediction}</span>
                </div>
              </div>
            </div>
          </Card>
        )}

        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1 h-9 bg-bg-deep border-border-custom text-[10px] font-bold uppercase tracking-wider" onClick={downloadResults}>
            <Download className="w-3.5 h-3.5 mr-2" />
            {t.export}
          </Button>
          <Button variant="outline" size="sm" className="flex-1 h-9 bg-bg-deep border-border-custom text-[10px] font-bold uppercase tracking-wider" onClick={() => toast.info(t.sharingSoon)}>
            <Share2 className="w-3.5 h-3.5 mr-2" />
            {t.share}
          </Button>
        </div>
      </div>

      {result.tool === 'generator' && (
        <Tabs defaultValue={result.isABMode ? "ab-hooks" : "hooks"} className="w-full">
          <TabsList className="flex flex-wrap bg-bg-deep border border-border-custom p-1 h-auto min-h-12 rounded-2xl w-full gap-1">
            {result.isABMode && (
              <TabsTrigger 
                value="ab-hooks" 
                className="flex-1 min-w-[100px] data-[state=active]:bg-accent-custom data-[state=active]:!text-white data-[state=inactive]:text-text-muted rounded-xl text-[11px] font-black uppercase tracking-wider transition-all py-2"
              >
                A/B Hooks
              </TabsTrigger>
            )}
            <TabsTrigger 
              value="hooks" 
              className="flex-1 min-w-[100px] data-[state=active]:bg-accent-custom data-[state=active]:!text-white data-[state=inactive]:text-text-muted rounded-xl text-[11px] font-black uppercase tracking-wider transition-all py-2"
            >
              {t.hooks}
            </TabsTrigger>
            <TabsTrigger 
              value="captions" 
              className="flex-1 min-w-[100px] data-[state=active]:bg-accent-custom data-[state=active]:!text-white data-[state=inactive]:text-text-muted rounded-xl text-[11px] font-black uppercase tracking-wider transition-all py-2"
            >
              {t.captions}
            </TabsTrigger>
            <TabsTrigger 
              value="titles" 
              className="flex-1 min-w-[100px] data-[state=active]:bg-accent-custom data-[state=active]:!text-white data-[state=inactive]:text-text-muted rounded-xl text-[11px] font-black uppercase tracking-wider transition-all py-2"
            >
              {t.titles}
            </TabsTrigger>
          </TabsList>

          {result.isABMode && result.abHooks && (
            <TabsContent value="ab-hooks" className="mt-6 focus-visible:outline-none space-y-4">
              <div className="grid grid-cols-1 gap-4">
                {result.abHooks.map((hook, i) => (
                  <Card key={i} className={cn(
                    "bg-bg-card border-border-custom p-6 rounded-[2rem] relative overflow-hidden transition-all hover:border-accent-custom/50",
                    i < 3 && "border-l-4 border-l-accent-custom shadow-lg shadow-accent-custom/5"
                  )}>
                    {i < 3 && (
                      <div className="absolute top-4 right-4 px-3 py-1 bg-accent-custom text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg">
                        TOP {i + 1}
                      </div>
                    )}
                    
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-bg-deep flex items-center justify-center text-accent-custom font-black text-xs">
                          {i + 1}
                        </div>
                        <p className="text-lg font-bold text-text-primary leading-tight pr-12">
                          {hook.text}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border-custom">
                        <div className="space-y-2">
                          <p className="text-[10px] font-black text-accent-custom uppercase tracking-widest flex items-center gap-2">
                            <Sparkles className="w-3 h-3" />
                            {t.explanation}
                          </p>
                          <p className="text-xs text-text-secondary leading-relaxed italic">
                            {hook.reasoning}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-[10px] font-black text-purple-500 uppercase tracking-widest flex items-center gap-2">
                            <Zap className="w-3 h-3" />
                            {t.psychologicalTriggers}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {hook.triggers.map((trigger, j) => (
                              <span key={j} className="px-2 py-1 bg-purple-500/10 text-purple-500 text-[9px] font-bold uppercase tracking-wider rounded-lg">
                                {t[trigger as keyof typeof t] || trigger}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-9 px-4 rounded-xl text-[10px] font-bold uppercase tracking-widest gap-2"
                          onClick={() => copyToClipboard(hook.text, `ab-${i}`)}
                        >
                          {copiedIndex === `ab-${i}` ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          {copiedIndex === `ab-${i}` ? t.copied : t.copy}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-9 px-4 rounded-xl text-[10px] font-bold uppercase tracking-widest gap-2 text-accent-custom border-accent-custom/20 hover:bg-accent-muted"
                          onClick={() => onRegenerate?.(hook.text)}
                        >
                          <RefreshCcw className="w-3.5 h-3.5" />
                          Regenerate
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>
          )}

          <TabsContent value="hooks" className="mt-6 focus-visible:outline-none">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.hooks.map((hook, i) => (
                <ResultCard 
                  key={`hook-${i}`} 
                  text={hook} 
                  index={i + 1} 
                  type="hook"
                  onCopy={() => copyToClipboard(hook, `hook-${i}`)}
                  isCopied={copiedIndex === `hook-${i}`}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="captions" className="mt-6 focus-visible:outline-none">
            <div className="grid grid-cols-1 gap-4">
              {result.captions.map((caption, i) => (
                <ResultCard 
                  key={`caption-${i}`} 
                  text={caption} 
                  index={i + 1} 
                  type="caption"
                  onCopy={() => copyToClipboard(caption, `caption-${i}`)}
                  isCopied={copiedIndex === `caption-${i}`}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="titles" className="mt-6 focus-visible:outline-none">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.titles.map((title, i) => (
                <ResultCard 
                  key={`title-${i}`} 
                  text={title} 
                  index={i + 1} 
                  type="title"
                  onCopy={() => copyToClipboard(title, `title-${i}`)}
                  isCopied={copiedIndex === `title-${i}`}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      )}

      {result.tool === 'analyzer' && result.analysis && (
        <div className="space-y-4">
          <Card className="bg-bg-card border-border-custom p-6 flex flex-col items-center justify-center text-center space-y-3">
            <div className="relative w-24 h-24 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90">
                <circle cx="48" cy="48" r="44" fill="none" stroke="currentColor" strokeWidth="6" className="text-bg-deep" />
                <circle cx="48" cy="48" r="44" fill="none" stroke="currentColor" strokeWidth="6" strokeDasharray={276} strokeDashoffset={276 - (276 * result.analysis.score) / 10} className="text-accent-custom transition-all duration-1000" />
              </svg>
              <span className="absolute text-3xl font-black text-text-primary">{result.analysis.score}</span>
            </div>
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-widest">{t.score}</h3>
            <p className="text-text-secondary text-[11px] leading-relaxed">{result.analysis.potential}</p>
          </Card>

          <div className="space-y-4">
            <Card className="bg-bg-card border-border-custom p-5 space-y-3">
              <div className="flex items-center gap-2 text-accent-custom font-bold text-[10px] uppercase tracking-widest">
                <AlertCircle className="w-3.5 h-3.5" />
                {t.problems}
              </div>
              <ul className="space-y-2">
                {result.analysis.problems.map((p, i) => (
                  <li key={i} className="flex items-start gap-2 text-text-secondary text-[11px]">
                    <span className="w-1 h-1 rounded-full bg-text-muted mt-1.5 shrink-0" />
                    {p}
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="bg-bg-card border-border-custom p-5 space-y-3 border-l-4 border-l-accent-custom">
              <div className="flex items-center gap-2 text-text-primary font-bold text-[10px] uppercase tracking-widest">
                <CheckCircle2 className="w-3.5 h-3.5 text-accent-custom" />
                {t.improvedVersion}
              </div>
              <p className="text-text-primary text-base font-medium leading-relaxed">
                {result.analysis.improved}
              </p>
              <Button variant="ghost" size="sm" className="h-8 text-[10px] font-bold uppercase tracking-widest text-accent-custom hover:bg-accent-muted" onClick={() => copyToClipboard(result.analysis!.improved, 'improved')}>
                {copiedIndex === 'improved' ? t.copied : t.copy}
              </Button>
            </Card>
          </div>
        </div>
      )}

      {result.tool === 'improver' && result.improvement && (
        <div className="space-y-6">
          <Card className="bg-bg-card border-border-custom p-6 border-l-4 border-l-accent-custom space-y-3">
            <div className="flex items-center gap-2 text-text-primary font-bold text-[10px] uppercase tracking-widest">
              <Star className="w-3.5 h-3.5 text-accent-custom" />
              {t.improvedVersion}
            </div>
            <p className="text-text-primary text-xl font-bold leading-tight">
              {result.improvement.improved}
            </p>
            <div className="pt-3 border-t border-border-custom">
              <p className="text-text-secondary text-[11px] leading-relaxed">
                <strong className="text-text-primary">{t.explanation}:</strong> {result.improvement.explanation}
              </p>
            </div>
          </Card>

          <div className="space-y-3">
            <h3 className="text-sm font-bold text-text-primary flex items-center gap-2 uppercase tracking-widest">
              <ArrowRight className="w-4 h-4 text-accent-custom" />
              {t.variations}
            </h3>
            <div className="space-y-3">
              {result.improvement.variations.map((v, i) => (
                <Card key={i} className="bg-bg-card border-border-custom p-4 group relative">
                  <p className="text-text-primary text-[11px] pr-12 leading-relaxed">{v}</p>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 text-text-muted hover:text-accent-custom bg-bg-deep border border-border-custom" 
                    onClick={() => copyToClipboard(v, `var-${i}`)}
                  >
                    {copiedIndex === `var-${i}` ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

function ResultCard({ text, index, onCopy, isCopied, type, onImprove, onRegenerate }: { text: string; index: number; onCopy: () => void; isCopied: boolean; type: 'hook' | 'caption' | 'title'; onImprove?: () => void; onRegenerate?: () => void; key?: string }) {
  const { t } = useSettings();
  const getBadge = () => {
    if (type !== 'hook') return null;
    const badges = [t.badgeCuriosity, t.badgeUrgency, t.badgeAuthority, t.badgePatternInterrupt, t.badgeSocialProof];
    return badges[index % badges.length];
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="bg-bg-card border-border-custom p-4 hover:border-text-muted transition-all group relative h-full flex flex-col">
        {type === 'hook' && (
          <span className="text-[8px] font-black tracking-widest bg-accent-muted text-accent-custom px-2 py-0.5 rounded w-fit mb-3 uppercase">
            {getBadge()}
          </span>
        )}
        
        <div className="flex gap-3 flex-1">
          {type === 'hook' && (
            <span className="text-accent-custom font-black text-sm mt-0.5 shrink-0">
              {index.toString().padStart(2, '0')}
            </span>
          )}
          <p className={cn(
            "text-[13px] leading-relaxed pr-8",
            type === 'caption' ? "text-text-secondary italic" : "text-text-primary",
            type === 'title' ? "font-bold text-base" : "font-medium"
          )}>
            {text}
          </p>
        </div>

        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border-custom md:opacity-0 md:group-hover:opacity-100 transition-opacity">
          {type === 'hook' && (
            <>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-9 flex-1 md:flex-none text-[9px] font-black uppercase tracking-widest text-accent-custom hover:bg-accent-muted gap-2 border border-accent-custom/10 md:border-none"
                onClick={onImprove}
              >
                <Wand2 className="w-3.5 h-3.5" />
                {t.improveMyHook}
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-9 flex-1 md:flex-none text-[9px] font-black uppercase tracking-widest text-text-muted hover:text-text-primary gap-2 border border-border-custom md:border-none"
                onClick={onRegenerate}
              >
                <RefreshCcw className="w-3.5 h-3.5" />
                Regen
              </Button>
            </>
          )}
        </div>

        <Button
          size="icon"
          variant="ghost"
          className={cn(
            "absolute top-2 right-2 h-8 w-8 rounded-lg transition-all border border-border-custom",
            isCopied ? "bg-accent-custom text-white border-accent-custom" : "bg-bg-deep text-text-muted hover:text-accent-custom"
          )}
          onClick={onCopy}
        >
          {isCopied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        </Button>
      </Card>
    </motion.div>
  );
}
