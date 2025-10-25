'use client';

import { useEffect, useState } from 'react';
import { THEME } from '@/enums/theme';
import { setCookie } from '@/utils/cookies';
import { getInitialTheme, applyTheme } from '@/utils/theme';

export const useTheme = (defaultTheme?: THEME) => {
  const [theme, setTheme] = useState<THEME | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Inicialização do tema
  useEffect(() => {
    const initialTheme = getInitialTheme(defaultTheme);
    setTheme(initialTheme);
    setIsLoading(false);
  }, [defaultTheme]);

  // Aplicar mudanças do tema
  useEffect(() => {
    if (theme === null) return;
    
    setCookie('scrum-poker-theme', theme);
    applyTheme(theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(current => current === THEME.LIGHT ? THEME.DARK : THEME.LIGHT);
  };

  return {
    theme,
    isLoading,
    toggleTheme,
    isDark: theme === THEME.DARK,
    isLight: theme === THEME.LIGHT,
  };
};