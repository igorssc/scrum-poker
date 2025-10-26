'use client';

import { useRoomCache } from '@/hooks/useRoomCache';
import { Box } from './Box';
import { Flex } from './Flex';
import Image from 'next/image';
import path from 'path';
import { useState, useEffect } from 'react';

export const UsersList = () => {
  const { cachedRoomData } = useRoomCache();
  const [flippingCards, setFlippingCards] = useState<Set<string>>(new Set());
  const [previousCardsOpen, setPreviousCardsOpen] = useState<boolean | undefined>(undefined);

  // Detectar mudança no cardsOpen para ativar animação
  useEffect(() => {
    const currentCardsOpen = cachedRoomData?.data?.cards_open;
    
    if (previousCardsOpen === false && currentCardsOpen === true) {
      // Cartas foram reveladas - iniciar animação de flip
      const votedMemberIds = cachedRoomData?.data?.members
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
            <p className="text-gray-600 dark:text-gray-400 text-center">
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

  // Organizar membros baseado no estado das cartas
  const organizedMembers = cardsOpen 
    ? // Cartas abertas: agrupar por voto
      loggedMembers.sort((a, b) => {
        // Primeiro: membros que votaram, agrupados por voto
        if (a.vote && b.vote) {
          return a.vote.localeCompare(b.vote);
        }
        // Segundo: membros que votaram vêm antes dos que não votaram
        if (a.vote && !b.vote) return -1;
        if (!a.vote && b.vote) return 1;
        // Terceiro: entre os que não votaram, ordem alfabética
        return a.member.name.localeCompare(b.member.name);
      })
    : // Cartas fechadas: ordem alfabética por nome
      loggedMembers.sort((a, b) => a.member.name.localeCompare(b.member.name));

  return (
    <div>
      {/* Membros Logados */}
      {organizedMembers.length > 0 && (
        <Box className="min-h-fit max-w-full p-6">
          <Flex className="gap-4">
            <h3 className="text-xl font-bold text-center">
              Membros Ativos ({organizedMembers.length})
            </h3>
            
            <div className="w-full space-y-3">
              {organizedMembers.map((member, index) => {
                const hasVoted = !!member.vote;
                const isFlipping = flippingCards.has(member.id);
                
                // Verificar se é um novo grupo de voto (apenas quando cartas estão abertas)
                const isNewVoteGroup = cardsOpen && member.vote && (
                  index === 0 || // Primeiro item com voto
                  (organizedMembers[index - 1].vote !== member.vote) // Mudança de voto
                );
                
                // Determinar o que mostrar baseado no estado das cartas
                let voteDisplay = null;
                let statusText = cardsOpen ? '' : 'Aguardando voto';
                
                if (hasVoted) {
                  if (cardsOpen) {
                    // Cartas reveladas - mostrar a carta real ou animação de flip
                    voteDisplay = (
                      <div className="flex items-center gap-2">
                        <div className={`relative w-8 h-12 ${isFlipping ? 'flip-container' : ''}`}>
                          {isFlipping ? (
                            <>
                              {/* Verso da carta - primeira metade da animação */}
                              <div className="flip-card-front">
                                <Image
                                  alt="Card back"
                                  src="/assets/cards/nature/verse.svg"
                                  width={32}
                                  height={48}
                                  className="w-8 h-12 rounded"
                                />
                              </div>
                              {/* Carta real - segunda metade da animação */}
                              <div className="flip-card-back">
                                <Image
                                  alt={`Card ${member.vote}`}
                                  src={path.join('assets', 'cards', member.vote)}
                                  width={32}
                                  height={48}
                                  className="w-8 h-12 rounded"
                                />
                              </div>
                            </>
                          ) : (
                            // Após o flip, mostrar a carta real
                            <Image
                              alt={`Card ${member.vote}`}
                              src={path.join('assets', 'cards', member.vote)}
                              width={32}
                              height={48}
                              className="w-8 h-12 rounded"
                            />
                          )}
                        </div>
                      </div>
                    );
                    statusText = ``;
                  } else {
                    // Cartas não reveladas - mostrar o verso
                    voteDisplay = (
                      <div className="relative w-8 h-12">
                        <Image
                          alt="Card back"
                          src="/assets/cards/nature/verse.svg"
                          width={32}
                          height={48}
                          className="w-8 h-12 rounded"
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
                      <div className={`flex items-center gap-2 mb-2 ${index > 0 ? 'mt-4' : ''}`}>
                        <div className="h-px bg-gray-300 dark:bg-gray-600 flex-1"></div>
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 px-2">
                          {member.vote.split('/').pop()?.split('.')[0] || member.vote}
                        </span>
                        <div className="h-px bg-gray-300 dark:bg-gray-600 flex-1"></div>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
                      <div className="flex flex-col flex-1">
                        <span className="font-medium">
                          {member.member.name}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {statusText}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        {voteDisplay}
                        <div className="w-3 h-3 bg-green-500 rounded-full" title="Online"></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
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
    </ div>
  );
};