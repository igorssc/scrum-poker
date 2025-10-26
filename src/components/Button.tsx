import { ButtonHTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary';
  isLoading?: boolean;
};

export const Button = ({ 
  className, 
  variant = 'primary', 
  isLoading = false, 
  children, 
  onClick,
  disabled,
  ...rest 
}: ButtonProps) => {
  const baseClasses = 'px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 text-[0.65rem] sm:text-xs font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-opacity-50 relative';
  
  const variantClasses = {
    primary: 'bg-purple-600 text-white hover:bg-purple-700 focus:ring-purple-500 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600 dark:focus:ring-gray-400',
    secondary: 'bg-purple-100 text-purple-700 hover:bg-purple-200 focus:ring-purple-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 dark:focus:ring-gray-300',
  };

  const isDisabled = disabled || isLoading;

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isLoading) return;
    onClick?.(e);
  };

  return (
    <button
      className={twMerge(
        baseClasses,
        variantClasses[variant],
        isDisabled 
          ? 'opacity-80 cursor-not-allowed transition-all' 
          : 'cursor-pointer',
        className,
      )}
      onClick={handleClick}
      disabled={isDisabled}
      {...rest}
    >
      {isLoading ? (
        <div className="flex items-center justify-center">
          <svg 
            className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" 
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
              className="opacity-25"
            />
            <path 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span className="ml-1.5 sm:ml-2">Carregando...</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
};
