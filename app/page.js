'use client';

import { useState, useCallback, useEffect } from 'react';
import InstallPWA from '../components/InstallPWA';
import { saveQueryParams, buildRedirectUrl } from '../utils/url-utils';

export default function Home() {
  const [installHandler, setInstallHandler] = useState(null);
  const [canInstall, setCanInstall] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isInstallingPWA, setIsInstallingPWA] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleInstallClick = useCallback(({ handleInstall, isInstallable }) => {
    if (handleInstall) {
      setInstallHandler(() => handleInstall);
      setCanInstall(isInstallable);
    } else {
      setIsInstallingPWA(false);
      setInstallHandler(null);
      setCanInstall(false);
      if (localStorage.getItem('pwa_installed') === 'true') {
        setIsInstalled(true);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches 
        || window.navigator.standalone 
        || document.referrer.includes('android-app://');
      
      const urlParams = new URLSearchParams(window.location.search);
      const launchSource = urlParams.get('source');
      const displayMode = urlParams.get('mode');
      
      if ((isInStandaloneMode && isMobile) || 
          (launchSource === 'pwa-launch' && displayMode === 'standalone' && isMobile)) {
        window.location.replace(buildRedirectUrl('https://legendsfront.com/trending/pwa-test'));
        return;
      }

      if (isInStandaloneMode && !isMobile) {
        window.location.replace(buildRedirectUrl('https://legendsfront.com/trending/pwa-test'));
        return;
      }

      saveQueryParams();
      setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
      const wasInstalled = localStorage.getItem('pwa_installed') === 'true';
      setIsInstalled(wasInstalled);
      setIsLoading(false);
    }
  }, [isMobile]);

  const handleButtonClick = () => {
    if (isInstalled && !isMobile) {
      return
    }

    if (isInstalled && isMobile) {
      setIsRedirecting(true);
      try {
        const pwaUrl = new URL(window.location.origin);
        pwaUrl.searchParams.set('mode', 'standalone');
        pwaUrl.searchParams.set('source', 'pwa-launch');
        
        if ('launchQueue' in window) {
          window.location.href = pwaUrl.toString();
          return;
        }

        const a = document.createElement('a');
        a.href = pwaUrl.toString();
        a.target = '_blank';
        a.rel = 'noopener';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } catch (err) {
        console.error('Error launching PWA:', err);
        window.location.href = window.location.origin;
      }
      return;
    }
    
    if (installHandler) {
      setIsInstallingPWA(true);
      installHandler();
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 px-4">
        <div className="flex items-start mb-8">
          <picture>
            <source srcSet="/icons/144.png" type="image/png" />
            <img src="/icons/144.png" alt="App Icon" className="w-16 h-16 rounded-2xl" />
          </picture>
          <div className="ml-4">
            <h1 className="text-xl font-bold text-black">Fortune Flight</h1>
            <span className="block text-green-700 font-bold">Fortune Flight</span>
            <span className="block text-gray-700">Without ads · In-app purchases</span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-start items-center mt-4 border-gray-300 pt-4">
          <div className="flex justify-between items-center mb-4 px-4">
            <div className="flex flex-col items-center mr-4">
              <span className="font-bold text-black">4.8★</span>
              <span className="text-gray-700">24K reviews</span>
            </div>
            <div className="border-l border-gray-300 h-8 mx-4"></div>
            <div className="flex flex-col items-center">
              <span className="font-bold text-black text-lg">100K+</span>
              <span className="text-gray-700">Downloads</span>
            </div>
            <div className="border-l border-gray-300 h-8 mx-4"></div>
            <div className="flex flex-col items-center">
              <span className="font-bold text-black text-lg">Rated for 18+</span>
            </div>
          </div>
        </div>
          <button
            onClick={handleButtonClick}
            disabled={isInstallingPWA}
            className={`w-full py-4 px-6 rounded-lg font-semibold text-lg shadow-lg transition-colors mt-4 relative ${
              isInstalled || canInstall 
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {isInstallingPWA ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Installing...
              </div>
            ) : (
              isInstalled ? 'Play' : 'Install App'
            )}
          </button>
        </div>
      </div>
      <InstallPWA 
        onInstallClick={handleInstallClick}
        onInstallSuccess={() => {
          setIsInstalled(true);
          localStorage.setItem('pwa_installed', 'true');
        }}
      />
    </div>
  );
} 