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
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const downloadResults = () => {
    let content = `IDEA: ${result.idea}\nMODE: ${result.mode}\nTOOL: ${result.tool}\n\n`;
    
    if (result.tool === 'generator') {
      content += `HOOKS:\n${result.hooks.map((h, i) => `${i + 1}. ${h}`).join('\n')}\n\n`;
      content += `CAPTIONS:\n${result.captions.map((c, i) => `${i + 1}. ${c}`).join('\n')}\n\n`;
      content += `TITLES:\n${result.titles.map((t, i) => `${i + 1}. ${t}`).join('\n')}`;
    } else if (result.tool === 'analyzer' && result.analysis) {
      content += `SCORE: ${result.analysis.score}/10\nPOTENTIAL: ${result.analysis.potential}\n\nPROBLEMS:\n${result.analysis.problems.join('\n')}\n\nIMPROVED: ${result.analysis.improved}`;
    } else if (result.tool === 'improver' && result.improvement) {
      content += `IMPROVED: ${result.improvement.improved}\n\nVARIATIONS:\n${result.improvement.variations.join('\n')}\n\nEXPLANATION: ${result.improvement.explanation}`;
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
      className="max-w-6xl mx-auto w-full py-12 px-8 space-y-8"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-text-muted hover:text-text-primary"
            onClick={onBack}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-text-primary tracking-tight">{t.results}</h2>
            <p className="text-text-secondary text-sm mt-1">
              {t.workspace}: <span className="text-text-primary font-medium italic">"{result.idea}"</span>
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" className="bg-bg-surface border-border-custom text-text-secondary hover:text-text-primary" onClick={downloadResults}>
            <Download className="w-4 h-4 mr-2" />
            {t.export}
          </Button>
          <Button variant="outline" size="sm" className="bg-bg-surface border-border-custom text-text-secondary hover:text-text-primary" onClick={() => toast.info('Sharing coming soon!')}>
            <Share2 className="w-4 h-4 mr-2" />
            {t.share}
          </Button>
        </div>
      </div>

      {result.tool === 'generator' && (
        <Tabs defaultValue="hooks" className="w-full">
          <TabsList className="flex bg-bg-deep border border-border-custom p-1 h-12 rounded-xl w-fit">
            <TabsTrigger value="hooks" className="px-6 data-[state=active]:bg-bg-surface data-[state=active]:text-text-primary rounded-lg text-text-secondary font-semibold transition-all">
              {t.hooks}
            </TabsTrigger>
            <TabsTrigger value="captions" className="px-6 data-[state=active]:bg-bg-surface data-[state=active]:text-text-primary rounded-lg text-text-secondary font-semibold transition-all">
              {t.captions}
            </TabsTrigger>
            <TabsTrigger value="titles" className="px-6 data-[state=active]:bg-bg-surface data-[state=active]:text-text-primary rounded-lg text-text-secondary font-semibold transition-all">
              {t.titles}
            </TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            <TabsContent value="hooks" className="mt-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

            <TabsContent value="captions" className="mt-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

            <TabsContent value="titles" className="mt-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-1 bg-bg-card border-border-custom p-8 flex flex-col items-center justify-center text-center space-y-4">
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90">
                <circle cx="64" cy="64" r="58" fill="none" stroke="currentColor" strokeWidth="8" className="text-bg-surface" />
                <circle cx="64" cy="64" r="58" fill="none" stroke="currentColor" strokeWidth="8" strokeDasharray={364} strokeDashoffset={364 - (364 * result.analysis.score) / 10} className="text-accent-custom transition-all duration-1000" />
              </svg>
              <span className="absolute text-4xl font-black text-text-primary">{result.analysis.score}</span>
            </div>
            <h3 className="text-lg font-bold text-text-primary">{t.score}</h3>
            <p className="text-text-secondary text-sm">{result.analysis.potential}</p>
          </Card>

          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-bg-card border-border-custom p-6 space-y-4">
              <div className="flex items-center gap-2 text-accent-custom font-bold text-sm uppercase tracking-widest">
                <AlertCircle className="w-4 h-4" />
                {t.problems}
              </div>
              <ul className="space-y-3">
                {result.analysis.problems.map((p, i) => (
                  <li key={i} className="flex items-start gap-3 text-text-secondary text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-text-muted mt-1.5 shrink-0" />
                    {p}
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="bg-bg-card border-border-custom p-6 space-y-4 border-l-4 border-l-accent-custom">
              <div className="flex items-center gap-2 text-text-primary font-bold text-sm uppercase tracking-widest">
                <CheckCircle2 className="w-4 h-4 text-accent-custom" />
                {t.improvedVersion}
              </div>
              <p className="text-text-primary text-lg font-medium leading-relaxed">
                {result.analysis.improved}
              </p>
              <Button variant="ghost" size="sm" className="text-accent-custom hover:bg-accent-muted" onClick={() => copyToClipboard(result.analysis!.improved, 'improved')}>
                {copiedIndex === 'improved' ? 'Copied' : t.export}
              </Button>
            </Card>
          </div>
        </div>
      )}

      {result.tool === 'improver' && result.improvement && (
        <div className="space-y-8">
          <Card className="bg-bg-card border-border-custom p-8 border-l-4 border-l-accent-custom space-y-4">
            <div className="flex items-center gap-2 text-text-primary font-bold text-sm uppercase tracking-widest">
              <Star className="w-4 h-4 text-accent-custom" />
              {t.improvedVersion}
            </div>
            <p className="text-text-primary text-2xl font-bold leading-tight">
              {result.improvement.improved}
            </p>
            <div className="pt-4 border-t border-border-custom">
              <p className="text-text-secondary text-sm leading-relaxed">
                <strong className="text-text-primary">{t.explanation}:</strong> {result.improvement.explanation}
              </p>
            </div>
          </Card>

          <div className="space-y-4">
            <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
              <ArrowRight className="w-5 h-5 text-accent-custom" />
              {t.variations}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.improvement.variations.map((v, i) => (
                <Card key={i} className="bg-bg-card border-border-custom p-5 group relative">
                  <p className="text-text-primary text-sm pr-12">{v}</p>
                  <Button variant="ghost" size="icon" className="absolute right-2 top-2 h-8 w-8 opacity-0 group-hover:opacity-100" onClick={() => copyToClipboard(v, `var-${i}`)}>
                    <Download className="w-4 h-4" />
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
  const getBadge = () => {
    if (type !== 'hook') return null;
    const badges = ['CURIOSITY', 'URGENCY', 'AUTHORITY', 'PATTERN INTERRUPT', 'SOCIAL PROOF'];
    return badges[index % badges.length];
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="bg-bg-card border-border-custom p-6 hover:border-text-muted transition-all group relative h-full flex flex-col">
        {type === 'hook' && (
          <span className="text-[9px] font-bold tracking-widest bg-accent-muted text-accent-custom px-2 py-1 rounded w-fit mb-4">
            {getBadge()}
          </span>
        )}
        
        <div className="flex gap-3 flex-1">
          {type === 'hook' && (
            <span className="text-accent-custom font-extrabold text-sm mt-0.5 shrink-0">
              {index.toString().padStart(2, '0')}
            </span>
          )}
          <p className={cn(
            "text-sm leading-relaxed",
            type === 'caption' ? "text-text-secondary italic" : "text-text-primary",
            type === 'title' ? "font-semibold" : "font-normal"
          )}>
            {text}
          </p>
        </div>

        <button
          className="absolute top-4 right-4 text-[10px] font-bold uppercase tracking-widest text-text-muted hover:text-text-primary transition-colors opacity-0 group-hover:opacity-100"
          onClick={onCopy}
        >
          {isCopied ? 'Copied' : 'Copy'}
        </button>
      </Card>
    </motion.div>
  );
}
