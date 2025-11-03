'use client';

import { useState } from 'react';
import {
  FaCheck,
  FaChevronDown,
  FaChevronUp,
  FaClock,
  FaEdit,
  FaHistory,
  FaRedo,
  FaSortAmountDown,
  FaSortAmountUp,
  FaStream,
  FaTable,
  FaTag,
  FaTimes,
  FaTrophy,
} from 'react-icons/fa';
import { twMerge } from 'tailwind-merge';
import { Box } from './Box';
import { Button } from './Button';
import { Input } from './Input';
import { Modal } from './Modal';
import { ResetTimerModalContent } from './ResetTimerModalContent';
import { Select } from './Select';

type Sector = 'backend' | 'front-web' | 'front-app';

interface Vote {
  userId: string;
  userName: string;
  card: string;
}

interface HistoryItem {
  id: string;
  topic: string;
  sector: Sector;
  finalizedAt: Date;
  duration?: number; // em segundos
  votes?: Vote[];
  winnerCards?: string[]; // em caso de empate, pode ter múltiplas
  consensus?: string; // carta vencedora ou "Empate"
}

interface IssueManagerProps {
  items?: HistoryItem[];
  onFinalizeIssue?: (issue: string, sector: Sector) => void;
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
  const [currentSector, setCurrentSector] = useState<Sector>('backend');
  const [isEditing, setIsEditing] = useState(false);
  const [tempIssue, setTempIssue] = useState('');
  const [tempSector, setTempSector] = useState<Sector>('backend');
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(true); // Aberto por padrão
  const [showDetailedHistory, setShowDetailedHistory] = useState(false);
  const [sectorFilter, setSectorFilter] = useState<Sector | 'all'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'time' | 'sector' | 'score' | 'name'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showResetModal, setShowResetModal] = useState(false);

  const historyItems = items || [];

  // Função para obter cor da tag do setor
  const getSectorTagColor = (sector: Sector) => {
    switch (sector) {
      case 'backend':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'front-web':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'front-app':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
    }
  };

  // Função para obter nome amigável do setor
  const getSectorLabel = (sector: Sector) => {
    switch (sector) {
      case 'backend':
        return 'Backend';
      case 'front-web':
        return 'Front Web';
      case 'front-app':
        return 'Front App';
    }
  };

  // Obter setores únicos que existem no histórico
  const availableSectors = Array.from(new Set(historyItems.map(item => item.sector)));

  // Opções de filtro dinâmicas
  const filterOptions = [
    { value: 'all', label: 'Todos' },
    ...availableSectors.map(sector => ({
      value: sector,
      label: getSectorLabel(sector),
    })),
  ];

  // Função para ordenar histórico
  const sortHistory = (items: HistoryItem[], sortBy: string, sortOrder: 'asc' | 'desc') => {
    const sorted = [...items].sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'time':
          comparison = (a.duration || 0) - (b.duration || 0);
          break;
        case 'sector':
          comparison = a.sector.localeCompare(b.sector);
          break;
        case 'name':
          comparison = a.topic.localeCompare(b.topic);
          break;
        case 'score':
          // Para empates, considerar a pontuação mais alta (número da carta)
          const getMaxScore = (item: HistoryItem) => {
            if (!item.votes || item.votes.length === 0) return 0;
            const scores = item.votes.map(vote => {
              const num = parseInt(vote.card);
              return isNaN(num) ? 0 : num;
            });
            return Math.max(...scores);
          };
          comparison = getMaxScore(a) - getMaxScore(b);
          break;
        default:
          comparison = new Date(b.finalizedAt).getTime() - new Date(a.finalizedAt).getTime();
      }

      return sortOrder === 'desc' ? -comparison : comparison;
    });

    return sorted;
  };

  // Filtrar histórico por setor
  const filteredItems =
    sectorFilter === 'all'
      ? historyItems
      : historyItems.filter(item => item.sector === sectorFilter);

  // Aplicar ordenação
  const filteredHistory = sortHistory(filteredItems, sortBy, sortOrder);

  const handleStartEdit = () => {
    setTempIssue(currentIssue);
    setTempSector(currentSector);
    setIsEditing(true);
  };

  const handleSave = () => {
    setCurrentIssue(tempIssue);
    setCurrentSector(tempSector);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempIssue(currentIssue);
    setTempSector(currentSector);
    setIsEditing(false);
  };

  const handleFinalize = () => {
    if (currentIssue.trim() && onFinalizeIssue) {
      onFinalizeIssue(currentIssue, currentSector);
      setCurrentIssue('');
      setCurrentSector('backend');
      // Para o timer quando finaliza a issue
      if (isRunning && onResetTimer) {
        onResetTimer();
      }
    }
  };

  const handleResetTimer = () => {
    if (onResetTimer) {
      onResetTimer();
      setShowResetModal(false);
    }
  };

  // Componente do relógio SVG
  const ClockIcon = ({ isActive }: { isActive: boolean }) => (
    <svg
      className={`w-4 h-4 transition-colors ${isActive ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12,6 12,12 16,14" />
    </svg>
  );

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
    <Box className="max-w-full lg:flex-1 min-h-0! max-h-fit flex flex-col gap-y-3 sm:gap-y-4 md:gap-y-6 lg:gap-y-8 min-w-0 overflow-hidden">
      <div className="flex flex-col gap-4 min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3
            className={twMerge(
              'text-[0.625rem] sm:text-xs font-medium text-gray-900 dark:text-white'
            )}
          >
            Issue Atual
          </h3>

          {/* Timer com relógio */}
          <div className="flex items-center gap-2">
            {time > 0 && (
              <button
                onClick={() => setShowResetModal(true)}
                className="py-[0.55rem] px-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors cursor-pointer"
                title="Resetar timer"
              >
                <FaRedo className="w-2 h-2 text-gray-500 dark:text-gray-400" />
              </button>
            )}
            <div
              className={`flex items-center gap-2 px-2 py-1 rounded border transition-colors cursor-pointer ${
                isRunning
                  ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                  : 'text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
              }`}
              onClick={onToggleTimer}
              title={isRunning ? 'Pausar timer' : 'Iniciar timer'}
            >
              <ClockIcon isActive={isRunning} />
              <span className={twMerge('text-[0.625rem] font-mono font-medium')}>
                {formatTime(time)}
              </span>
            </div>
          </div>
        </div>

        {/* Issue Atual */}
        <div className="space-y-2">
          {isEditing ? (
            <div className="space-y-2">
              {/* Desktop: Input e Select na mesma linha */}
              <div className="flex flex-col sm:flex-row gap-2 items-end">
                <div className="flex-1">
                  <Input
                    value={tempIssue}
                    onChange={e => setTempIssue(e.target.value)}
                    placeholder="Digite a issue atual..."
                    className={twMerge('w-full text-xs h-9 placeholder:text-[0.625rem]')}
                    autoFocus
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleSave();
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
              <div className="flex justify-end gap-1 pt-2">
                <button
                  onClick={handleCancel}
                  className={twMerge(
                    'inline-flex items-center gap-1 px-3 py-2.5 text-[0.625rem] text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors cursor-pointer'
                  )}
                >
                  <FaTimes className="w-2 h-2" />
                  <span>Cancelar</span>
                </button>
                <button
                  onClick={handleSave}
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
            <div className="flex items-stretch gap-2 h-8 min-w-0">
              <div className="flex-1 p-2.5 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600 flex items-center min-w-0 overflow-hidden">
                {currentIssue ? (
                  <div className="flex items-center justify-between gap-2 w-full min-w-0">
                    <div className="flex items-center gap-2 flex-1 min-w-0 overflow-hidden">
                      <span
                        className={twMerge(
                          'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.625rem] font-medium shrink-0',
                          getSectorTagColor(currentSector)
                        )}
                      >
                        <FaTag className="w-2 h-2" />
                        {getSectorLabel(currentSector)}
                      </span>
                      <p
                        className={twMerge(
                          'text-[0.625rem] sm:text-xs text-gray-900 dark:text-white truncate flex-1 min-w-0'
                        )}
                      >
                        {currentIssue}
                      </p>
                    </div>
                    <Button
                      onClick={handleStartEdit}
                      variant="tertiary"
                      className={twMerge('p-1 text-[0.625rem] shrink-0')}
                      title="Editar issue"
                    >
                      <FaEdit className="w-2.5 h-2.5" />
                    </Button>
                  </div>
                ) : (
                  <button onClick={handleStartEdit} className="w-full text-left cursor-pointer">
                    <p
                      className={twMerge(
                        'text-[0.625rem] sm:text-xs text-gray-500 dark:text-gray-400 italic'
                      )}
                    >
                      Clique para definir a issue atual
                    </p>
                  </button>
                )}
              </div>
              {currentIssue && (
                <Button
                  onClick={handleFinalize}
                  variant="primary"
                  className={twMerge('text-[0.625rem] px-2 py-0 flex items-center')}
                >
                  Finalizar Issue
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Histórico */}
        {historyItems.length > 0 && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}
                className="flex items-center gap-2 group cursor-pointer"
              >
                <FaHistory className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                <h4 className={twMerge('text-xs font-medium text-gray-900 dark:text-white')}>
                  Histórico de Votações
                </h4>
                <div className="flex items-center gap-1">
                  <span
                    className={twMerge(
                      'text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded-full text-[0.625rem]'
                    )}
                  >
                    {sectorFilter === 'all'
                      ? historyItems.length
                      : `${filteredHistory.length}/${historyItems.length}`}
                  </span>
                  {(sectorFilter !== 'all' || sortBy !== 'date' || sortOrder !== 'desc') && (
                    <span
                      className="w-1.5 h-1.5 bg-purple-500 rounded-full"
                      title="Filtros/Ordenação aplicados"
                    />
                  )}
                </div>
                {isHistoryExpanded ? (
                  <FaChevronUp className="w-2.5 h-2.5 text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors" />
                ) : (
                  <FaChevronDown className="w-2.5 h-2.5 text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors" />
                )}
              </button>

              {isHistoryExpanded && (
                <div className={twMerge('flex items-center gap-2 text-[0.625rem]')}>
                  {/* Filtro e Ordenação em linha */}
                  <div className="flex items-center gap-1.5">
                    <div className="flex items-center gap-1">
                      <Select
                        value={sectorFilter}
                        onChange={value => setSectorFilter(value as Sector | 'all')}
                        placeholder="Filtrar"
                        options={filterOptions}
                        size="sm"
                        variant="discrete"
                      />
                    </div>

                    <div className="w-px h-4 bg-gray-300 dark:bg-gray-600"></div>

                    <div className="flex items-center gap-1">
                      <Select
                        value={sortBy}
                        onChange={value =>
                          setSortBy(value as 'date' | 'time' | 'sector' | 'score' | 'name')
                        }
                        placeholder="Ordenar"
                        options={[
                          { value: 'date', label: 'Data' },
                          { value: 'name', label: 'Nome' },
                          { value: 'time', label: 'Tempo' },
                          { value: 'sector', label: 'Setor' },
                          { value: 'score', label: 'Pontuação' },
                        ]}
                        size="sm"
                        variant="discrete"
                      />
                      <button
                        onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                        className="p-[0.68rem] hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors flex items-center cursor-pointer"
                        title={`Ordenar ${sortOrder === 'asc' ? 'decrescente' : 'crescente'}`}
                      >
                        {sortOrder === 'asc' ? (
                          <FaSortAmountUp className="w-2.5 h-2.5 text-gray-500 dark:text-gray-400" />
                        ) : (
                          <FaSortAmountDown className="w-2.5 h-2.5 text-gray-500 dark:text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Separador e Toggle de Detalhes */}
                  <div className="w-px h-4 bg-gray-300 dark:bg-gray-600"></div>
                  <button
                    onClick={() => setShowDetailedHistory(!showDetailedHistory)}
                    className="p-[0.68rem] hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors flex items-center cursor-pointer"
                    title={showDetailedHistory ? 'Visualização resumida' : 'Visualização detalhada'}
                  >
                    {showDetailedHistory ? (
                      <FaTable className="w-2.5 h-2.5 text-gray-500 dark:text-gray-400" />
                    ) : (
                      <FaStream className="w-2.5 h-2.5 text-gray-500 dark:text-gray-400" />
                    )}
                  </button>
                </div>
              )}
            </div>

            {isHistoryExpanded && (
              <div className="space-y-2">
                {filteredHistory.map((item: HistoryItem) => (
                  <div
                    key={item.id}
                    className="p-2.5 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600"
                  >
                    {/* Header da Issue */}
                    <div className="flex items-start justify-between mb-2 min-w-0">
                      <div className="flex-1 min-w-0 overflow-hidden">
                        <div className="flex items-center gap-2 mb-1 min-w-0">
                          <p className="text-xs font-medium text-gray-900 dark:text-white truncate flex-1 min-w-0">
                            {item.topic}
                          </p>
                          <span
                            className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[8px] font-medium shrink-0 ${getSectorTagColor(item.sector)}`}
                          >
                            <FaTag className="w-1.5 h-1.5" />
                            {getSectorLabel(item.sector)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className={twMerge(
                              'text-[0.625rem] text-gray-500 dark:text-gray-400 shrink-0'
                            )}
                          >
                            {formatDate(item.finalizedAt)}
                          </span>
                          {item.duration && (
                            <span
                              className={twMerge(
                                'text-[0.625rem] text-gray-500 dark:text-gray-400 flex items-center gap-1 shrink-0'
                              )}
                            >
                              <FaClock className="w-2 h-2" />
                              {formatTime(item.duration)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Resultado da Votação */}
                      {item.consensus && (
                        <div className="flex items-center gap-1 ml-2 shrink-0">
                          <FaTrophy className="w-2.5 h-2.5 text-yellow-500" />
                          <span
                            className={twMerge(
                              'text-xs font-medium text-gray-900 dark:text-white bg-yellow-100 dark:bg-yellow-900/30 px-1.5 py-0.5 rounded text-[0.625rem] border border-yellow-200 dark:border-yellow-800'
                            )}
                          >
                            {item.consensus}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Detalhes da Votação */}
                    {showDetailedHistory && item.votes && item.votes.length > 0 && (
                      <div className="border-t border-gray-200 dark:border-gray-600 pt-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1">
                          {item.votes.map((vote, index) => (
                            <div
                              key={index}
                              className={twMerge(
                                'flex items-center justify-between p-1.5 bg-gray-100 dark:bg-gray-600 rounded text-[0.625rem]'
                              )}
                            >
                              <span className="text-gray-700 dark:text-gray-300 truncate flex-1 mr-1">
                                {vote.userName}
                              </span>
                              <span
                                className={`font-medium px-1 py-0.5 rounded ${
                                  item.winnerCards?.includes(vote.card)
                                    ? 'bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200'
                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                                }`}
                              >
                                {vote.card}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Resumo da Votação quando não está no modo detalhado */}
                    {!showDetailedHistory && item.votes && item.votes.length > 0 && (
                      <div className="border-t border-gray-200 dark:border-gray-600 pt-2">
                        <div className="flex items-center justify-between">
                          <span
                            className={twMerge('text-[0.625rem] text-gray-500 dark:text-gray-400')}
                          >
                            {item.votes.length} voto{item.votes.length !== 1 ? 's' : ''}
                          </span>
                          {item.winnerCards && item.winnerCards.length > 1 && (
                            <span className="text-[10px] text-amber-600 dark:text-amber-400 truncate">
                              Empate: {item.winnerCards.join(', ')}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal de confirmação de reset do timer */}
      <Modal isOpen={showResetModal} onClose={() => setShowResetModal(false)} title="Resetar Timer">
        <ResetTimerModalContent
          formattedTime={formatTime(time)}
          onConfirm={handleResetTimer}
          onCancel={() => setShowResetModal(false)}
        />
      </Modal>
    </Box>
  );
}
