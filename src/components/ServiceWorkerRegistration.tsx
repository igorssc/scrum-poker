'use client';

import { useEffect } from 'react';

export const ServiceWorkerRegistration = () => {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // Aguarda o carregamento completo da página
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js', {
            scope: '/',
            updateViaCache: 'none', // Força verificação de atualizações
          })
          .then(registration => {
            console.log('SW registered successfully:', registration.scope);
            
            // Força verificação de atualizações imediatamente
            registration.update();
            
            // Verifica se há atualizações
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing;
              if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                  if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    console.log('New SW available, activating immediately');
                    // Força ativação imediata da nova versão
                    newWorker.postMessage({ type: 'SKIP_WAITING' });
                  }
                });
              }
            });
          })
          .catch(error => {
            console.log('SW registration failed:', error);
          });

        // Listener para quando o SW toma controle
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          console.log('SW controller changed');
          // Não recarrega automaticamente para evitar loops
        });
      });
    }
  }, []);

  return null;
};