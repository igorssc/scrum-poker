import { useEffect, useMemo } from 'react';
import { io } from 'socket.io-client';

export const useWebsocket = () => {
  const socket = useMemo(
    () =>
      io('ws://localhost:8089', {
        transports: ['websocket'],
        reconnection: true,
        autoConnect: false,
      }),
    [],
  );

  useEffect(() => {
    socket.connect();

    return () => {
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { socket };
};
