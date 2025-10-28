'use client';

import { usePWABanner } from '@/hooks/usePWABanner';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { useState } from 'react';
import { twMerge } from 'tailwind-merge';

export const PWAInstallBanner = () => {
  const { showBanner, dismissBanner, installApp } = usePWABanner();
  const { isInstallable, isInstalled, promptInstall } = usePWAInstall();
  const [isInstalling, setIsInstalling] = useState(false);

  // Não mostra o banner se:
  // - Não deve mostrar conforme regras de tempo
  // - Não é instalável
  // - Já está instalado
  if (!showBanner || !isInstallable || isInstalled) {
    return null;
  }

  const handleInstall = async () => {
    setIsInstalling(true);

    try {
      const result = await promptInstall();

      if (result === 'accepted') {
        installApp(); // Remove o banner permanentemente
      }
      // Se result === 'dismissed' (cancelou), não faz nada - banner continua visível
    } catch (error) {
      console.error('Erro na instalação:', error);
    } finally {
      setIsInstalling(false);
    }
  };

  const handleDismiss = () => {
    dismissBanner(); // Remove por 1 dia
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 animate-slide-up">
      <div className="mx-auto max-w-xl">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-start gap-3">
            {/* Ícone */}
            <div className="shrink-0 w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-5 h-5 text-purple-600 dark:text-purple-400"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z"
                />
              </svg>
            </div>

            {/* Conteúdo */}
            <div className="flex-1 min-w-0">
              <h3 className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                Instalar Scrum Poker
              </h3>
              <p className="text-[0.7rem] text-gray-600 dark:text-gray-400 mt-1 sm:py-2 leading-relaxed">
                Instale nosso app para acesso rápido e experiência otimizada.
              </p>

              {/* Botões */}
              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleInstall}
                  disabled={isInstalling}
                  className={twMerge(
                    'cursor-pointer flex-1 px-3 py-1 text-[0.7rem] font-medium rounded-md transition-colors',
                    'bg-purple-600 hover:bg-purple-700 text-white',
                    'disabled:opacity-50 disabled:cursor-not-allowed'
                  )}
                >
                  {isInstalling ? (
                    <div className="flex items-center justify-center gap-1.5">
                      <svg
                        className="w-3 h-3 animate-spin"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Instalando...
                    </div>
                  ) : (
                    'Instalar'
                  )}
                </button>

                <button
                  onClick={handleDismiss}
                  disabled={isInstalling}
                  className={twMerge(
                    'cursor-pointer px-3 py-1.5 text-[0.7rem] font-medium rounded-md transition-colors',
                    'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600',
                    'text-gray-700 dark:text-gray-300',
                    'disabled:opacity-50 disabled:cursor-not-allowed'
                  )}
                >
                  Agora não
                </button>
              </div>
            </div>

            {/* Botão de fechar */}
            <button
              onClick={handleDismiss}
              disabled={isInstalling}
              className={twMerge(
                'cursor-pointer shrink-0 p-1 rounded-full transition-colors',
                'hover:bg-gray-100 dark:hover:bg-gray-700',
                'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
