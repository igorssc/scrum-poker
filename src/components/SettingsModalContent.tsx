'use client';

import { useContextSelector } from 'use-context-selector';
import { RoomContext } from '@/context/RoomContext';
import { useRoomCache } from '@/hooks/useRoomCache';
import { Button } from './Button';
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
    { value: 'primary', label: 'Primary (Padrão)' },
    { value: 'dark', label: 'Dark' },
    { value: 'light', label: 'Light' },
    { value: 'retro', label: 'Retro' },
  ];

  // PATCH sala
  const patchRoomMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/rooms/${room?.id}?user_id=${user?.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Erro ao salvar sala');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['room', room?.id] });
    },
  });

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
        await patchRoomMutation.mutateAsync({
          name: roomName,
          theme,
        });
      }
      // Só owner pode mudar privacidade
      if (room?.owner_id === user?.id && isPrivate !== !!room?.private) {
        await patchRoomMutation.mutateAsync({
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
    <div className="grid grid-rows-[1fr_auto] h-full max-h-[80vh] w-full max-w-lg mx-auto">
      <form
        className="grid grid-rows-[1fr_auto] min-h-0"
        onSubmit={e => {
          e.preventDefault();
          handleSaveAll();
        }}
      >
        {/* Conteúdo com scroll */}
        <div className="overflow-y-auto min-h-0">
          <div className="px-6 pt-6 pb-2">
            <div className="flex flex-col gap-6">
            {/* Nome do usuário */}
            <div className="flex flex-col gap-2">
              <label className="text-gray-600 dark:text-gray-400">Seu nome:</label>
              <input
                type="text"
                value={userName}
                onChange={e => setUserName(e.target.value)}
                className="px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>
            {/* Nome da sala */}
            <div className="flex flex-col gap-2">
              <label className="text-gray-600 dark:text-gray-400">Nome da sala:</label>
              <input
                type="text"
                value={roomName}
                onChange={e => setRoomName(e.target.value)}
                className={twMerge(
                  'px-3 py-2 rounded-md border',
                  canEditRoom ? 'border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100' : 'border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-900 text-gray-400 dark:text-gray-500 opacity-70'
                )}
                disabled={!canEditRoom}
              />
            </div>
            {/* Tema da sala */}
            <div className="flex flex-col gap-2">
              <label className="text-gray-600 dark:text-gray-400">Tema da sala:</label>
              <select
                value={theme}
                onChange={e => setTheme(e.target.value)}
                className={twMerge(
                  'px-3 py-2 rounded-md border',
                  canEditRoom ? 'border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100' : 'border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-900 text-gray-400 dark:text-gray-500 opacity-70'
                )}
                disabled={!canEditRoom}
              >
                {themeOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            {/* Privacidade */}
            <div className="flex items-center justify-between gap-3">
              <label className="text-gray-600 dark:text-gray-400">Sala privada:</label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className={twMerge(
                    'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                    isPrivate ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-700',
                    room?.owner_id !== user?.id ? 'opacity-60 cursor-not-allowed' : ''
                  )}
                  onClick={() => room?.owner_id === user?.id && setIsPrivate(v => !v)}
                  disabled={room?.owner_id !== user?.id}
                  aria-pressed={isPrivate}
                >
                  <span
                    className={twMerge(
                      'inline-block h-5 w-5 transform rounded-full bg-white transition-transform',
                      isPrivate ? 'translate-x-5' : 'translate-x-1'
                    )}
                  />
                </button>
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {isPrivate ? 'Privada' : 'Pública'}
                </span>
              </div>
            </div>
              {/* Localização da sala */}
              <LocationSection room={room} user={user} />
            </div>
          </div>
        </div>

        {/* Erro e botões fixos no rodapé */}
        <div className="px-6 pb-6 pt-2">
          {error && (
            <div className="text-center text-sm text-red-600 dark:text-red-400 mb-4">
              {error}
            </div>
          )}
          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="px-6"
            >
              Fechar
            </Button>
            <Button
              type="submit"
              className="bg-purple-600 hover:bg-purple-700 focus:ring-purple-500 px-6"
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