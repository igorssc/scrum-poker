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
        className="w-4 h-4 dark:text-purple-400/80 text-purple-400"
      >
        <path d="M9 14l-5-5 5-5" />
        <path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H12" />
      </svg>
    </button>
  );
};
