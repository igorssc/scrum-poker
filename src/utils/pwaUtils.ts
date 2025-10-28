/**
 * Utilities for PWA manifest and theme management
 */

export const refreshPWAManifest = async (theme: 'light' | 'dark') => {
  try {
    // Remove manifest atual
    const existingManifest = document.querySelector('link[rel="manifest"]');
    if (existingManifest) {
      existingManifest.remove();
    }

    // Aguarda um pouco para garantir remoção
    await new Promise(resolve => setTimeout(resolve, 50));

    // Adiciona novo manifest
    const manifestLink = document.createElement('link');
    manifestLink.rel = 'manifest';
    manifestLink.href = `/api/manifest?theme=${theme}&t=${Date.now()}`;
    document.head.appendChild(manifestLink);

    // Atualiza theme-color meta tag
    let themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (!themeColorMeta) {
      themeColorMeta = document.createElement('meta');
      themeColorMeta.setAttribute('name', 'theme-color');
      document.head.appendChild(themeColorMeta);
    }

    const themeColor = theme === 'dark' ? '#374151' : '#8b5cf6';
    themeColorMeta.setAttribute('content', themeColor);

    // Se PWA está instalado, tenta forçar atualização
    if ('serviceWorker' in navigator && window.matchMedia('(display-mode: standalone)').matches) {
      try {
        const registration = await navigator.serviceWorker.ready;
        await registration.update();
        
        // Força recarga do manifest no service worker
        const sw = registration.active;
        if (sw) {
          sw.postMessage({
            type: 'MANIFEST_UPDATE',
            theme,
            timestamp: Date.now()
          });
        }
      } catch (error) {
        // Silenciosamente ignora erros de service worker
        console.debug('Service worker update failed:', error);
      }
    }

    return true;
  } catch (error) {
    console.error('Failed to refresh PWA manifest:', error);
    return false;
  }
};

export const detectTheme = (): 'light' | 'dark' => {
  const isDark =
    document.documentElement.classList.contains('dark') ||
    window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  return isDark ? 'dark' : 'light';
};

export const isPWAInstalled = (): boolean => {
  return window.matchMedia('(display-mode: standalone)').matches ||
         (window.navigator as any).standalone === true ||
         document.referrer.includes('android-app://');
};