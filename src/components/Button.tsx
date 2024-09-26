import { ButtonHTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export const Button = ({ className, ...rest }: ButtonProps) => {
  return (
    <button
      className={twMerge(
        'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
        'bg-purple-600 text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50',
        'dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600 dark:focus:ring-gray-400',
        className,
      )}
      {...rest}
    />
  );
};
