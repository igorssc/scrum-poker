'use client';
import { Box } from '@/components/Box';
import { EnterRoom } from '@/components/EnterRoom';
import { Glass } from '@/components/Glass';
import { SampleCards } from '@/components/SampleCards';
import { WaitingRoom } from '@/components/WaitingRoom';
import { useRoomStore } from '@/hooks/useRoom';
import { useWebsocket } from '@/hooks/useWebsocket';
import { MemberProps } from '@/protocols/Member';
import { RoomProps } from '@/protocols/Room';
import api from '@/services/api';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

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
  const { enterRoom, user, room, clear, isHydrated } = useRoomStore();
  const router = useRouter();
  const roomId = params.id;
  const { access } = searchParams;
  const { socket } = useWebsocket();
  const [waitingLogin, setWaitingLogin] = useState(false);

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

    const userIsLogged = data?.data.members.some(
      (member) => member.member.id === user?.id && member.status === 'LOGGED',
    );

    if (!userIsLogged) return;

    const userIsNotExists = data?.data.members.some(
      (member) => member.member.id === user?.id,
    );

    if (!userIsNotExists) return clear();

    channel.postMessage({ type: 'login-scrum-poker' });

    router.replace('/');
  }, [user, data?.data]);

  useEffect(() => {
    channel.onmessage = (message) => {
      console.log(message);
      if (message.data.type === 'logout-scrum-poker') {
        clear();
        router.refresh();
      }
      if (message.data.type === 'waiting-login-scrum-poker') {
        setWaitingLogin(true);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channel]);

  useEffect(() => {
    if (!user || !user.id) return;

    const handleEvent = (event: any) => {
      console.log(event);

      if (event.type === 'sign-in-accept') {
        const { user_id } = (event as SignInAcceptEventProps).data.user;

        console.log(user);

        if (user_id !== user.id) return;

        channel.postMessage({ type: 'login-scrum-poker' });

        router.replace('/');
      }

      if (event.type === 'sign-out') {
        const { id } = (event as SignOutEventProps).data.user;

        console.log(user);

        if (id !== user.id) return;

        clear();

        router.refresh();
      }
    };

    socket.on(roomId, handleEvent);

    return () => {
      socket.off(roomId, handleEvent);
    };
  }, [roomId, socket, user, router]);

  if (!isHydrated) {
    return <></>;
  }

  if (!(user && room?.id === roomId) && !waitingLogin)
    return (
      <SampleCards>
        <Glass>
          <Box>
            <EnterRoom
              roomId={roomId}
              roomName={data?.data.name}
              access={access}
            />
          </Box>
        </Glass>
      </SampleCards>
    );

  return (
    <SampleCards>
      <Glass>
        <Box>
          <WaitingRoom roomId={roomId} roomName={data?.data.name} />
        </Box>
      </Glass>
    </SampleCards>
  );
}
