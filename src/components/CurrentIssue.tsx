'use client';

import React from 'react';
import { FaCheck, FaEdit, FaPause, FaPlay, FaStop, FaTimes } from 'react-icons/fa';
import { twMerge } from 'tailwind-merge';
import { Box } from './Box';
import { Button } from './Button';
import { Input } from './Input';
import { Modal } from './Modal';
import { Select } from './Select';

type Sector = 'backend' | 'front-web' | 'front-app';

interface CurrentIssueProps {
  currentIssue: string;
  currentSector: Sector;
  tempIssue: string;
  tempSector: Sector;
  isEditing: boolean;
  time: number;
  isRunning: boolean;
  showResetModal: boolean;
  onStartEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onFinalize: () => void;
  onStartTimer?: () => void;
  onPauseTimer?: () => void;
  onResetTimer?: () => void;
  onTempIssueChange: (value: string) => void;
  onTempSectorChange: React.Dispatch<React.SetStateAction<Sector>>;
  onShowResetModal: (show: boolean) => void;
  formatTime: (seconds: number) => string;
}

// Componente do Modal de Reset do Timer
const ResetTimerModalContent = ({
  formattedTime,
  onConfirm,
  onCancel,
}: {
  formattedTime: string;
  onConfirm: () => void;
  onCancel: () => void;
}) => (
  <div className="space-y-3">
    <p className="text-sm text-gray-600 dark:text-gray-400">
      Tem certeza que deseja resetar o timer? O tempo atual de{' '}
      <span className="font-medium text-gray-900 dark:text-white">{formattedTime}</span> será
      perdido.
    </p>
    <div className="flex justify-end gap-2 pt-2">
      <Button onClick={onCancel} variant="secondary">
        Cancelar
      </Button>
      <Button onClick={onConfirm} variant="primary">
        Resetar
      </Button>
    </div>
  </div>
);

export default function CurrentIssue({
  currentIssue,
  currentSector,
  tempIssue,
  tempSector,
  isEditing,
  time,
  isRunning,
  showResetModal,
  onStartEdit,
  onSave,
  onCancel,
  onFinalize,
  onStartTimer,
  onPauseTimer,
  onResetTimer,
  onTempIssueChange,
  onTempSectorChange,
  onShowResetModal,
  formatTime,
}: CurrentIssueProps) {
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

  const handleResetTimer = () => {
    if (onResetTimer) {
      onResetTimer();
      onShowResetModal(false);
    }
  };

  // Componente do relógio SVG
  const ClockIcon = ({ isActive }: { isActive: boolean }) => (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      className={twMerge(
        'transition-colors',
        isActive ? 'text-purple-600 dark:text-purple-400' : 'text-gray-500 dark:text-gray-400'
      )}
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="2"
        className={isActive ? 'animate-pulse' : ''}
      />
      <polyline
        points="12,6 12,12 16,14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  return (
    <>
      <Box className="max-w-full w-full h-fit min-h-fit! p-3 sm:p-4 md:p-4 lg:p-5">
        <div className="w-full flex flex-col gap-3">
          <h3
            className={twMerge(
              'text-xs md:text-sm font-medium max-lg:text-center text-gray-900 dark:text-white'
            )}
          >
            Issue Atual
          </h3>

          {isEditing ? (
            <div className="space-y-3">
              {/* Campos de edição */}
              <div className="flex flex-col sm:flex-row gap-2 min-w-0">
                <div className="flex-1 min-w-0">
                  <Input
                    value={tempIssue}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      onTempIssueChange(e.target.value)
                    }
                    placeholder="Digite a issue atual..."
                    className={twMerge('w-full text-xs h-9 placeholder:text-[0.625rem]')}
                    autoFocus
                    onKeyDown={(e: React.KeyboardEvent) => {
                      if (e.key === 'Enter') onSave();
                      if (e.key === 'Escape') onCancel();
                    }}
                  />
                </div>
                <div className="w-full sm:w-36 sm:shrink-0">
                  <Select
                    value={tempSector}
                    onChange={value => onTempSectorChange(value as Sector)}
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
                  onClick={onCancel}
                  className={twMerge(
                    'inline-flex items-center gap-1 px-3 py-2.5 text-[0.625rem] text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors cursor-pointer'
                  )}
                >
                  <FaTimes className="w-2 h-2" />
                  <span>Cancelar</span>
                </button>
                <button
                  onClick={onSave}
                  className={twMerge(
                    'inline-flex items-center gap-1 px-3 py-2.5 text-[0.625rem] text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-200 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded transition-colors cursor-pointer'
                  )}
                >
                  <FaCheck className="w-2 h-2" />
                  <span>Salvar</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex max-sm:flex-col items-stretch gap-2 sm:h-8 min-w-0">
              <div className="flex-1 p-2.5 max-sm:py-1.5 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600 flex items-center min-w-0 overflow-hidden">
                {currentIssue ? (
                  <div className="flex items-center justify-between gap-2 w-full min-w-0">
                    <div className="flex items-center gap-2 flex-1 min-w-0 overflow-hidden">
                      <span
                        className={twMerge(
                          'text-xs text-gray-900 dark:text-white truncate flex-1 min-w-0'
                        )}
                        title={currentIssue}
                      >
                        {currentIssue}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[8px] font-medium shrink-0 border ${getSectorTagColor(currentSector)}`}
                      >
                        {getSectorLabel(currentSector)}
                      </span>
                    </div>
                    <button
                      onClick={onStartEdit}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors shrink-0"
                      title="Editar issue"
                    >
                      <FaEdit className="w-2 h-2 text-gray-500 dark:text-gray-400" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={twMerge(
                        'text-xs text-gray-500 dark:text-gray-400 italic flex-1 min-w-0'
                      )}
                    >
                      Nenhuma issue definida
                    </span>
                    <button
                      onClick={onStartEdit}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors shrink-0 ml-2"
                      title="Adicionar issue"
                    >
                      <FaEdit className="w-2 h-2 text-gray-500 dark:text-gray-400" />
                    </button>
                  </div>
                )}
              </div>

              {/* Timer e Controles */}
              <div className="flex items-stretch gap-1 shrink-0">
                {/* Display do Timer */}
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded min-w-14 justify-center">
                  <ClockIcon isActive={isRunning} />
                  <span
                    className={twMerge(
                      'text-[0.625rem] font-medium tabular-nums',
                      isRunning
                        ? 'text-purple-600 dark:text-purple-400'
                        : 'text-gray-600 dark:text-gray-400'
                    )}
                  >
                    {formatTime(time)}
                  </span>
                </div>

                {/* Controles do Timer */}
                <div className="flex items-stretch">
                  {!isRunning ? (
                    <button
                      onClick={onStartTimer}
                      disabled={!onStartTimer}
                      className="px-2 py-1.5 bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/40 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Iniciar timer"
                    >
                      <FaPlay className="w-2 h-2" />
                    </button>
                  ) : (
                    <button
                      onClick={onPauseTimer}
                      disabled={!onPauseTimer}
                      className="px-2 py-1.5 bg-yellow-50 hover:bg-yellow-100 dark:bg-yellow-900/20 dark:hover:bg-yellow-900/40 border border-yellow-200 dark:border-yellow-800 text-yellow-600 dark:text-yellow-400 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Pausar timer"
                    >
                      <FaPause className="w-2 h-2" />
                    </button>
                  )}

                  {time > 0 && (
                    <button
                      onClick={() => onShowResetModal(true)}
                      className="px-2 py-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded ml-1 transition-colors"
                      title="Resetar timer"
                    >
                      <FaStop className="w-2 h-2" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Botão Finalizar - sempre visível quando há issue */}
          {currentIssue && !isEditing && (
            <div className="flex justify-end pt-2">
              <Button onClick={onFinalize} variant="primary">
                Finalizar Issue
              </Button>
            </div>
          )}
        </div>
      </Box>

      {/* Modal de confirmação de reset do timer */}
      <Modal isOpen={showResetModal} onClose={() => onShowResetModal(false)} title="Resetar Timer">
        <ResetTimerModalContent
          formattedTime={formatTime(time)}
          onConfirm={handleResetTimer}
          onCancel={() => onShowResetModal(false)}
        />
      </Modal>
    </>
  );
}
