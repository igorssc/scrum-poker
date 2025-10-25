'use client';

import { useContextSelector } from 'use-context-selector';
import { RoomContext } from '@/context/RoomContext';
import { useRoomCache } from '@/hooks/useRoomCache';
import { Button } from './Button';
import { Flex } from './Flex';
import { twMerge } from 'tailwind-merge';

type SettingsModalContentProps = {
  onClose: () => void;
};

export const SettingsModalContent = ({ onClose }: SettingsModalContentProps) => {
  const { user, logout } = useContextSelector(RoomContext, (context) => ({
    user: context.user,
    logout: context.logout,
  }));
  
  const { cachedRoomData } = useRoomCache();
  const room = cachedRoomData?.data;
  
  // Encontrar os dados do usuário atual nos membros da sala
  const userMember = room?.members?.find(member => member.member.id === user?.id);

  const handleLogout = () => {
    logout();
    onClose();
  };

  return (
    <Flex className="gap-6">
      {/* Informações da Sala */}
      <div className="w-full">
        <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">
          Informações da Sala
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Nome:</span>
            <span className="font-medium">{room?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Tema:</span>
            <span className="font-medium">{room?.theme || 'Não definido'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Status:</span>
            <span className={twMerge("font-medium", room?.status === 'OPEN' ? "text-green-600" : "text-red-600")}>
              {room?.status === 'OPEN' ? 'Aberta' : 'Fechada'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Privada:</span>
            <span className="font-medium">
              {room?.private ? 'Sim' : 'Não'}
            </span>
          </div>
        </div>
      </div>

      {/* Informações do Usuário */}
      <div className="w-full">
        <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">
          Suas Informações
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Nome:</span>
            <span className="font-medium">{userMember?.member.name || 'Carregando...'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Você é:</span>
            <span className="font-medium">
              {room?.owner_id === user?.id ? 'Proprietário' : 'Membro'}
            </span>
          </div>
        </div>
      </div>

      {/* Ações */}
      <div className="w-full pt-4 border-t border-gray-200 dark:border-gray-700">
        <Flex className="gap-3">
          <Button 
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-500 w-full"
          >
            Sair da Sala
          </Button>
          
          <Button 
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-700 focus:ring-gray-500 w-full"
          >
            Fechar
          </Button>
        </Flex>
      </div>
    </Flex>
  );
};