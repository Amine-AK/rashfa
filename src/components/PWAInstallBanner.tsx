import React, { useState, useEffect } from 'react';
import { Download, Smartphone, X, Share } from 'lucide-react';

export const PWAInstallBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if already installed as standalone PWA
    const isStandaloneApp = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
    setIsStandalone(isStandaloneApp);

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Listen for beforeinstallprompt (Android / Chrome)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    }
  };

  if (isStandalone || dismissed) return null;

  return (
    <div className="fixed bottom-4 left-3 right-3 z-50 max-w-md mx-auto bg-stone-900/95 backdrop-blur-md border-2 border-amber-500/80 p-3.5 rounded-2xl shadow-2xl animate-fadeIn text-stone-100 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center font-bold shrink-0">
          <Smartphone className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-bold text-xs text-stone-100">Install Rashfa App</h4>
          <p className="text-[11px] text-stone-400">
            {isIOS ? 'Tap Share ➔ Add to Home Screen' : 'Install on your phone for 1-tap access'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        {!isIOS && deferredPrompt && (
          <button
            onClick={handleInstallClick}
            className="bg-amber-500 hover:bg-amber-400 text-stone-950 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 shadow transition-all active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Install</span>
          </button>
        )}

        {isIOS && (
          <span className="text-[11px] bg-stone-800 text-amber-300 font-bold px-2 py-1 rounded-lg flex items-center gap-1 border border-stone-700">
            <Share className="w-3 h-3 text-amber-400" />
            <span>Share ➔ Add</span>
          </span>
        )}

        <button
          onClick={() => setDismissed(true)}
          className="text-stone-400 hover:text-stone-200 p-1"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
