'use client';

import { THEME } from '@/enums/theme';
import { useTheme } from '@/hooks/useTheme';
import { Button } from './Button';
import { ThemeIcon } from './ThemeIcon';

type ThemeButtonProps = {
  defaultTheme?: THEME;
};

export const ThemeButton = ({ defaultTheme }: ThemeButtonProps) => {
  const { theme, isLoading, toggleTheme, isDark } = useTheme(defaultTheme);

  if (isLoading) {
    return (
      <Button
        className="bg-gray-600 hover:bg-gray-700 focus:ring-gray-500"
        title="Carregando tema..."
        disabled
      >
        <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle
            cx="12"
            cy="12"
            r="10"
            strokeWidth={2}
            strokeDasharray="31.416"
            strokeDashoffset="31.416"
          />
        </svg>
      </Button>
    );
  }

  return (
    <Button
      onClick={toggleTheme}
      className="light:bg-linear-to-r from-purple-300 via-purple-400 to-purple-500 focus:ring-purple-600 focus:ring-1"
      title={isDark ? 'Modo claro' : 'Modo escuro'}
    >
      <ThemeIcon theme={theme!} size="sm" className="text-white" />
    </Button>
  );
};
