'use client';

import { useRoomCache } from '@/hooks/useRoomCache';
import { Box } from './Box';
import { Flex } from './Flex';

export const UsersList = () => {
  const { cachedRoomData } = useRoomCache();

  if (!cachedRoomData?.data.members) {
    return (
      <Flex className="gap-4">
        <Box className="min-h-fit max-w-[400px] p-6">
          <Flex>
            <p className="text-gray-600 dark:text-gray-400 text-center">
              Carregando membros da sala...
            </p>
          </Flex>
        </Box>
      </Flex>
    );
  }

  const members = cachedRoomData.data.members;
  const loggedMembers = members.filter(member => member.status === 'LOGGED');
  const pendingMembers = members.filter(member => member.status === 'PENDING');

  return (
    <Flex className="gap-6">
      {/* Membros Logados */}
      {loggedMembers.length > 0 && (
        <Box className="min-h-fit max-w-[400px] p-6">
          <Flex className="gap-4">
            <h3 className="text-xl font-bold text-center">
              Membros Ativos ({loggedMembers.length})
            </h3>
            
            <div className="w-full space-y-3">
              {loggedMembers.map((member) => (
                <div 
                  key={member.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700"
                >
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {member.member.name}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {member.vote ? `Votou: ${member.vote}` : 'Aguardando voto'}
                    </span>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full" title="Online"></div>
                  </div>
                </div>
              ))}
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
    </Flex>
  );
};