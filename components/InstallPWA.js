'use client';

import { useState, useEffect } from 'react';

export default function InstallPWA() {
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
      // Actualizar información de depuración
      const updateDebugInfo = () => {
        setDebugInfo({
          isStandalone: window.matchMedia('(display-mode: standalone)').matches,
          isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent),
          isPWACompatible: 'serviceWorker' in navigator,
          hasServiceWorker: false, // Se actualizará después
          beforeInstallPromptFired: !!deferredPrompt,
          currentTimestamp: new Date().toLocaleTimeString(),
        });
      };

      // Verificar service worker
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

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('SW registered:', registration);
          setDebugInfo(prev => ({
            ...prev,
            hasServiceWorker: true
          }));
        })
        .catch(error => {
          console.log('SW registration failed:', error);
          setDebugInfo(prev => ({
            ...prev,
            hasServiceWorker: false,
            lastError: error.message
          }));
        });
    }
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      setDebugInfo(prev => ({
        ...prev,
        lastUserChoice: outcome,
      }));
      setDeferredPrompt(null);
      setIsInstallable(false);
    } catch (err) {
      setDebugInfo(prev => ({
        ...prev,
        lastError: err.message,
      }));
    }
  };

  return (
    <div>
      {/* Panel de depuración */}
      <div className="fixed top-0 left-0 right-0 bg-black/80 text-white p-4 text-xs z-50">
        <h3 className="font-bold mb-2">Debug Info:</h3>
        <ul>
          <li>🕒 Última actualización: {debugInfo.currentTimestamp}</li>
          <li>📱 Modo standalone: {debugInfo.isStandalone ? '✅' : '❌'}</li>
          <li>🍎 Dispositivo iOS: {debugInfo.isIOS ? '✅' : '❌'}</li>
          <li>🔧 Compatible con PWA: {debugInfo.isPWACompatible ? '✅' : '❌'}</li>
          <li>👷 Service Worker activo: {debugInfo.hasServiceWorker ? '✅' : '❌'}</li>
          <li>📥 Evento beforeinstallprompt: {debugInfo.beforeInstallPromptFired ? '✅' : '❌'}</li>
          <li>💾 DeferredPrompt disponible: {deferredPrompt ? '✅' : '❌'}</li>
          <li>🎯 Es instalable: {isInstallable ? '✅' : '❌'}</li>
          {debugInfo.lastUserChoice && (
            <li>✨ Última elección: {debugInfo.lastUserChoice}</li>
          )}
          {debugInfo.lastError && (
            <li className="text-red-400">❌ Error: {debugInfo.lastError}</li>
          )}
        </ul>
      </div>

      {/* Botón de instalación */}
      {isInstallable && (
        <button
          onClick={handleInstallClick}
          className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-blue-700 transition-colors"
        >
          Instalar App
        </button>
      )}
    </div>
  );
}