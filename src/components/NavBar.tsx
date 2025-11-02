'use client';

import { RoomContext } from '@/context/RoomContext';
import { useRoomCache } from '@/hooks/useRoomCache';
import { useServerTimer } from '@/hooks/useServerTimer';
import { useTheme } from '@/hooks/useTheme';
import * as Popover from '@radix-ui/react-popover';
import { useState } from 'react';
import { useContextSelector } from 'use-context-selector';
import { Button } from './Button';
import { Modal } from './Modal';
import { ResetTimerModalContent } from './ResetTimerModalContent';
import { SettingsModalContent } from './SettingsModalContent';
import { ShareModalContent } from './ShareModalContent';
import { ThemeButton } from './ThemeButton';

export const NavBar = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  const { room, user, logout, isLoggingOut } = useContextSelector(RoomContext, context => ({
    room: context.room,
    user: context.user,
    logout: context.logout,
    isLoggingOut: context.isLoggingOut,
  }));

  const { cachedRoomData } = useRoomCache();
  const { toggleTheme } = useTheme();
  const {
    formattedTime,
    isRunning,
    toggle: toggleTimer,
    reset: resetTimer,
    seconds: secondsTimer,
  } = useServerTimer();

  // Encontrar os dados do usuário atual nos membros da sala
  const userMember = cachedRoomData?.data?.members?.find(member => member.member.id === user?.id);

  const isOwner = room?.owner_id === user?.id;

  const userCanStartAndStopTimer =
    isOwner || cachedRoomData?.data?.who_can_open_cards.includes(user?.id || '');

  return (
    <>
      <header className="relative p-3 sm:p-4 md:p-6 lg:p-8 bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-200 rounded-lg shadow-sm backdrop-blur-sm">
        {/* Layout Mobile: Hamburger Menu */}
        <div className="md:hidden">
          <div className="flex items-center justify-between">
            {/* Informações da sala e usuário */}
            <div className="flex flex-col min-w-0 flex-1 gap-2 sm:gap-2">
              <h1 className="text-sm sm:text-base font-bold text-gray-900 dark:text-gray-100 truncate mr-4">
                {cachedRoomData?.data?.name || 'Carregando...'}
              </h1>
              <div className="flex items-center gap-2 min-w-0 pr-4">
                <p className="text-xs text-gray-600 dark:text-gray-400 truncate mr-2">
                  {userMember?.member.name || 'Usuário'}
                </p>
                {room?.owner_id === user?.id && (
                  <span className="px-1.5 py-0.5 text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded whitespace-nowrap">
                    Proprietário
                  </span>
                )}
              </div>
            </div>

            {/* Menu Hamburger com Popover */}
            <Popover.Root open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <Popover.Trigger asChild>
                <button
                  className="cursor-pointer p-2 rounded-lg bg-purple-100 hover:bg-purple-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
                  title="Menu"
                >
                  <svg
                    className="w-5 h-5 text-purple-600 dark:text-gray-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </button>
              </Popover.Trigger>

              <Popover.Portal>
                <Popover.Content
                  className="md:hidden w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 overflow-visible"
                  side="bottom"
                  align="end"
                  sideOffset={12}
                  onOpenAutoFocus={e => e.preventDefault()}
                >
                  {/* Seta CSS customizada - menor e centralizada com o trigger */}
                  <div className="absolute -top-1 right-3 w-2.5 h-2.5 bg-white dark:bg-gray-800 border-l border-t border-gray-200 dark:border-gray-700 transform rotate-45"></div>
                  <div className="py-2">
                    {/* Tema */}
                    <div className="px-3 py-2 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-700">
                      <span className="text-sm text-gray-700 dark:text-gray-300">Tema</span>
                      <div
                        onClick={e => {
                          e.stopPropagation();
                          setIsMenuOpen(false);
                          setTimeout(() => toggleTheme(), 100);
                        }}
                        className="cursor-pointer"
                      >
                        <ThemeButton />
                      </div>
                    </div>

                    {/* Divisor */}
                    <div className="border-t border-gray-200 dark:border-gray-600 my-2"></div>

                    {/* Compartilhar */}
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        setIsShareOpen(true);
                        setIsMenuOpen(false);
                      }}
                      className="cursor-pointer w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3"
                    >
                      <svg
                        className="w-4 h-4 text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                        />
                      </svg>
                      Compartilhar sala
                    </button>

                    {/* Configurações */}
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        setIsSettingsOpen(true);
                        setIsMenuOpen(false);
                      }}
                      className="cursor-pointer w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3"
                    >
                      <svg
                        className="w-4 h-4 text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      Configurações
                    </button>

                    {/* Divisor */}
                    <div className="border-t border-gray-200 dark:border-gray-600 my-2"></div>

                    {/* Sair */}
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        logout();
                        setIsMenuOpen(false);
                      }}
                      disabled={isLoggingOut}
                      className="cursor-pointer w-full px-3 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                      Sair da sala
                    </button>
                  </div>
                </Popover.Content>
              </Popover.Portal>
            </Popover.Root>
          </div>
        </div>

        {/* Layout Desktop: Horizontal Layout (md+) */}
        <div className="hidden md:flex md:items-center md:justify-between">
          {/* Informações do usuário e sala */}
          <div className="flex flex-col gap-2 overflow-hidden">
            <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100 truncate pr-6">
              {cachedRoomData?.data?.name || 'Carregando...'}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 truncate pr-6">
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
            <div className="flex items-center gap-2">
              {/* Botão de Reset - aparece apenas quando timer está rodando */}
              {secondsTimer > 0 && userCanStartAndStopTimer && (
                <button
                  onClick={() => setIsResetConfirmOpen(true)}
                  className="p-2 rounded-lg cursor-pointer transition-colors"
                  title="Resetar timer"
                >
                  <svg
                    className="w-4 h-4 text-purple-400 hover:text-purple-500 dark:text-gray-300 dark:hover:text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m-15.357-2A8.003 8.003 0 0019.417 15M15 15h-4"
                    />
                  </svg>
                </button>
              )}

              {/* Botão do Timer com Tooltip */}
              <Button
                onClick={toggleTimer}
                className={`light:bg-linear-to-r from-purple-300 via-purple-400 to-purple-500 focus:ring-purple-600 focus:ring-1 ${
                  isRunning ? 'animate-pulse' : ''
                }`}
                title={
                  !userCanStartAndStopTimer
                    ? 'Você não pode iniciar ou parar o timer'
                    : isRunning
                      ? 'Clique para pausar'
                      : 'Clique para iniciar'
                }
                disabled={!userCanStartAndStopTimer}
              >
                <div className="flex items-center gap-2">
                  {/* Ícone de relógio simples */}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12,6 12,12 16,14" />
                  </svg>
                  <span className="text-xs font-mono">{formattedTime}</span>
                </div>
              </Button>
            </div>

            <ThemeButton />

            <Button
              onClick={() => setIsShareOpen(true)}
              className="light:bg-linear-to-r from-purple-300 via-purple-400 to-purple-500 focus:ring-purple-600 focus:ring-1"
              title="Compartilhar sala"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                />
              </svg>
            </Button>

            <Button
              onClick={() => setIsSettingsOpen(true)}
              className="light:bg-linear-to-r from-purple-300 via-purple-400 to-purple-500 focus:ring-purple-600 focus:ring-1"
              title="Configurações"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </Button>

            <Button
              onClick={() => logout()}
              className="light:bg-linear-to-r from-purple-300 via-purple-400 to-purple-500 focus:ring-purple-600 focus:ring-1"
              title="Sair da sala"
              disabled={isLoggingOut}
              isLoading={isLoggingOut}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            </Button>
          </div>
        </div>
      </header>

      {/* Modal de Configurações */}
      <Modal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        title="Configurações da Sala"
        className="max-w-xl"
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
          access={cachedRoomData?.data?.access}
          onClose={() => setIsShareOpen(false)}
        />
      </Modal>

      {/* Modal de Confirmação de Reset do Timer */}
      <Modal
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        title="Resetar Timer"
      >
        <ResetTimerModalContent
          formattedTime={formattedTime}
          onConfirm={() => {
            resetTimer();
            setIsResetConfirmOpen(false);
          }}
          onCancel={() => setIsResetConfirmOpen(false)}
        />
      </Modal>
    </>
  );
};
