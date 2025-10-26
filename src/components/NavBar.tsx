'use client';

import { useState, useEffect, useRef } from 'react';
import { useContextSelector } from 'use-context-selector';
import { RoomContext } from '@/context/RoomContext';
import { useRoomCache } from '@/hooks/useRoomCache';
import { useTheme } from '@/hooks/useTheme';
import { Button } from './Button';
import { Modal } from './Modal';
import { SettingsModalContent } from './SettingsModalContent';
import { ShareModalContent } from './ShareModalContent';
import { ThemeButton } from './ThemeButton';

export const NavBar = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const { room, user, logout } = useContextSelector(RoomContext, (context) => ({
    room: context.room,
    user: context.user,
    logout: context.logout,
  }));

  const { cachedRoomData } = useRoomCache();
  const { toggleTheme } = useTheme();
  
  // Encontrar os dados do usuário atual nos membros da sala
  const userMember = cachedRoomData?.data?.members?.find(member => member.member.id === user?.id);

  // Calcular posição do dropdown baseado no botão
  const calculateDropdownPosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const scrollY = window.scrollY;
      setDropdownPosition({
        top: rect.bottom + scrollY + 8, // 8px de margem
        right: window.innerWidth - rect.right
      });
    }
  };

  // Abrir/fechar menu e calcular posição
  const toggleMenu = () => {
    if (!isMenuOpen) {
      calculateDropdownPosition();
    }
    setIsMenuOpen(!isMenuOpen);
  };

  // Gerenciar redimensionamento da tela
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 768; // md breakpoint
      
      if (!isMobile && isMenuOpen) {
        // Se mudou para desktop e menu está aberto, fechar
        setIsMenuOpen(false);
      } else if (isMobile && isMenuOpen) {
        // Se ainda é mobile e menu está aberto, recalcular posição
        calculateDropdownPosition();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMenuOpen]);

  // Fechar menu quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      
      // Verifica se o clique foi fora do menu e do botão
      if (menuRef.current && !menuRef.current.contains(target) && 
          buttonRef.current && !buttonRef.current.contains(target)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      // Delay para evitar fechamento imediato
      setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 100);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <>
      <header className="relative p-2 sm:p-3 md:p-4 bg-white/80 dark:bg-gray-800/80 rounded-lg shadow-sm backdrop-blur-sm">
        {/* Layout Mobile: Hamburger Menu */}
        <div className="md:hidden">
          <div className="flex items-center justify-between">
            {/* Informações da sala e usuário */}
            <div className="flex flex-col min-w-0 flex-1">
              <h1 className="text-sm sm:text-base font-bold text-gray-900 dark:text-gray-100 truncate">
                {cachedRoomData?.data?.name || 'Carregando...'}
              </h1>
              <div className="flex items-center gap-2 min-w-0">
                <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                  {userMember?.member.name || 'Usuário'}
                </p>
                {room?.owner_id === user?.id && (
                  <span className="px-1.5 py-0.5 text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded whitespace-nowrap">
                    Proprietário
                  </span>
                )}
              </div>
            </div>
            
            {/* Menu Hamburger */}
            <div className="relative" ref={menuRef}>
              <button
                ref={buttonRef}
                onClick={toggleMenu}
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
                title="Menu"
              >
                <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Layout Desktop: Horizontal Layout (md+) */}
        <div className="hidden md:flex md:items-center md:justify-between">
          {/* Informações do usuário e sala */}
          <div className="flex flex-col">
            <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {cachedRoomData?.data?.name || 'Carregando...'}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Olá, {userMember?.member.name || 'Usuário'}
              {room?.owner_id === user?.id && (
                <span className="ml-2 px-2 py-1 text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded">
                  Proprietário
                </span>
              )}
            </p>
          </div>

          {/* Botões de ação */}
          <div className="flex gap-2">
            <ThemeButton />
            
            <Button
              onClick={() => setIsShareOpen(true)}
              className="bg-blue-800 hover:bg-blue-900 focus:ring-blue-500"
              title="Compartilhar sala"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
            </Button>
            
            <Button
              onClick={() => setIsSettingsOpen(true)}
              className="bg-gray-600 hover:bg-gray-700 focus:ring-gray-500"
              title="Configurações"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </Button>
            
            <Button 
              onClick={() => logout()}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
              title="Sair da sala"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </Button>
          </div>
        </div>
      </header>

      {/* Dropdown Menu Renderizado Fora do Header */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div 
            ref={menuRef}
            className="fixed w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50"
            style={{
              top: `${dropdownPosition.top}px`,
              right: `${dropdownPosition.right}px`
            }}
          >
              <div className="py-2">
                {/* Tema - Fecha o menu primeiro, depois troca tema */}
                <div className="px-3 py-2 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-700">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Tema</span>
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMenuOpen(false);
                      setTimeout(() => toggleTheme(), 100);
                    }}
                  >
                    <ThemeButton />
                  </div>
                </div>

                {/* Divisor */}
                <div className="border-t border-gray-200 dark:border-gray-600 my-2"></div>
                
                {/* Compartilhar */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsShareOpen(true);
                    setTimeout(() => setIsMenuOpen(false), 100);
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3"
                >
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                  Compartilhar sala
                </button>
                
                {/* Configurações */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsSettingsOpen(true);
                    setTimeout(() => setIsMenuOpen(false), 100);
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3"
                >
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Configurações
                </button>
                
                {/* Divisor */}
                <div className="border-t border-gray-200 dark:border-gray-600 my-2"></div>
                
                {/* Sair */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    logout();
                    setTimeout(() => setIsMenuOpen(false), 100);
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sair da sala
                </button>
              </div>
            </div>
        </div>
      )}

      {/* Modal de Configurações */}
      <Modal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        title="Configurações da Sala"
      >
        <SettingsModalContent onClose={() => setIsSettingsOpen(false)} />
      </Modal>

      {/* Modal de Compartilhamento */}
      <Modal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        title={`Compartilhar "${cachedRoomData?.data?.name || ''}"`}
      >
        <ShareModalContent 
          roomId={room?.id || ''}
          roomName={cachedRoomData?.data?.name}
          onClose={() => setIsShareOpen(false)} 
        />
      </Modal>
    </>
  );
};