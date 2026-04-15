import { useSettings } from '@/context/SettingsContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X, HelpCircle, Zap, Wand2, Search, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HelpModal({ isOpen, onClose }: HelpModalProps) {
  const { t } = useSettings();

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
            className="relative w-full max-w-2xl"
          >
            <Card className="bg-bg-card border-border-custom shadow-2xl overflow-hidden rounded-2xl max-h-[85vh] flex flex-col">
              <div className="p-6 border-b border-border-custom flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-accent-custom" />
                  <h2 className="text-xl font-bold text-text-primary">{t.helpTitle}</h2>
                </div>
                <Button variant="ghost" size="icon" className="text-text-muted hover:text-text-primary" onClick={onClose}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="p-8 overflow-y-auto space-y-8 custom-scrollbar">
                <div className="space-y-4">
                  <p className="text-text-secondary leading-relaxed">
                    {t.helpIntro}
                  </p>
                </div>

                {/* Tools Section */}
                <div className="space-y-6">
                  <h3 className="text-sm font-black uppercase tracking-[0.2em] text-accent-custom flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    {t.helpToolsTitle}
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="bg-bg-deep p-5 rounded-xl border border-border-custom space-y-2">
                      <div className="flex items-center gap-2 text-text-primary font-bold">
                        <Zap className="w-4 h-4 text-yellow-500" />
                        {t.generator}
                      </div>
                      <p className="text-sm text-text-secondary">{t.helpGeneratorDesc}</p>
                    </div>
                    <div className="bg-bg-deep p-5 rounded-xl border border-border-custom space-y-2">
                      <div className="flex items-center gap-2 text-text-primary font-bold">
                        <Wand2 className="w-4 h-4 text-purple-500" />
                        {t.improver}
                      </div>
                      <p className="text-sm text-text-secondary">{t.helpImproverDesc}</p>
                    </div>
                    <div className="bg-bg-deep p-5 rounded-xl border border-border-custom space-y-2">
                      <div className="flex items-center gap-2 text-text-primary font-bold">
                        <Search className="w-4 h-4 text-blue-500" />
                        {t.analyzer}
                      </div>
                      <p className="text-sm text-text-secondary">{t.helpAnalyzerDesc}</p>
                    </div>
                  </div>
                </div>

                {/* Modes Section */}
                <div className="space-y-6">
                  <h3 className="text-sm font-black uppercase tracking-[0.2em] text-accent-custom flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    {t.helpModesTitle}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-bg-deep p-5 rounded-xl border border-border-custom space-y-2">
                      <div className="text-text-primary font-bold text-sm">{t.normal}</div>
                      <p className="text-xs text-text-secondary leading-relaxed">{t.helpNormalDesc}</p>
                    </div>
                    <div className="bg-bg-deep p-5 rounded-xl border border-border-custom space-y-2">
                      <div className="text-text-primary font-bold text-sm">{t.viral}</div>
                      <p className="text-xs text-text-secondary leading-relaxed">{t.helpViralDesc}</p>
                    </div>
                    <div className="bg-bg-deep p-5 rounded-xl border border-border-custom space-y-2">
                      <div className="text-text-primary font-bold text-sm">{t.aggressive}</div>
                      <p className="text-xs text-text-secondary leading-relaxed">{t.helpAggressiveDesc}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-bg-surface border-t border-border-custom flex justify-end shrink-0">
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
