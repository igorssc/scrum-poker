import { ReactNode } from 'react';

type SampleCardsProps = {
  children: ReactNode;
};

export const SampleCards = ({ children }: SampleCardsProps) => {
  return (
    <div className="flex flex-col gap-12 w-full h-screen justify-center items-center bg-cards bg-no-repeat bg-cover overflow-hidden">
      {children}
    </div>
  );
};
