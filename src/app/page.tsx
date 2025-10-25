'use client';
import { CreateRoom } from '../components/CreateRoom';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { RoomProps } from '../protocols/Room';
import { useEffect, useState } from 'react';
import { Box } from '../components/Box';
import { useContextSelector } from 'use-context-selector';
import { RoomContext } from '@/context/RoomContext';
import { MemberProps } from '@/protocols/Member';
import { LoadingScreen } from '@/components/LoadingScreen';
import { SearchRoom } from '@/components/SearchRoom';
import { Flex } from '@/components/Flex';
import { Board } from '@/components/Board';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function Home() {
  const [isLookingForRoom, setIsLookingForRoom] = useState(false);

  const { room, user, isHydrated } = useContextSelector(
    RoomContext,
    (context) => ({
      room: context.room,
      user: context.user,
      isHydrated: context.isHydrated,
      tabId: context.tabId,
    }),
  );

  const { data } = useQuery<{ data: { members: MemberProps[] } & RoomProps }>({
    queryKey: ['room', room?.id],
    queryFn: () => api.get(`rooms/${room?.id}`),
    enabled: !!room?.id,
    refetchInterval: 5000,
  });

  useEffect(() => {
    if (!(user && room)) return;

    const userFound = data?.data.members.find(
      (member) => member.member.id === user.id,
    );

    if (!userFound) return;

    const userIsLogged = userFound.status === 'LOGGED';

    if (!userIsLogged) window.location.replace(`room/${room?.id}`);
  }, [data?.data, room]);

  if (!isHydrated || (user && room && !data?.data)) {
    return <LoadingScreen />;
  }

  if (isLookingForRoom)
    return (
      <div className="relative min-h-screen">
        <ThemeToggle className="fixed top-4 right-4 z-50" />
        <Box>
          <Flex>
            <SearchRoom />
          </Flex>
        </Box>
      </div>
    );

  if (!room)
    return (
      <div className="relative min-h-screen">
        <ThemeToggle className="fixed top-4 right-4 z-50" />
        <Box>
          <Flex>
            <CreateRoom setIsLookingForRoom={setIsLookingForRoom} />
          </Flex>
        </Box>
      </div>
    );

  return (
    <Board/>
  );
}
