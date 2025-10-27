'use client';

import { useRoomCache } from '@/hooks/useRoomCache';
import { Box } from './Box';
import { Flex } from './Flex';
import Image from 'next/image';
import path from 'path';
import { useState, useEffect } from 'react';
import { twMerge } from 'tailwind-merge';

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
      {/* Membros Logados */}
      {organizedMembers.length > 0 && (
        <Box className="min-h-0! max-w-full p-3 sm:p-4 md:p-6 lg:p-8">
          <Flex className="gap-3 sm:gap-4 md:gap-6 lg:gap-8">
            <h3 className="text-xs md:text-sm xl:text-md font-bold text-center">
              Membros Ativos ({organizedMembers.length})
            </h3>
            
            <div className="w-full space-y-3">
              {organizedMembers.map((member, index) => {
                const hasVoted = !!member.vote;
                const isFlipping = flippingCards.has(member.id);
                
                // Verificar se é um novo grupo de voto (apenas quando cartas estão abertas)
                const isNewVoteGroup = cardsOpen && (
                  // Primeiro membro com voto
                  (member.vote && (index === 0 || !organizedMembers[index - 1].vote)) ||
                  // Mudança de voto entre membros que votaram
                  (member.vote && organizedMembers[index - 1].vote && 
                   getCardValue(member.vote) !== getCardValue(organizedMembers[index - 1].vote!)) ||
                  // Primeiro membro sem voto (após membros que votaram)
                  (!member.vote && organizedMembers[index - 1].vote)
                );
                
                // Determinar o que mostrar baseado no estado das cartas
                let voteDisplay = null;
                let statusText = cardsOpen ? '' : 'Aguardando voto';
                
                if (hasVoted) {
                  if (cardsOpen) {
                    // Cartas reveladas - mostrar a carta real ou animação de flip
                    voteDisplay = (
                      <div className="flex items-center gap-2">
                        <div className={`relative w-6 h-8 sm:w-7 sm:h-10 md:w-8 md:h-12 ${isFlipping ? 'flip-container' : ''}`}>
                          {isFlipping ? (
                            <>
                              {/* Verso da carta - primeira metade da animação */}
                              <div className="flip-card-front">
                                <Image
                                  alt="Card back"
                                  src="/assets/cards/nature/verse.svg"
                                  width={32}
                                  height={48}
                                  className="w-6 h-8 sm:w-7 sm:h-10 md:w-8 md:h-12 rounded"
                                />
                              </div>
                              {/* Carta real - segunda metade da animação */}
                              <div className="flip-card-back">
                                <Image
                                  alt={`Card ${member.vote}`}
                                  src={path.join('assets', 'cards', member.vote)}
                                  width={32}
                                  height={48}
                                  className="w-6 h-8 sm:w-7 sm:h-10 md:w-8 md:h-12 rounded"
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
                              className="w-6 h-8 sm:w-7 sm:h-10 md:w-8 md:h-12 rounded"
                            />
                          )}
                        </div>
                      </div>
                    );
                    statusText = ``;
                  } else {
                    // Cartas não reveladas - mostrar o verso
                    voteDisplay = (
                      <div className="relative w-6 h-8 sm:w-7 sm:h-10 md:w-8 md:h-12">
                        <Image
                          alt="Card back"
                          src="/assets/cards/nature/verse.svg"
                          width={32}
                          height={48}
                          className="w-6 h-8 sm:w-7 sm:h-10 md:w-8 md:h-12 rounded"
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
                      <div className={`flex items-center gap-2 mb-2 md:mb-4 ${index > 0 ? 'mt-2 md:mt-4' : ''}`}>
                        <div className="h-px bg-gray-300 dark:bg-gray-600 flex-1"></div>
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-400 px-2">
                          {member.vote ? getCardValue(member.vote) : 'Não votaram'}
                        </span>
                        <div className="h-px bg-gray-300 dark:bg-gray-600 flex-1"></div>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between p-2 sm:p-3 text-[0.65rem] md:text-xs lg:text-sm rounded-lg bg-gray-100 dark:bg-gray-700 min-h-8 sm:min-h-10 md:min-h-12">
                      <div className="flex flex-col flex-1">
                        <span className="font-medium">
                          {member.member.name}
                        </span>
                        <span className="text-[80%] text-gray-500 dark:text-gray-400">
                          {statusText}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 sm:gap-3 min-w-8 sm:min-w-10 md:min-w-12 justify-end">
                        {voteDisplay || <div className="w-6 h-8 sm:w-7 sm:h-10 md:w-8 md:h-12"></div>}
                        <div 
                          className={twMerge(
                            'w-3 h-3 rounded-full animate-glow-pulse',
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