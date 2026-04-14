import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { MainPanel } from './components/MainPanel';
import { OutputDisplay } from './components/OutputDisplay';
import { ChatAssistant } from './components/ChatAssistant';
import { SettingsModal } from './components/SettingsModal';
import { HelpModal } from './components/HelpModal';
import { InstallPWA } from './components/InstallPWA';
import { ViralMode, GenerationResult, ContentPack, ContentTone, ToolType } from './lib/types';
import { generateContent } from './services/aiService';
import { useHistory } from './hooks/useHistory';
import { Toaster } from './components/ui/sonner';
import { SettingsProvider, useSettings } from './context/SettingsContext';
import { Menu, X } from 'lucide-react';
import { Button } from './components/ui/button';
import { cn } from './lib/utils';
import { toast } from 'sonner';

function AppContent() {
  const { t } = useSettings();
  const { history, saveToHistory, deleteFromHistory, getResult } = useHistory();
  const [activeResult, setActiveResult] = useState<GenerationResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const handleGenerate = async (input: string, mode: ViralMode, pack: ContentPack, tone: ContentTone, tool: ToolType) => {
    setIsGenerating(true);
    try {
      const result = await generateContent(input, mode, pack, tone, tool);
      setActiveResult(result);
      saveToHistory(result);
      toast.success(t.statusReady);
    } catch (error) {
      toast.error('Something went wrong. Using fallback templates.');
    } finally {
      setIsGenerating(false);
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
    <div className="flex h-screen bg-bg-deep text-text-primary overflow-hidden font-sans">
      {/* Mobile Sidebar Overlay */}
      <div 
        className={cn(
          "fixed inset-0 bg-black/60 z-40 md:hidden transition-opacity duration-300",
          isSidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside className={cn(
        "fixed md:relative z-50 h-full transition-transform duration-300 md:translate-x-0",
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

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative bg-bg-deep">
        {/* Header */}
        <header className="h-16 border-b border-border-custom flex items-center justify-between px-10 shrink-0 bg-bg-deep/80 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden text-text-secondary"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>
            <div className="text-[13px] text-text-secondary">
              {t.workspace} / <strong className="text-text-primary">{activeResult ? activeResult.idea : t.newChat}</strong>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-[13px] text-text-secondary">
              <span className="w-2 h-2 rounded-full bg-accent-custom animate-pulse" />
              {t.statusReady}
            </div>
            <Button variant="ghost" size="sm" className="text-accent-custom hover:bg-accent-muted font-bold uppercase tracking-widest text-[10px]" onClick={() => toast.info('Pro features coming soon!')}>
              {t.upgrade}
            </Button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto scroll-smooth">
          <div className="min-h-full flex flex-col">
            {!activeResult ? (
              <div className="flex-1 flex items-center justify-center py-12">
                <MainPanel onGenerate={handleGenerate} isGenerating={isGenerating} />
              </div>
            ) : (
              <div className="flex-1">
                <OutputDisplay result={activeResult} onBack={() => setActiveResult(null)} />
                <div className="max-w-4xl mx-auto px-8 pb-20">
                  <Button 
                    variant="ghost" 
                    className="w-full border border-dashed border-border-custom text-text-muted hover:text-text-secondary hover:bg-bg-surface/50 h-16 rounded-2xl transition-all"
                    onClick={handleNew}
                  >
                    {t.newChat}
                  </Button>
                </div>
              </div>
            )}
            
            {/* Footer */}
            <footer className="py-12 border-t border-border-custom text-center space-y-4 bg-bg-card/30">
              <p className="text-text-muted text-[11px] font-bold uppercase tracking-[0.2em]">
                © 2026 Hook Studio AI. {t.footerText}
              </p>
              <div className="flex justify-center gap-8 text-[10px] text-text-muted uppercase tracking-widest font-bold">
                <a href="#" className="hover:text-text-secondary transition-colors">Privacy</a>
                <a href="#" className="hover:text-text-secondary transition-colors">Terms</a>
                <a href="#" className="hover:text-text-secondary transition-colors">Contact</a>
              </div>
            </footer>
          </div>
        </div>
      </main>

      <ChatAssistant />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
      <InstallPWA />
      <Toaster position="bottom-right" theme="dark" />
    </div>
  );
}

export default function App() {
  return (
    <SettingsProvider>
      <AppContent />
    </SettingsProvider>
  );
}

