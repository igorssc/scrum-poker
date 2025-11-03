import { HistoryItem, Sector } from '@/types/voting';
import jsPDF from 'jspdf';

interface PDFGeneratorOptions {
  historyItems: HistoryItem[];
  sectorFilter: Sector | 'all';
  sortBy: 'date' | 'time' | 'sector' | 'score' | 'name';
  sortOrder: 'asc' | 'desc';
  showDetailedHistory: boolean;
  formatDate: (date: Date) => string;
  formatTime: (seconds: number) => string;
  getSectorLabel: (sector: Sector) => string;
  theme?: 'light' | 'dark';
}

// Função para limpar texto removendo emojis, caracteres especiais e acentos
const cleanText = (text: string): string => {
  return (
    text
      // Remover emojis (vários ranges Unicode)
      .replace(/[\u{1F600}-\u{1F64F}]/gu, '') // Emoticons
      .replace(/[\u{1F300}-\u{1F5FF}]/gu, '') // Símbolos diversos
      .replace(/[\u{1F680}-\u{1F6FF}]/gu, '') // Transporte e símbolos
      .replace(/[\u{1F700}-\u{1F77F}]/gu, '') // Símbolos alquímicos
      .replace(/[\u{1F780}-\u{1F7FF}]/gu, '') // Símbolos geométricos estendidos
      .replace(/[\u{1F800}-\u{1F8FF}]/gu, '') // Setas suplementares
      .replace(/[\u{2600}-\u{26FF}]/gu, '') // Símbolos diversos
      .replace(/[\u{2700}-\u{27BF}]/gu, '') // Dingbats
      .replace(/[\u{1F900}-\u{1F9FF}]/gu, '') // Símbolos suplementares
      .replace(/[\u{1FA00}-\u{1FA6F}]/gu, '') // Símbolos estendidos A
      .replace(/[\u{1FA70}-\u{1FAFF}]/gu, '') // Símbolos estendidos B
      // Substituir acentos por caracteres sem acento
      .replace(/[àáâãäå]/g, 'a')
      .replace(/[èéêë]/g, 'e')
      .replace(/[ìíîï]/g, 'i')
      .replace(/[òóôõö]/g, 'o')
      .replace(/[ùúûü]/g, 'u')
      .replace(/[ñ]/g, 'n')
      .replace(/[ç]/g, 'c')
      .replace(/[ÀÁÂÃÄÅ]/g, 'A')
      .replace(/[ÈÉÊË]/g, 'E')
      .replace(/[ÌÍÎÏ]/g, 'I')
      .replace(/[ÒÓÔÕÖ]/g, 'O')
      .replace(/[ÙÚÛÜ]/g, 'U')
      .replace(/[Ñ]/g, 'N')
      .replace(/[Ç]/g, 'C')
      // Remover outros caracteres especiais, mantendo apenas letras, números, espaços e pontuação básica
      .replace(/[^\w\s\-\.\,\:\;\!\?\(\)]/g, '')
      // Limpar espaços múltiplos
      .replace(/\s+/g, ' ')
      .trim()
  );
};

export const generateHistoryPDF = ({
  historyItems,
  sectorFilter,
  sortBy,
  sortOrder,
  showDetailedHistory,
  formatDate,
  formatTime,
  getSectorLabel,
  theme = 'light',
}: PDFGeneratorOptions) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  let yPos = 20;

  // Espaçamento padrão entre todas as caixas
  const SECTION_SPACING = 8;

  // Configurações de tema
  const themeConfig = {
    light: {
      background: [255, 255, 255], // Branco
      cardBackground: [249, 250, 251], // Cinza muito claro
      cardBackgroundAlt: [255, 255, 255], // Branco
      analysisBackground: [220, 220, 220], // Cinza claro
      textPrimary: [0, 0, 0], // Preto
      textSecondary: [60, 60, 60], // Cinza escuro
      textMuted: [50, 50, 50], // Cinza médio
      border: [200, 200, 200], // Cinza claro
    },
    dark: {
      background: [39, 39, 42], // Zinc-800
      cardBackground: [63, 63, 70], // Zinc-700
      // cardBackgroundAlt: [71, 85, 105], // Slate-600
      cardBackgroundAlt: [63, 63, 70], // Zinc-700
      analysisBackground: [82, 82, 91], // Zinc-600
      textPrimary: [244, 244, 245], // Zinc-100
      textSecondary: [228, 228, 231], // Zinc-200
      textMuted: [228, 228, 231], // Zinc-200
      border: [39, 39, 42], // Zinc-800
    },
  };

  const colors = themeConfig[theme];

  // Aplicar fundo da página se for tema escuro
  if (theme === 'dark') {
    doc.setFillColor(colors.background[0], colors.background[1], colors.background[2]);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
  }

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
      // Aplicar fundo em novas páginas se for tema escuro
      if (theme === 'dark') {
        doc.setFillColor(colors.background[0], colors.background[1], colors.background[2]);
        doc.rect(0, 0, pageWidth, pageHeight, 'F');
      }
      yPos = 20;
    }
  };

  // Função para desenhar retângulo com bordas (simulando card)
  const drawCard = (x: number, y: number, width: number, height: number, fillColor?: number[]) => {
    doc.setDrawColor(colors.border[0], colors.border[1], colors.border[2]);
    doc.setLineWidth(0.5);
    if (fillColor) {
      doc.setFillColor(fillColor[0], fillColor[1], fillColor[2]);
    } else {
      doc.setFillColor(
        colors.cardBackground[0],
        colors.cardBackground[1],
        colors.cardBackground[2]
      );
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

  // Cabeçalho
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(colors.textPrimary[0], colors.textPrimary[1], colors.textPrimary[2]);
  doc.text('Historico de Votacoes - Scrum Poker', pageWidth / 2, yPos, { align: 'center' });
  yPos += 15;

  // Data de geração
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(colors.textMuted[0], colors.textMuted[1], colors.textMuted[2]);
  doc.text(`Gerado em: ${formatDate(new Date())}`, pageWidth / 2, yPos, { align: 'center' });
  yPos += 20;

  // Card de filtros aplicados - altura padronizada
  const filterCardHeight = 48;
  checkPageBreak(filterCardHeight);
  drawCard(15, yPos, pageWidth - 30, filterCardHeight, colors.analysisBackground);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(colors.textPrimary[0], colors.textPrimary[1], colors.textPrimary[2]);
  doc.text('Filtros e Ordenacao Aplicados', 20, yPos + 10);

  yPos += 20;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(colors.textSecondary[0], colors.textSecondary[1], colors.textSecondary[2]);
  doc.text(
    `Setor: ${sectorFilter === 'all' ? 'Todos os setores' : getSectorLabel(sectorFilter as Sector)}`,
    25,
    yPos
  );
  yPos += 6;
  doc.text(
    `Ordenacao: ${sortOptions.find((opt: any) => opt.value === sortBy)?.label} (${
      sortOrder === 'asc' ? 'Crescente' : 'Decrescente'
    })`,
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
  yPos += 6; // Espaço para sair do card de filtros

  yPos += SECTION_SPACING; // Espaçamento padrão entre seções

  // Análise dinâmica das votações
  const generateVotingAnalysis = () => {
    // Coleta de dados dos votos
    const allVotes: { userName: string; card: string; wasWinner: boolean; isEmpate: boolean }[] =
      [];
    const userStats: Record<
      string,
      { total: number; wins: number; empates: number; consensus: number }
    > = {};

    filteredHistory.forEach(item => {
      item.votingRounds.forEach(round => {
        const isEmpate = round.consensus === 'Empate';
        round.votes.forEach(vote => {
          const wasWinner = round.winnerCards?.includes(vote.card) || false;
          allVotes.push({
            userName: vote.userName,
            card: vote.card,
            wasWinner,
            isEmpate,
          });

          if (!userStats[vote.userName]) {
            userStats[vote.userName] = { total: 0, wins: 0, empates: 0, consensus: 0 };
          }

          userStats[vote.userName].total++;
          if (wasWinner && !isEmpate) {
            userStats[vote.userName].wins++;
          } else if (wasWinner && isEmpate) {
            userStats[vote.userName].empates++;
          }
          if (wasWinner) {
            userStats[vote.userName].consensus++;
          }
        });
      });
    });

    // Análise dos dados
    const users = Object.keys(userStats);
    const userPerformances = users
      .map(userName => ({
        name: userName,
        ...userStats[userName],
        winRate:
          userStats[userName].total > 0
            ? (userStats[userName].wins / userStats[userName].total) * 100
            : 0,
        consensusRate:
          userStats[userName].total > 0
            ? (userStats[userName].consensus / userStats[userName].total) * 100
            : 0,
      }))
      .sort((a, b) => b.consensusRate - a.consensusRate);

    return { userPerformances, totalVotes: allVotes.length, totalUsers: users.length };
  };

  if (filteredHistory.length > 0) {
    const analysis = generateVotingAnalysis();

    // Card de análise - altura padronizada
    const analysisHeight = showDetailedHistory
      ? 25 + analysis.userPerformances.length * 6 + 15 // Modo detalhado: altura precisa
      : 48; // Modo resumido: altura padrão igual ao filtro

    checkPageBreak(analysisHeight);
    drawCard(15, yPos, pageWidth - 30, analysisHeight, colors.analysisBackground);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(colors.textPrimary[0], colors.textPrimary[1], colors.textPrimary[2]);
    doc.text('Analise de Performance da Equipe', 20, yPos + 10);

    yPos += 20;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(colors.textSecondary[0], colors.textSecondary[1], colors.textSecondary[2]);

    if (analysis.userPerformances.length > 0) {
      const avgConsensusRate =
        analysis.userPerformances.reduce((sum, user) => sum + user.consensusRate, 0) /
        analysis.userPerformances.length;

      if (showDetailedHistory) {
        // Modo detalhado: análise individual de cada membro
        doc.text(
          `Analise individual dos ${analysis.userPerformances.length} membros (${analysis.totalVotes} votos total):`,
          25,
          yPos
        );
        yPos += 6;

        analysis.userPerformances.forEach((user, index) => {
          const performance = user.consensusRate;
          let performanceLabel = '';

          if (performance >= avgConsensusRate + 10) {
            performanceLabel = 'Excelente alinhamento';
          } else if (performance >= avgConsensusRate) {
            performanceLabel = 'Bom alinhamento';
          } else if (performance >= avgConsensusRate - 10) {
            performanceLabel = 'Alinhamento regular';
          } else {
            performanceLabel = 'Precisa melhorar';
          }

          const userText = `${index + 1}. ${cleanText(user.name)}: ${user.consensus}/${user.total} consensos (${performance.toFixed(1)}%) - ${performanceLabel}`;
          doc.text(userText, 30, yPos);
          yPos += 6;
        });

        yPos += 4; // Espaçamento menor antes da média
        doc.text(`Media da equipe: ${avgConsensusRate.toFixed(1)}% de taxa de consenso`, 25, yPos);
      } else {
        // Modo resumido: visão geral
        const bestPerformer = analysis.userPerformances[0];
        const worstPerformer = analysis.userPerformances[analysis.userPerformances.length - 1];

        doc.text(
          `Melhor alinhamento: ${cleanText(bestPerformer.name)} (${bestPerformer.consensusRate.toFixed(1)}% de consenso)`,
          25,
          yPos
        );
        yPos += 6;

        if (analysis.userPerformances.length > 1) {
          doc.text(
            `Menor alinhamento: ${cleanText(worstPerformer.name)} (${worstPerformer.consensusRate.toFixed(1)}% de consenso)`,
            25,
            yPos
          );
          yPos += 6;
        }

        doc.text(
          `Media da equipe: ${avgConsensusRate.toFixed(1)}% de consenso em ${analysis.totalVotes} votos`,
          25,
          yPos
        );
        yPos += 6;

        // Classificação dos usuários
        const aboveAvg = analysis.userPerformances.filter(u => u.consensusRate > avgConsensusRate);

        if (aboveAvg.length > 0) {
          doc.text(`Acima da media: ${aboveAvg.map(u => cleanText(u.name)).join(', ')}`, 25, yPos);
        }
      }
    } else {
      doc.text('Nao ha dados suficientes para analise', 25, yPos);
    }

    yPos += 6; // Espaço para sair do card de análise
    yPos += SECTION_SPACING; // Espaçamento padrão após análise
  } else if (filteredHistory.length > 0) {
    // Se não há análise mas há cards, adicionar espaçamento
    yPos += SECTION_SPACING;
  }

  // Renderizar cada issue como um card
  filteredHistory.forEach((item, index) => {
    const cardHeight = showDetailedHistory
      ? 45 + // Base mínima padronizada
        item.votingRounds.length * 25 +
        item.votingRounds.reduce((sum, round) => sum + Math.ceil(round.votes.length / 3) * 8, 0)
      : 55; // Altura padronizada para modo resumido

    checkPageBreak(cardHeight);

    // Card principal da issue com cores alternadas do tema
    const cardColor = index % 2 === 0 ? colors.cardBackground : colors.cardBackgroundAlt;
    drawCard(15, yPos, pageWidth - 30, cardHeight, cardColor);

    // Header da issue
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(colors.textPrimary[0], colors.textPrimary[1], colors.textPrimary[2]);

    // Título sem truncamento - texto limpo
    doc.text(cleanText(item.topic), 20, yPos + 10);

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
      doc.setTextColor(colors.textMuted[0], colors.textMuted[1], colors.textMuted[2]);
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
      doc.setTextColor(colors.textMuted[0], colors.textMuted[1], colors.textMuted[2]);
      doc.text(`Data: ${formatDate(item.finalizedAt || item.createdAt)}`, 20, yPos);

      if (item.totalDuration) {
        doc.text(`Duracao: ${formatTime(item.totalDuration)}`, 80, yPos);
      }

      yPos += 8;
    }

    // Detalhes das votações (se modo detalhado)
    if (showDetailedHistory && item.votingRounds.length > 0) {
      // Linha separadora
      doc.setDrawColor(colors.border[0], colors.border[1], colors.border[2]);
      doc.setLineWidth(0.3);
      doc.line(20, yPos, pageWidth - 20, yPos);
      yPos += 6;

      item.votingRounds.forEach((round, roundIndex) => {
        // Header da votação
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(colors.textSecondary[0], colors.textSecondary[1], colors.textSecondary[2]);
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

          yPos += 7;
        }

        // Votos da rodada em lista simples - respeitando limites da caixa
        round.votes.forEach((vote, voteIndex) => {
          doc.setFontSize(8);
          doc.setFont('helvetica', 'normal');

          // Nome do usuário
          doc.setTextColor(
            colors.textSecondary[0],
            colors.textSecondary[1],
            colors.textSecondary[2]
          );
          let userName = cleanText(vote.userName);
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

        yPos += 5; // Espaçamento entre rodadas
      });
    } else if (!showDetailedHistory && item.votingRounds.length > 0) {
      // Resumo das votações - respeitando limites da caixa
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(colors.textMuted[0], colors.textMuted[1], colors.textMuted[2]);
      const totalVotes = item.votingRounds.reduce((total, round) => total + round.votes.length, 0);
      // Alinhar com os demais elementos do card (posição x: 20)
      doc.text(`${item.votingRounds.length} votacao(s) - ${totalVotes} votos total`, 20, yPos);
      yPos += 8;
    }

    yPos += SECTION_SPACING; // Espaçamento padrão entre cards
  });

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(colors.textMuted[0], colors.textMuted[1], colors.textMuted[2]);
  doc.text('Scrum Poker - Historico de Votacoes', pageWidth / 2, pageHeight - 10, {
    align: 'center',
  });

  // Salvar PDF
  const fileName = `historico-votacoes-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};
