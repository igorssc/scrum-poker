'use client';

import { useEffect } from 'react';
import { refreshPWAManifest, detectTheme } from '@/utils/pwaUtils';

export const DynamicManifest = () => {
  useEffect(() => {
    const updateManifest = async () => {
      const theme = detectTheme();
      await refreshPWAManifest(theme);
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
