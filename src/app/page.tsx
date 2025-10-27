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

  const { room, user, isHydrated, clear } = useContextSelector(RoomContext, context => ({
    room: context.room,
    user: context.user,
    isHydrated: context.isHydrated,
    tabId: context.tabId,
    clear: context.clear,
  }));

  const { data, error } = useQuery<{ data: { members: MemberProps[] } & RoomProps }>({
    queryKey: ['room', room?.id],
    queryFn: () => api.get(`rooms/${room?.id}`),
    enabled: !!room?.id,
    refetchInterval: 5000,
    retry: (failureCount, error: any) => {
      // Se for erro 404 (sala não encontrada) ou 403 (sem permissão), não tenta novamente
      if (error?.response?.status === 404 || error?.response?.status === 403) {
        return false;
      }
      // Para outros erros, tenta até 2 vezes
      return failureCount < 2;
    },
  });

  // Detecta erros e limpa o localStorage quando necessário
  useEffect(() => {
    if (
      (error && (error as any)?.response?.status === 404) ||
      (error as any)?.response?.status === 403
    ) {
      clear();
    }
  }, [error, clear]);

  useEffect(() => {
    if (!(user && room)) return;

    const userFound = data?.data?.members?.find(member => member.member.id === user.id);

    if (!userFound) return;

    const userIsLogged = userFound.status === 'LOGGED';

    if (!userIsLogged) window.location.replace(`room/${room?.id}`);
  }, [data?.data, room]);

  if (!isHydrated || (user && room && !data?.data)) {
    return <LoadingScreen />;
  }

  if (isLookingForRoom)
    return (
      <div className="relative min-h-[calc(100dvh-2rem)] flex content-center items-center max-w-[90%]">
        <ThemeToggle className="fixed top-3 right-3 sm:top-4 sm:right-4 z-50" />
        <Box allowOverflow className="w-160 max-h-[80dvh] sm:max-h-[800px]">
          <Flex>
            <SearchRoom />
          </Flex>
        </Box>
      </div>
    );

  if (!room)
    return (
      <div className="relative min-h-[calc(100dvh-2rem)] flex content-center items-center max-w-[90%]">
        <ThemeToggle className="fixed top-3 right-3 sm:top-4 sm:right-4 z-50" />
        <Box allowOverflow className="w-160">
          <Flex>
            <CreateRoom setIsLookingForRoom={setIsLookingForRoom} />
          </Flex>
        </Box>
      </div>
    );

  return (
    <div className="relative min-h-[calc(100dvh-2rem)] flex content-center items-center max-w-[90%]">
      <Board />
    </div>
  );
}
