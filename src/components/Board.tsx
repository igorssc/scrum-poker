import { RoomContext } from '@/context/RoomContext';
import { useRoomActions } from '@/hooks/useRoomActions';
import { useServerTimer } from '@/hooks/useServerTimer';
import { useWebSocketEventHandlers } from '@/hooks/useWebSocketEventHandlers';
import { MemberProps } from '@/protocols/Member';
import { RoomProps } from '@/protocols/Room';
import { HistoryItem, Sector } from '@/types/voting';
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
  const { cachedRoomData } = useRoomCache();

  // Converter dados reais do cache para o formato HistoryItem
  const votingHistory: HistoryItem[] =
    cachedRoomData?.data?.votes?.map(session => ({
      id: session.id,
      topic: session.topic,
      sector: session.sector as Sector,
      createdAt: new Date(session.created_at),
      finalizedAt: session.finalized_at ? new Date(session.finalized_at) : undefined,
      totalDuration: session.total_duration || undefined,
      finalConsensus: session.final_consensus || undefined,
      votingRounds: session.voting_rounds.map(round => ({
        id: round.id,
        votedAt: new Date(round.voted_at),
        duration: round.duration || 0,
        consensus: round.consensus,
        winnerCards: round.winner_cards,
        votes: round.votes.map(vote => ({
          userId: vote.user_id,
          userName: vote.user.name,
          card: vote.card.toString(),
        })),
      })),
    })) || [];

  const { room, user, clear } = useContextSelector(RoomContext, context => ({
    room: context.room,
    user: context.user,
    clear: context.clear,
  }));

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
                <>
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
                  <p className="text-[0.65rem] text-gray-400 leading-relaxed">
                    Ao revelar as cartas, se uma issue está definida, é criado automaticamente um
                    registro histórico contendo o resultado da votação, tempo decorrido e
                    participação dos membros.
                  </p>
                </>
              )}
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
