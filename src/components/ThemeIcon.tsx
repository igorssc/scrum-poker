import { THEME } from '@/enums/theme';
import { twMerge } from 'tailwind-merge';

type ThemeIconProps = {
  theme: THEME;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

const sizeClasses = {
  sm: 'w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4',
  md: 'w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5',
  lg: 'w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6',
};

export const ThemeIcon = ({ theme, size = 'md', className = '' }: ThemeIconProps) => {
  const sizeClass = sizeClasses[size];

  if (theme === THEME.DARK) {
    return (
      <svg
        className={twMerge(sizeClass, 'drop-shadow-sm', className)}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>
    );
  }

  return (
    <svg
      className={twMerge(sizeClass, 'drop-shadow-sm', className)}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
      />
    </svg>
  );
};
