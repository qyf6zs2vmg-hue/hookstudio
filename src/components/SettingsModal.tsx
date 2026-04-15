import { useSettings } from '@/context/SettingsContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X, Globe, Moon, Sun, Monitor } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { settings, t, setLanguage, setTheme } = useSettings();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md"
          >
            <Card className="bg-bg-card border-border-custom shadow-2xl overflow-hidden rounded-2xl">
              <div className="p-6 border-b border-border-custom flex items-center justify-between">
                <h2 className="text-xl font-bold text-text-primary">{t.settings}</h2>
                <Button variant="ghost" size="icon" className="text-text-muted hover:text-text-primary" onClick={onClose}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="p-6 space-y-8">
                {/* Language */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-text-secondary">
                    <Globe className="w-4 h-4" />
                    <span className="text-sm font-bold uppercase tracking-widest">{t.language}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {(['ru', 'uz'] as const).map((lang) => (
                      <button
                        key={lang}
                        onClick={() => setLanguage(lang)}
                        className={cn(
                          "py-3 rounded-xl border text-sm font-bold transition-all",
                          settings.language === lang 
                            ? "bg-accent-muted border-accent-custom text-accent-custom" 
                            : "bg-bg-deep border-border-custom text-text-secondary hover:border-text-muted"
                        )}
                      >
                        {lang === 'ru' ? 'Русский' : 'O\'zbekcha'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Theme */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-text-secondary">
                    <Monitor className="w-4 h-4" />
                    <span className="text-sm font-bold uppercase tracking-widest">{t.theme}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => setTheme('light')}
                      className={cn(
                        "flex flex-col items-center gap-2 py-4 rounded-xl border transition-all",
                        settings.theme === 'light' 
                          ? "bg-accent-muted border-accent-custom text-accent-custom" 
                          : "bg-bg-deep border-border-custom text-text-secondary hover:border-text-muted"
                      )}
                    >
                      <Sun className="w-5 h-5" />
                      <span className="text-[10px] font-bold uppercase">{t.light}</span>
                    </button>
                    <button
                      onClick={() => setTheme('dark')}
                      className={cn(
                        "flex flex-col items-center gap-2 py-4 rounded-xl border transition-all",
                        settings.theme === 'dark' 
                          ? "bg-accent-muted border-accent-custom text-accent-custom" 
                          : "bg-bg-deep border-border-custom text-text-secondary hover:border-text-muted"
                      )}
                    >
                      <Moon className="w-5 h-5" />
                      <span className="text-[10px] font-bold uppercase">{t.dark}</span>
                    </button>
                    <button
                      onClick={() => setTheme('system')}
                      className={cn(
                        "flex flex-col items-center gap-2 py-4 rounded-xl border transition-all",
                        settings.theme === 'system' 
                          ? "bg-accent-muted border-accent-custom text-accent-custom" 
                          : "bg-bg-deep border-border-custom text-text-secondary hover:border-text-muted"
                      )}
                    >
                      <Monitor className="w-5 h-5" />
                      <span className="text-[10px] font-bold uppercase">{t.system}</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-bg-surface border-t border-border-custom flex justify-end">
                <Button className="bg-text-primary text-bg-deep hover:opacity-90 font-bold px-8" onClick={onClose}>
                  OK
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
