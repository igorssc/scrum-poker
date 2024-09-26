'use client';
import { EnterRoom } from '@/src/components/EnterRoom';
import { Glass } from '@/src/components/Glass';
import { useRoomStore } from '@/src/hooks/useRoom';
import { useWebsocket } from '@/src/hooks/useWebsocket';
import { MemberProps } from '@/src/protocols/Member';
import { RoomProps } from '@/src/protocols/Room';
import api from '@/src/services/api';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

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
  const { enterRoom, user, room, clear } = useRoomStore();
  const router = useRouter();
  const roomId = params.id;
  const { access } = searchParams;
  const { socket } = useWebsocket();

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
      (member) => member.member.id === user.id && member.status === 'LOGGED',
    );

    if (!userIsLogged) return;

    const userIsNotExists = data?.data.members.some(
      (member) => member.member.id === user.id,
    );

    if (!userIsNotExists) return clear();

    router.replace('/');
  }, [user, data?.data]);

  useEffect(() => {
    if (!user && !room) return;

    console.log(user, room);

    //
  }, [room]);

  useEffect(() => {
    if (!user || !user.id) return;

    const handleEvent = (event: any) => {
      console.log(event);

      if (event.type === 'sign-in-accept') {
        const { user_id } = (event as SignInAcceptEventProps).data.user;

        console.log(user);

        if (user_id !== user.id) return;

        router.replace('/');
      }

      if (event.type === 'sign-out') {
        const { id } = (event as SignOutEventProps).data.user;

        console.log(user);

        if (id !== user.id) return;

        clear();

        router.replace('/');
      }
    };

    socket.on(roomId, handleEvent);

    return () => {
      socket.off(roomId, handleEvent);
    };
  }, [roomId, socket, user, router]);

  if (!(user.id && room.id))
    return (
      <Glass>
        <EnterRoom roomId={roomId} access={access} />
      </Glass>
    );

  return <>esperando...</>;
}
