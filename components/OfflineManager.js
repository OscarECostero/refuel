'use client';

import { useOfflineManager } from '../hooks/useOfflineManager';

export default function OfflineManager() {
  const { isOffline, isUpdateAvailable, updateServiceWorker } = useOfflineManager();

  return (
    <>
      {isOffline && (
        <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-black p-2 text-center z-50">
          Modo sin conexión - Mostrando contenido guardado
        </div>
      )}
      
      {isUpdateAvailable && (
        <div className="fixed bottom-0 left-0 right-0 bg-blue-500 text-white p-4 flex justify-between items-center z-50">
          <span>Hay una nueva versión disponible</span>
          <button
            onClick={updateServiceWorker}
            className="bg-white text-blue-500 px-4 py-2 rounded"
          >
            Actualizar
          </button>
        </div>
      )}
    </>
  );
}