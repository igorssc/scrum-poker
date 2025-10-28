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

      // Força atualização da meta tag
      let meta = document.querySelector('meta[name="theme-color"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', 'theme-color');
        document.head.appendChild(meta);
      }
      
      meta.setAttribute('content', themeColor);
      
      // Log apenas quando há mudança real
      const currentColor = meta.getAttribute('content');
      if (currentColor !== themeColor) {
        console.log('🎨 Theme color changed:', themeColor, '| Dark mode:', isDark);
      }

      // Para dispositivos iOS - ajusta estilo da status bar
      let appleMeta = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
      if (appleMeta) {
        const statusBarStyle = isDark ? 'black-translucent' : 'default';
        appleMeta.setAttribute('content', statusBarStyle);
      }
    };

    // Atualização inicial com retry
    const initialUpdate = () => {
      updateThemeColor();
      // Segunda tentativa após pequeno delay para garantir
      setTimeout(updateThemeColor, 200);
    };

    initialUpdate();

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
    };
  }, []);

  return null;
};