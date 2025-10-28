'use client';

import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

type OfflineGuardProps = {
  children: React.ReactNode;
};

export const OfflineGuard = ({ children }: OfflineGuardProps) => {
  const isOnline = useOnlineStatus();
  const [showOffline, setShowOffline] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      // Pequeno delay para evitar falsos positivos
      const timer = setTimeout(() => {
        setShowOffline(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    } else {
      setShowOffline(false);
    }
  }, [isOnline]);

  const handleRetry = () => {
    // Força uma verificação de conexão
    if (navigator.onLine) {
      window.location.reload();
    }
  };

  if (showOffline) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          {/* Card principal */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
            {/* Ícone animado */}
            <div className="relative mb-6">
              <div className="w-20 h-20 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-10 h-10 text-red-600 dark:text-red-400"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.288 15.038a5.25 5.25 0 017.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 011.06 0z"
                  />
                </svg>
              </div>
              
              {/* Efeito de pulso */}
              <div className="absolute inset-0 w-20 h-20 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full animate-ping opacity-75"></div>
            </div>

            {/* Título */}
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
              Sem Conexão
            </h1>

            {/* Descrição */}
            <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
              É necessário ter conexão com a internet para acessar as salas do Scrum Poker. 
              Verifique sua conexão e tente novamente.
            </p>

            {/* Status */}
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center gap-2 text-sm">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-red-700 dark:text-red-300 font-medium">
                  Offline
                </span>
              </div>
            </div>

            {/* Botão de retry */}
            <button
              onClick={handleRetry}
              className={twMerge(
                'w-full py-3 px-4 rounded-lg font-medium transition-all duration-200',
                'bg-purple-600 hover:bg-purple-700 text-white',
                'focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2',
                'dark:focus:ring-offset-gray-800',
                'transform hover:scale-105 active:scale-95'
              )}
            >
              <div className="flex items-center justify-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
                  />
                </svg>
                Tentar Novamente
              </div>
            </button>
          </div>

          {/* Dicas */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              💡 Dicas para resolver:
            </p>
            <ul className="text-xs text-gray-400 dark:text-gray-500 space-y-1">
              <li>• Verifique sua conexão Wi-Fi ou dados móveis</li>
              <li>• Tente recarregar a página</li>
              <li>• Aguarde alguns segundos e tente novamente</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};