import { useState, useEffect } from 'react';
import { useSettings } from '@/context/SettingsContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X, Download, Monitor } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function InstallPWA() {
  const { t } = useSettings();
  const [show, setShow] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Check if already installed or dismissed
    const isDismissed = localStorage.getItem('pwa_dismissed');
    if (isDismissed) return;

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShow(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // For testing/demo purposes, if beforeinstallprompt doesn't fire (e.g. in some browsers)
    // we can show it after a delay if it's not a standalone app
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (!isStandalone && !isDismissed) {
      const timer = setTimeout(() => {
        if (!deferredPrompt) setShow(true);
      }, 5000);
      return () => clearTimeout(timer);
    }

    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, [deferredPrompt]);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        localStorage.setItem('pwa_dismissed', 'true');
        setShow(false);
      }
      setDeferredPrompt(null);
    } else {
      // Fallback for browsers that don't support beforeinstallprompt
      // Just hide and mark as dismissed for now
      localStorage.setItem('pwa_dismissed', 'true');
      setShow(false);
      alert('To install: Use your browser menu and select "Add to Home Screen"');
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('pwa_dismissed', 'true');
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[300] w-[90%] max-w-md"
        >
          <Card className="bg-bg-card border-accent-custom/30 shadow-2xl p-4 flex items-center gap-4 border-2">
            <div className="w-12 h-12 rounded-xl bg-accent-muted flex items-center justify-center shrink-0">
              <Monitor className="w-6 h-6 text-accent-custom" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-text-primary truncate">{t.pwaTitle}</h4>
              <p className="text-xs text-text-secondary truncate">{t.pwaDesc}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" className="bg-accent-custom hover:bg-accent-custom/90 text-white font-bold text-xs" onClick={handleInstall}>
                {t.pwaInstall}
              </Button>
              <Button size="icon" variant="ghost" className="h-8 w-8 text-text-muted hover:text-text-primary" onClick={handleDismiss}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
