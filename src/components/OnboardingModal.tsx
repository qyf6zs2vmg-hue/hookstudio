import { useSettings } from '@/context/SettingsContext';
import { Button } from '@/components/ui/button';
import { X, Rocket, Zap, Target, BarChart3 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function OnboardingModal({ isOpen, onClose }: OnboardingModalProps) {
  const { t } = useSettings();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-2xl bg-bg-card border border-border-custom rounded-[2.5rem] shadow-2xl overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-accent-custom via-purple-500 to-accent-custom animate-gradient-x" />
            
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-2 text-text-muted hover:text-text-primary transition-colors rounded-full hover:bg-bg-deep"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-8 md:p-12">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-accent-custom flex items-center justify-center text-white shadow-lg shadow-accent-custom/20">
                  <Rocket className="w-6 h-6" />
                </div>
                <h2 className="text-2xl md:text-3xl font-black tracking-tighter text-text-primary">
                  {t.onboardingTitle}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-sm font-black uppercase tracking-widest text-accent-custom flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      {t.onboardingSection1Title}
                    </h3>
                    <p className="text-sm text-text-secondary leading-relaxed">
                      {t.onboardingSection1Desc}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-black uppercase tracking-widest text-accent-custom flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      {t.onboardingSection2Title}
                    </h3>
                    <p className="text-sm text-text-secondary leading-relaxed">
                      {t.onboardingSection2Desc}
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-sm font-black uppercase tracking-widest text-accent-custom flex items-center gap-2">
                      <BarChart3 className="w-4 h-4" />
                      {t.onboardingSection3Title}
                    </h3>
                    <p className="text-sm text-text-secondary leading-relaxed">
                      {t.onboardingSection3Desc}
                    </p>
                  </div>

                  <div className="bg-bg-deep p-6 rounded-2xl border border-border-custom">
                    <ul className="space-y-3">
                      {['Viral score prediction', 'Algorithm-optimized', 'A/B hook testing', 'Psychological tuning'].map((item, i) => (
                        <li key={i} className="flex items-center gap-3 text-xs font-bold text-text-primary">
                          <div className="w-1.5 h-1.5 rounded-full bg-accent-custom" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="mt-12 flex justify-center">
                <Button
                  onClick={onClose}
                  className="h-14 px-12 bg-accent-custom hover:opacity-90 text-white font-black rounded-2xl shadow-xl shadow-accent-custom/20 uppercase tracking-[0.2em] text-xs transition-all hover:scale-105 active:scale-95"
                >
                  {t.onboardingCTA}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
