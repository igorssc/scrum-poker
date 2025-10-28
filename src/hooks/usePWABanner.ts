'use client';

import { useEffect, useState } from 'react';

const STORAGE_KEY = 'pwa-install-banner';
const DISMISS_DURATION = 1 * 24 * 60 * 60 * 1000; // 1 dia em milissegundos

interface BannerState {
  dismissed: boolean;
  dismissedAt: number;
  permanentlyDismissed: boolean;
}

export const usePWABanner = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const checkBannerState = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        const now = Date.now();

        if (!stored) {
          // Primeira visita - mostra o banner
          setShowBanner(true);
          setIsLoaded(true);
          return;
        }

        const bannerState: BannerState = JSON.parse(stored);

        // Se foi permanentemente dispensado, nunca mais mostra
        if (bannerState.permanentlyDismissed) {
          setShowBanner(false);
          setIsLoaded(true);
          return;
        }

        // Se foi dispensado, verifica se já passou o tempo
        if (bannerState.dismissed) {
          const timePassed = now - bannerState.dismissedAt;
          
          if (timePassed >= DISMISS_DURATION) {
            // Já passou 1 dia, mostra novamente
            setShowBanner(true);
          } else {
            // Ainda dentro do período de 1 dia
            setShowBanner(false);
          }
        } else {
          // Não foi dispensado, mostra o banner
          setShowBanner(true);
        }

        setIsLoaded(true);
      } catch (error) {
        console.error('Erro ao verificar estado do banner PWA:', error);
        // Em caso de erro, mostra o banner
        setShowBanner(true);
        setIsLoaded(true);
      }
    };

    checkBannerState();
  }, []);

  // Função para dispensar temporariamente (1 dia)
  const dismissBanner = () => {
    const bannerState: BannerState = {
      dismissed: true,
      dismissedAt: Date.now(),
      permanentlyDismissed: false,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(bannerState));
    setShowBanner(false);
  };

  // Função para dispensar permanentemente
  const dismissPermanently = () => {
    const bannerState: BannerState = {
      dismissed: true,
      dismissedAt: Date.now(),
      permanentlyDismissed: true,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(bannerState));
    setShowBanner(false);
  };

  // Função para instalar (também remove o banner permanentemente)
  const installApp = () => {
    dismissPermanently();
  };

  return {
    showBanner: showBanner && isLoaded,
    isLoaded,
    dismissBanner,
    dismissPermanently,
    installApp,
  };
};
