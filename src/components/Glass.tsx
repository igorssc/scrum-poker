import { ReactNode } from 'react';

type GlassProps = {
  children: ReactNode;
};

export const Glass = ({ children }: GlassProps) => {
  return (
    <>
      <div className="fixed inset-0 backdrop-blur-md flex justify-center items-center">
        <div className="min-w-40 min-h-40 bg-white shadow-2xl p-8">
          {children}
        </div>
      </div>
    </>
  );
};
