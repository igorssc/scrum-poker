'use client';

import { useState } from 'react';
import {
  FaCheck,
  FaChevronDown,
  FaChevronUp,
  FaEdit,
  FaHistory,
  FaPause,
  FaPlay,
  FaStop,
  FaTimes,
} from 'react-icons/fa';
import { Box } from './Box';
import { Button } from './Button';
import { Input } from './Input';

interface HistoryItem {
  id: string;
  topic: string;
  finalizedAt: Date;
  // Futuramente: votes, average, etc.
}

interface IssueManagerProps {
  items?: HistoryItem[];
  onFinalizeIssue?: (issue: string) => void;
  // Timer props
  time?: number;
  isRunning?: boolean;
  onToggleTimer?: () => void;
  onResetTimer?: () => void;
}

export function IssueManager({
  items = [],
  onFinalizeIssue,
  time = 0,
  isRunning = false,
  onToggleTimer,
  onResetTimer,
}: IssueManagerProps) {
  const [currentIssue, setCurrentIssue] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [tempIssue, setTempIssue] = useState('');
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(false);

  const historyItems = items || [];

  const handleStartEdit = () => {
    setTempIssue(currentIssue);
    setIsEditing(true);
  };

  const handleSave = () => {
    setCurrentIssue(tempIssue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempIssue(currentIssue);
    setIsEditing(false);
  };

  const handleFinalize = () => {
    if (currentIssue.trim() && onFinalizeIssue) {
      onFinalizeIssue(currentIssue);
      setCurrentIssue('');
      // Para o timer quando finaliza a issue
      if (isRunning && onResetTimer) {
        onResetTimer();
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <Box className="max-w-full lg:flex-1 min-h-0! max-h-fit flex flex-col gap-y-3 sm:gap-y-4 md:gap-y-6 lg:gap-y-8">
      <div className="flex flex-col gap-4">
        {/* Header com Timer */}
        <div className="flex items-center justify-between">
          <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
            Issue Atual
          </h3>

          {/* Timer */}
          <div className="flex items-center gap-2">
            <div
              className={`text-lg font-mono font-bold px-3 py-1 rounded-lg border-2 transition-colors ${
                isRunning
                  ? 'text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 animate-pulse'
                  : 'text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
              }`}
            >
              {formatTime(time)}
            </div>

            <div className="flex gap-1">
              <Button
                onClick={onToggleTimer}
                variant={isRunning ? 'secondary' : 'primary'}
                className="p-2"
                title={isRunning ? 'Pausar timer' : 'Iniciar timer'}
              >
                {isRunning ? <FaPause className="w-3 h-3" /> : <FaPlay className="w-3 h-3" />}
              </Button>

              <Button
                onClick={onResetTimer}
                variant="tertiary"
                className="p-2"
                title="Resetar timer"
                disabled={time === 0}
              >
                <FaStop className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>

        {/* Issue Atual */}
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Input
                value={tempIssue}
                onChange={e => setTempIssue(e.target.value)}
                placeholder="Digite a issue atual..."
                className="flex-1"
                autoFocus
                onKeyDown={e => {
                  if (e.key === 'Enter') handleSave();
                  if (e.key === 'Escape') handleCancel();
                }}
              />
              <Button onClick={handleSave} variant="primary" className="p-2" title="Salvar">
                <FaCheck className="w-3 h-3" />
              </Button>
              <Button onClick={handleCancel} variant="secondary" className="p-2" title="Cancelar">
                <FaTimes className="w-3 h-3" />
              </Button>
            </>
          ) : (
            <>
              <button
                onClick={handleStartEdit}
                className="flex-1 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 text-left hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                {currentIssue ? (
                  <p className="text-sm sm:text-base text-gray-900 dark:text-white">
                    {currentIssue}
                  </p>
                ) : (
                  <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 italic">
                    Clique para definir a issue atual
                  </p>
                )}
              </button>
              {currentIssue && (
                <>
                  <Button
                    onClick={handleStartEdit}
                    variant="tertiary"
                    className="p-2"
                    title="Editar issue"
                  >
                    <FaEdit className="w-3 h-3" />
                  </Button>
                  <Button
                    onClick={handleFinalize}
                    variant="primary"
                    className="text-xs sm:text-sm px-3 py-2"
                  >
                    Finalizar Issue
                  </Button>
                </>
              )}
            </>
          )}
        </div>

        {/* Histórico */}
        {historyItems.length > 0 && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <button
              onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}
              className="flex items-center justify-between w-full group"
            >
              <div className="flex items-center gap-2">
                <FaHistory className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Histórico de Issues
                </h4>
                <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                  {historyItems.length}
                </span>
              </div>

              {isHistoryExpanded ? (
                <FaChevronUp className="w-3 h-3 text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors" />
              ) : (
                <FaChevronDown className="w-3 h-3 text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors" />
              )}
            </button>

            {isHistoryExpanded && (
              <div className="space-y-2 pt-3">
                {historyItems.map((item: HistoryItem) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {item.topic}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Finalizado em {formatDate(item.finalizedAt)}
                      </p>
                    </div>

                    {/* Futuramente: mostrar resultado da votação */}
                    <div className="ml-3 text-xs text-gray-400 dark:text-gray-500">
                      {/* Exemplo: "8 pontos" ou "Consenso: 5" */}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Box>
  );
}
