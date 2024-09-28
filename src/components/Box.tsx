import { HTMLAttributes, ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

type BoxProps = {
  children: ReactNode;
} & HTMLAttributes<HTMLDivElement>;

export const Box = ({ children, className, ...rest }: BoxProps) => {
  return (
    <div
      className={twMerge(
        'relative w-full flex max-w-[400px] min-h-[400px] max-h-[90vh] p-8 rounded-md shadow-xl transition-all bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-200 overflow-auto',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
};
