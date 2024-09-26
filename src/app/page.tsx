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

export default function Home() {
  const { room, user, logout, isHydrated } = useRoomStore();

  const { data } = useQuery<{ data: RoomProps }>({
    queryKey: ['room', room?.id],
    queryFn: () => api.get(`rooms/${room?.id}`),
  });

  if (!isHydrated) {
    return <></>;
  }

  return (
    <>
      <pre>{JSON.stringify(room, null, 4)}</pre>
      <pre>{JSON.stringify(user, null, 4)}</pre>

      {/* <pre>{JSON.stringify(data?.data, null, 4)}</pre> */}
      {room && (
        <>
          <header>
            <button onClick={logout}>sair</button>
          </header>
        </>
      )}
      {!room && (
        <Glass>
          <Box>
            <CreateRoom />
          </Box>
        </Glass>
      )}
      {(!data?.data.private || room?.owner_id === user?.id) && <AcceptUsers />}
      <Cards />
    </>
  );
}
