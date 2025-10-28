import { useEffect, useMemo } from 'react';
import { io, Socket } from 'socket.io-client';

// Instância global do socket para evitar múltiplas conexões
let globalSocket: Socket | null = null;

export const useWebsocket = () => {
  const socket = useMemo(() => {
    // Se já existe uma instância global, reutiliza
    if (globalSocket && globalSocket.connected) {
      return globalSocket;
    }

    // Cria nova instância apenas se necessário
    globalSocket = io('ws://localhost:8089', {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      forceNew: false,
      autoConnect: false,
    });

    return globalSocket;
  }, []);

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    const handleConnect = () => {
      console.log('WebSocket connected');
    };

    const handleDisconnect = (reason: string) => {
      console.log('WebSocket disconnected:', reason);

      // Reconecta automaticamente se a desconexão não foi intencional
      if (reason === 'io server disconnect') {
        // Reconecta após um delay
        setTimeout(() => {
          if (!socket.connected) {
            socket.connect();
          }
        }, 1000);
      }
    };

    const handleConnectError = (error: Error) => {
      console.error('WebSocket connection error:', error);
    };

    const handleReconnect = (attemptNumber: number) => {
      console.log('WebSocket reconnected after', attemptNumber, 'attempts');
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectError);
    socket.on('reconnect', handleReconnect);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleConnectError);
      socket.off('reconnect', handleReconnect);
      // NÃO desconecta aqui para permitir reutilização
    };
  }, [socket]);

  return { socket };
};
