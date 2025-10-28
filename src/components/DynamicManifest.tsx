'use client';

import { useEffect } from 'react';

export const DynamicManifest = () => {
  useEffect(() => {
    const updateThemeColor = () => {
      // Detecta o tema atual
      const isDark =
        document.documentElement.classList.contains('dark') ||
        window.matchMedia('(prefers-color-scheme: dark)').matches;

      // Atualiza meta theme-color
      const themeColorMeta = document.querySelector('meta[name="theme-color"]');
      if (themeColorMeta) {
        const themeColor = isDark ? '#374151' : '#8b5cf6'; // gray-700 : purple-500
        themeColorMeta.setAttribute('content', themeColor);
        console.log('Theme color updated:', themeColor, 'Dark mode:', isDark);
      }
    };

    // Atualiza inicialmente
    updateThemeColor();

    // Observer para mudanças no tema DOM
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          updateThemeColor();
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    // Listener para mudanças do sistema
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = () => updateThemeColor();
    mediaQuery.addEventListener('change', handleSystemThemeChange);

    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, []);

  return null;
};
