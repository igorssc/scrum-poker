import { RoomContext } from '@/context/RoomContext';
import { useRoomActions } from '@/hooks/useRoomActions';
import { useServerTimer } from '@/hooks/useServerTimer';
import { useWebSocketEventHandlers } from '@/hooks/useWebSocketEventHandlers';
import { MemberProps } from '@/protocols/Member';
import { RoomProps } from '@/protocols/Room';
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

export const Board = () => {
  // Mock data inicial para demonstração
  const [votingHistory, setVotingHistory] = useState<HistoryItem[]>([
    {
      id: '1',
      topic: 'Implementar sistema de autenticação OAuth',
      sector: 'backend',
      finalizedAt: new Date(Date.now() - 1000 * 60 * 30), // 30 min atrás
      duration: 180, // 3 minutos
      consensus: '8',
      winnerCards: ['8'],
      votes: [
        { userId: '1', userName: 'João Silva', card: '8' },
        { userId: '2', userName: 'Maria Santos', card: '8' },
        { userId: '3', userName: 'Pedro Costa', card: '5' },
        { userId: '4', userName: 'Ana Lima', card: '8' },
      ],
    },
    {
      id: '2',
      topic: 'Refatorar componentes de UI para melhor performance',
      sector: 'front-web',
      finalizedAt: new Date(Date.now() - 1000 * 60 * 60), // 1 hora atrás
      duration: 240, // 4 minutos
      consensus: 'Empate',
      winnerCards: ['5', '8'],
      votes: [
        { userId: '1', userName: 'João Silva', card: '5' },
        { userId: '2', userName: 'Maria Santos', card: '8' },
        { userId: '3', userName: 'Pedro Costa', card: '5' },
        { userId: '4', userName: 'Ana Lima', card: '8' },
        { userId: '5', userName: 'Carlos Rocha', card: '3' },
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

    const newHistoryItem: HistoryItem = {
      id: Date.now().toString(),
      topic,
      sector,
      finalizedAt: new Date(),
      duration: Math.floor(Math.random() * 300) + 60, // Entre 1-5 minutos
      votes: mockVotes,
      winnerCards,
      consensus: winnerCards.length === 1 ? winnerCards[0] : 'Empate',
    };

    setVotingHistory(prev => [newHistoryItem, ...prev]);
    console.log(
      'Finalizing topic:',
      topic,
      'sector:',
      sector,
      'with consensus:',
      newHistoryItem.consensus
    );
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
            <Box className="max-w-full lg:flex-1 min-h-0! max-h-fit flex flex-col gap-y-3 sm:gap-y-4 md:gap-y-6 lg:gap-y-8">
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
            </Box>

            {/* Users List - aparece aqui em md para baixo */}
            <div className="lg:hidden">
              <UsersList />
            </div>

            {/* Issue Manager - Tema, Timer e Histórico */}
            <IssueManager
              items={votingHistory}
              onFinalizeIssue={handleFinalizeTopic}
              time={secondsTimer}
              isRunning={isRunning}
              onToggleTimer={toggleTimer}
              onResetTimer={resetTimer}
            />
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
