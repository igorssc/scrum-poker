import { useEffect, useState, useRef } from 'react';
import { useWebsocket } from '../hooks/useWebsocket';
import { useContextSelector } from 'use-context-selector';
import { RoomContext } from '@/context/RoomContext';
import { useRoomCache } from '@/hooks/useRoomCache';
import { Box } from './Box';
import { Flex } from './Flex';
import { Button } from './Button';
import { twMerge } from 'tailwind-merge';

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
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [hasOverflow, setHasOverflow] = useState(false);

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

  // Funções para drag scroll (mouse)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Velocidade do scroll
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  // Funções para touch events (mobile)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    setStartX(e.touches[0].pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    const x = e.touches[0].pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Função para verificar se há overflow no container
  const checkOverflow = () => {
    if (!scrollContainerRef.current) return;
    
    const container = scrollContainerRef.current;
    const hasOverflowNow = container.scrollWidth > container.clientWidth && users.length > 1;
    setHasOverflow(hasOverflowNow);
  };

  // Verificar overflow após renderização e mudanças de tamanho
  useEffect(() => {
    checkOverflow();
    
    const handleResize = () => {
      checkOverflow();
    };

    window.addEventListener('resize', handleResize);
    
    // Observer para detectar mudanças no conteúdo do container
    const resizeObserver = new ResizeObserver(() => {
      checkOverflow();
    });
    
    if (scrollContainerRef.current) {
      resizeObserver.observe(scrollContainerRef.current);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      resizeObserver.disconnect();
    };
  }, [users.length]); // Re-executar quando o número de usuários mudar

  if (users.length === 0) {
    return null;
  }

 

  return (
    <div className="w-full mb-4">
      {/* Container do carousel */}
      <div className="relative">
        <div 
          ref={scrollContainerRef}
          className={twMerge("overflow-x-auto scrollbar-hide select-none",
            !hasOverflow ? 'cursor-default' : isDragging ? 'cursor-grabbing' : 'cursor-grab'
          )}
          onMouseDown={hasOverflow ? handleMouseDown : undefined}
          onMouseUp={hasOverflow ? handleMouseUp : undefined}
          onMouseMove={hasOverflow ? handleMouseMove : undefined}
          onMouseLeave={hasOverflow ? handleMouseLeave : undefined}
          onTouchStart={hasOverflow ? handleTouchStart : undefined}
          onTouchMove={hasOverflow ? handleTouchMove : undefined}
          onTouchEnd={hasOverflow ? handleTouchEnd : undefined}
        >
          <div 
            className={`flex gap-3 pb-2 ${
              hasOverflow ? '' : 'justify-center'
            }`} 
            style={hasOverflow ? { width: 'max-content' } : undefined}
          >
            {users.map((user) => (
              <Box 
                key={user.id} 
                className="min-h-fit min-w-[260px] max-w-[260px] p-4 shrink-0 shadow-none"
              >
                <Flex className="gap-3">
                  <h3 className="text-base font-semibold text-center">
                    {user.name}
                  </h3>
                  
                  <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
                    Aguardando aprovação
                  </p>
                  
                  <Flex className="flex-row gap-2 mt-2">
                    <Button 
                      onClick={(e) => {
                        // Previne clique durante drag
                        if (isDragging) {
                          e.preventDefault();
                          return;
                        }
                        acceptUser(user.id);
                      }}
                      onMouseDown={(e) => e.stopPropagation()}
                      className="bg-green-600 hover:bg-green-700 focus:ring-green-500 text-sm py-1.5 px-3 flex-1"
                    >
                      Aceitar
                    </Button>
                    
                    <Button 
                      onClick={(e) => {
                        // Previne clique durante drag
                        if (isDragging) {
                          e.preventDefault();
                          return;
                        }
                        refuseUser(user.id);
                      }}
                      onMouseDown={(e) => e.stopPropagation()}
                      className="bg-red-600 hover:bg-red-700 focus:ring-red-500 text-sm py-1.5 px-3 flex-1"
                    >
                      Recusar
                    </Button>
                  </Flex>
                </Flex>
              </Box>
            ))}
          </div>
        </div>
        
        {/* Gradient fade nas bordas para indicar scroll */}
        {hasOverflow && (
          <>
            <div className="absolute left-0 top-0 bottom-0 w-4 bg-linear-to-r from-gray-400/70 to-transparent pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-4 bg-linear-to-l from-gray-400/70 to-transparent pointer-events-none" />
          </>
        )}
      </div>
      
      {/* Indicador de scroll */}
      {hasOverflow && (
        <p className="text-xs text-gray-500 dark:text-gray-800 text-center mt-2">
          ← Deslize para ver mais usuários ({users.length}) →
        </p>
      )}
    </div>
  );
};
