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

      // Strategy 1: Update existing meta tag first (mobile browsers prefer this)
      let existingMeta = document.querySelector('meta[name="theme-color"]');
      if (existingMeta) {
        existingMeta.setAttribute('content', themeColor);
      }

      // Strategy 2: For mobile browsers, also force DOM re-evaluation
      // Remove and recreate after a micro-delay
      setTimeout(() => {
        const allMetas = document.querySelectorAll('meta[name="theme-color"]');
        allMetas.forEach(meta => meta.remove());

        // Create fresh meta tag
        const newMeta = document.createElement('meta');
        newMeta.name = 'theme-color';
        newMeta.content = themeColor;
        
        // Insert at the very beginning of head for mobile priority
        if (document.head.firstChild) {
          document.head.insertBefore(newMeta, document.head.firstChild);
        } else {
          document.head.appendChild(newMeta);
        }

        // Force viewport meta refresh for mobile browsers
        const viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) {
          const content = viewport.getAttribute('content');
          if (content) {
            viewport.setAttribute('content', content + ', theme-color=' + themeColor);
            // Restore original viewport after micro-delay
            setTimeout(() => {
              viewport.setAttribute('content', content);
            }, 10);
          }
        }
      }, 5);

      // Para navegadores Edge/IE
      let msMeta = document.querySelector('meta[name="msapplication-navbutton-color"]');
      if (!msMeta) {
        msMeta = document.createElement('meta');
        msMeta.setAttribute('name', 'msapplication-navbutton-color');
        document.head.appendChild(msMeta);
      }
      msMeta.setAttribute('content', themeColor);

      // Para Safari iOS - status bar
      let appleMeta = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
      if (appleMeta) {
        const statusBarStyle = isDark ? 'black-translucent' : 'default';
        appleMeta.setAttribute('content', statusBarStyle);
      }


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