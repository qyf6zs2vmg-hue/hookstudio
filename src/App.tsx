import { useState, useEffect, useRef } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { MainPanel } from '@/components/MainPanel';
import { OutputDisplay } from '@/components/OutputDisplay';
import { ChatAssistant } from '@/components/ChatAssistant';
import { SettingsModal } from '@/components/SettingsModal';
import { HelpModal } from '@/components/HelpModal';
import { InstallPWA } from '@/components/InstallPWA';
import { ViralMode, GenerationResult, ContentPack, ContentTone, ToolType, AlgorithmMode, ContentGoal } from '@/lib/types';
import { enqueueRequest, QueueStatus, getSystemStatus } from '@/services/queueService';
import { useHistory } from '@/hooks/useHistory';
import { Toaster } from '@/components/ui/sonner';
import { SettingsProvider, useSettings } from '@/context/SettingsContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { OnboardingModal } from '@/components/OnboardingModal';
import { Menu, X, Clock, AlertTriangle, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

function AppContent() {
  const { t } = useSettings();
  const { history, saveToHistory, deleteFromHistory, getResult } = useHistory();
  const [activeResult, setActiveResult] = useState<GenerationResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  
  // Queue & Limit State
  const [queueStatus, setQueueStatus] = useState<QueueStatus | null>(null);
  const [systemStatus, setSystemStatus] = useState(getSystemStatus());

  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setSystemStatus(getSystemStatus());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Scroll main content to top when result changes
    if (mainRef.current) {
      mainRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [activeResult?.id]);

  useEffect(() => {
    // Check for first visit
    const hasVisited = localStorage.getItem('hook_studio_visited');
    if (!hasVisited) {
      setIsOnboardingOpen(true);
      localStorage.setItem('hook_studio_visited', 'true');
    }
  }, []);

  const formatTime = (ms: number) => {
    const hours = Math.floor(ms / 3600000);
    const mins = Math.floor((ms % 3600000) / 60000);
    const secs = Math.floor((ms % 60000) / 1000);
    return `${hours}h ${mins}m ${secs}s`;
  };

  const handleGenerate = async (
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
  ) => {
    setIsGenerating(true);
    setQueueStatus(null);
    
    try {
      const result = await enqueueRequest(input, mode, pack, tone, tool, (status) => {
        setQueueStatus(status);
      }, options);
      
      setActiveResult(result);
      saveToHistory(result);
      toast.success(t.statusReady);
    } catch (error: any) {
      if (error.message === 'USER_LIMIT_REACHED') {
        toast.error(t.userLimitReached);
      } else if (error.message === 'GLOBAL_LIMIT_REACHED') {
        toast.error(t.globalLimitReached);
      } else if (error.message === 'COOLDOWN_ACTIVE') {
        toast.error(t.cooldownActive.replace('{time}', Math.ceil(systemStatus.cooldown.remainingTime / 1000).toString()));
      } else {
        toast.error(t.errorFallback);
      }
    } finally {
      setIsGenerating(false);
      setQueueStatus(null);
      setSystemStatus(getSystemStatus());
    }
  };

  const handleSelectHistory = (id: string) => {
    const result = getResult(id);
    if (result) {
      setActiveResult(result);
      setIsSidebarOpen(false);
    }
  };

  const handleNew = () => {
    setActiveResult(null);
    setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-bg-deep text-text-primary font-sans dark overflow-x-hidden flex flex-col md:flex-row">
      {/* Desktop Sidebar (Permanent) */}
      <aside className="hidden md:flex w-[280px] border-r border-border-custom bg-bg-card shrink-0 h-screen sticky top-0">
        <Sidebar 
          history={history}
          activeId={activeResult?.id || null}
          onSelect={handleSelectHistory}
          onDelete={deleteFromHistory}
          onNew={handleNew}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenHelp={() => setIsHelpOpen(true)}
        />
      </aside>

      <div className="flex-1 flex flex-col min-h-screen relative overflow-hidden">
        {/* Header (Mobile Only) */}
        <header className="md:hidden h-16 border-b border-border-custom flex items-center justify-between px-6 shrink-0 bg-bg-card/80 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-text-secondary"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-black tracking-tighter text-text-primary">
              Hook Studio
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-text-secondary"
              onClick={() => setIsSettingsOpen(true)}
            >
              <span className="w-2 h-2 rounded-full bg-accent-custom animate-pulse" />
            </Button>
          </div>
        </header>

        {/* Mobile Sidebar Drawer Overlay */}
        <div 
          className={cn(
            "fixed inset-0 bg-black/80 z-40 transition-opacity duration-300 md:hidden",
            isSidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          )}
          onClick={() => setIsSidebarOpen(false)}
        />

        {/* Mobile Sidebar Drawer */}
        <aside className={cn(
          "fixed top-0 left-0 bottom-0 w-[280px] bg-bg-deep z-50 transition-transform duration-300 shadow-2xl md:hidden",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <Sidebar 
            history={history}
            activeId={activeResult?.id || null}
            onSelect={handleSelectHistory}
            onDelete={deleteFromHistory}
            onNew={handleNew}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenHelp={() => setIsHelpOpen(true)}
          />
        </aside>

        {/* Main Content Area */}
        <main 
          ref={mainRef}
          className="flex-1 flex flex-col overflow-y-auto no-scrollbar w-full bg-bg-deep"
        >
          <div className="flex-1 flex flex-col p-4 md:p-10 max-w-[1400px] mx-auto w-full">
            {/* Desktop Header (Visible only on desktop) */}
            <div className="hidden md:flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-black tracking-tighter text-text-primary">Hook Studio AI</h1>
                <p className="text-text-secondary text-sm font-medium mt-1 uppercase tracking-widest">{t.creatorMode}</p>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" className="bg-bg-card border-border-custom" onClick={() => setIsHelpOpen(true)}>
                  {t.help}
                </Button>
                <Button variant="outline" size="sm" className="bg-bg-card border-border-custom" onClick={() => setIsSettingsOpen(true)}>
                  {t.settings}
                </Button>
              </div>
            </div>
            {/* System Status Banner */}
            <div className="mb-4 space-y-2">
              {(systemStatus.limits.isUserLimited || systemStatus.limits.isGlobalLimited) && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-3 flex items-center gap-3 text-destructive animate-in fade-in slide-in-from-top-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <div className="flex-1">
                    <p className="text-[10px] font-black uppercase tracking-widest">
                      {systemStatus.limits.isGlobalLimited ? t.globalLimitReached : t.userLimitReached}
                    </p>
                    <p className="text-[9px] opacity-80 font-bold uppercase tracking-wider">
                      {t.tryAgainTomorrow} • {t.resetCountdown.replace('{time}', formatTime(systemStatus.limits.resetTimeRemaining))}
                    </p>
                  </div>
                </div>
              )}

              {isGenerating && queueStatus && (
                <div className="bg-accent-muted border border-accent-custom/20 rounded-xl p-3 flex items-center gap-3 text-accent-custom animate-pulse">
                  <Clock className="w-4 h-4 shrink-0" />
                  <div className="flex-1">
                    <p className="text-[10px] font-black uppercase tracking-widest">
                      {t.inQueue}
                    </p>
                    <p className="text-[9px] opacity-80 font-bold uppercase tracking-wider">
                      {t.queuePosition.replace('{pos}', queueStatus.position.toString())} • {t.estimatedWait.replace('{time}', queueStatus.estimatedWaitTime.toString())}
                    </p>
                  </div>
                </div>
              )}

              {systemStatus.cooldown.isCoolingDown && !isGenerating && (
                <div className="bg-bg-surface border border-border-custom rounded-xl p-3 flex items-center gap-3 text-text-secondary">
                  <Timer className="w-4 h-4 shrink-0" />
                  <div className="flex-1">
                    <p className="text-[10px] font-black uppercase tracking-widest">
                      {t.cooldownActive.replace('{time}', Math.ceil(systemStatus.cooldown.remainingTime / 1000).toString())}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {!activeResult ? (
              <div className="flex-1 flex flex-col items-center justify-center py-8">
                <MainPanel onGenerate={handleGenerate} isGenerating={isGenerating} />
              </div>
            ) : (
              <div className="flex-1 space-y-6">
                <OutputDisplay 
                  result={activeResult} 
                  onBack={() => setActiveResult(null)} 
                  onRegenerate={(idea) => handleGenerate(idea, activeResult.mode, activeResult.pack, activeResult.tone, 'generator')}
                />
                <div className="px-4 pb-12">
                  <Button 
                    variant="ghost" 
                    className="w-full border border-dashed border-border-custom text-text-muted hover:text-text-secondary hover:bg-bg-surface/50 h-14 rounded-2xl transition-all font-bold uppercase tracking-widest text-[10px]"
                    onClick={handleNew}
                  >
                    {t.newChat}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <footer className="py-8 border-t border-border-custom text-center space-y-3 bg-bg-deep/30 px-6">
            <p className="text-text-muted text-[10px] font-bold uppercase tracking-[0.2em]">
              © 2026 Hook Studio AI
            </p>
            <div className="flex justify-center gap-6 text-[9px] text-text-muted uppercase tracking-widest font-bold">
              <a href="#" className="hover:text-text-secondary transition-colors">Privacy</a>
              <a href="#" className="hover:text-text-secondary transition-colors">Terms</a>
              <a href="#" className="hover:text-text-secondary transition-colors">Contact</a>
            </div>
          </footer>
        </main>

        <ChatAssistant />
        <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
        <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
        <OnboardingModal isOpen={isOnboardingOpen} onClose={() => setIsOnboardingOpen(false)} />
        <InstallPWA />
        <Toaster position="top-center" theme="dark" />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <SettingsProvider>
        <AppContent />
      </SettingsProvider>
    </ErrorBoundary>
  );
}

