'use client';
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

export default function Room({ params, searchParams }: RoomPageProps) {
  const { enterRoom, user } = useRoomStore();
  const router = useRouter();
  const roomId = params.id;
  const { access } = searchParams;
  const { socket } = useWebsocket();

  const { data, refetch } = useQuery<{
    data: { members: MemberProps[] } & RoomProps;
  }>({
    queryKey: ['room', roomId],
    queryFn: () => api.get(`rooms/${roomId}`),
  });

  useEffect(() => {
    refetch();

    const userIsLogged = data?.data.members.some(
      (member) => member.member.id === user.id && member.status === 'LOGGED',
    );

    if (!userIsLogged) return;

    router.replace('/');
  }, [user, data]);

  useEffect(() => {
    enterRoom({ roomId, userName: 'igor', access });
  }, [enterRoom, roomId]);

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
    };

    socket.on(roomId, handleEvent);

    return () => {
      socket.off(roomId, handleEvent);
    };
  }, [roomId, socket, user, router]);

  return <>esperando...</>;
}
