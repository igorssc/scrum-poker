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

interface HistoryItem {
  id: string;
  topic: string;
  finalizedAt: Date;
}

export const Board = () => {
  const [votingHistory, setVotingHistory] = useState<HistoryItem[]>([]);

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

  const handleFinalizeTopic = (topic: string) => {
    // TODO: Conectar com API futuramente
    const newHistoryItem: HistoryItem = {
      id: Date.now().toString(),
      topic,
      finalizedAt: new Date(),
    };

    setVotingHistory(prev => [newHistoryItem, ...prev]);
    console.log('Finalizing topic:', topic);
    // Aqui será feita a chamada para API para salvar no histórico
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
          <div className="w-full flex flex-col gap-3 sm:gap-4 md:gap-6">
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
          <div className="lg:w-80 lg:shrink-0">
            <UsersList />
          </div>
        </div>
      </main>
    </div>
  );
};
