import { ReactNode } from 'react';

type GlassProps = {
  children: ReactNode;
};

export const Glass = ({ children }: GlassProps) => {
  return (
    <>
      <div className="w-full flex justify-center py-4">
        <div className="backdrop-blur-md bg-zinc-800/50 fixed inset-0" />
        {children}
      </div>
    </>
  );
};
