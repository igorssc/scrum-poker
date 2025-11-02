'use client';

import { useState } from 'react';
import { FaHistory, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { Box } from './Box';

interface HistoryItem {
  id: string;
  topic: string;
  finalizedAt: Date;
  // Futuramente: votes, average, etc.
}

interface VotingHistoryProps {
  items?: HistoryItem[];
}

export function VotingHistory({ items = [] }: VotingHistoryProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const historyItems = items || [];

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (historyItems.length === 0) {
    return (
      <Box className="w-full">
        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
          <FaHistory className="w-4 h-4" />
          <p className="text-sm">Nenhum tema finalizado ainda</p>
        </div>
      </Box>
    );
  }

  return (
    <Box className="w-full">
      <div className="flex flex-col gap-3">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between w-full group"
        >
          <div className="flex items-center gap-2">
            <FaHistory className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
              Histórico de Votações
            </h3>
            <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
              {historyItems.length}
            </span>
          </div>
          
          {isExpanded ? (
            <FaChevronUp className="w-3 h-3 text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors" />
          ) : (
            <FaChevronDown className="w-3 h-3 text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors" />
          )}
        </button>

        {isExpanded && (
          <div className="space-y-2 border-t border-gray-200 dark:border-gray-700 pt-3">
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
    </Box>
  );
}