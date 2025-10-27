'use client';

import { useContextSelector } from 'use-context-selector';
import { RoomContext } from '@/context/RoomContext';
import { useRoomCache } from '@/hooks/useRoomCache';
import { useRoomActions } from '@/hooks/useRoomActions';
import { Button } from './Button';
import { Input } from './Input';
import { Select } from './Select';
import { LocationSection } from './LocationSection';
import { twMerge } from 'tailwind-merge';
import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

type SettingsModalContentProps = {
  onClose: () => void;
};

export const SettingsModalContent = ({ onClose }: SettingsModalContentProps) => {
  const { user } = useContextSelector(RoomContext, (context) => ({
    user: context.user,
  }));
  const { cachedRoomData } = useRoomCache();
  const { updateRoom } = useRoomActions();
  const room = cachedRoomData?.data;
  const userMember = room?.members?.find(member => member.member.id === user?.id);

  // States para edição
  const [roomName, setRoomName] = useState(room?.name || '');
  const [isPrivate, setIsPrivate] = useState(!!room?.private);
  const [theme, setTheme] = useState(room?.theme || 'primary');
  const [userName, setUserName] = useState(userMember?.member.name || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Revalida dados do modal ao abrir
  // (reage a mudanças de room ou userMember)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    setRoomName(room?.name || '');
    setIsPrivate(!!room?.private);
    setTheme(room?.theme || 'primary');
    setUserName(userMember?.member.name || '');
  }, [room?.name, room?.private, room?.theme, userMember?.member.name]);

  // Temas fake
  const themeOptions = [
    { value: 'nature', label: 'Natureza (Padrão)' },
  ];

  // PATCH usuário
  const patchUserMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${user?.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Erro ao salvar usuário');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });

  // Permissões para campos
  const canEditRoom = !isPrivate || room?.owner_id === user?.id;
  const canEditPrivate = room?.owner_id === user?.id;

  // Decide o que salvar
  const handleSaveAll = async () => {
    setSaving(true);
    setError(null);
    try {
      // Permissões: se sala pública, qualquer usuário pode editar nome/tema; se privada, só owner
      const canEditRoom = !isPrivate || room?.owner_id === user?.id;
      if (canEditRoom && (roomName !== room?.name || theme !== room?.theme)) {
        await updateRoom({
          name: roomName,
          theme,
        });
      }
      // Só owner pode mudar privacidade
      if (room?.owner_id === user?.id && isPrivate !== !!room?.private) {
        await updateRoom({
          private: isPrivate,
        });
      }
      // Qualquer usuário pode alterar seu nome
      if (userName !== userMember?.member.name) {
        await patchUserMutation.mutateAsync({ name: userName });
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar alterações');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="h-full max-h-[80dvh] w-full mx-auto">
      <form
        className="min-h-0"
        onSubmit={e => {
          e.preventDefault();
          handleSaveAll();
        }}
      >
        <div className="min-h-0">
          <div className="pt-3 sm:pt-4 md:pt-5 lg:pt-6 pb-1 sm:pb-1.5 md:pb-2">
            <div className="flex flex-col gap-4 lg:gap-6">
              {/* Nome do usuário */}
              <Input
                label="Seu nome:"
                type="text"
                value={userName}
                onChange={e => setUserName(e.target.value)}
              />
              
              {/* Nome da sala */}
              <Input
                label="Nome da sala:"
                type="text"
                value={roomName}
                onChange={e => setRoomName(e.target.value)}
                disabled={!canEditRoom}
              />
              
              {/* Tema da sala */}
              <Select
                label="Tema da sala:"
                options={themeOptions}
                value={theme}
                onChange={setTheme}
                disabled={!canEditRoom || themeOptions.length < 2}
              />
              {/* Privacidade */}
              <div className="flex items-center justify-between gap-2 sm:gap-3">
                <label className={twMerge("text-[0.65rem] sm:text-xs text-gray-600 dark:text-gray-400 font-medium", !canEditRoom
                ? 'text-gray-400 dark:text-gray-500'
                : 'text-gray-700 dark:text-gray-300')}>Sala privada:</label>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <button
                    type="button"
                    className={twMerge(
                      'relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors',
                      isPrivate ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-700',
                      room?.owner_id !== user?.id ? 'opacity-60 cursor-not-allowed' : ''
                    )}
                    onClick={() => room?.owner_id === user?.id && setIsPrivate(v => !v)}
                    disabled={room?.owner_id !== user?.id}
                    aria-pressed={isPrivate}
                  >
                    <span
                      className={twMerge(
                        'inline-block h-4 w-4 sm:h-5 sm:w-5 transform rounded-full bg-white transition-transform',
                        isPrivate ? 'translate-x-4 sm:translate-x-5' : 'translate-x-0.5 sm:translate-x-1'
                      )}
                    />
                  </button>
                  <span className="text-[0.65rem] sm:text-xs text-gray-600 dark:text-gray-400">
                    {isPrivate ? 'Privada' : 'Pública'}
                  </span>
              </div>
            </div>

            <div className="text-[0.6rem] sm:text-[0.65rem] text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
              <p>
              <strong>Salas privadas</strong> requerem aprovação do proprietário para entrada e apenas ele pode modificar configurações; <strong>salas públicas</strong> permitem entrada livre via link e edição por qualquer membro, porém entrada via busca por distância ainda requer permissão.
              </p>
            </div>

            {/* Localização da sala */}
            <LocationSection room={room} user={user} />
            
            </div>
          </div>
        </div>

        {/* Erro e botões fixos no rodapé */}
        <div className="w-full pb-3 sm:pb-4 md:pb-5 lg:pb-6 pt-2">
          {error && (
            <div className="text-center text-[0.65rem] sm:text-xs text-red-600 dark:text-red-400 mb-2 sm:mb-3 md:mb-4">
              {error}
            </div>
          )}
          <div className="grid grid-cols-2 md:flex gap-2 sm:gap-3 justify-end pt-2 sm:pt-3 md:pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="px-3 sm:px-4 md:px-5 lg:px-6"
            >
              Fechar
            </Button>
            <Button
              type="submit"
              className="bg-purple-600 hover:bg-purple-700 focus:ring-purple-500 px-3 sm:px-4 md:px-5 lg:px-6"
              disabled={saving}
            >
              {saving ? 'Salvando...' : 'Salvar alterações'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};