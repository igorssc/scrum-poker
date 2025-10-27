import { RoomContext } from '@/context/RoomContext';
import { useRoomActions } from '@/hooks/useRoomActions';
import { MemberProps } from '@/protocols/Member';
import { RoomProps } from '@/protocols/Room';
import { useQueryClient } from '@tanstack/react-query';
import { useContextSelector } from 'use-context-selector';
import { AcceptUsers } from './AcceptUsers';
import { Box } from './Box';
import { Button } from './Button';
import { Cards } from './Cards';
import { Flex } from './Flex';
import { NavBar } from './NavBar';
import { UsersList } from './UsersList';

export const Board = () => {
  const { room, user } = useContextSelector(RoomContext, context => ({
    room: context.room,
    user: context.user,
  }));

  const { revealCards, clearVotes, isRevealingCards, isClearingVotes } = useRoomActions();
  const queryClient = useQueryClient();
  const data = queryClient.getQueryData<{ data: { members: MemberProps[] } & RoomProps }>([
    'room',
    room?.id,
  ]);

  const isOwner = room?.owner_id === user?.id;

  return (
    <div className="w-[1200px] max-w-full flex flex-col gap-3 sm:gap-4 md:gap-6">
      <NavBar />

      <main className="flex flex-col gap-3 sm:gap-4 md:gap-6">
        {(!data?.data.private || room?.owner_id === user?.id) && <AcceptUsers />}

        <Box className="max-w-full min-h-0! flex flex-col gap-y-3 sm:gap-y-4 md:gap-y-6 lg:gap-y-8">
          <Cards />

          {isOwner && (
            <Flex className="w-full flex-row gap-2 md:gap-4">
              <Button
                className="flex-1"
                onClick={clearVotes}
                isLoading={isClearingVotes}
                variant="tertiary"
              >
                Limpar votos
              </Button>
              <Button
                className="flex-1"
                onClick={revealCards}
                isLoading={isRevealingCards}
                variant="tertiary"
              >
                Revelar cartas
              </Button>
            </Flex>
          )}
        </Box>

        <UsersList />
      </main>
    </div>
  );
};
