'use client';
import { Cards } from '../components/Cards';
import { CreateRoom } from '../components/CreateRoom';
import { useRoomStore } from '../hooks/useRoom';
import { AcceptUsers } from '../components/AcceptUsers';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { RoomProps } from '../protocols/Room';
import { Glass } from '../components/Glass';
import { useEffect, useState } from 'react';
import { Box } from '../components/Box';
import { SampleCards } from '@/components/SampleCards';
import Head from 'next/head';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { room, user, logout, isHydrated, clear } = useRoomStore();

  const router = useRouter();

  const channel = new BroadcastChannel('channel-scrum-poker');

  const { data } = useQuery<{ data: RoomProps }>({
    queryKey: ['room', room?.id],
    queryFn: () => api.get(`rooms/${room?.id}`),
  });

  useEffect(() => {
    if (room) {
      channel.postMessage('login-scrum-poker');
    }
  }, [room]);

  useEffect(() => {
    channel.onmessage = (message) => {
      console.log(message);
      if (message.data.type === 'logout-scrum-poker') {
        clear();
      }
      if (message.data.type === 'login-scrum-poker') {
        window.location.reload();
      }
      if (message.data.type === 'waiting-login-scrum-poker') {
        window.location.replace(`room/${message.data?.roomId}`);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channel]);

  if (!isHydrated) {
    return <></>;
  }

  return (
    <>
      <Head>
        <title>Scrum poker</title>
      </Head>
      {/* <pre>{JSON.stringify(room, null, 4)}</pre>
      <pre>{JSON.stringify(user, null, 4)}</pre> */}

      {/* <pre>{JSON.stringify(data?.data, null, 4)}</pre> */}
      {room && (
        <>
          <header>
            <button onClick={logout}>sair</button>
          </header>
        </>
      )}
      {!room && (
        <SampleCards>
          <Glass>
            <Box>
              <CreateRoom />
            </Box>
          </Glass>
        </SampleCards>
      )}
      {(!data?.data.private || room?.owner_id === user?.id) && <AcceptUsers />}
    </>
  );
}
