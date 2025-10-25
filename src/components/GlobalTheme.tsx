'use client';

import { useEffect } from 'react';
import { THEME } from '@/enums/theme';
import { getInitialTheme, applyTheme } from '@/utils/theme';

type GlobalThemeProps = {
  defaultTheme?: THEME;
};

export const GlobalTheme = ({ defaultTheme }: GlobalThemeProps) => {
  useEffect(() => {
    const initialTheme = getInitialTheme(defaultTheme);
    applyTheme(initialTheme);
    
    // Tornar o body visível após aplicar o tema
    document.body.style.visibility = 'visible';
  }, [defaultTheme]);

  return null;
};