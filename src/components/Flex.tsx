import { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

type FlexProps = {
  children: ReactNode;
  className?: string;
};

export const Flex = ({ children, className, ...rest }: FlexProps) => {
  return (
    <div
      className={twMerge(
        'w-full h-full relative m-auto flex flex-col justify-center items-center',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
};
