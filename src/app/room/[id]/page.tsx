'use client';
import { Box } from '@/components/Box';
import { EnterRoom } from '@/components/EnterRoom';
import { Flex } from '@/components/Flex';
import { Glass } from '@/components/Glass';
import { LoadingScreen } from '@/components/LoadingScreen';
import { SampleCards } from '@/components/SampleCards';
import { WaitingRoom } from '@/components/WaitingRoom';
import { RoomContext } from '@/context/RoomContext';
import { useWebsocket } from '@/hooks/useWebsocket';
import { MemberProps } from '@/protocols/Member';
import { RoomProps } from '@/protocols/Room';
import api from '@/services/api';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useContextSelector } from 'use-context-selector';

type RoomPageProps = {
  params: {
    id: string;
  };
  searchParams: {
    access?: string;
  };
};

type SignInAcceptEventProps = {
  type: string;
  data: {
    user: {
      user_id: string;
    };
  };
};

type SignOutEventProps = {
  type: string;
  data: {
    user: {
      id: string;
    };
  };
};

export default function Room({ params, searchParams }: RoomPageProps) {
  const {
    room,
    user,
    isHydrated,
    clear,
    waitingLogin,
    setWaitingLogin,
    tabId,
  } = useContextSelector(RoomContext, (context) => ({
    room: context.room,
    user: context.user,
    isHydrated: context.isHydrated,
    clear: context.clear,
    waitingLogin: context.waitingLogin,
    setWaitingLogin: context.setWaitingLogin,
    tabId: context.tabId,
  }));

  const router = useRouter();
  const roomId = params.id;
  const { access } = searchParams;
  const { socket } = useWebsocket();

  const channel = new BroadcastChannel('channel-scrum-poker');

  const { data, refetch } = useQuery<{
    data: { members: MemberProps[] } & RoomProps;
  }>({
    queryKey: ['room', roomId],
    queryFn: () => api.get(`rooms/${roomId}`),
    refetchInterval: 5000,
  });

  useEffect(() => {
    refetch();

    if (!data?.data || !user) return;

    const userFound = data?.data.members.find(
      (member) => member.member.id === user.id,
    );

    if (!userFound) return;

    const userIsRefused = userFound.status === 'REFUSED';

    if (userIsRefused) return clear();

    const userIsLogged = userFound.status === 'LOGGED';

    if (!userIsLogged) return;

    channel.postMessage({ type: 'login-scrum-poker', tabId });

    router.replace('/');
  }, [user, data?.data]);

  useEffect(() => {
    if (room) setWaitingLogin(true);
  }, [room]);

  useEffect(() => {
    if (!user || !user.id) return;

    const handleEvent = (event: any) => {
      if (event.type === 'sign-in-accept') {
        const { user_id } = (event as SignInAcceptEventProps).data.user;

        if (user_id !== user.id) return;

        channel.postMessage({ type: 'login-scrum-poker', tabId });

        window.location.replace('/');
      }

      if (event.type === 'sign-out') {
        const { id } = (event as SignOutEventProps).data.user;

        if (id !== user.id) return;

        clear();
        setWaitingLogin(false);
        window.location.reload();
      }

      if (event.type === 'sign-in-refuse') {
        const { id } = (event as SignOutEventProps).data.user;

        if (id !== user.id) return;

        clear();
        setWaitingLogin(false);
        window.location.reload();
      }
    };

    socket.on(roomId, handleEvent);

    return () => {
      socket.off(roomId, handleEvent);
    };
  }, [roomId, socket, user, router]);

  if (!isHydrated || (user && room && !data?.data)) {
    return <LoadingScreen />;
  }

  if (!(user && room?.id === roomId) && !waitingLogin)
    return (
      <SampleCards>
        <Glass>
          <Box>
            <Flex>
              <EnterRoom
                roomId={roomId}
                roomName={data?.data.name}
                access={access}
              />
            </Flex>
          </Box>
        </Glass>
      </SampleCards>
    );

  return (
    <SampleCards>
      <Glass>
        <Box>
          <Flex>
            <WaitingRoom roomName={data?.data.name} roomId={roomId} />
          </Flex>
        </Box>
      </Glass>
    </SampleCards>
  );
}
