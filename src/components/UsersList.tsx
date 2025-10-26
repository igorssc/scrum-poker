'use client';

import { useRoomCache } from '@/hooks/useRoomCache';
import { Box } from './Box';
import { Flex } from './Flex';
import Image from 'next/image';
import path from 'path';

export const UsersList = () => {
  const { cachedRoomData } = useRoomCache();

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

  return (
    <div>
      {/* Membros Logados */}
      {loggedMembers.length > 0 && (
        <Box className="min-h-fit max-w-full p-6">
          <Flex className="gap-4">
            <h3 className="text-xl font-bold text-center">
              Membros Ativos ({loggedMembers.length})
            </h3>
            
            <div className="w-full space-y-3">
              {loggedMembers.map((member) => {
                const hasVoted = !!member.vote;
                
                // Determinar o que mostrar baseado no estado das cartas
                let voteDisplay = null;
                let statusText = 'Aguardando voto';
                
                if (hasVoted) {
                  if (cardsOpen) {
                    // Cartas reveladas - mostrar a carta real
                    voteDisplay = (
                      <div className="flex items-center gap-2">
                        <Image
                          alt={`Card ${member.vote}`}
                          src={path.join('assets', 'cards', member.vote)}
                          width={32}
                          height={48}
                          className="w-8 h-12 rounded"
                        />
                      </div>
                    );
                    statusText = `Votou: ${member.vote}`;
                  } else {
                    // Cartas não reveladas - mostrar o verso
                    voteDisplay = (
                      <Image
                        alt="Card back"
                        src="/assets/cards/nature/verse.svg"
                        width={32}
                        height={48}
                        className="w-8 h-12 rounded"
                      />
                    );
                    statusText = 'Já votou';
                  }
                }
                
                return (
                  <div 
                    key={member.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700"
                  >
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