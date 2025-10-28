import { RoomContext } from '@/context/RoomContext';
import { useRoomCache } from '@/hooks/useRoomCache';
import { useEffect, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { useContextSelector } from 'use-context-selector';
import { Box } from './Box';
import { Button } from './Button';
import { Flex } from './Flex';

type UserProps = {
  id: string;
  name: string;
};

export const AcceptUsers = () => {
  const { cachedRoomData } = useRoomCache();

  const { room, acceptUser, refuseUser } = useContextSelector(RoomContext, context => ({
    room: context.room,
    acceptUser: context.acceptUser,
    refuseUser: context.refuseUser,
  }));

  // Extrair usuários PENDING diretamente do cache do React Query
  const users = cachedRoomData?.data.members
    ?.filter(member => member.status === 'PENDING')
    .map(member => ({
      id: member.member.id,
      name: member.member.name,
    })) || [];

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [hasOverflow, setHasOverflow] = useState(false);
  
  // Estados de loading para cada usuário com ação específica
  const [loadingUsers, setLoadingUsers] = useState<Map<string, 'accept' | 'refuse' | null>>(new Map());

  // Funções para gerenciar loading
  const setUserLoading = (userId: string, action: 'accept' | 'refuse' | null) => {
    setLoadingUsers(prev => {
      const newMap = new Map(prev);
      if (action === null) {
        newMap.delete(userId);
      } else {
        newMap.set(userId, action);
      }
      return newMap;
    });
  };

  const getUserLoadingAction = (userId: string) => loadingUsers.get(userId) || null;
  const isUserLoading = (userId: string) => loadingUsers.has(userId);

  // Handlers para aceitar/recusar usuários
  const handleAcceptUser = async (userId: string) => {
    if (isDragging || isUserLoading(userId)) return;
    
    setUserLoading(userId, 'accept');
    try {
      await acceptUser(userId);
    } catch (error) {
      // Error já tratado no RoomContext com toast
    } finally {
      setUserLoading(userId, null);
    }
  };

  const handleRefuseUser = async (userId: string) => {
    if (isDragging || isUserLoading(userId)) return;
    
    setUserLoading(userId, 'refuse');
    try {
      await refuseUser(userId);
    } catch (error) {
      // Error já tratado no RoomContext com toast
    } finally {
      setUserLoading(userId, null);
    }
  };

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
    <div className="w-full">
      {/* Container do carousel */}
      <div className="relative">
        <div
          ref={scrollContainerRef}
          className={twMerge(
            'overflow-x-auto scrollbar-hide select-none',
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
            className={twMerge('flex gap-3', hasOverflow ? '' : 'justify-center')}
            style={hasOverflow ? { width: 'max-content' } : undefined}
          >
            {users.map(user => (
              <Box
                key={user.id}
                className="min-h-0! min-w-[260px] max-w-[260px] p-4 shrink-0 shadow-none"
              >
                <Flex className="gap-3">
                  <h3 className="text-xs md:text-sm font-semibold text-center">{user.name}</h3>

                  <p className="text-[0.65rem] md:text-xs text-gray-600 dark:text-gray-400 text-center">
                    Aguardando aprovação
                  </p>

                  <Flex className="flex-row gap-2 mt-2">
                    <Button
                      onClick={e => {
                        e.preventDefault();
                        handleRefuseUser(user.id);
                      }}
                      onMouseDown={e => e.stopPropagation()}
                      className="flex-1"
                      variant="secondary"
                      isLoading={getUserLoadingAction(user.id) === 'refuse'}
                      disabled={getUserLoadingAction(user.id) === 'accept'}
                    >
                      Recusar
                    </Button>
                    <Button
                      onClick={e => {
                        e.preventDefault();
                        handleAcceptUser(user.id);
                      }}
                      onMouseDown={e => e.stopPropagation()}
                      className="flex-1"
                      isLoading={getUserLoadingAction(user.id) === 'accept'}
                      disabled={getUserLoadingAction(user.id) === 'refuse'}
                    >
                      Aceitar
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
            <div className="absolute left-0 top-0 bottom-0 w-4 bg-linear-to-r from-gray-400/70 dark:from-gray-600/70 to-transparent pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-4 bg-linear-to-l from-gray-400/70 dark:from-gray-600/70 to-transparent pointer-events-none" />
          </>
        )}
      </div>

      {/* Indicador de scroll */}
      {hasOverflow && (
        <p className="text-xs text-gray-100 dark:text-gray-800 text-center mt-2">
          ← Deslize para ver mais usuários ({users.length}) →
        </p>
      )}
    </div>
  );
};
