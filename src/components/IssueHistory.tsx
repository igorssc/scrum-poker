'use client';

import { RoomContext } from '@/context/RoomContext';
import { useRoomCache } from '@/hooks/useRoomCache';
import { HistoryItem, Sector } from '@/types/voting';
import { generateHistoryPDF } from '@/utils/pdfGenerator';
import * as Popover from '@radix-ui/react-popover';
import React from 'react';
import {
  FaChevronDown,
  FaChevronUp,
  FaClock,
  FaDownload,
  FaFilter,
  FaSort,
  FaSortAmountDown,
  FaSortAmountUp,
  FaStream,
  FaTable,
  FaTag,
  FaTrophy,
} from 'react-icons/fa';
import { twMerge } from 'tailwind-merge';
import { useContextSelector } from 'use-context-selector';
import { Box } from './Box';

// Componente dos controles de filtro e ordenação
const FilterAndSortControls = ({
  sectorFilter,
  onSectorFilterChange,
  filterOptions,
  sortBy,
  sortOrder,
  onSortByChange,
  onToggleSortOrder,
  showDetailedHistory,
  onToggleDetailedHistory,
  onDownloadPDF,
  userCanDownloadPDF,
  getSectorLabel,
}: {
  sectorFilter: Sector | 'all';
  onSectorFilterChange: React.Dispatch<React.SetStateAction<Sector | 'all'>>;
  filterOptions: { value: string; label: string }[];
  sortBy: 'date' | 'time' | 'sector' | 'score' | 'name';
  sortOrder: 'asc' | 'desc';
  onSortByChange: React.Dispatch<
    React.SetStateAction<'date' | 'time' | 'sector' | 'score' | 'name'>
  >;
  onToggleSortOrder: () => void;
  showDetailedHistory: boolean;
  onToggleDetailedHistory: () => void;
  onDownloadPDF: () => void;
  userCanDownloadPDF: boolean;
  getSectorLabel: (sector: Sector) => string;
}) => {
  const hasFilterApplied = sectorFilter !== 'all';
  const hasSortApplied = sortBy !== 'date' || sortOrder !== 'desc';

  const sortOptions = [
    { value: 'date', label: 'Data' },
    { value: 'name', label: 'Nome' },
    { value: 'time', label: 'Tempo' },
    { value: 'sector', label: 'Setor' },
    { value: 'score', label: 'Pontuação' },
  ];

  return (
    <div className="flex items-center gap-1 sm:gap-2 text-[0.625rem]">
      {/* Filtro Popover */}
      <Popover.Root>
        <Popover.Trigger asChild>
          <button
            className="relative p-[0.68rem] hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors flex items-center cursor-pointer shrink-0"
            title="Filtrar por setor"
          >
            <FaFilter className="w-3 h-2.5 text-gray-500 dark:text-gray-400" />
            {hasFilterApplied && (
              <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-purple-500 rounded-full"></div>
            )}
          </button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl min-w-32 z-50"
            side="bottom"
            align="center"
            sideOffset={4}
          >
            {filterOptions.map(option => (
              <Popover.Close asChild key={option.value}>
                <button
                  onClick={() => onSectorFilterChange(option.value as Sector | 'all')}
                  className={twMerge(
                    'w-full px-3 py-2 text-left text-xs hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors first:rounded-t-lg last:rounded-b-lg',
                    sectorFilter === option.value
                      ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                      : 'text-gray-700 dark:text-gray-300'
                  )}
                >
                  {option.label}
                </button>
              </Popover.Close>
            ))}
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>

      {/* Separador */}
      <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 shrink-0"></div>

      {/* Ordenação Popover */}
      <Popover.Root>
        <Popover.Trigger asChild>
          <button
            className="relative p-[0.68rem] hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors flex items-center cursor-pointer shrink-0"
            title="Ordenar"
          >
            <FaSort className="w-3 h-3.5 text-gray-500 dark:text-gray-400" />
            {hasSortApplied && (
              <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-purple-500 rounded-full"></div>
            )}
          </button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl min-w-40 z-50"
            side="bottom"
            align="center"
            sideOffset={4}
          >
            {/* Botões Asc/Desc */}
            <div className="flex border-b border-gray-200 dark:border-gray-700">
              <button
                onClick={() => {
                  if (sortOrder !== 'asc') onToggleSortOrder();
                }}
                className={twMerge(
                  'flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs transition-colors rounded-tl-lg',
                  sortOrder === 'asc'
                    ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                )}
              >
                <FaSortAmountUp className="w-2.5 h-2.5" />
                <span>Asc</span>
              </button>
              <button
                onClick={() => {
                  if (sortOrder !== 'desc') onToggleSortOrder();
                }}
                className={twMerge(
                  'flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs transition-colors rounded-tr-lg',
                  sortOrder === 'desc'
                    ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                )}
              >
                <FaSortAmountDown className="w-2.5 h-2.5" />
                <span>Desc</span>
              </button>
            </div>

            {/* Opções de Ordenação */}
            {sortOptions.map(option => (
              <Popover.Close asChild key={option.value}>
                <button
                  onClick={() =>
                    onSortByChange(option.value as 'date' | 'time' | 'sector' | 'score' | 'name')
                  }
                  className={twMerge(
                    'w-full px-3 py-2 text-left text-xs hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors last:rounded-b-lg',
                    sortBy === option.value
                      ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                      : 'text-gray-700 dark:text-gray-300'
                  )}
                >
                  {option.label}
                </button>
              </Popover.Close>
            ))}
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>

      {/* Separador */}
      <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 shrink-0"></div>

      {/* Toggle de Detalhes */}
      <button
        onClick={onToggleDetailedHistory}
        className="p-[0.68rem] hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors flex items-center cursor-pointer shrink-0"
        title={showDetailedHistory ? 'Visualização resumida' : 'Visualização detalhada'}
      >
        {showDetailedHistory ? (
          <FaTable className="w-3 h-3 text-gray-500 dark:text-gray-400" />
        ) : (
          <FaStream className="w-3 h-3 text-gray-500 dark:text-gray-400" />
        )}
      </button>

      {/* Download PDF - apenas para usuários com permissão */}
      {userCanDownloadPDF && (
        <>
          {/* Separador */}
          <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 shrink-0"></div>

          {/* Download PDF */}
          <button
            onClick={onDownloadPDF}
            className="p-[0.68rem] hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors flex items-center cursor-pointer shrink-0"
            title={`Baixar histórico em PDF - O documento será gerado com: ${
              showDetailedHistory ? 'visualização detalhada' : 'visualização resumida'
            }, ordenação por ${sortOptions
              .find(opt => opt.value === sortBy)
              ?.label.toLowerCase()} (${sortOrder === 'asc' ? 'crescente' : 'decrescente'}), ${
              sectorFilter === 'all' ? 'todos os setores' : `setor ${getSectorLabel(sectorFilter)}`
            } e tema atual`}
          >
            <FaDownload className="w-3 h-3 text-gray-500 dark:text-gray-400" />
          </button>
        </>
      )}
    </div>
  );
};

interface IssueHistoryProps {
  historyItems: HistoryItem[];
  isHistoryExpanded: boolean;
  sectorFilter: Sector | 'all';
  sortBy: 'date' | 'time' | 'sector' | 'score' | 'name';
  sortOrder: 'asc' | 'desc';
  showDetailedHistory: boolean;
  onToggleHistory: () => void;
  onSectorFilterChange: React.Dispatch<React.SetStateAction<Sector | 'all'>>;
  onSortByChange: React.Dispatch<
    React.SetStateAction<'date' | 'time' | 'sector' | 'score' | 'name'>
  >;
  onToggleSortOrder: () => void;
  onToggleDetailedHistory: () => void;
  formatDate: (date: Date) => string;
  formatTime: (seconds: number) => string;
}

export default function IssueHistory({
  historyItems,
  isHistoryExpanded,
  sectorFilter,
  sortBy,
  sortOrder,
  showDetailedHistory,
  onToggleHistory,
  onSectorFilterChange,
  onSortByChange,
  onToggleSortOrder,
  onToggleDetailedHistory,
  formatDate,
  formatTime,
}: IssueHistoryProps) {
  // Verificar permissões do usuário
  const { user } = useContextSelector(RoomContext, context => ({
    user: context.user,
  }));
  const { cachedRoomData } = useRoomCache();

  const room = cachedRoomData?.data;
  const isOwner = room?.owner_id === user?.id;
  const userCanDownloadPDF =
    isOwner || (room?.who_can_open_cards?.includes(user?.id || '') ?? false);
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

  // Obter setores únicos que existem no histórico
  const uniqueSectors = Array.from(new Set(historyItems.map(item => item.sector)));
  const filterOptions = [
    { value: 'all', label: 'Todos' },
    ...uniqueSectors.map(sector => ({
      value: sector,
      label: getSectorLabel(sector),
    })),
  ];

  // Função para ordenar histórico
  const sortHistory = (
    items: HistoryItem[],
    sortBy: 'date' | 'time' | 'sector' | 'score' | 'name',
    order: 'asc' | 'desc'
  ) => {
    return [...items].sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'date':
          const aDate = a.finalizedAt || a.createdAt;
          const bDate = b.finalizedAt || b.createdAt;
          comparison = bDate.getTime() - aDate.getTime();
          break;
        case 'time':
          comparison = (b.totalDuration || 0) - (a.totalDuration || 0);
          break;
        case 'sector':
          comparison = a.sector.localeCompare(b.sector);
          break;
        case 'score':
          const aScore = a.finalConsensus ? parseFloat(a.finalConsensus) || 0 : 0;
          const bScore = b.finalConsensus ? parseFloat(b.finalConsensus) || 0 : 0;
          comparison = bScore - aScore;
          break;
        case 'name':
          comparison = a.topic.localeCompare(b.topic);
          break;
      }

      return order === 'desc' ? comparison : -comparison;
    });
  };

  // Filtrar histórico por setor
  const filteredItems =
    sectorFilter === 'all'
      ? historyItems
      : historyItems.filter(item => item.sector === sectorFilter);

  // Aplicar ordenação
  const filteredHistory = sortHistory(filteredItems, sortBy, sortOrder);

  // Função para gerar PDF usando o gerador extraído
  const handleDownloadPDF = () => {
    // Detectar tema atual
    const isDark = document.documentElement.classList.contains('dark');
    const theme = isDark ? 'dark' : 'light';

    generateHistoryPDF({
      historyItems,
      sectorFilter,
      sortBy,
      sortOrder,
      showDetailedHistory,
      formatDate,
      formatTime,
      getSectorLabel,
      theme,
    });
  };

  if (historyItems.length === 0) {
    return null;
  }

  return (
    <Box
      className="w-full max-w-full h-fit min-h-fit! p-3 sm:p-4 md:p-4 lg:p-5"
      allowOverflow={true}
    >
      <div className="w-full flex flex-col gap-4 min-w-0">
        <div className="dark:border-gray-700">
          <div className="flex items-center justify-between mb-3 max-[400px]:flex-col max-[400px]:gap-2">
            <button
              onClick={onToggleHistory}
              className="flex items-center gap-2 group cursor-pointer"
            >
              <h4
                className={twMerge('text-xs md:text-sm font-medium text-gray-900 dark:text-white')}
              >
                Histórico de Votações
              </h4>
              <div className="flex items-center gap-1">
                <span
                  className={twMerge(
                    'text-xs text-gray-500 dark:text-gray-400 bg-purple-100 dark:bg-gray-700 px-1.5 py-0.5 rounded-full text-[0.625rem]'
                  )}
                >
                  {sectorFilter === 'all'
                    ? historyItems.length
                    : `${filteredHistory.length}/${historyItems.length}`}
                </span>
              </div>
              {isHistoryExpanded ? (
                <FaChevronUp className="w-3 h-3 text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors" />
              ) : (
                <FaChevronDown className="w-3 h-3 text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors" />
              )}
            </button>

            {isHistoryExpanded && (
              <FilterAndSortControls
                sectorFilter={sectorFilter}
                onSectorFilterChange={onSectorFilterChange}
                filterOptions={filterOptions}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSortByChange={onSortByChange}
                onToggleSortOrder={onToggleSortOrder}
                showDetailedHistory={showDetailedHistory}
                onToggleDetailedHistory={onToggleDetailedHistory}
                onDownloadPDF={handleDownloadPDF}
                userCanDownloadPDF={userCanDownloadPDF}
                getSectorLabel={getSectorLabel}
              />
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
                  <div className="mb-2">
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

                      {/* Resultado Final da Issue - só mostra troféu se não for empate */}
                      {item.finalConsensus && item.finalConsensus !== 'Empate' && (
                        <div className="flex items-center gap-1 shrink-0">
                          <FaTrophy className="w-3 h-3 text-yellow-500" />
                          <span
                            className={twMerge(
                              'text-xs font-medium text-gray-900 dark:text-white bg-yellow-100 dark:bg-yellow-900/30 px-1.5 py-0.5 rounded text-[0.625rem] border border-yellow-200 dark:border-yellow-800'
                            )}
                          >
                            {item.finalConsensus}
                          </span>
                        </div>
                      )}

                      {/* Resultado Final da Issue - empate sem troféu */}
                      {item.finalConsensus === 'Empate' && (
                        <div className="flex items-center gap-1 shrink-0">
                          <span
                            className={twMerge(
                              'text-xs font-medium text-gray-900 dark:text-white bg-amber-100 dark:bg-amber-900/30 px-1.5 py-0.5 rounded text-[0.625rem] border border-amber-200 dark:border-amber-800'
                            )}
                          >
                            {item.finalConsensus}
                          </span>
                        </div>
                      )}

                      {/* Indicador de múltiplas votações */}
                      {item.votingRounds.length > 1 && (
                        <span className="text-[8px] bg-purple-100 dark:bg-purple-700/30 text-purple-800 dark:text-purple-200 px-1.5 py-0.5 rounded-full">
                          {item.votingRounds.length} votações
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={twMerge(
                          'text-[0.625rem] text-gray-500 dark:text-gray-400 shrink-0'
                        )}
                      >
                        {formatDate(item.finalizedAt || item.createdAt)}
                      </span>
                      {item.totalDuration && (
                        <span
                          className={twMerge(
                            'text-[0.625rem] text-gray-500 dark:text-gray-400 flex items-center gap-1 shrink-0'
                          )}
                        >
                          <FaClock className="w-2 h-2" />
                          {formatTime(item.totalDuration)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Histórico de Votações */}
                  {showDetailedHistory && item.votingRounds.length > 0 && (
                    <div className="border-t border-gray-200 dark:border-gray-600 pt-2 space-y-3">
                      {item.votingRounds.map((round, roundIndex) => (
                        <div key={round.id} className="space-y-2">
                          {/* Header da votação */}
                          {item.votingRounds.length > 1 && (
                            <div className="flex items-center gap-2">
                              <span className="text-[0.6rem] font-medium text-gray-700 dark:text-gray-300">
                                Votação {roundIndex + 1}
                              </span>
                              {round.consensus && (
                                <span
                                  className={twMerge(
                                    'text-[0.55rem] px-1 py-0.5 rounded',
                                    round.consensus === 'Empate'
                                      ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                                      : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                  )}
                                >
                                  {round.consensus}
                                </span>
                              )}
                              <span className="text-[0.55rem] text-gray-500 dark:text-gray-400">
                                {formatTime(round.duration || 0)}
                              </span>
                            </div>
                          )}

                          {/* Votos da rodada */}
                          <div className="grid grid-cols-2 lg:grid-cols-3 gap-1">
                            {round.votes.map((vote, voteIndex) => (
                              <div
                                key={voteIndex}
                                className={twMerge(
                                  'flex items-center justify-between p-1.5 bg-gray-100 dark:bg-gray-600 rounded text-[0.625rem]'
                                )}
                              >
                                <span className="text-gray-700 dark:text-gray-300 truncate flex-1 mr-1">
                                  {vote.userName}
                                </span>
                                <span
                                  className={`font-medium px-1 py-0.5 rounded ${
                                    round.winnerCards?.includes(vote.card)
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
                      ))}
                    </div>
                  )}

                  {/* Resumo das Votações quando não está no modo detalhado */}
                  {!showDetailedHistory && item.votingRounds.length > 0 && (
                    <div className="border-t border-gray-200 dark:border-gray-600 pt-2">
                      <div className="flex items-center justify-between">
                        <span
                          className={twMerge('text-[0.625rem] text-gray-500 dark:text-gray-400')}
                        >
                          {item.votingRounds.length} votação
                          {item.votingRounds.length !== 1 ? 'ões' : ''} •{' '}
                          {item.votingRounds.reduce(
                            (total, round) => total + round.votes.length,
                            0
                          )}{' '}
                          votos
                        </span>
                        {item.votingRounds.length > 1 && (
                          <span className="text-[10px] text-purple-600 dark:text-purple-400 truncate">
                            Múltiplas rodadas
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
      </div>
    </Box>
  );
}
