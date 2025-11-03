'use client';

import { RoomContext } from '@/context/RoomContext';
import { useRoomActions } from '@/hooks/useRoomActions';
import { useRoomCache } from '@/hooks/useRoomCache';
import React, { useState } from 'react';
import { FaCheck, FaEdit, FaRedo, FaTimes, FaTrash } from 'react-icons/fa';
import { twMerge } from 'tailwind-merge';
import { useContextSelector } from 'use-context-selector';
import { Box } from './Box';
import { ClearIssueModalContent } from './ClearIssueModalContent';
import { Input } from './Input';
import { Modal } from './Modal';
import { ResetTimerModalContent } from './ResetTimerModalContent';
import { Select } from './Select';

type Sector = 'backend' | 'front-web' | 'front-app';

interface CurrentIssueProps {
  time: number;
  isRunning: boolean;
  onStartTimer?: () => void;
  onPauseTimer?: () => void;
  onResetTimer?: () => void;
  formatTime: (seconds: number) => string;
}

export default function CurrentIssue({
  time,
  isRunning,
  onStartTimer,
  onPauseTimer,
  onResetTimer,
  formatTime,
}: CurrentIssueProps) {
  // Estados internos para edição
  const [isEditing, setIsEditing] = useState(false);
  const [tempIssue, setTempIssue] = useState('');
  const [tempSector, setTempSector] = useState<Sector>('backend');
  const [showResetModal, setShowResetModal] = useState(false);
  const [showClearIssueModal, setShowClearIssueModal] = useState(false);

  // Verificar permissões do usuário
  const { user } = useContextSelector(RoomContext, context => ({
    user: context.user,
  }));
  const { cachedRoomData } = useRoomCache();
  const { updateRoom, isUpdatingRoom } = useRoomActions();

  const room = cachedRoomData?.data;
  const isOwner = room?.owner_id === user?.id;
  const userCanOpenCards = isOwner || room?.who_can_open_cards?.includes(user?.id || '');

  // Se o usuário não tem permissão, desabilita as ações
  const canPerformActions = userCanOpenCards;

  // Dados atuais do room
  const currentIssue = room?.current_issue || '';
  const currentSector = (room?.current_sector as Sector) || 'backend';

  // Funções para gerenciar a edição
  const handleStartEdit = () => {
    setTempIssue(currentIssue);
    setTempSector(currentSector);
    setIsEditing(true);
  };

  const handleSave = async (edit = false) => {
    if (!canPerformActions) return;

    try {
      // Verifica se é uma nova issue (campo estava vazio)
      const wasEmpty = !currentIssue.trim();
      const hasNewContent = tempIssue.trim();

      await updateRoom({
        current_issue: tempIssue.trim() || null,
        current_sector: tempIssue.trim() ? tempSector : null,
        ...(!edit && {
          stop_timer: null,
          start_timer: new Date(new Date().getTime() - 1000).toISOString(),
        }),
      });
      setIsEditing(false);

      // Auto-start timer: Se era uma issue nova (campo estava vazio) e agora tem conteúdo,
      // iniciar o timer automaticamente para começar a contagem de tempo da votação
      if (wasEmpty && hasNewContent && onStartTimer && !isRunning) {
        onStartTimer();
      }
    } catch (error) {
      console.error('Erro ao salvar issue:', error);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setTempIssue('');
    setTempSector('backend');
  };

  const handleClearIssue = () => {
    setShowClearIssueModal(true);
  };

  const handleConfirmClearIssue = async () => {
    if (!canPerformActions) return;

    try {
      await updateRoom({
        current_issue: null,
        current_sector: null,
      });

      // Reset timer: Quando a issue é limpa, o timer deve ser zerado
      // para não manter o tempo da votação anterior
      if (onResetTimer) {
        onResetTimer();
      }

      setShowClearIssueModal(false);
    } catch (error) {
      console.error('Erro ao limpar issue:', error);
    }
  };

  const handleResetTimer = () => {
    if (onResetTimer) {
      onResetTimer();
      setShowResetModal(false);
    }
  };

  const getSectorLabel = (sector: Sector): string => {
    const labels = {
      backend: 'Backend',
      'front-web': 'Front Web',
      'front-app': 'Front App',
    };
    return labels[sector];
  };

  const getSectorTagColor = (sector: Sector): string => {
    const colors = {
      backend:
        'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-800',
      'front-web':
        'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800',
      'front-app':
        'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 border-purple-200 dark:border-purple-800',
    };
    return colors[sector];
  };

  // Função para determinar a cor do timer baseada no tempo
  const getTimerColorClasses = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);

    // Se não tem permissão, usar estilo desabilitado mas ainda pulsando
    if (!canPerformActions) {
      return {
        text: 'text-gray-400 dark:text-gray-500',
        border: 'border-gray-300 dark:border-gray-600',
        bg: 'bg-gray-100 dark:bg-gray-800',
        hover: '', // Sem hover quando desabilitado
        pulse: seconds > 0 && isRunning ? 'animate-pulse' : '',
        cursor: 'cursor-not-allowed',
      };
    }

    if (minutes >= 20) {
      // Vermelho após 20 minutos
      return {
        text: 'text-red-600 dark:text-red-400',
        border: 'border-red-200 dark:border-red-800',
        bg: 'bg-red-50 dark:bg-red-900/20',
        hover: 'hover:bg-red-100 dark:hover:bg-red-900/40',
        pulse: isRunning ? 'animate-pulse' : '',
        cursor: 'cursor-pointer',
      };
    } else if (minutes >= 10) {
      // Amarelo após 10 minutos
      return {
        text: 'text-yellow-600 dark:text-yellow-400',
        border: 'border-yellow-200 dark:border-yellow-800',
        bg: 'bg-yellow-50 dark:bg-yellow-900/20',
        hover: 'hover:bg-yellow-100 dark:hover:bg-yellow-900/40',
        pulse: isRunning ? 'animate-pulse' : '',
        cursor: 'cursor-pointer',
      };
    } else {
      // Cor normal (cinza) - pulsa apenas se o timer não estiver zerado E estiver rodando
      return {
        text: 'text-gray-600 dark:text-gray-400',
        border: 'border-gray-200 dark:border-gray-600',
        bg: 'bg-gray-50 dark:bg-gray-700',
        hover: 'hover:bg-gray-100 dark:hover:bg-gray-600',
        pulse: seconds > 0 && isRunning ? 'animate-pulse' : '',
        cursor: 'cursor-pointer',
      };
    }
  };

  // Componente do relógio SVG
  const ClockIcon = ({ isActive }: { isActive: boolean }) => {
    const colors = getTimerColorClasses(time);
    return (
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        className={twMerge('transition-colors', colors.text)}
      >
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
        <polyline
          points="12,6 12,12 16,14"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  };

  return (
    <>
      <Box
        className="max-w-full w-full h-fit min-h-fit! p-3 sm:p-4 md:p-4 lg:p-5"
        allowOverflow={isEditing}
      >
        <div className="w-full flex flex-col gap-3 sm:gap-5">
          <div className="w-full h-fit flex justify-between items-center">
            <div className="flex items-center gap-2">
              <h3
                className={twMerge(
                  'text-xs md:text-sm font-medium max-lg:text-center text-gray-900 dark:text-white'
                )}
              >
                Issue Atual
              </h3>
              {currentIssue && (
                <span
                  className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[8px] font-medium shrink-0 border ${getSectorTagColor(currentSector)}`}
                >
                  {getSectorLabel(currentSector)}
                </span>
              )}
            </div>
          </div>

          {isEditing && canPerformActions ? (
            <div className="space-y-3">
              {/* Campos de edição */}
              <div className="flex flex-col sm:flex-row gap-2 min-w-0">
                <div className="flex-1 min-w-0">
                  <Input
                    value={tempIssue}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setTempIssue(e.target.value)
                    }
                    placeholder="Digite a issue atual..."
                    className={twMerge(
                      'w-full text-[0.65rem] md:text-xs h-9 placeholder:text-[0.625rem]'
                    )}
                    autoFocus
                    onKeyDown={(e: React.KeyboardEvent) => {
                      if (e.key === 'Enter') handleSave(!!room?.current_issue);
                      if (e.key === 'Escape') handleCancel();
                    }}
                  />
                </div>
                <div className="w-full sm:w-36 sm:shrink-0">
                  <Select
                    value={tempSector}
                    onChange={value => setTempSector(value as Sector)}
                    placeholder="Setor"
                    options={[
                      { value: 'backend', label: 'Backend' },
                      { value: 'front-web', label: 'Front Web' },
                      { value: 'front-app', label: 'Front App' },
                    ]}
                  />
                </div>
              </div>
              {/* Botões discretos alinhados à direita */}
              <div className="flex justify-center sm:justify-end gap-1 pt-2">
                <button
                  onClick={handleCancel}
                  disabled={isUpdatingRoom}
                  className={twMerge(
                    'inline-flex items-center gap-1 px-3 py-2.5 text-[0.625rem] text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
                  )}
                >
                  <FaTimes className="w-2 h-2" />
                  <span>Cancelar</span>
                </button>
                <button
                  onClick={() => handleSave(!!room?.current_issue)}
                  disabled={isUpdatingRoom}
                  className={twMerge(
                    'inline-flex items-center gap-1 px-3 py-2.5 text-[0.625rem] text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-200 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
                  )}
                >
                  <FaCheck className="w-2 h-2" />
                  <span>{isUpdatingRoom ? 'Salvando...' : 'Salvar'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-stretch gap-2 sm:h-8 min-w-0">
              <div
                className={twMerge(
                  'flex-1 p-2.5 max-sm:py-1.5 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600 flex items-center min-w-0 overflow-hidden',
                  canPerformActions
                    ? 'hover:bg-gray-100 dark:hover:bg-gray-700/80'
                    : 'cursor-not-allowed'
                )}
              >
                {currentIssue ? (
                  <div className="flex items-center justify-between gap-2 w-full min-w-0">
                    <div className="flex items-center gap-2 flex-1 min-w-0 overflow-hidden">
                      {/* Ícone de lixeira discreto à esquerda */}
                      {canPerformActions && (
                        <button
                          onClick={handleClearIssue}
                          disabled={isUpdatingRoom}
                          className="cursor-pointer p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-colors shrink-0 disabled:opacity-50 disabled:cursor-not-allowed group"
                          title="Remover issue"
                        >
                          <FaTrash className="w-2.5 h-2.5 text-gray-400 dark:text-gray-500 group-hover:text-red-500 dark:group-hover:text-red-400 transition-colors" />
                        </button>
                      )}
                      <span
                        className={twMerge(
                          'text-[0.65rem] md:text-xs text-gray-900 dark:text-white truncate flex-1 min-w-0'
                        )}
                        title={currentIssue}
                      >
                        {currentIssue}
                      </span>
                    </div>
                    {canPerformActions && (
                      <button
                        onClick={handleStartEdit}
                        disabled={isUpdatingRoom}
                        className="cursor-pointer p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Editar issue"
                      >
                        <FaEdit className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                      </button>
                    )}
                  </div>
                ) : canPerformActions ? (
                  <button
                    onClick={handleStartEdit}
                    disabled={isUpdatingRoom}
                    className="flex items-center justify-between w-full cursor-pointer transition-colors rounded p-1 -m-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Clique para definir a issue"
                  >
                    <span
                      className={twMerge(
                        'text-[0.65rem] md:text-xs text-gray-500 dark:text-gray-400 italic flex-1 min-w-0 text-left'
                      )}
                    >
                      Clique aqui para definir a issue
                    </span>
                  </button>
                ) : (
                  <span
                    className={twMerge(
                      'text-[0.65rem] md:text-xs text-gray-400 dark:text-gray-500 italic flex-1 min-w-0 text-left p-1'
                    )}
                    title="Você não tem permissão para definir issues"
                  >
                    Apenas usuários com permissão podem definir issues
                  </span>
                )}
              </div>

              {/* Timer e Controles - só exibe quando há issue */}
              {currentIssue && (
                <div className="flex items-stretch gap-2 shrink-0">
                  {/* Display do Timer - clicável para play/pause */}
                  <button
                    onClick={
                      canPerformActions ? (!isRunning ? onStartTimer : onPauseTimer) : undefined
                    }
                    disabled={
                      !canPerformActions ||
                      (!onStartTimer && !isRunning) ||
                      (!onPauseTimer && isRunning)
                    }
                    className={twMerge(
                      'flex items-center gap-1.5 px-2.5 py-1.5 rounded min-w-14 justify-center transition-colors disabled:cursor-not-allowed',
                      getTimerColorClasses(time).bg,
                      getTimerColorClasses(time).border,
                      getTimerColorClasses(time).hover,
                      getTimerColorClasses(time).pulse,
                      getTimerColorClasses(time).cursor,
                      'border'
                    )}
                    title={
                      !canPerformActions
                        ? 'Você não tem permissão para controlar o timer'
                        : isRunning
                          ? 'Pausar timer'
                          : 'Iniciar timer'
                    }
                  >
                    <ClockIcon isActive={isRunning} />
                    <span
                      className={twMerge(
                        'text-[0.625rem] font-medium tabular-nums',
                        getTimerColorClasses(time).text
                      )}
                    >
                      {formatTime(time)}
                    </span>
                  </button>

                  {/* Reset Button - à direita */}
                  {time > 0 && canPerformActions && (
                    <button
                      onClick={() => setShowResetModal(true)}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors cursor-pointer"
                      title="Resetar timer"
                    >
                      <FaRedo className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </Box>

      {/* Modal de confirmação de reset do timer */}
      <Modal isOpen={showResetModal} onClose={() => setShowResetModal(false)} title="Resetar Timer">
        <ResetTimerModalContent
          formattedTime={formatTime(time)}
          onConfirm={handleResetTimer}
          onCancel={() => setShowResetModal(false)}
        />
      </Modal>

      {/* Modal de confirmação de limpar issue */}
      <Modal
        isOpen={showClearIssueModal}
        onClose={() => setShowClearIssueModal(false)}
        title="Remover Issue"
        className="max-w-lg"
      >
        <ClearIssueModalContent
          currentIssue={currentIssue}
          onConfirm={handleConfirmClearIssue}
          onCancel={() => setShowClearIssueModal(false)}
        />
      </Modal>
    </>
  );
}
