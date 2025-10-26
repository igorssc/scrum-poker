import { ReactNode } from 'react';

type GlassProps = {
  children: ReactNode;
};

export const Glass = ({ children }: GlassProps) => {
  return (
    <>
      <div className="w-full backdrop-blur-md flex justify-center bg-zinc-800/50 py-4">
        {children}
      </div>
    </>
  );
};
