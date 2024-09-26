import { ReactNode } from 'react';

type GlassProps = {
  children: ReactNode;
};

export const Glass = ({ children }: GlassProps) => {
  return (
    <>
      <div className="fixed inset-0 backdrop-blur-md flex justify-center items-center bg-zinc-800/50">
        {children}
      </div>
    </>
  );
};
