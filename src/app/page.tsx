'use client';
import { CreateRoom } from '../components/CreateRoom';
import { AcceptUsers } from '../components/AcceptUsers';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { RoomProps } from '../protocols/Room';
import { Glass } from '../components/Glass';
import { useEffect } from 'react';
import { Box } from '../components/Box';
import { SampleCards } from '@/components/SampleCards';
import Head from 'next/head';
import { useRouter } from 'next/navigation';
import { useContextSelector } from 'use-context-selector';
import { RoomContext } from '@/context/RoomContext';

export default function Home() {
  const { room, user, logout, isHydrated, tabId } = useContextSelector(
    RoomContext,
    (context) => ({
      room: context.room,
      user: context.user,
      logout: context.logout,
      isHydrated: context.isHydrated,
      tabId: context.tabId,
    }),
  );

  const router = useRouter();

  const channel = new BroadcastChannel('channel-scrum-poker');

  const { data } = useQuery<{ data: RoomProps }>({
    queryKey: ['room', room?.id],
    queryFn: () => api.get(`rooms/${room?.id}`),
  });

  useEffect(() => {
    if (room) {
      channel.postMessage({ type: 'login-scrum-poker', tabId });
    }
  }, [room]);

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
