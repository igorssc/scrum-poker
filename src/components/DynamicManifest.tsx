'use client';

import { useEffect } from 'react';

export const DynamicManifest = () => {
  useEffect(() => {
    const updateManifest = () => {
      // Detecta o tema atual
      const isDark =
        document.documentElement.classList.contains('dark') ||
        window.matchMedia('(prefers-color-scheme: dark)').matches;

      const theme = isDark ? 'dark' : 'light';

      // Remove manifest existente
      const existingManifest = document.querySelector('link[rel="manifest"]');
      if (existingManifest) {
        existingManifest.remove();
      }

      // Adiciona novo manifest com tema
      const manifestLink = document.createElement('link');
      manifestLink.rel = 'manifest';
      manifestLink.href = `/api/manifest?theme=${theme}`;
      document.head.appendChild(manifestLink);

      // Atualiza meta theme-color também
      let themeColorMeta = document.querySelector('meta[name="theme-color"]');
      if (!themeColorMeta) {
        themeColorMeta = document.createElement('meta');
        themeColorMeta.setAttribute('name', 'theme-color');
        document.head.appendChild(themeColorMeta);
      }

      const themeColor = isDark ? '#a855f7' : '#8b5cf6';
      themeColorMeta.setAttribute('content', themeColor);
    };

    // Atualiza inicialmente
    updateManifest();

    // Observer para mudanças no tema
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (
          mutation.type === 'attributes' &&
          mutation.attributeName === 'class' &&
          mutation.target === document.documentElement
        ) {
          updateManifest();
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    // Listener para mudanças de preferência do sistema
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => updateManifest();
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return null; // Componente sem UI
};
