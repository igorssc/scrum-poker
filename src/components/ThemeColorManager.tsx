'use client';

import { useEffect } from 'react';

export const ThemeColorManager = () => {
  useEffect(() => {
    const updateThemeColor = () => {
      // Detecta tema de forma mais direta
      const isDark = document.documentElement.classList.contains('dark');
      
      // Cores otimizadas para header do navegador
      const colors = {
        light: '#8b5cf6', // purple-500 - bem visível no light
        dark: '#374151'   // gray-700 - bem visível no dark
      };
      
      const themeColor = isDark ? colors.dark : colors.light;

      // Remove todas as meta tags theme-color existentes
      const existingMetas = document.querySelectorAll('meta[name="theme-color"]');
      existingMetas.forEach(meta => meta.remove());

      // Cria nova meta tag theme-color
      const meta = document.createElement('meta');
      meta.setAttribute('name', 'theme-color');
      meta.setAttribute('content', themeColor);
      document.head.appendChild(meta);

      // Para navegadores que usam msapplication-navbutton-color (Edge/IE)
      let msMeta = document.querySelector('meta[name="msapplication-navbutton-color"]');
      if (!msMeta) {
        msMeta = document.createElement('meta');
        msMeta.setAttribute('name', 'msapplication-navbutton-color');
        document.head.appendChild(msMeta);
      }
      msMeta.setAttribute('content', themeColor);

      // Para navegadores que usam apple-mobile-web-app-status-bar-style
      let appleMeta = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
      if (appleMeta) {
        const statusBarStyle = isDark ? 'black-translucent' : 'default';
        appleMeta.setAttribute('content', statusBarStyle);
      }

      console.log('🎨 Theme color forcibly updated:', themeColor, '| Dark mode:', isDark);
      console.log('📱 Applied to both PWA and browser header');
    };

    // Atualização inicial com retry agressivo
    const initialUpdate = () => {
      updateThemeColor();
      // Retry múltiplo para navegadores teimosos
      setTimeout(updateThemeColor, 100);
      setTimeout(updateThemeColor, 300);
      setTimeout(updateThemeColor, 600);
    };

    initialUpdate();

    // Também força atualização quando a página fica visível ou ganha foco
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        setTimeout(updateThemeColor, 50);
      }
    };

    const handleFocus = () => {
      setTimeout(updateThemeColor, 50);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    // Observer otimizado - só observa mudanças de classe
    const observer = new MutationObserver((mutations) => {
      let shouldUpdate = false;
      
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && 
            mutation.attributeName === 'class' &&
            mutation.target === document.documentElement) {
          shouldUpdate = true;
        }
      });
      
      if (shouldUpdate) {
        updateThemeColor();
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  return null;
};