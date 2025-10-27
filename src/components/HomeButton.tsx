'use client';

import { twMerge } from 'tailwind-merge';

type HomeButtonProps = {
  className?: string;
};

export const HomeButton = ({ className = '' }: HomeButtonProps) => {
  return (
    <button
      onClick={() => (window.location.href = '/')}
      className={twMerge(
        'p-2 sm:p-2.5 md:p-3 cursor-pointer rounded-full transition-all duration-200 bg-zinc-900 hover:bg-zinc-900/50 backdrop-blur-sm border border-white/20 shadow-lg hover:shadow-xl hover:scale-105',
        className
      )}
      title="Voltar para a página inicial"
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 dark:text-yellow-400/80 text-slate-400"
      >
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9,22 9,12 15,12 15,22" />
      </svg>
    </button>
  );
};
