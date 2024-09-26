import { ReactNode } from 'react';

type BoxProps = {
  children: ReactNode;
};

export const Box = ({ children }: BoxProps) => {
  return (
    <div className="w-full max-w-[400px] min-h-[400px] flex justify-center items-center p-8 rounded-md shadow-xl transition-all bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-200">
      {children}
    </div>
  );
};
