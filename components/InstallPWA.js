'use client';

import { useState, useEffect } from 'react';

export default function InstallPWA({ onInstallClick }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [debugInfo, setDebugInfo] = useState({
    isStandalone: false,
    isIOS: false,
    isPWACompatible: false,
    hasServiceWorker: false,
    beforeInstallPromptFired: false,
    currentTimestamp: '',
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const updateDebugInfo = () => {
        setDebugInfo({
          isStandalone: window.matchMedia('(display-mode: standalone)').matches,
          isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent),
          isPWACompatible: 'serviceWorker' in navigator,
          hasServiceWorker: false,
          beforeInstallPromptFired: !!deferredPrompt,
          currentTimestamp: new Date().toLocaleTimeString(),
        });
      };

      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(registrations => {
          setDebugInfo(prev => ({
            ...prev,
            hasServiceWorker: registrations.length > 0
          }));
        });
      }

      const handleBeforeInstallPrompt = (e) => {
        e.preventDefault();
        setDeferredPrompt(e);
        setIsInstallable(true);
        updateDebugInfo();
      };

      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      updateDebugInfo();

      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      };
    }
  }, [deferredPrompt]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      console.log('No hay prompt de instalación disponible');
      return;
    }

    try {
      await deferredPrompt.prompt();
      
      const choiceResult = await deferredPrompt.userChoice;
      
      setDebugInfo(prev => ({
        ...prev,
        lastUserChoice: choiceResult.outcome,
      }));

      setDeferredPrompt(null);
      setIsInstallable(false);

      if (choiceResult.outcome === 'accepted') {
        console.log('Usuario aceptó la instalación');
        setTimeout(() => {
          window.location.href = 'https://refuelpickup.com/';
        }, 1000);
      }
    } catch (err) {
      console.error('Error durante la instalación:', err);
      setDebugInfo(prev => ({
        ...prev,
        lastError: err.message,
      }));
    }
  };

  useEffect(() => {
    onInstallClick?.({ 
      handleInstall: handleInstallClick, 
      isInstallable: !!deferredPrompt 
    });
  }, [deferredPrompt, onInstallClick]);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black/80 text-white p-4 text-xs">
      <div className="max-w-2xl mx-auto">
        <h3 className="font-bold mb-2">Debug Info:</h3>
        <div className="grid grid-cols-2 gap-2">
          <ul>
            <li>🕒 Last update: {debugInfo.currentTimestamp}</li>
            <li>📱 standalone: {debugInfo.isStandalone ? '✅' : '❌'}</li>
            <li>🍎 iOS Device: {debugInfo.isIOS ? '✅' : '❌'}</li>
            <li>🔧 PWA ready: {debugInfo.isPWACompatible ? '✅' : '❌'}</li>
            <li>👷 Service Worker active: {debugInfo.hasServiceWorker ? '✅' : '❌'}</li>
            <li>📥 Event beforeinstallprompt: {debugInfo.beforeInstallPromptFired ? '✅' : '❌'}</li>
            <li>💾 DeferredPrompt ready: {deferredPrompt ? '✅' : '❌'}</li>
            <li>🎯 can ``: {isInstallable ? '✅' : '❌'}</li>
            {debugInfo.lastUserChoice && (
              <li>✨ Last user choice: {debugInfo.lastUserChoice}</li>
            )}
            {debugInfo.lastError && (
              <li className="text-red-400">❌ Error: {debugInfo.lastError}</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}