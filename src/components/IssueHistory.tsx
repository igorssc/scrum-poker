'use client';

import React from 'react';
import {
  FaChevronDown,
  FaChevronUp,
  FaClock,
  FaHistory,
  FaSortAmountDown,
  FaSortAmountUp,
  FaStream,
  FaTable,
  FaTag,
  FaTrophy,
} from 'react-icons/fa';
import { twMerge } from 'tailwind-merge';
import { Box } from './Box';
import { Select } from './Select';

type Sector = 'backend' | 'front-web' | 'front-app';

interface HistoryItem {
  id: string;
  topic: string;
  sector: Sector;
  finalizedAt: Date;
  duration?: number;
  consensus?: string;
  votes?: Array<{
    userName: string;
    card: string;
  }>;
  winnerCards?: string[];
}

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
          comparison = new Date(b.finalizedAt).getTime() - new Date(a.finalizedAt).getTime();
          break;
        case 'time':
          comparison = (b.duration || 0) - (a.duration || 0);
          break;
        case 'sector':
          comparison = a.sector.localeCompare(b.sector);
          break;
        case 'score':
          const aScore = a.consensus ? parseFloat(a.consensus) || 0 : 0;
          const bScore = b.consensus ? parseFloat(b.consensus) || 0 : 0;
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

  if (historyItems.length === 0) {
    return null;
  }

  return (
    <Box className="w-full max-w-full h-fit min-h-fit! p-3 sm:p-4 md:p-4 lg:p-5">
      <div className="w-full flex flex-col gap-4 min-w-0">
        <div className="dark:border-gray-700">
          <div className="flex items-center justify-between mb-3 max-sm:flex-col max-sm:gap-2">
            <button
              onClick={onToggleHistory}
              className="flex items-center gap-2 group cursor-pointer"
            >
              <FaHistory className="w-3 h-3 text-gray-600 dark:text-gray-400" />
              <h4
                className={twMerge('text-xs md:text-sm font-medium text-gray-900 dark:text-white')}
              >
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
                <div className="flex items-center gap-1.5 flex-1 min-w-0 overflow-x-auto">
                  <div className="flex items-center gap-1 shrink-0">
                    <Select
                      value={sectorFilter}
                      onChange={value => onSectorFilterChange(value as Sector | 'all')}
                      placeholder="Filtrar"
                      options={filterOptions}
                      size="sm"
                      variant="discrete"
                    />
                  </div>

                  <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 shrink-0"></div>

                  <div className="flex items-center gap-1 shrink-0">
                    <Select
                      value={sortBy}
                      onChange={value =>
                        onSortByChange(value as 'date' | 'time' | 'sector' | 'score' | 'name')
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
                      onClick={onToggleSortOrder}
                      className="p-[0.68rem] hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors flex items-center cursor-pointer shrink-0"
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
                <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 shrink-0"></div>
                <button
                  onClick={onToggleDetailedHistory}
                  className="p-[0.68rem] hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors flex items-center cursor-pointer shrink-0"
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
                      <div className="grid grid-cols-2 lg:grid-cols-3 gap-1">
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
      </div>
    </Box>
  );
}
