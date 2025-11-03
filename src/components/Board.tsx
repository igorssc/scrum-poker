import { RoomContext } from '@/context/RoomContext';
import { useRoomActions } from '@/hooks/useRoomActions';
import { useServerTimer } from '@/hooks/useServerTimer';
import { useWebSocketEventHandlers } from '@/hooks/useWebSocketEventHandlers';
import { MemberProps } from '@/protocols/Member';
import { RoomProps } from '@/protocols/Room';
import { HistoryItem, Sector, Vote, VotingRound } from '@/types/voting';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useContextSelector } from 'use-context-selector';
import { useRoomCache } from '../hooks/useRoomCache';
import { useWebsocket } from '../hooks/useWebsocket';
import { Box } from './Box';
import { Button } from './Button';
import { Cards } from './Cards';
import { Flex } from './Flex';
import { IssueManager } from './IssueManager';
import { NavBar } from './NavBar';
import { UsersList } from './UsersList';

export const Board = () => {
  // Estados para a issue atual
  const [currentIssue, setCurrentIssue] = useState<string>('');
  const [currentSector, setCurrentSector] = useState<Sector>('backend');

  // Mock data inicial para demonstração
  const [votingHistory, setVotingHistory] = useState<HistoryItem[]>([
    {
      id: '1',
      topic: 'Implementar sistema de autenticação OAuth',
      sector: 'backend',
      createdAt: new Date(Date.now() - 1000 * 60 * 45), // 45 min atrás
      finalizedAt: new Date(Date.now() - 1000 * 60 * 30), // 30 min atrás
      totalDuration: 900, // 15 minutos total
      finalConsensus: '8',
      votingRounds: [
        {
          id: '1-1',
          votedAt: new Date(Date.now() - 1000 * 60 * 40),
          duration: 420, // 7 minutos
          consensus: 'Empate',
          winnerCards: ['5', '8'],
          votes: [
            { userName: 'João Silva', card: '5' },
            { userName: 'Maria Santos', card: '8' },
            { userName: 'Pedro Costa', card: '5' },
            { userName: 'Ana Lima', card: '8' },
          ],
        },
        {
          id: '1-2',
          votedAt: new Date(Date.now() - 1000 * 60 * 30),
          duration: 480, // 8 minutos
          consensus: '8',
          winnerCards: ['8'],
          votes: [
            { userName: 'João Silva', card: '8' },
            { userName: 'Maria Santos', card: '8' },
            { userName: 'Pedro Costa', card: '8' },
            { userName: 'Ana Lima', card: '5' },
          ],
        },
      ],
    },
    {
      id: '2',
      topic: 'Refatorar componentes de UI para melhor performance',
      sector: 'front-web',
      createdAt: new Date(Date.now() - 1000 * 60 * 60), // 1 hora atrás
      finalizedAt: new Date(Date.now() - 1000 * 60 * 55), // 55 min atrás
      totalDuration: 300, // 5 minutos total
      finalConsensus: '5',
      votingRounds: [
        {
          id: '2-1',
          votedAt: new Date(Date.now() - 1000 * 60 * 55),
          duration: 300, // 5 minutos
          consensus: '5',
          winnerCards: ['5'],
          votes: [
            { userName: 'João Silva', card: '5' },
            { userName: 'Maria Santos', card: '5' },
            { userName: 'Pedro Costa', card: '5' },
            { userName: 'Ana Lima', card: '8' },
            { userName: 'Carlos Rocha', card: '3' },
          ],
        },
      ],
    },
    {
      id: '3',
      topic: 'Implementar funcionalidade de chat em tempo real',
      sector: 'front-app',
      createdAt: new Date(Date.now() - 1000 * 60 * 120), // 2 horas atrás
      finalizedAt: new Date(Date.now() - 1000 * 60 * 100), // 1h40min atrás
      totalDuration: 1200, // 20 minutos total
      finalConsensus: 'Empate',
      votingRounds: [
        {
          id: '3-1',
          votedAt: new Date(Date.now() - 1000 * 60 * 115),
          duration: 300, // 5 minutos
          consensus: 'Empate',
          winnerCards: ['8', '13'],
          votes: [
            { userName: 'João Silva 💜', card: '8' },
            { userName: 'Maria Santos 💜', card: '13' },
            { userName: 'Pedro Costa 💜', card: '8' },
            { userName: 'Ana Lima 💜', card: '13' },
          ],
        },
        {
          id: '3-2',
          votedAt: new Date(Date.now() - 1000 * 60 * 110),
          duration: 420, // 7 minutos
          consensus: 'Empate',
          winnerCards: ['5', '8'],
          votes: [
            { userName: 'João Silva', card: '5' },
            { userName: 'Maria Santos', card: '8' },
            { userName: 'Pedro Costa', card: '5' },
            { userName: 'Ana Lima', card: '8' },
          ],
        },
        {
          id: '3-3',
          votedAt: new Date(Date.now() - 1000 * 60 * 100),
          duration: 480, // 8 minutos
          consensus: 'Empate',
          winnerCards: ['8', '13'],
          votes: [
            { userName: 'João Silva', card: '8' },
            { userName: 'Maria Santos', card: '13' },
            { userName: 'Pedro Costa', card: '8' },
            { userName: 'Ana Lima', card: '13' },
            { userName: 'Carlos Rocha', card: '5' },
          ],
        },
      ],
    },
  ]);

  const { room, user, clear } = useContextSelector(RoomContext, context => ({
    room: context.room,
    user: context.user,
    clear: context.clear,
  }));

  const { cachedRoomData } = useRoomCache();

  const { revealCards, clearVotes, isRevealingCards, isClearingVotes } = useRoomActions();
  const {
    formattedTime,
    isRunning,
    toggle: toggleTimer,
    reset: resetTimer,
    seconds: secondsTimer,
  } = useServerTimer();

  // Funções específicas para start e pause
  const startTimer = async () => {
    if (!isRunning) {
      await toggleTimer();
    }
  };

  const pauseTimer = async () => {
    if (isRunning) {
      await toggleTimer();
    }
  };
  const queryClient = useQueryClient();
  const data = queryClient.getQueryData<{ data: { members: MemberProps[] } & RoomProps }>([
    'room',
    room?.id,
  ]);

  const { socket } = useWebsocket();
  const { handleEvent } = useWebSocketEventHandlers(room?.id || '', clear);

  const isOwner = room?.owner_id === user?.id;

  const userCanRevealAndClearCards =
    isOwner || cachedRoomData?.data?.who_can_open_cards.includes(user?.id || '');

  const handleFinalizeTopic = (topic: string, sector: Sector) => {
    // Atualizar a issue atual
    setCurrentIssue(topic);
    setCurrentSector(sector);
    // Mock votes para demonstração
    const mockVotes: Vote[] = [
      { userId: '1', userName: 'João Silva', card: Math.random() > 0.5 ? '5' : '8' },
      { userId: '2', userName: 'Maria Santos', card: Math.random() > 0.5 ? '3' : '5' },
      { userId: '3', userName: 'Pedro Costa', card: Math.random() > 0.5 ? '8' : '13' },
      { userId: '4', userName: 'Ana Lima', card: Math.random() > 0.5 ? '5' : '8' },
    ];

    // Calcular cartas vencedoras
    const cardCounts = mockVotes.reduce(
      (acc, vote) => {
        acc[vote.card] = (acc[vote.card] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const maxVotes = Math.max(...Object.values(cardCounts));
    const winnerCards = Object.keys(cardCounts).filter(card => cardCounts[card] === maxVotes);

    const consensus = winnerCards.length === 1 ? winnerCards[0] : 'Empate';
    const duration = Math.floor(Math.random() * 300) + 60; // Entre 1-5 minutos

    const newVotingRound: VotingRound = {
      id: `${Date.now()}-1`,
      votedAt: new Date(),
      duration,
      consensus,
      winnerCards,
      votes: mockVotes.map(vote => ({ userName: vote.userName, card: vote.card })),
    };

    const newHistoryItem: HistoryItem = {
      id: Date.now().toString(),
      topic,
      sector,
      createdAt: new Date(),
      finalizedAt: new Date(),
      totalDuration: duration,
      finalConsensus: consensus,
      votingRounds: [newVotingRound],
    };

    setVotingHistory(prev => [newHistoryItem, ...prev]);
    console.log('Finalizing topic:', topic, 'sector:', sector, 'with consensus:', consensus);
  };

  useEffect(() => {
    const roomId = room?.id;

    if (!roomId) return;
    if (!user || !user.id) return;

    socket.on(roomId, handleEvent);

    return () => {
      socket.off(roomId, handleEvent);
    };
  }, [room?.id, socket, handleEvent]);

  return (
    <div className="w-[1200px] max-w-full flex flex-col gap-3 sm:gap-4 md:gap-6">
      <NavBar />

      <main className="flex flex-col gap-3 sm:gap-4 md:gap-6">
        {/* {(!data?.data.private || room?.owner_id === user?.id) && <AcceptUsers />} */}

        {/* Layout responsivo: coluna em mobile/tablet, lado a lado em lg+ */}
        <div className="flex flex-col lg:flex-row lg:items-start gap-3 sm:gap-4 md:gap-6">
          {/* Cards Section */}
          <div className="w-full lg:max-w-[calc(100%-21.5rem)] flex flex-col gap-3 sm:gap-4 md:gap-6">
            {/* Issue Manager - separado para usar apenas CurrentIssue */}
            {(() => {
              const issueManager = IssueManager({
                currentIssue: currentIssue || '',
                currentSector: currentSector || 'backend',
                historyItems: votingHistory,
                time: secondsTimer,
                isRunning: isRunning,
                onFinalizeIssue: handleFinalizeTopic,
                onStartTimer: startTimer,
                onPauseTimer: pauseTimer,
                onResetTimer: resetTimer,
              });
              return issueManager.CurrentIssue;
            })()}

            <Box className="max-w-full lg:flex-1 min-h-0! max-h-fit flex flex-col gap-y-3 sm:gap-y-4 md:gap-y-4 lg:gap-y-5 p-3 sm:p-4 md:p-4 lg:p-5">
              <Cards />

              {userCanRevealAndClearCards && (
                <Flex className="w-full flex-row gap-2 md:gap-4">
                  <Button
                    className="flex-1"
                    onClick={clearVotes}
                    isLoading={isClearingVotes}
                    variant="tertiary"
                    disabled={isRevealingCards || isClearingVotes || !data?.data.cards_open}
                  >
                    Limpar votos
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={revealCards}
                    isLoading={isRevealingCards}
                    variant="tertiary"
                    disabled={isRevealingCards || isClearingVotes || data?.data.cards_open}
                  >
                    Revelar cartas
                  </Button>
                </Flex>
              )}

              <p className="text-[0.65rem] text-gray-400 leading-relaxed">
                Ao revelar as cartas, se uma issue está definida, é criado automaticamente um
                registro histórico contendo o resultado da votação, tempo decorrido e participação
                dos membros.
              </p>
            </Box>

            {/* Users List - aparece aqui em md para baixo */}
            <div className="lg:hidden">
              <UsersList />
            </div>

            {/* Issue History */}
            {(() => {
              const issueManager = IssueManager({
                currentIssue: currentIssue || '',
                currentSector: currentSector || 'backend',
                historyItems: votingHistory,
                time: secondsTimer,
                isRunning: isRunning,
                onFinalizeIssue: handleFinalizeTopic,
                onStartTimer: startTimer,
                onPauseTimer: pauseTimer,
                onResetTimer: resetTimer,
              });
              return issueManager.IssueHistory;
            })()}
          </div>

          {/* Users List - lateral em lg+ */}
          <div className="hidden lg:block lg:w-80 lg:shrink-0">
            <UsersList />
          </div>
        </div>
      </main>
    </div>
  );
};
