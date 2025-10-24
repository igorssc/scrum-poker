import { useState } from "react";
import { useContextSelector } from "use-context-selector";
import { Button } from "./Button";
import { RoomContext } from "@/context/RoomContext";
import { AcceptUsers } from "./AcceptUsers";
import { useQueryClient } from "@tanstack/react-query";
import { MemberProps } from "@/protocols/Member";
import { RoomProps } from "@/protocols/Room";
import { UsersList } from "./UsersList";
import { Modal } from "./Modal";
import { SettingsModalContent } from "./SettingsModalContent";
import { useRoomCache } from "@/hooks/useRoomCache";

export const Board = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const { room, user, logout } = useContextSelector(
      RoomContext,
      (context) => ({
        room: context.room,
        user: context.user,
        logout: context.logout,
        tabId: context.tabId,
      }),
    );

  const queryClient = useQueryClient();
  const { cachedRoomData } = useRoomCache();
  
  const data = queryClient.getQueryData<{ data: { members: MemberProps[] } & RoomProps }>(['room', room?.id]);
  
  // Encontrar os dados do usuário atual nos membros da sala
  const userMember = cachedRoomData?.data?.members?.find(member => member.member.id === user?.id);

  return (
    <div className="w-[1200px] max-w-[95%] p-4 sm:p-10 bg-gray-400/70">
      <header className="flex items-center justify-between mb-6 p-4 bg-white/80 dark:bg-gray-800/80 rounded-lg shadow-sm backdrop-blur-sm">
        {/* Informações do usuário e sala */}
        <div className="flex flex-col">
          <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            {cachedRoomData?.data?.name || 'Carregando...'}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Olá, {userMember?.member.name || 'Usuário'}
            {room?.owner_id === user?.id && (
              <span className="ml-2 px-2 py-1 text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded">
                Proprietário
              </span>
            )}
          </p>
        </div>

        {/* Botões de ação */}
        <div className="flex gap-2">
          <Button
            onClick={() => setIsSettingsOpen(true)}
            className="bg-gray-600 hover:bg-gray-700 focus:ring-gray-500"
            title="Configurações"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </Button>
          
          <Button 
            onClick={() => logout()}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
            title="Sair da sala"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </Button>
        </div>
      </header>

      <main>
        {(!data?.data.private || room?.owner_id === user?.id) && <AcceptUsers />}
        <UsersList/>
      </main>

      {/* Modal de Configurações */}
      <Modal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        title="Configurações da Sala"
      >
        <SettingsModalContent onClose={() => setIsSettingsOpen(false)} />
      </Modal>
    </div>
  );
}