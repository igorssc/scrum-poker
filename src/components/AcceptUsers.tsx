import { useEffect, useState } from 'react';
import { useWebsocket } from '../hooks/useWebsocket';
import { useContextSelector } from 'use-context-selector';
import { RoomContext } from '@/context/RoomContext';
import { useRoomCache } from '@/hooks/useRoomCache';
import { Box } from './Box';
import { Flex } from './Flex';
import { Button } from './Button';

type UserProps = {
  id: string;
  name: string;
};

type SignInEventProps = {
  type: string;
  data: {
    user: {
      status: string;
      member: UserProps;
    };
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

/**
 * Componente híbrido que usa WebSocket para atualizações em tempo real
 * e REST API como fallback para garantir consistência dos dados.
 * 
 * Estratégia:
 * 1. WebSocket: Atualizações rápidas em tempo real
 * 2. REST API (via cache): Fallback para sincronizar membros PENDING
 * 3. Merge inteligente: Combina dados de ambas as fontes sem duplicatas
 */
export const AcceptUsers = () => {
  const { socket } = useWebsocket();
  const { cachedRoomData } = useRoomCache();

  const { room, acceptUser, refuseUser } = useContextSelector(
    RoomContext,
    (context) => ({
      room: context.room,
      acceptUser: context.acceptUser,
      refuseUser: context.refuseUser,
    }),
  );

  const [users, setUser] = useState<UserProps[]>([]);

  // Função para extrair usuários PENDING da API REST (fallback)
  const getPendingUsersFromAPI = () => {
    if (!cachedRoomData?.data.members) return [];
    
    return cachedRoomData.data.members
      .filter(member => member.status === 'PENDING')
      .map(member => ({
        id: member.member.id,
        name: member.member.name,
      }));
  };

  // Sincronizar com dados da API REST quando disponível
  useEffect(() => {
    const pendingUsers = getPendingUsersFromAPI();
    
    setUser(prevUsers => {
      // Se temos dados da API, use eles como fonte de verdade
      if (cachedRoomData?.data.members) {
        const pendingUserIds = pendingUsers.map(user => user.id);
        
        // Manter apenas usuários que ainda estão PENDING na API ou que vieram do websocket
        const filteredUsers = prevUsers.filter(user => {
          // Se o usuário está na API como PENDING, manter
          if (pendingUserIds.includes(user.id)) return true;
          
          // Se o usuário não está na API, pode ter sido adicionado pelo websocket recentemente
          // Vamos manter por enquanto (o websocket vai limpar se necessário)
          const userInAPI = cachedRoomData.data.members.some(member => member.member.id === user.id);
          return !userInAPI;
        });
        
        // Adicionar novos usuários PENDING da API que não estão no estado local
        const mergedUsers = [...filteredUsers];
        pendingUsers.forEach(apiUser => {
          const userExists = mergedUsers.some(user => user.id === apiUser.id);
          if (!userExists) {
            mergedUsers.push(apiUser);
          }
        });
        
        return mergedUsers;
      }
      
      return prevUsers;
    });
  }, [cachedRoomData]);

  // WebSocket para atualizações em tempo real
  useEffect(() => {
    if (!room) return;

    const handleWebSocketEvent = (event: any) => {
      if (event.type === 'sign-in') {
        return setUser((prev) => {
          if ((event as SignInEventProps).data.user.status === 'LOGGED')
            return prev;

          const { id, name } = (event as SignInEventProps).data.user.member;

          const userAlreadyExists = prev.some((user) => user.id === id);

          if (userAlreadyExists) return prev;

          return [...prev, { id, name }];
        });
      }

      if (event.type === 'sign-in-accept') {
        return setUser((prev) => {
          const { user_id } = (event as SignInAcceptEventProps).data.user;
          return prev.filter((user) => user.id !== user_id);
        });
      }

      if (event.type === 'sign-in-refuse') {
        return setUser((prev) => {
          const { user_id } = (event as SignInAcceptEventProps).data.user;
          return prev.filter((user) => user.id !== user_id);
        });
      }

      if (event.type === 'sign-out') {
        return setUser((prev) => {
          const { id } = (event as SignOutEventProps).data.user;
          return prev.filter((user) => user.id !== id);
        });
      }
    };

    socket.on(room.id, handleWebSocketEvent);

    return () => {
      socket.off(room.id, handleWebSocketEvent);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room]);

  return (
    <Flex className="gap-4">
      {users.map((user) => (
        <Box 
          key={user.id} 
          className="min-h-fit max-w-[300px] p-6"
        >
          <Flex className="gap-4">
            <h3 className="text-lg font-semibold text-center">
              {user.name}
            </h3>
            
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
              Aguardando aprovação
            </p>
            
            <Flex className="flex-row gap-3 mt-4">
              <Button 
                onClick={() => acceptUser(user.id)}
                className="bg-green-600 hover:bg-green-700 focus:ring-green-500"
              >
                Aceitar
              </Button>
              
              <Button 
                onClick={() => refuseUser(user.id)}
                className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
              >
                Recusar
              </Button>
            </Flex>
          </Flex>
        </Box>
      ))}
    </Flex>
  );
};
