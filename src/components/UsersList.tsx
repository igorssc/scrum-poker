'use client';

import { RoomContext } from '@/context/RoomContext';
import { useRoomCache } from '@/hooks/useRoomCache';
import api from '@/services/api';
import { handleApiError, showSuccessToast } from '@/utils/errorHandler';
import * as Popover from '@radix-ui/react-popover';
import { useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import path from 'path';
import { useEffect, useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import { twMerge } from 'tailwind-merge';
import { useContext } from 'use-context-selector';
import { Box } from './Box';
import { Flex } from './Flex';
import { Modal } from './Modal';
import { RemoveUserModalContent } from './RemoveUserModalContent';

export const UsersList = () => {
  const { cachedRoomData } = useRoomCache();
  const { room, user, acceptUser, refuseUser, isAcceptingUser, isRefusingUser } =
    useContext(RoomContext);
  const queryClient = useQueryClient();
  const [flippingCards, setFlippingCards] = useState<Set<string>>(new Set());
  const [previousCardsOpen, setPreviousCardsOpen] = useState<boolean | undefined>(undefined);
  const [removingUsers, setRemovingUsers] = useState<Set<string>>(new Set());
  const [userToRemove, setUserToRemove] = useState<{ id: string; name: string } | null>(null);
  const [openPopover, setOpenPopover] = useState<string | null>(null);

  // Detectar mudança no cardsOpen para ativar animação
  useEffect(() => {
    const currentCardsOpen = cachedRoomData?.data?.cards_open;

    if (previousCardsOpen === false && currentCardsOpen === true) {
      // Cartas foram reveladas - iniciar animação de flip
      const votedMemberIds =
        cachedRoomData?.data?.members
          ?.filter(member => member.status === 'LOGGED' && member.vote)
          ?.map(member => member.id) || [];

      setFlippingCards(new Set(votedMemberIds));

      // Remover estado de flip após a animação
      setTimeout(() => {
        setFlippingCards(new Set());
      }, 600); // Duração da animação
    }

    setPreviousCardsOpen(currentCardsOpen);
  }, [cachedRoomData?.data?.cards_open, cachedRoomData?.data?.members, previousCardsOpen]);

  if (!cachedRoomData?.data.members) {
    return (
      <div>
        <Box className="min-h-fit max-w-full p-6">
          <Flex>
            <p className="text-gray-600 dark:text-gray-400 text-center text-sm md:text-md xl:text-lg">
              Carregando membros da sala...
            </p>
          </Flex>
        </Box>
      </div>
    );
  }

  const members = cachedRoomData.data.members;
  const loggedMembers = members.filter(member => member.status === 'LOGGED');
  const pendingMembers = members.filter(member => member.status === 'PENDING');
  const cardsOpen = cachedRoomData?.data?.cards_open;

  // Verificar se o usuário atual é o owner
  const isOwner = room?.owner_id === user?.id;

  const userCanAcceptActions =
    isOwner || cachedRoomData.data?.who_can_aprove_entries.includes(user?.id || '');

  // Função para confirmar remoção do usuário
  const confirmRemoveUser = async () => {
    if (!room?.id || !user?.id || !userToRemove || removingUsers.has(userToRemove.id)) return;

    setRemovingUsers(prev => new Set(prev).add(userToRemove.id));

    try {
      await api.post(`/rooms/${room.id}/sign-out`, {
        user_id: userToRemove.id,
        user_action_id: user.id,
      });

      queryClient.setQueryData(['room', room.id], (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          data: {
            ...oldData.data,
            members: oldData.data.members.filter(
              (member: any) => member.member.id !== userToRemove.id
            ),
          },
        };
      });

      queryClient.invalidateQueries({ queryKey: ['room', room.id] });

      showSuccessToast('Usuário removido com sucesso!');
    } catch (error) {
      handleApiError(error, 'Erro ao remover usuário');
    } finally {
      setRemovingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userToRemove.id);
        return newSet;
      });
      setUserToRemove(null);
    }
  };

  // Função para cancelar remoção
  const cancelRemoveUser = () => {
    setUserToRemove(null);
  };

  // Função para extrair o valor da carta
  const getCardValue = (vote: string) => {
    return vote.split('/').pop()?.split('.')[0] || vote;
  };

  // Organizar membros baseado no estado das cartas
  const organizedMembers = cardsOpen
    ? // Cartas abertas: agrupar por voto com ordenação sofisticada
      loggedMembers.sort((a, b) => {
        // Separar membros que votaram dos que não votaram
        if (a.vote && !b.vote) return -1;
        if (!a.vote && b.vote) return 1;
        if (!a.vote && !b.vote) return a.member.name.localeCompare(b.member.name);

        // Ambos votaram - ordenar por tipo de voto
        const valueA = getCardValue(a.vote!);
        const valueB = getCardValue(b.vote!);

        const numA = parseFloat(valueA);
        const numB = parseFloat(valueB);

        const isNumA = !isNaN(numA);
        const isNumB = !isNaN(numB);

        // Números primeiro, ordenados do menor para o maior
        if (isNumA && isNumB) {
          return numA - numB;
        }

        // Números vêm antes de strings
        if (isNumA && !isNumB) return -1;
        if (!isNumA && isNumB) return 1;

        // Ambos são strings - ordem alfabética
        return valueA.localeCompare(valueB);
      })
    : // Cartas fechadas: ordem alfabética por nome
      loggedMembers.sort((a, b) => a.member.name.localeCompare(b.member.name));

  return (
    <div>
      {/* Container único para ambos os tipos de usuários */}
      {(pendingMembers.length > 0 || organizedMembers.length > 0) && (
        <Box className="min-h-0! max-h-fit! max-w-full p-3 sm:p-4 md:p-4 lg:p-5">
          <Flex className="gap-2 sm:gap-3 md:gap-4">
            {/* Usuários Pendentes */}
            {pendingMembers.length > 0 && (
              <div className="w-full">
                <h3 className="text-xs md:text-sm xl:text-md font-medium text-center mb-3 sm:mb-4 md:mb-4 lg:mb-5">
                  Usuários Pendentes ({pendingMembers.length})
                </h3>
                <div className="w-full space-y-2 mb-4">
                  {pendingMembers.map(member => (
                    <div key={member.id}>
                      <div className="group flex items-center justify-between p-2 sm:p-2.5 md:p-2.5 text-[0.65rem] md:text-xs lg:text-sm rounded-lg min-h-8 sm:min-h-9 md:min-h-10 transition-colors bg-orange-50 dark:bg-orange-800/10 border border-orange-200 dark:border-orange-800/50">
                        <div className="flex items-center flex-1 gap-2 min-w-0">
                          {/* Bolinha laranja para usuários pendentes */}
                          <div
                            className="w-2 h-2 rounded-full animate-glow-pulse shrink-0 bg-orange-500"
                            title="Aguardando aprovação"
                          ></div>

                          <div className="flex flex-col flex-1 min-w-0 overflow-hidden mr-4">
                            <span className="font-medium truncate">{member.member.name}</span>
                            <span className="text-[80%] text-orange-600 dark:text-orange-300 truncate">
                              Aguardando aprovação
                            </span>
                          </div>
                        </div>

                        {/* Botões de Aceitar/Recusar - apenas para o owner */}
                        {userCanAcceptActions && (
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => acceptUser(member.member.id)}
                              disabled={isAcceptingUser || isRefusingUser}
                              className="cursor-pointer p-1.5 rounded-full bg-green-200 hover:bg-green-300 dark:bg-green-800/50 dark:hover:bg-green-700/60 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Aceitar usuário"
                            >
                              {isAcceptingUser ? (
                                <div className="w-3 h-3 border border-green-700 dark:border-green-300 border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                <svg
                                  className="w-3 h-3 text-green-700 dark:text-green-300"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              )}
                            </button>
                            <button
                              onClick={() => refuseUser(member.member.id)}
                              disabled={isAcceptingUser || isRefusingUser}
                              className="cursor-pointer p-1.5 rounded-full bg-red-200 hover:bg-red-300 dark:bg-red-800/50 dark:hover:bg-red-700/60 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Recusar usuário"
                            >
                              {isRefusingUser ? (
                                <div className="w-3 h-3 border border-red-700 dark:border-red-300 border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                <svg
                                  className="w-3 h-3 text-red-700 dark:text-red-300"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                  />
                                </svg>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Separador entre pendentes e ativos */}
            {pendingMembers.length > 0 && organizedMembers.length > 0 && (
              <div className="w-full -mt-2">
                <div className="h-px bg-gray-300 dark:bg-gray-600 my-2"></div>
              </div>
            )}

            {/* Usuários Ativos */}
            {organizedMembers.length > 0 && (
              <div className="w-full">
                <h3 className="flex items-center justify-center gap-2 w-full text-xs md:text-sm xl:text-md font-medium text-center mb-3 sm:mb-4 md:mb-4 lg:mb-5">
                  Usuários Ativos
                  <div className="flex items-center gap-1">
                    <span
                      className={twMerge(
                        'text-xs text-gray-500 dark:text-gray-400 bg-purple-100 dark:bg-gray-700 px-1.5 py-0.5 rounded-full text-[0.625rem]'
                      )}
                    >
                      {organizedMembers.length}
                    </span>
                  </div>
                </h3>

                <div className="w-full space-y-2">
                  {organizedMembers.map((member, index) => {
                    const hasVoted = !!member.vote;
                    const isFlipping = flippingCards.has(member.id);
                    const isCurrentUser = member.member.id === user?.id;

                    // Verificar se é um novo grupo de voto (apenas quando cartas estão abertas)
                    const previousMember = index > 0 ? organizedMembers[index - 1] : null;
                    const isNewVoteGroup =
                      cardsOpen &&
                      // Primeiro membro com voto
                      ((member.vote && (index === 0 || !previousMember?.vote)) ||
                        // Mudança de voto entre membros que votaram
                        (member.vote &&
                          previousMember?.vote &&
                          getCardValue(member.vote) !== getCardValue(previousMember.vote)) ||
                        // Primeiro membro sem voto (após membros que votaram)
                        (!member.vote && previousMember?.vote));

                    // Determinar o que mostrar baseado no estado das cartas
                    let voteDisplay = null;
                    let statusText = cardsOpen ? '' : 'Aguardando voto';

                    if (hasVoted) {
                      if (cardsOpen) {
                        // Cartas reveladas - mostrar a carta real ou animação de flip
                        voteDisplay = (
                          <div className="flex items-center gap-1.5">
                            <div
                              className={`relative w-5 h-7 sm:w-6 sm:h-8 md:w-6 md:h-9 ${isFlipping ? 'flip-container' : ''}`}
                            >
                              {isFlipping ? (
                                <>
                                  {/* Verso da carta - primeira metade da animação */}
                                  <div className="flip-card-front">
                                    <Image
                                      alt="Card back"
                                      src="/assets/cards/nature/verse.svg"
                                      width={24}
                                      height={36}
                                      className="w-5 h-7 sm:w-6 sm:h-8 md:w-6 md:h-9 rounded"
                                    />
                                  </div>
                                  {/* Carta real - segunda metade da animação */}
                                  <div className="flip-card-back">
                                    <Image
                                      alt={`Card ${member.vote}`}
                                      src={path.join('assets', 'cards', member.vote || '')}
                                      width={24}
                                      height={36}
                                      className="w-5 h-7 sm:w-6 sm:h-8 md:w-6 md:h-9 rounded"
                                    />
                                  </div>
                                </>
                              ) : (
                                // Após o flip, mostrar a carta real
                                <Image
                                  alt={`Card ${member.vote}`}
                                  src={path.join('assets', 'cards', member.vote || '')}
                                  width={24}
                                  height={36}
                                  className="w-5 h-7 sm:w-6 sm:h-8 md:w-6 md:h-9 rounded"
                                />
                              )}
                            </div>
                          </div>
                        );
                        statusText = ``;
                      } else {
                        // Cartas não reveladas - mostrar o verso
                        voteDisplay = (
                          <div className="relative w-5 h-7 sm:w-6 sm:h-8 md:w-6 md:h-9">
                            <Image
                              alt="Card back"
                              src="/assets/cards/nature/verse.svg"
                              width={24}
                              height={36}
                              className="w-5 h-7 sm:w-6 sm:h-8 md:w-6 md:h-9 rounded"
                            />
                          </div>
                        );
                        statusText = 'Já votou';
                      }
                    }

                    return (
                      <div key={member.id}>
                        {/* Separador de grupo de voto */}
                        {isNewVoteGroup && (
                          <div
                            className={`flex items-center gap-2 mb-1.5 md:mb-2 ${index > 0 ? 'mt-1.5 md:mt-2' : ''}`}
                          >
                            <div className="h-px bg-gray-300 dark:bg-gray-600 flex-1"></div>
                            <span className="text-xs font-medium text-gray-700 dark:text-gray-400 px-2">
                              {member.vote ? getCardValue(member.vote) : 'Não votaram'}
                            </span>
                            <div className="h-px bg-gray-300 dark:bg-gray-600 flex-1"></div>
                          </div>
                        )}

                        <div className="group flex items-center justify-between p-2 sm:p-2.5 md:p-2.5 text-[0.65rem] md:text-xs lg:text-sm rounded-lg min-h-8 sm:min-h-9 md:min-h-10 transition-colors bg-gray-100 dark:bg-gray-700 hover:bg-gray-200/60 dark:hover:bg-gray-600">
                          <div className="flex items-center flex-1 gap-2 min-w-0">
                            {/* Bolinha de status - posicionada à esquerda, centralizada */}
                            <div
                              className={twMerge(
                                'w-2 h-2 rounded-full animate-glow-pulse shrink-0',
                                cardsOpen
                                  ? hasVoted
                                    ? 'bg-green-500' // Revelado e votou - verde
                                    : 'bg-gray-400' // Revelado e não votou - cinza
                                  : hasVoted
                                    ? 'bg-green-500' // Não revelado mas votou - verde
                                    : 'bg-yellow-500' // Não revelado e não votou - amarelo (aguardando)
                              )}
                              title={
                                cardsOpen
                                  ? hasVoted
                                    ? 'Votou'
                                    : 'Não votou'
                                  : hasVoted
                                    ? 'Já votou'
                                    : 'Aguardando voto'
                              }
                            ></div>

                            <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                              <span className={twMerge('font-medium truncate mr-4')}>
                                {member.member.name}
                              </span>
                              <span className="text-[80%] text-gray-500 dark:text-gray-400 truncate">
                                {statusText}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 sm:gap-2 md:gap-2 min-w-8 sm:min-w-9 md:min-w-10 justify-end">
                            {voteDisplay || (
                              <div className="w-5 h-7 sm:w-6 sm:h-8 md:w-6 md:h-9"></div>
                            )}

                            {/* Dropdown de ações - aparece para os usuários com permissão em todos os membros */}
                            {userCanAcceptActions && (
                              <Popover.Root
                                open={openPopover === member.id}
                                onOpenChange={open => setOpenPopover(open ? member.id : null)}
                              >
                                <Popover.Trigger asChild>
                                  <button
                                    disabled={removingUsers.has(member.member.id)}
                                    className="cursor-pointer p-1 text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300 transition-all duration-200 disabled:opacity-30 shrink-0 rounded-full"
                                    title="Opções do usuário"
                                  >
                                    <svg
                                      className="w-4 h-4"
                                      fill="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                                    </svg>
                                  </button>
                                </Popover.Trigger>

                                <Popover.Portal>
                                  <Popover.Content
                                    className="w-40 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 overflow-hidden"
                                    side="bottom"
                                    align="end"
                                    sideOffset={8}
                                    onOpenAutoFocus={e => e.preventDefault()}
                                  >
                                    <div className="py-1">
                                      <button
                                        onClick={() => {
                                          // Só permite remoção se não for o próprio owner ou o próprio usuário
                                          if (
                                            member.member.id !== user?.id &&
                                            room?.owner_id !== member.member.id
                                          ) {
                                            setUserToRemove({
                                              id: member.member.id,
                                              name: member.member.name,
                                            });
                                            setOpenPopover(null);
                                          }
                                        }}
                                        disabled={
                                          removingUsers.has(member.member.id) ||
                                          member.member.id === user?.id ||
                                          room?.owner_id === member.member.id
                                        }
                                        className={twMerge(
                                          'w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors',
                                          member.member.id === user?.id ||
                                            room?.owner_id === member.member.id
                                            ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed'
                                            : 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer',
                                          'disabled:opacity-50 disabled:cursor-not-allowed'
                                        )}
                                        title={
                                          member.member.id === user?.id
                                            ? 'Você não pode remover a si mesmo'
                                            : 'Remover da sala'
                                        }
                                      >
                                        <FaTimes className="w-3 h-3" />
                                        Remover da sala
                                      </button>
                                    </div>
                                  </Popover.Content>
                                </Popover.Portal>
                              </Popover.Root>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </Flex>
        </Box>
      )}

      {/* Estado vazio */}
      {members.length === 0 && (
        <Box className="min-h-fit max-w-[400px] p-6">
          <Flex>
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Sala vazia</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Nenhum membro encontrado nesta sala.
              </p>
            </div>
          </Flex>
        </Box>
      )}

      {/* Modal de confirmação de remoção */}
      <Modal isOpen={!!userToRemove} onClose={cancelRemoveUser} title="Remover Usuário">
        {userToRemove && (
          <RemoveUserModalContent
            userName={userToRemove.name}
            isRemoving={removingUsers.has(userToRemove.id)}
            onConfirm={confirmRemoveUser}
            onCancel={cancelRemoveUser}
          />
        )}
      </Modal>
    </div>
  );
};
