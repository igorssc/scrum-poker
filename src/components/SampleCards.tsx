import { ReactNode } from 'react';

type SampleCardsProps = {
  children: ReactNode;
};

export const SampleCards = ({ children }: SampleCardsProps) => {
  return (
    <div className="flex flex-col gap-12 w-full min-h-screen justify-center bg-cards bg-no-repeat bg-cover bg-fixed">
      {children}
    </div>
  );
};
