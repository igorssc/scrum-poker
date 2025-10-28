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
      let themeColorMeta = document.querySelector('meta[name="theme-color"]');
      if (!themeColorMeta) {
        themeColorMeta = document.createElement('meta');
        themeColorMeta.setAttribute('name', 'theme-color');
        document.head.appendChild(themeColorMeta);
      }

      const themeColor = isDark ? '#374151' : '#8b5cf6';
      themeColorMeta.setAttribute('content', themeColor);
    };

    // Aguarda um pouco para garantir que o tema foi aplicado
    setTimeout(updateThemeColor, 100);

    // Observer para mudanças no tema
    const observer = new MutationObserver(() => {
      setTimeout(updateThemeColor, 50);
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    // Listener para mudanças de preferência do sistema
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      setTimeout(updateThemeColor, 50);
    };
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return null;
};
