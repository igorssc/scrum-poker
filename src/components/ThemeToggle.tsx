'use client';

import { THEME } from '@/enums/theme';
import { useTheme } from '@/hooks/useTheme';
import { twMerge } from 'tailwind-merge';
import { ThemeIcon } from './ThemeIcon';

type ThemeToggleProps = {
  defaultTheme?: THEME;
  className?: string;
};

export const ThemeToggle = ({ defaultTheme, className = '' }: ThemeToggleProps) => {
  const { theme, isLoading, toggleTheme, isDark } = useTheme(defaultTheme);

  if (isLoading) {
    return (
      <button
        className={twMerge(
          'p-2 sm:p-2.5 md:p-3 rounded-full transition-all duration-200 cursor-not-allowed opacity-50 backdrop-blur-sm border border-white/20 shadow-lg',
          className
        )}
        title="Carregando tema..."
        disabled
      >
        <svg
          className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-gray-600 animate-spin"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <circle
            cx="12"
            cy="12"
            r="10"
            strokeWidth={2}
            strokeDasharray="31.416"
            strokeDashoffset="31.416"
          />
        </svg>
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className={twMerge(
        'p-2 sm:p-2.5 md:p-3 cursor-pointer rounded-full transition-all duration-200 bg-zinc-900 hover:bg-zinc-900/50 backdrop-blur-sm border border-white/20 shadow-lg hover:shadow-xl hover:scale-105',
        className
      )}
      title={isDark ? 'Modo claro' : 'Modo escuro'}
    >
      <ThemeIcon
        theme={theme!}
        size="lg"
        className={isDark ? 'text-purple-400/80' : 'text-purple-400'}
      />
    </button>
  );
};
