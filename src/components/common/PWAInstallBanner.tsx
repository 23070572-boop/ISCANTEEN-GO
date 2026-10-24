import React, { useState, useEffect } from 'react';
import { Download, Share, PlusSquare, WifiOff, Smartphone, ExternalLink } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { feedback } from '../../utils/feedback';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const PWAInstallBanner: React.FC = () => {
  const { openAppStoreModal } = useApp();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsInstalled(isStandalone);

    const ua = window.navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(ua));

    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const handlePrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handlePrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handlePrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    feedback.tap();
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
        setDeferredPrompt(null);
      }
    } else {
      openAppStoreModal();
    }
  };

  return (
    <>
      {/* Offline banner */}
      {!isOnline && (
        <div className="fixed top-12 inset-x-3 z-50 max-w-md mx-auto bg-stone-900 text-stone-100 px-3.5 py-2 rounded-2xl text-xs flex items-center justify-between shadow-xl">
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Mất kết nối Internet — Đang hiển thị mã QR & vé offline</span>
          </div>
        </div>
      )}

      {/* PWA Prompt inside mobile view */}
      {!isInstalled && (
        <div className="mx-4 mt-2.5 mb-1 p-3 rounded-2xl bg-white border border-stone-200/80 flex items-center justify-between gap-3 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-stone-900 text-stone-100 flex items-center justify-center shrink-0 shadow-2xs">
              <Smartphone className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-stone-900 leading-tight truncate">Cài đặt ứng dụng ISCanteen Go</p>
              <p className="text-[10px] text-stone-500 truncate">Toàn màn hình · Vé QR offline · Gợi ý AI</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleInstallClick}
              className="px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-100 font-semibold text-xs active:scale-95 transition-all"
            >
              {isIOS ? 'Thêm vào Home' : 'Cài App'}
            </button>
            <button
              onClick={() => {
                feedback.tap();
                openAppStoreModal();
              }}
              className="p-1.5 text-stone-500 hover:text-stone-900 rounded-lg hover:bg-stone-100 transition-colors"
              title="Hướng dẫn & App Store"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
