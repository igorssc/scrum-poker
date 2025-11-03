'use client';

import { Board } from '@/components/Board';
import { Box } from '@/components/Box';
import { CreateRoom } from '@/components/CreateRoom';
import { Flex } from '@/components/Flex';
import { HomeButton } from '@/components/HomeButton';
import { LoadingScreen } from '@/components/LoadingScreen';
import { SearchRoom } from '@/components/SearchRoom';
import { ThemeToggle } from '@/components/ThemeToggle';
import { RoomContext } from '@/context/RoomContext';
import { MemberProps } from '@/protocols/Member';
import { RoomProps } from '@/protocols/Room';
import api from '@/services/api';
import { handleApiError } from '@/utils/errorHandler';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useContextSelector } from 'use-context-selector';

export default function BoardPage() {
  return <BoardContent />;
}

function BoardContent() {
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
    queryFn: async () => {
      try {
        return await api.get(`rooms/${room?.id}`);
      } catch (error) {
        handleApiError(error, 'Erro ao carregar dados da sala');
        throw error;
      }
    },
    enabled: !!room?.id,
    refetchInterval: 3000,
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
    if (!(user && room && data)) return;

    const userFound = data?.data?.members?.find(member => member.member.id === user.id);

    // Se o usuário não foi encontrado na sala, desloga ele
    if (!userFound) {
      clear();
      return;
    }

    const userIsLogged = userFound.status === 'LOGGED';

    if (!userIsLogged) window.location.replace(`/room/${room?.id}`);
  }, [data?.data, room, user, clear]);

  if (!isHydrated || (user && room && !data?.data)) {
    return <LoadingScreen />;
  }

  if (isLookingForRoom)
    return (
      <div className="relative min-h-[calc(100dvh-3rem-4rem)] mb-16 flex content-center items-center max-w-[calc(100%-1.5rem)] md:max-w-[90%]">
        <ThemeToggle className="fixed top-3 right-3 sm:top-4 sm:right-4 z-50" />
        <HomeButton className="fixed top-4 left-4 z-50" />
        <Box allowOverflow className="w-160 max-h-[80dvh] sm:max-h-[800px]">
          <Flex>
            <SearchRoom />
          </Flex>
        </Box>
      </div>
    );

  if (!room)
    return (
      <div className="relative min-h-[calc(100dvh-3rem-4rem)] mb-16 flex content-center items-center max-w-[calc(100%-1.5rem)] md:max-w-[90%]">
        <ThemeToggle className="fixed top-3 right-3 sm:top-4 sm:right-4 z-50" />
        <HomeButton className="fixed top-4 left-4 z-50" />
        <Box allowOverflow className="w-160">
          <Flex>
            <CreateRoom setIsLookingForRoom={setIsLookingForRoom} />
          </Flex>
        </Box>
      </div>
    );

  return (
    <div className="relative min-h-[calc(100dvh-3rem-4rem)] mb-16 flex content-center items-center max-w-[calc(100%-1.5rem)] md:max-w-[90%]">
      <Board />
    </div>
  );
}
