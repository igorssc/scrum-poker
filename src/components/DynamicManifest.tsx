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
      
      console.log('🎨 Atualizando manifest para tema:', theme);

      // Remove manifest existente
      const existingManifest = document.querySelector('link[rel="manifest"]');
      if (existingManifest) {
        existingManifest.remove();
      }

      // Adiciona novo manifest com tema e cache-busting
      const manifestLink = document.createElement('link');
      manifestLink.rel = 'manifest';
      manifestLink.href = `/api/manifest?theme=${theme}&t=${Date.now()}`;
      document.head.appendChild(manifestLink);

      // Atualiza meta theme-color também
      let themeColorMeta = document.querySelector('meta[name="theme-color"]');
      if (!themeColorMeta) {
        themeColorMeta = document.createElement('meta');
        themeColorMeta.setAttribute('name', 'theme-color');
        document.head.appendChild(themeColorMeta);
      }

      const themeColor = isDark ? '#374151' : '#8b5cf6'; // gray-700 para dark, purple-600 para light
      themeColorMeta.setAttribute('content', themeColor);
      
      console.log('✅ Theme color atualizado para:', themeColor);
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
