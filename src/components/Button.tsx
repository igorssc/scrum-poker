import { ButtonHTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary';
};

export const Button = ({ className, variant = 'primary', ...rest }: ButtonProps) => {
  const baseClasses = 'px-4 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-opacity-50';
  
  const variantClasses = {
    primary: 'bg-purple-600 text-white hover:bg-purple-700 focus:ring-purple-500 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600 dark:focus:ring-gray-400',
    secondary: 'bg-purple-100 text-purple-700 hover:bg-purple-200 focus:ring-purple-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 dark:focus:ring-gray-300',
  };

  return (
    <button
      className={twMerge(
        baseClasses,
        variantClasses[variant],
        className,
      )}
      {...rest}
    />
  );
};
