'use client';

import { useOfflineManager } from '../hooks/useOfflineManager';

export default function OfflineManager() {
  const { isOffline, isUpdateAvailable, updateServiceWorker } = useOfflineManager();

  return (
    <>
      {isOffline && (
        <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-black p-2 text-center z-50">
          Offline
        </div>
      )}
    </>
  );
}