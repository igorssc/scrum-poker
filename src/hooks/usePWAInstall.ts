'use client';

import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

export const usePWAInstall = () => {
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // Verifica se já está instalado
    const checkIfInstalled = () => {
      // Método 1: display-mode standalone
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

      // Método 2: navigator.standalone (iOS)
      const isIOSStandalone = (window.navigator as any).standalone === true;

      // Método 3: window.matchMedia para iOS
      const isIOSDisplayMode = window.matchMedia('(display-mode: standalone)').matches;

      return isStandalone || isIOSStandalone || isIOSDisplayMode;
    };

    setIsInstalled(checkIfInstalled());

    // Listener para o evento beforeinstallprompt
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      // Previne o banner automático do browser
      e.preventDefault();

      // Salva o evento para usar depois
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    // Listener para quando o app é instalado
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Função para mostrar o prompt de instalação
  const promptInstall = async () => {
    if (!deferredPrompt) return null;

    try {
      // Mostra o prompt de instalação
      await deferredPrompt.prompt();

      // Aguarda a escolha do usuário
      const choiceResult = await deferredPrompt.userChoice;

      // Limpa o prompt
      setDeferredPrompt(null);
      setIsInstallable(false);

      return choiceResult.outcome;
    } catch (error) {
      console.error('Erro ao mostrar prompt de instalação:', error);
      return null;
    }
  };

  return {
    isInstallable: isInstallable && !isInstalled,
    isInstalled,
    promptInstall,
  };
};
