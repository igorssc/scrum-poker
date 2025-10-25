import { InputHTMLAttributes, forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, disabled, ...rest }, ref) => {
    return (
      <div className="flex flex-col">
        {label && (
          <label
            className={twMerge(
              'mb-1.5 sm:mb-2 text-[0.65rem] sm:text-xs font-medium',
              disabled
                ? 'text-gray-400 dark:text-gray-500'
                : 'text-gray-700 dark:text-gray-300',
            )}
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          disabled={disabled}
          className={twMerge(
            'block w-full px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 text-[0.65rem] sm:text-xs rounded-lg transition-colors',
            'border border-gray-300 focus:border-purple-500 focus:outline-none',
            'bg-white text-gray-900 placeholder-gray-500',
            'dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600',
            'dark:focus:border-purple-400 dark:placeholder-gray-400',
            disabled
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
              : 'cursor-text',
            className,
          )}
          {...rest}
        />
      </div>
    );
  },
);

Input.displayName = 'Input';
