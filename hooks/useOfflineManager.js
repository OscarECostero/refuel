'use client';

import { useState, useEffect } from 'react';
import { Workbox } from 'workbox-window';

export function useOfflineManager() {
  const [isOffline, setIsOffline] = useState(false);
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [wb, setWb] = useState(null);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      const workbox = new Workbox('/sw.js');

      workbox.addEventListener('waiting', () => {
        setIsUpdateAvailable(true);
      });

      workbox.register();
      setWb(workbox);
    }

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    setIsOffline(!navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const updateServiceWorker = async () => {
    if (wb) {
      await wb.messageSkipWaiting();
      window.location.reload();
    }
  };

  return {
    isOffline,
    isUpdateAvailable,
    updateServiceWorker,
  };
}