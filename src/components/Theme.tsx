'use client';

import { useEffect, useState } from 'react';
import { THEME } from '@/enums/theme';
import { setCookie } from '@/utils/cookies';
import { Moon, Sun } from 'lucide-react';

type ThemeProps = {
  defaultTheme?: THEME;
};

export const Theme = ({ defaultTheme }: ThemeProps) => {
  const [theme, setTheme] = useState<THEME>(defaultTheme || THEME.LIGHT);

  useEffect(() => {
    const theme = document.cookie
      .split('; ')
      .find((row) => row.startsWith('scrum-poker-theme='));
    const themeValue = theme ? theme.split('=')[1] : defaultTheme;

    const root = document.documentElement;
    if (themeValue === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    document.body.style.visibility = 'visible';
  }, [defaultTheme]);

  useEffect(() => {
    setCookie('scrum-poker-theme', theme);

    if (theme === THEME.DARK) {
      document.documentElement.classList.add('dark');
      return;
    }

    document.documentElement.classList.remove('dark');
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) =>
      prevTheme === THEME.LIGHT ? THEME.DARK : THEME.LIGHT,
    );
  };

  return (
    <button
      className="fixed z-30 top-4 right-4 cursor-pointer"
      onClick={toggleTheme}
    >
      {theme === THEME.DARK ? (
        <Moon className="text-white dark:text-gray-900" />
      ) : (
        <Sun className="text-white dark:text-gray-900" />
      )}
    </button>
  );
};
