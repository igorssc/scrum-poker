'use client';
import { CreateRoom } from '../components/CreateRoom';
import { AcceptUsers } from '../components/AcceptUsers';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { RoomProps } from '../protocols/Room';
import { Glass } from '../components/Glass';
import { useEffect, useState } from 'react';
import { Box } from '../components/Box';
import { SampleCards } from '@/components/SampleCards';
import { useContextSelector } from 'use-context-selector';
import { RoomContext } from '@/context/RoomContext';
import { Button } from '@/components/Button';
import { MemberProps } from '@/protocols/Member';
import { LoadingScreen } from '@/components/LoadingScreen';
import { SearchRoom } from '@/components/SearchRoom';
import { Flex } from '@/components/Flex';
import { Board } from '@/components/Board';

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
      <SampleCards>
        <Glass>
          <Box>
            <Flex>
              <SearchRoom />
            </Flex>
          </Box>
        </Glass>
      </SampleCards>
    );

  if (!room)
    return (
      <SampleCards>
        <Glass>
          <Box>
            <Flex>
              <CreateRoom setIsLookingForRoom={setIsLookingForRoom} />
            </Flex>
          </Box>
        </Glass>
      </SampleCards>
    );

  return (
    <Board/>
  );
}
