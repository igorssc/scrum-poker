import { ReactNode } from 'react';

type GlassProps = {
  children: ReactNode;
};

export const Glass = ({ children }: GlassProps) => {
  return (
    <>
      <div className="w-full flex flex-col items-center justify-center py-3 md:py-6">
        <div className="backdrop-blur-md bg-white/50 dark:bg-zinc-800/60 fixed inset-0" />
        {children}
      </div>
    </>
  );
};
