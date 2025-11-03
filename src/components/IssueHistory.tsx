'use client';

import { HistoryItem, Sector } from '@/types/voting';
import * as Popover from '@radix-ui/react-popover';
import jsPDF from 'jspdf';
import React from 'react';
import {
  FaChevronDown,
  FaChevronUp,
  FaClock,
  FaDownload,
  FaFilter,
  FaHistory,
  FaSort,
  FaSortAmountDown,
  FaSortAmountUp,
  FaStream,
  FaTable,
  FaTag,
  FaTrophy,
} from 'react-icons/fa';
import { twMerge } from 'tailwind-merge';
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
    <div className="flex items-center gap-2 text-[0.625rem]">
      {/* Filtro Popover */}
      <Popover.Root>
        <Popover.Trigger asChild>
          <button
            className="relative p-[0.68rem] hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors flex items-center cursor-pointer shrink-0"
            title="Filtrar por setor"
          >
            <FaFilter className="w-3 h-2 text-gray-500 dark:text-gray-400" />
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
            <FaSort className="w-3 h-3 text-gray-500 dark:text-gray-400" />
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

      {/* Separador */}
      <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 shrink-0"></div>

      {/* Download PDF */}
      <button
        onClick={onDownloadPDF}
        className="p-[0.68rem] hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors flex items-center cursor-pointer shrink-0"
        title="Baixar histórico em PDF"
      >
        <FaDownload className="w-3 h-3 text-gray-500 dark:text-gray-400" />
      </button>
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

  // Função para gerar PDF com layout limpo e organizado
  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    let yPos = 20;

    const sortOptions = [
      { value: 'date', label: 'Data' },
      { value: 'name', label: 'Nome' },
      { value: 'time', label: 'Tempo' },
      { value: 'sector', label: 'Setor' },
      { value: 'score', label: 'Pontuação' },
    ];

    // Função para adicionar nova página se necessário
    const checkPageBreak = (neededHeight: number) => {
      if (yPos + neededHeight > pageHeight - 20) {
        doc.addPage();
        yPos = 20;
      }
    };

    // Função para desenhar retângulo com bordas (simulando card)
    const drawCard = (
      x: number,
      y: number,
      width: number,
      height: number,
      fillColor?: number[]
    ) => {
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      if (fillColor) {
        doc.setFillColor(fillColor[0], fillColor[1], fillColor[2]);
      } else {
        doc.setFillColor(249, 250, 251);
      }
      doc.rect(x, y, width, height, 'FD');
    };

    // Função para desenhar tag/badge
    const drawTag = (text: string, x: number, y: number, color: number[]) => {
      const textWidth = doc.getTextWidth(text);
      const tagWidth = textWidth + 8;
      const tagHeight = 6;

      doc.setFillColor(color[0], color[1], color[2]);
      doc.rect(x, y - 1, tagWidth, tagHeight, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(7);
      doc.text(text, x + 4, y + 3);
      doc.setTextColor(0, 0, 0);

      return tagWidth;
    };

    // Cabeçalho
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Historico de Votacoes - Scrum Poker', pageWidth / 2, yPos, { align: 'center' });
    yPos += 15;

    // Data de geração
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(`Gerado em: ${formatDate(new Date())}`, pageWidth / 2, yPos, { align: 'center' });
    yPos += 20;

    // Card de filtros aplicados - altura ajustada
    const filterCardHeight = 45;
    checkPageBreak(filterCardHeight);
    drawCard(15, yPos - 5, pageWidth - 30, filterCardHeight);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Filtros e Ordenacao Aplicados', 20, yPos + 5);

    yPos += 15;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    doc.text(
      `Setor: ${sectorFilter === 'all' ? 'Todos os setores' : getSectorLabel(sectorFilter as Sector)}`,
      25,
      yPos
    );
    yPos += 6;
    doc.text(
      `Ordenacao: ${sortOptions.find((opt: any) => opt.value === sortBy)?.label} (${sortOrder === 'asc' ? 'Crescente' : 'Decrescente'})`,
      25,
      yPos
    );
    yPos += 6;
    doc.text(
      `Visualizacao: ${showDetailedHistory ? 'Detalhada com todas as votacoes' : 'Resumida'}`,
      25,
      yPos
    );
    yPos += 6;
    doc.text(`Total de issues: ${filteredHistory.length}`, 25, yPos);

    yPos += 15; // Espaço reduzido entre card de filtros e issues

    // Renderizar cada issue como um card
    filteredHistory.forEach((item, index) => {
      const cardHeight = showDetailedHistory
        ? 40 +
          item.votingRounds.length * 25 +
          item.votingRounds.reduce((sum, round) => sum + Math.ceil(round.votes.length / 3) * 8, 0)
        : 50; // Altura otimizada para modo resumido

      checkPageBreak(cardHeight);

      // Card principal da issue
      const cardColor = index % 2 === 0 ? [249, 250, 251] : [255, 255, 255]; // Alternar cores
      drawCard(15, yPos, pageWidth - 30, cardHeight, cardColor);

      // Header da issue
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);

      // Título sem truncamento
      doc.text(item.topic, 20, yPos + 10);

      // Mover para linha das tags (abaixo do título, lado esquerdo) - espaçamento maior
      yPos += 20;

      // Tags do lado esquerdo
      let tagX = 20; // Começar do lado esquerdo
      const sectorColors: Record<Sector, number[]> = {
        backend: [59, 130, 246], // blue-500
        'front-web': [34, 197, 94], // green-500
        'front-app': [168, 85, 247], // purple-500
      };

      // Tag do setor
      const tagWidth = drawTag(getSectorLabel(item.sector), tagX, yPos, sectorColors[item.sector]);
      tagX += tagWidth + 5;

      // Resultado final
      if (item.finalConsensus) {
        if (item.finalConsensus !== 'Empate') {
          const consensusText = `Consenso: ${item.finalConsensus}`;
          const resultWidth = drawTag(consensusText, tagX, yPos, [34, 197, 94]); // green-500
          tagX += resultWidth + 5;
        } else {
          const empateWidth = drawTag('Empate', tagX, yPos, [245, 158, 11]); // amber-500
          tagX += empateWidth + 5;
        }
      }

      // Indicador de múltiplas votações
      if (item.votingRounds.length > 1) {
        const votacoesText = `${item.votingRounds.length} votacoes`;
        drawTag(votacoesText, tagX, yPos, [99, 102, 241]); // purple-500
      }

      // Informações da issue (data e duração) - espaçamento adequado para o modo
      if (showDetailedHistory) {
        yPos += 15;
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 100, 100);
        doc.text(`Data: ${formatDate(item.finalizedAt || item.createdAt)}`, 20, yPos);

        if (item.totalDuration) {
          doc.text(`Duracao: ${formatTime(item.totalDuration)}`, 80, yPos);
        }

        yPos += 10;
      } else {
        // No modo resumido, posicionar mais abaixo para ficar próximo do fim da caixa
        yPos += 15;
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 100, 100);
        doc.text(`Data: ${formatDate(item.finalizedAt || item.createdAt)}`, 20, yPos);

        if (item.totalDuration) {
          doc.text(`Duracao: ${formatTime(item.totalDuration)}`, 80, yPos);
        }

        yPos += 8;
      }

      // Detalhes das votações (se modo detalhado)
      if (showDetailedHistory && item.votingRounds.length > 0) {
        // Linha separadora
        doc.setDrawColor(220, 220, 220);
        doc.setLineWidth(0.3);
        doc.line(20, yPos, pageWidth - 20, yPos);
        yPos += 8;

        item.votingRounds.forEach((round, roundIndex) => {
          // Header da votação
          doc.setFontSize(9);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(50, 50, 50);

          if (item.votingRounds.length > 1) {
            doc.text(`Votacao ${roundIndex + 1}`, 25, yPos);

            // Status da votação
            const statusX = 70;
            if (round.consensus) {
              doc.text(`Resultado: ${round.consensus}`, statusX, yPos);
            }

            // Duração da votação
            if (round.duration) {
              doc.text(`Tempo: ${formatTime(round.duration)}`, statusX + 50, yPos);
            }

            yPos += 8;
          }

          // Votos da rodada em lista simples - respeitando limites da caixa
          round.votes.forEach((vote, voteIndex) => {
            doc.setFontSize(8);
            doc.setFont('helvetica', 'normal');

            // Nome do usuário
            doc.setTextColor(80, 80, 80);
            let userName = vote.userName;
            // Limitar nome para caber na caixa (margem de 30 a 165)
            const maxNameWidth = 50;
            if (doc.getTextWidth(userName) > maxNameWidth) {
              userName = userName.split(' ')[0]; // Apenas primeiro nome
              if (doc.getTextWidth(userName) > maxNameWidth) {
                userName = userName.substring(0, 8) + '...'; // Truncar se ainda estiver muito longo
              }
            }
            doc.text(`${userName}:`, 30, yPos);

            // Carta votada - posição limitada para não sair da caixa
            const isWinner = round.winnerCards?.includes(vote.card);
            const isEmpate = round.consensus === 'Empate';

            if (isWinner && !isEmpate) {
              doc.setTextColor(0, 150, 0); // Verde para vencedor real
              doc.setFont('helvetica', 'bold');
              doc.text(`${vote.card} (vencedor)`, 85, yPos);
            } else if (isWinner && isEmpate) {
              doc.setTextColor(245, 158, 11); // Cor âmbar para empate
              doc.setFont('helvetica', 'bold');
              doc.text(vote.card, 85, yPos);
            } else {
              doc.setTextColor(120, 120, 120);
              doc.setFont('helvetica', 'normal');
              doc.text(vote.card, 85, yPos);
            }

            yPos += 6;
          });

          yPos += 3; // Espaço reduzido após cada rodada
        });
      } else if (!showDetailedHistory && item.votingRounds.length > 0) {
        // Resumo das votações - respeitando limites da caixa
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(120, 120, 120);
        const totalVotes = item.votingRounds.reduce(
          (total, round) => total + round.votes.length,
          0
        );
        // Alinhar com os demais elementos do card (posição x: 20)
        doc.text(`${item.votingRounds.length} votacao(s) - ${totalVotes} votos total`, 20, yPos);
        yPos += 8;
      }

      yPos += 5; // Espaço reduzido entre cards
    });

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('Scrum Poker - Historico de Votacoes', pageWidth / 2, pageHeight - 10, {
      align: 'center',
    });

    // Salvar PDF
    const fileName = `historico-votacoes-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
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
                        <span className="text-[8px] bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-1.5 py-0.5 rounded-full">
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
                              {round.duration && (
                                <span className="text-[0.55rem] text-gray-500 dark:text-gray-400">
                                  {formatTime(round.duration)}
                                </span>
                              )}
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
                          <span className="text-[10px] text-blue-600 dark:text-blue-400 truncate">
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
