'use client';

import { useState, useEffect, useCallback } from 'react';
import { saveQueryParams, buildRedirectUrl } from '../utils/url-utils';

export default function InstallPWA({ onInstallClick }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isIOSChrome, setIsIOSChrome] = useState(false);
  const [isIOSSafari, setIsIOSSafari] = useState(false);
  const [debugInfo, setDebugInfo] = useState({
    isStandalone: false,
    isIOS: false,
    isPWACompatible: false,
    hasServiceWorker: false,
    beforeInstallPromptFired: false,
    currentTimestamp: '',
  });

  const handleBeforeInstallPrompt = useCallback((e) => {
    e.preventDefault();
    setDeferredPrompt(e);
    setIsInstallable(true);
    setDebugInfo(prev => ({
      ...prev,
      beforeInstallPromptFired: true
    }));
  }, []);

  useEffect(() => {
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const iosSafari = ios && /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
    const iosChrome = ios && /CriOS/.test(navigator.userAgent);
    
    setIsIOS(ios);
    setIsIOSSafari(iosSafari);
    setIsIOSChrome(iosChrome);

    if (iosSafari && !window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstallable(true);
    }

    setDebugInfo({
      isStandalone: window.matchMedia('(display-mode: standalone)').matches,
      isIOS: ios,
      isIOSSafari: iosSafari,
      isIOSChrome: iosChrome,
      isPWACompatible: 'serviceWorker' in navigator,
      hasServiceWorker: false,
      beforeInstallPromptFired: !!deferredPrompt,
      currentTimestamp: new Date().toLocaleTimeString(),
    });

    if (!ios) {
      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    }

    return () => {
      if (!ios) {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      }
    };
  }, [handleBeforeInstallPrompt]);

  const handleIOSInstall = useCallback(() => {
    saveQueryParams();
    const modal = document.createElement('div');
    modal.innerHTML = `
      <div class="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
        <div class="bg-white rounded-lg p-6 max-w-sm w-full">
          <h3 class="text-lg font-bold mb-4 text-black">Install on iOS</h3>
          <ol class="list-decimal list-inside space-y-2 text-gray-700 mb-4">
            <li>Tap the share button</li>
            <li>Scroll down and tap "Add to Home Screen"</li>
            <li>Tap "Add" in the top right</li>
          </ol>
          <button class="w-full bg-blue-500 text-white py-2 rounded-lg" onclick="this.parentElement.parentElement.remove()">
            Got it
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }, []);

  const handleInstallClick = useCallback(async () => {
    if (isIOS) {
      handleIOSInstall();
      return;
    }

    if (!deferredPrompt) {
      console.log('No installation prompt available');
      return;
    }

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted installation');
        saveQueryParams();
        setTimeout(() => {
          const redirectUrl = buildRedirectUrl('https://legendsfront.com/trending/pwa-test');
          window.location.href = redirectUrl;
        }, 1000);
      }
    } catch (err) {
      console.error('Installation error:', err);
    }
  }, [deferredPrompt, isIOS, handleIOSInstall]);

  useEffect(() => {
    onInstallClick?.({
      handleInstall: handleInstallClick,
      isInstallable: isInstallable
    });
  }, [handleInstallClick, isInstallable, onInstallClick]);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black/80 text-white p-4 text-xs">
      <div className="max-w-2xl mx-auto">
        <h3 className="font-bold mb-2">Debug Info:</h3>
        <div className="grid grid-cols-2 gap-2">
          <ul>
            <li>🕒 Last update: {debugInfo.currentTimestamp}</li>
            <li>📱 standalone: {debugInfo.isStandalone ? '✅' : '❌'}</li>
            <li>🍎 iOS Device: {debugInfo.isIOS ? '✅' : '❌'}</li>
            <li>🔧 iOS Safari: {debugInfo.isIOSSafari ? '✅' : '❌'}</li>
            <li>🌐 iOS Chrome: {debugInfo.isIOSChrome ? '✅' : '❌'}</li>
            <li>🔧 PWA ready: {debugInfo.isPWACompatible ? '✅' : '❌'}</li>
            <li>👷 Service Worker active: {debugInfo.hasServiceWorker ? '✅' : '❌'}</li>
            <li>📥 Can Install: {isInstallable ? '✅' : '❌'}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}