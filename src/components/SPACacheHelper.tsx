'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export const SPACacheHelper = () => {
  const pathname = usePathname();

  useEffect(() => {
    // Lista de rotas SPA que devem ser cacheadas
    const spaRoutes = ['/board', '/room'];
    const isSPARoute = spaRoutes.some(route => 
      pathname === route || pathname.startsWith(route + '/')
    );

    if (isSPARoute && 'serviceWorker' in navigator) {
      // Registra a página atual no cache quando é visitada online
      navigator.serviceWorker.ready.then(registration => {
        // Envia mensagem para o SW cachear esta página
        if (registration.active) {
          registration.active.postMessage({
            type: 'CACHE_CURRENT_PAGE',
            url: window.location.href,
            pathname: pathname
          });
        }
      }).catch(() => {
        // Silenciosamente ignora erros
      });
    }
  }, [pathname]);

  return null;
};