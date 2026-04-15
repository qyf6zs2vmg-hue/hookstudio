import { GenerationResult } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Share2, Download, Star, AlertCircle, ArrowRight, CheckCircle2, ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { useSettings } from '@/context/SettingsContext';

interface OutputDisplayProps {
  result: GenerationResult;
  onBack: () => void;
}

export function OutputDisplay({ result, onBack }: OutputDisplayProps) {
  const { t } = useSettings();
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full space-y-6"
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
        <Tabs defaultValue="hooks" className="w-full">
          <TabsList className="flex bg-bg-deep border border-border-custom p-1 h-10 rounded-xl w-full">
            <TabsTrigger value="hooks" className="flex-1 data-[state=active]:bg-bg-card data-[state=active]:text-text-primary rounded-lg text-[10px] font-black uppercase tracking-wider transition-all">
              {t.hooks}
            </TabsTrigger>
            <TabsTrigger value="captions" className="flex-1 data-[state=active]:bg-bg-card data-[state=active]:text-text-primary rounded-lg text-[10px] font-black uppercase tracking-wider transition-all">
              {t.captions}
            </TabsTrigger>
            <TabsTrigger value="titles" className="flex-1 data-[state=active]:bg-bg-card data-[state=active]:text-text-primary rounded-lg text-[10px] font-black uppercase tracking-wider transition-all">
              {t.titles}
            </TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            <TabsContent value="hooks" className="mt-4">
              <div className="space-y-3">
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

            <TabsContent value="captions" className="mt-4">
              <div className="space-y-3">
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

            <TabsContent value="titles" className="mt-4">
              <div className="space-y-3">
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
          </AnimatePresence>
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
                  <p className="text-text-primary text-[11px] pr-10 leading-relaxed">{v}</p>
                  <Button variant="ghost" size="icon" className="absolute right-1 top-1 h-8 w-8 opacity-0 group-hover:opacity-100" onClick={() => copyToClipboard(v, `var-${i}`)}>
                    <Download className="w-3.5 h-3.5" />
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

function ResultCard({ text, index, onCopy, isCopied, type }: { text: string; index: number; onCopy: () => void; isCopied: boolean; type: 'hook' | 'caption' | 'title'; key?: string }) {
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
            <span className="text-accent-custom font-black text-xs mt-0.5 shrink-0">
              {index.toString().padStart(2, '0')}
            </span>
          )}
          <p className={cn(
            "text-[12px] leading-relaxed",
            type === 'caption' ? "text-text-secondary italic" : "text-text-primary",
            type === 'title' ? "font-bold" : "font-medium"
          )}>
            {text}
          </p>
        </div>

        <button
          className="absolute top-2 right-2 text-[8px] font-black uppercase tracking-widest text-text-muted hover:text-text-primary transition-colors opacity-0 group-hover:opacity-100 bg-bg-deep px-2 py-1 rounded border border-border-custom"
          onClick={onCopy}
        >
          {isCopied ? t.copied : t.copy}
        </button>
      </Card>
    </motion.div>
  );
}
