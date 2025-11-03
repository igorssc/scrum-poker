import { FaGithub } from 'react-icons/fa';
import { twMerge } from 'tailwind-merge';

interface FooterProps {
  variant?: 'default' | 'minimal';
  className?: string;
}

export function Footer({ variant = 'default', className = '' }: FooterProps) {
  if (variant === 'minimal') {
    return (
      <footer
        className={twMerge(
          'h-16 w-full flex items-center justify-center bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 absolute bottom-0 z-50 ',
          className
        )}
        style={{ '--footer-height': '4rem' } as React.CSSProperties}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-xs sm:text-sm">
              Criado com 💜 por{' '}
              <a
                href="https://github.com/igorssc"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-purple-500 hover:text-purple-600 dark:text-purple-400 dark:hover:text-purple-300 font-medium transition-colors"
              >
                <FaGithub className="w-3 h-3" />
                Igor Costa
              </a>
            </p>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer
      className={twMerge(
        'py-12 bg-gray-900 dark:bg-gray-800 text-gray-300 relative z-50',
        className
      )}
      style={{ '--footer-height': '12rem' } as React.CSSProperties}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-white mb-4 font-sinera">
            Scrum Poker
          </h3>
          <p className="text-xs sm:text-sm md:text-sm mb-8">
            A ferramenta gratuita e online para planning poker que sua equipe precisa.
          </p>
          <div className="border-t border-gray-700 pt-8">
            <p className="text-xs sm:text-sm md:text-sm mb-8">
              © 2024 Scrum Poker. Feito com 💜 para a comunidade ágil.
            </p>
            <p className="text-xs sm:text-sm flex items-center justify-center gap-2">
              Criado por{' '}
              <a
                href="https://github.com/igorssc"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-purple-400 hover:text-purple-300 font-medium transition-colors"
              >
                <FaGithub className="w-4 h-4" />
                Igor Costa
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
