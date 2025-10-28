'use client';

import { useEffect } from 'react';

export const DynamicManifest = () => {
  useEffect(() => {
    const updateManifestAndTheme = () => {
      // Detecta o tema atual com múltiplas verificações
      const hasThemeClass = document.documentElement.classList.contains('dark');
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const bodyClass = document.body.classList.contains('dark');
      
      // Prioridade: classe no html > classe no body > preferência do sistema
      const isDark = hasThemeClass || bodyClass || (systemPrefersDark && !document.documentElement.classList.contains('light'));

      const theme = isDark ? 'dark' : 'light';
      const themeColor = isDark ? '#374151' : '#8b5cf6'; // gray-700 : purple-500

      // Atualiza meta theme-color
      const themeColorMeta = document.querySelector('meta[name="theme-color"]');
      if (themeColorMeta) {
        themeColorMeta.setAttribute('content', themeColor);
        console.log('Theme color updated:', themeColor, 'Dark mode:', isDark);
      }

      // Atualiza manifest link
      let manifestLink = document.querySelector('link[rel="manifest"]');
      if (manifestLink) {
        manifestLink.setAttribute('href', `/api/manifest?theme=${theme}&t=${Date.now()}`);
        console.log('Manifest updated for theme:', theme);
      }
    };

    // Atualiza inicialmente após um pequeno delay
    setTimeout(updateManifestAndTheme, 100);

    // Observer para mudanças no tema DOM
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          setTimeout(updateManifestAndTheme, 50);
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    // Listener para mudanças do sistema
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = () => {
      setTimeout(updateManifestAndTheme, 50);
    };
    mediaQuery.addEventListener('change', handleSystemThemeChange);

    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, []);

  return null;
};
