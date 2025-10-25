'use client';

import { useContextSelector } from 'use-context-selector';
import { RoomContext } from '@/context/RoomContext';
import { useRoomCache } from '@/hooks/useRoomCache';
import { Button } from './Button';
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
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [addressLoading, setAddressLoading] = useState(false);
  const queryClient = useQueryClient();

  // Revalida dados do modal ao abrir
  // (reage a mudanças de room ou userMember)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    setRoomName(room?.name || '');
    setIsPrivate(!!room?.private);
    setTheme(room?.theme || 'primary');
    setUserName(userMember?.member.name || '');
    
    // Converte coordenadas para endereço quando a sala tem localização
    if (room?.lat && room?.lng) {
      fetchAddress(room.lat, room.lng);
    } else {
      setAddress(null);
    }
  }, [room?.name, room?.private, room?.theme, userMember?.member.name, room?.lat, room?.lng]);

  // Converte coordenadas para endereço usando geocoding reverso (Nominatim - gratuito)
  const fetchAddress = async (lat: number, lng: number) => {
    setAddressLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=pt&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'ScrumPoker/1.0'
          }
        }
      );
      const data = await response.json();
      
      if (data.display_name) {
        setAddress(data.display_name);
      } else {
        setAddress('Endereço não encontrado');
      }
    } catch (error) {
      console.error('Erro ao buscar endereço:', error);
      setAddress('Erro ao buscar endereço');
    } finally {
      setAddressLoading(false);
    }
  };

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

  // Atualiza localização da sala
  const handleUpdateLocation = async () => {
    setLocationLoading(true);
    setLocationError(null);
    try {
      const { coords } = await new Promise<{ coords: { latitude: number; longitude: number } }>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });
      const { latitude, longitude } = coords;
      await patchRoomMutation.mutateAsync({
        lat: latitude,
        lng: longitude,
      });
      
      // Busca o endereço das novas coordenadas
      await fetchAddress(latitude, longitude);
      
      queryClient.invalidateQueries({ queryKey: ['room', room?.id] });
    } catch (err: any) {
      setLocationError(err.message || 'Erro ao atualizar localização');
    } finally {
      setLocationLoading(false);
    }
  };

  return (
    <form
      className="w-full max-w-lg mx-auto p-4 flex flex-col gap-8"
      onSubmit={e => {
        e.preventDefault();
        handleSaveAll();
      }}
    >
      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 text-center">
        Configurações da Sala
      </h3>
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
        <div className="flex flex-col gap-2">
          <label className="text-gray-600 dark:text-gray-400">Localização da sala:</label>
          {room?.lat && room?.lng ? (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-4 h-4 text-green-600 dark:text-green-400"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 17.642 4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                <span className="font-mono">
                  {room.lat.toFixed(6)}, {room.lng.toFixed(6)}
                </span>
              </div>
              {addressLoading ? (
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-3 h-3 animate-spin"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                  </svg>
                  Buscando endereço...
                </div>
              ) : address ? (
                <div className="text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 p-2 rounded-md">
                  {address}
                </div>
              ) : null}
            </div>
          ) : (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Nenhuma localização definida
            </div>
          )}
          <button
            type="button"
            onClick={handleUpdateLocation}
            disabled={locationLoading}
            className={twMerge(
              'text-left text-sm text-blue-600 dark:text-blue-400 hover:underline transition-colors cursor-pointer',
              locationLoading ? 'opacity-60 cursor-not-allowed' : ''
            )}
          >
            {locationLoading ? (
              <span className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-4 h-4 animate-spin"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
                Atualizando localização...
              </span>
            ) : (
              'Atualizar localização'
            )}
          </button>
          {locationError && (
            <span className="text-xs text-red-600 dark:text-red-400">
              {locationError}
            </span>
          )}
        </div>
      </div>
      {error && (
        <div className="text-center text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}
      <div className="flex gap-3 justify-end mt-2">
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
    </form>
  );
};