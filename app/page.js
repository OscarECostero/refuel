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
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto py-6 px-4">
        <div className="flex items-start mt-8">
          <picture>
            <source srcSet="/icons/144.png" type="image/png" />
            <img 
              src="/icons/144.png" 
              alt="App Icon" 
              className="w-24 h-24 rounded-xl"
            />
          </picture>
          <div className="ml-4 pt-1">
            <h1 className="text-2xl font-bold text-black mb-1">Fortune Flight</h1>
            <p className="text-sm text-[#01875f] font-medium">Fortune Flight</p>
            <p className="text-sm text-gray-600">Ad-free · In-app purchases</p>
          </div>
        </div>

        <div className="flex items-center mt-8 mb-6 space-x-12">
          <div className="flex flex-col">
            <span className="font-bold text-black">4.9★</span>
            <span className="text-xs text-gray-600">7k reviews</span>
          </div>
          <div className="h-8 w-px bg-gray-300"></div>
          <div className="flex flex-col">
            <span className="font-bold text-black">1000k+</span>
            <span className="text-xs text-gray-600">Dowloads</span>
          </div>
          <div className="h-8 w-px bg-gray-300"></div>
          <div className="flex flex-col">
            <span className="font-bold text-black">18+</span>
            <span className="text-xs text-gray-600">Rated for 18+</span>
          </div>
        </div>

        <button
          onClick={handleButtonClick}
          disabled={isInstallingPWA}
          className="w-full py-1.5 px-4 bg-[#01875f] text-white rounded-lg font-medium text-sm mt-4"
        >
          {isInstallingPWA ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Installing...
            </div>
          ) : (
            isInstalled ? 'Play' : 'Install'
          )}
        </button>

        <div className="mt-16 overflow-x-auto">
          <div className="flex space-x-4">
            <img src="/screenshots/desktop.png" alt="Screenshot 1" className="w-64 h-auto rounded-lg shadow-md" />
            <img src="/screenshots/home.png" alt="Screenshot 2" className="w-64 h-auto rounded-lg shadow-md" />
            <img src="/screenshots/mobile.png" alt="Screenshot 3" className="w-64 h-auto rounded-lg shadow-md" />
            <img src="/screenshots/desktop.png" alt="Screenshot 4" className="w-64 h-auto rounded-lg shadow-md" />
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-lg font-bold mb-4 text-gray-900">About this game</h2>
          <p className="text-gray-700 text-sm leading-relaxed">
            Aviator is an official application developed by Banger Casino for people to play from their phones and win real money. Aviator is a dynamic gaming program application that brings the excitement of a live casino with great bonuses and great winning possibilities to your mobile device. With its high-quality graphics and interactive gameplay, you're not just playing, you're being the center of attention in a virtual gaming show. Plus, with real cash prizes and simple withdrawal options, you can quickly and easily transfer your winnings to your bank or crypto account or any other account.
          </p>
        </div>

        <div className="mt-6 border-t border-gray-200 pt-4">
          <h3 className="font-bold text-lg text-gray-900">Last updated</h3>
          <p className="text-gray-600 text-sm">January 11, 2024</p>
        </div>

        <div className="mt-6 border-t border-gray-200 pt-4">
          <h2 className="text-lg font-bold mb-4 flex items-center justify-between text-gray-900">
            Data Protection
            {/* <div className="flex items-center space-x-2">
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <span className="sr-only">Copy</span>
                📋
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <span className="sr-only">Share</span>
                ↗️
              </button>
            </div> */}
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            In this section, developers can specify how the application determines data collection and user usability.
          </p>
          
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <span>↔️</span>
              <div>
                <p className="font-medium text-gray-900">No data shared with third parties</p>
                <a href="#" className="text-sm text-gray-600 hover:underline">
                  Learn more about how developers declare actions
                </a>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <span>🔒</span>
              <div>
                <p className="font-medium text-gray-900">No data collected</p>
                <a href="#" className="text-sm text-gray-600 hover:underline">
                  Learn more about how developers declare collections
                </a>
              </div>
            </div>
            
            <button className="text-[#01875f] mt-4 text-sm font-medium">
              View details
            </button>
          </div>
        </div>

        <div className="mt-6 border-t border-gray-200 pt-4">
          <h2 className="text-lg font-bold mb-4 flex items-center justify-between text-gray-900">
            Ratings and reviews
            {/* <div className="flex items-center space-x-2">
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <span className="sr-only">Copy</span>
                📋
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <span className="sr-only">Share</span>
                ↗️
              </button>
            </div> */}
          </h2>

          <div>
            <div className="flex items-start gap-8">
              <div>
                <div className="text-6xl font-medium text-gray-900">4.9</div>
                <div className="flex text-yellow-400 text-xl">★★★★★</div>
                <div className="text-sm text-gray-600">7k reviews</div>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm text-gray-600">5</span>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-[#01875f]" style={{width: '95%'}}></div>
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm text-gray-600">4</span>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-[#01875f]" style={{width: '3%'}}></div>
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm text-gray-600">3</span>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-[#01875f]" style={{width: '1%'}}></div>
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm text-gray-600">2</span>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-[#01875f]" style={{width: '0%'}}></div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">1</span>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-[#01875f]" style={{width: '1%'}}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <div className="border-t border-gray-200 py-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                <div>
                  <h3 className="font-medium">Rahim Miah</h3>
                  <div className="flex text-yellow-400">★★★★★</div>
                  <p className="text-xs text-gray-600">October 23, 2024</p>
                </div>
              </div>
              <p className="mt-2 text-gray-700">
                I get a great bonus in my balance and play this game daily. Yesterday I won ₹7,000 here and today I won ₹21,000
              </p>
              <p className="text-sm text-gray-600 mt-2">155 people found this review helpful</p>
              <div className="mt-2 flex items-center gap-4">
              <span className="text-sm text-gray-600">Did you find this helpful?</span>

                <button className="px-4 py-1 text-gray-600 text-sm border border-gray-300 rounded-full">Yes</button>
                <button className="px-4 py-1 text-gray-600 text-sm border border-gray-300 rounded-full">No</button>
              </div>
            </div>

            <div className="border-t border-gray-200 py-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                <div>
                  <h3 className="font-medium">Abdul Kalam</h3>
                  <div className="flex text-yellow-400">★★★★★</div>
                  <p className="text-xs text-gray-600">October 23, 2024</p>
                </div>
                <button className="ml-auto p-2 hover:bg-gray-100 rounded-full">⋮</button>
              </div>
              <p className="mt-2 text-gray-700">
                I was skeptical about winning real money in online games, but Crazy Time changed my mind. Quick and easy withdrawals also
              </p>
              <p className="text-sm text-gray-600 mt-2">238 people found this review helpful</p>
              <div className="mt-2 flex items-center gap-4">
                <span className="text-sm text-gray-600">Did you find this helpful?</span>
                <div className="flex gap-2">
                  <button className="px-4 py-1 text-gray-600 text-sm border border-gray-300 rounded-full hover:bg-gray-50">Yes</button>
                  <button className="px-4 py-1 text-gray-600 text-sm border border-gray-300 rounded-full hover:bg-gray-50">No</button>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 py-4 pl-12">
              <div className="flex items-center gap-4">
                <div>
                  <h3 className="font-medium text-gray-700">1WIN-Casino</h3>
                  <p className="text-xs text-gray-600">October 23, 2024</p>
                </div>
                <button className="ml-auto p-2 hover:bg-gray-100 rounded-full">⋮</button>
              </div>
              <p className="mt-2 text-gray-700">
                Abdul, we appreciate your kind words! Ensuring a seamless experience for our players, especially with real money transactions, is our top priority. We wish you all the best.
              </p>
            </div>

            <div className="border-t border-gray-200 py-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                <div>
                  <h3 className="font-medium">Mohamed Rahman</h3>
                  <div className="flex text-yellow-400">★★★★★</div>
                  <p className="text-xs text-gray-600">October 22, 2024</p>
                </div>
                <button className="ml-auto p-2 hover:bg-gray-100 rounded-full">⋮</button>
              </div>
              <p className="mt-2 text-gray-700">
                Real money withdrawal after a big win in this game. The withdrawal process was surprisingly fast. Today I won 12,000 rupees here.
              </p>
              <p className="text-sm text-gray-600 mt-2">150 people found this review helpful</p>
              <div className="mt-2 flex items-center gap-4">
                <span className="text-sm text-gray-600">Did you find this helpful?</span>
                <div className="flex gap-2">
                  <button className="px-4 py-1 text-gray-600 text-sm border border-gray-300 rounded-full hover:bg-gray-50">Yes</button>
                  <button className="px-4 py-1 text-gray-600 text-sm border border-gray-300 rounded-full hover:bg-gray-50">No</button>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 py-4 pl-12">
              <div className="flex items-center gap-4">
                <div>
                  <h3 className="font-medium text-gray-700">1WIN-Casino</h3>
                  <p className="text-sm text-gray-600">October 22, 2024</p>
                </div>
                <button className="ml-auto p-2 hover:bg-gray-100 rounded-full">⋮</button>
              </div>
              <p className="mt-2 text-gray-700">
                Mohammad, thank you for the kind words. We're glad to know that Crazy Time was fun and rewarding for you. Your satisfaction motivates us!
              </p>
            </div>

            <div className="border-t border-gray-200 py-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                <div>
                  <h3 className="font-medium">Hasan Chowdhury</h3>
                  <div className="flex text-yellow-400">★★★★</div>
                  <p className="text-xs text-gray-600">October 22, 2024</p>
                </div>
                <button className="ml-auto p-2 hover:bg-gray-100 rounded-full">⋮</button>
              </div>
              <p className="mt-2 text-gray-700">
                Invested ₹500 and won ₹10,000. Recommended!
              </p>
              <p className="text-sm text-gray-600 mt-2">47 people found this review helpful</p>
              <div className="mt-2 flex items-center gap-4">
                <span className="text-sm text-gray-600">Did you find this helpful?</span>
                <div className="flex gap-2">
                  <button className="px-4 py-1 text-gray-600 text-sm border border-gray-300 rounded-full hover:bg-gray-50">Yes</button>
                  <button className="px-4 py-1 text-gray-600 text-sm border border-gray-300 rounded-full hover:bg-gray-50">No</button>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 py-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                <div>
                  <h3 className="font-medium">Iqbal Ahmed</h3>
                  <div className="flex text-yellow-400">★★★★★</div>
                  <p className="text-xs text-gray-600">October 21, 2024</p>
                </div>
                <button className="ml-auto p-2 hover:bg-gray-100 rounded-full">⋮</button>
              </div>
              <p className="mt-2 text-gray-700">
                The thrill of winning real money on Pin Up is unmatched. And the fact that I can withdraw my winnings so quickly is a huge advantage.
              </p>
              <p className="text-sm text-gray-600 mt-2">136 people found this review helpful</p>
              <div className="mt-2 flex items-center gap-4">
                <span className="text-sm text-gray-600">Did you find this helpful?</span>
                <div className="flex gap-2">
                  <button className="px-4 py-1 text-gray-600 text-sm border border-gray-300 rounded-full hover:bg-gray-50">Yes</button>
                  <button className="px-4 py-1 text-gray-600 text-sm border border-gray-300 rounded-full hover:bg-gray-50">No</button>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 py-4 pl-12">
              <div className="flex items-center gap-4">
                <div>
                  <h3 className="font-medium text-gray-700">1WIN-Casino</h3>
                  <p className="text-xs text-gray-600">October 21, 2024</p>
                </div>
                <button className="ml-auto p-2 hover:bg-gray-100 rounded-full">⋮</button>
              </div>
              <p className="mt-2 text-gray-700">
                Hello Iqbal, I'm glad to know your victory came so quickly. Our team works hard to ensure fast and secure transactions. Thanks for playing Crazy Time
              </p>
            </div>

            <div className="mt-6 border-t border-gray-200 pt-4 mb-16">
              <button className="text-green-600 text-xs font-medium hover:text-green-700">
                See all reviews
              </button>
            </div>
          </div>
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