'use client';

import { RoomContext } from '@/context/RoomContext';
import { useRoomActions } from '@/hooks/useRoomActions';
import { useRoomCache } from '@/hooks/useRoomCache';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { twMerge } from 'tailwind-merge';
import { useContextSelector } from 'use-context-selector';
import { Button } from './Button';
import { Input } from './Input';
import { LocationSection } from './LocationSection';
import { MultiSelect, MultiSelectOption } from './MultiSelect';
import { Select } from './Select';

type SettingsModalContentProps = {
  onClose: () => void;
};

export const SettingsModalContent = ({ onClose }: SettingsModalContentProps) => {
  const { user } = useContextSelector(RoomContext, context => ({
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
  const [lat, setLat] = useState<number | undefined>(room?.lat);
  const [lng, setLng] = useState<number | undefined>(room?.lng);
  const [whoCanEdit, setWhoCanEdit] = useState<string[]>(room?.who_can_edit || []);
  const [whoCanOpenCards, setWhoCanOpenCards] = useState<string[]>(room?.who_can_open_cards || []);
  const [whoCanApproveEntries, setWhoCanApproveEntries] = useState<string[]>(
    room?.who_can_aprove_entries || []
  );
  const [autoGrantPermissions, setAutoGrantPermissions] = useState(!!room?.auto_grant_permissions);
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
    setLat(room?.lat);
    setLng(room?.lng);
    setWhoCanEdit(room?.who_can_edit || []);
    setWhoCanOpenCards(room?.who_can_open_cards || []);
    setWhoCanApproveEntries(room?.who_can_aprove_entries || []);
    setAutoGrantPermissions(!!room?.auto_grant_permissions);
  }, [
    room?.name,
    room?.private,
    room?.theme,
    room?.lat,
    room?.lng,
    room?.who_can_edit,
    room?.who_can_open_cards,
    room?.who_can_aprove_entries,
    room?.auto_grant_permissions,
    userMember?.member.name,
  ]);

  // Temas fake
  const themeOptions = [
    { value: 'nature', label: 'Natureza (Padrão)' },
    { value: 'simple', label: 'Simples' },
    { value: 'cheap', label: 'Baralho' },
  ];

  // Opções dos membros para os MultiSelects
  const memberOptions: MultiSelectOption[] = (room?.members || [])
    .filter(member => member.status === 'LOGGED') // Apenas membros logados
    .map(member => ({
      value: member.member.id,
      label: `${member.member.name}${member.member.id === room?.owner_id ? ' (Proprietário)' : ''}`,
      disabled: member.member.id === room?.owner_id || member.member.id === user?.id, // Owner sempre está incluído
    }));

  // Garantir que o owner sempre esteja incluído nos valores
  const ensureOwnerIncluded = (values: string[]) => {
    const ownerId = room?.owner_id;
    return ownerId && !values.includes(ownerId) ? [...values, ownerId] : values;
  };

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

  const isOwner = room?.owner_id === user?.id;

  // Permissões para campos
  const userCanEditRoom = isOwner || cachedRoomData?.data?.who_can_edit.includes(user?.id || '');
  const userCanRevealAndClearCards =
    isOwner || cachedRoomData?.data?.who_can_open_cards.includes(user?.id || '');
  const userCanApproveEntries =
    isOwner || cachedRoomData?.data?.who_can_aprove_entries.includes(user?.id || '');

  // Decide o que salvar
  const handleSaveAll = async () => {
    setSaving(true);
    setError(null);
    try {
      // Garantir que o owner sempre esteja incluído nas permissões
      const ownerId = room?.owner_id;
      const finalWhoCanEdit =
        ownerId && !whoCanEdit.includes(ownerId) ? [...whoCanEdit, ownerId] : whoCanEdit;
      const finalWhoCanOpenCards =
        ownerId && !whoCanOpenCards.includes(ownerId)
          ? [...whoCanOpenCards, ownerId]
          : whoCanOpenCards;
      const finalWhoCanApproveEntries =
        ownerId && !whoCanApproveEntries.includes(ownerId)
          ? [...whoCanApproveEntries, ownerId]
          : whoCanApproveEntries;

      if (
        userCanEditRoom &&
        (roomName !== room?.name ||
          theme !== room?.theme ||
          lat !== room?.lat ||
          lng !== room?.lng ||
          autoGrantPermissions !== !!room?.auto_grant_permissions ||
          JSON.stringify(finalWhoCanEdit.sort()) !==
            JSON.stringify((room?.who_can_edit || []).sort()) ||
          JSON.stringify(finalWhoCanOpenCards.sort()) !==
            JSON.stringify((room?.who_can_open_cards || []).sort()) ||
          JSON.stringify(finalWhoCanApproveEntries.sort()) !==
            JSON.stringify((room?.who_can_aprove_entries || []).sort()))
      ) {
        const updateData: any = {};
        if (roomName !== room?.name) updateData.name = roomName;
        if (theme !== room?.theme) updateData.theme = theme;
        if (lat !== room?.lat) updateData.lat = lat;
        if (lng !== room?.lng) updateData.lng = lng;
        if (autoGrantPermissions !== !!room?.auto_grant_permissions) {
          updateData.auto_grant_permissions = autoGrantPermissions;
        }
        if (
          JSON.stringify(finalWhoCanEdit.sort()) !==
          JSON.stringify((room?.who_can_edit || []).sort())
        ) {
          updateData.who_can_edit = finalWhoCanEdit;
        }
        if (
          JSON.stringify(finalWhoCanOpenCards.sort()) !==
          JSON.stringify((room?.who_can_open_cards || []).sort())
        ) {
          updateData.who_can_open_cards = finalWhoCanOpenCards;
        }
        if (
          JSON.stringify(finalWhoCanApproveEntries.sort()) !==
          JSON.stringify((room?.who_can_aprove_entries || []).sort())
        ) {
          updateData.who_can_aprove_entries = finalWhoCanApproveEntries;
        }

        await updateRoom(updateData);

        // Atualizar cache manualmente com os novos dados da sala
        queryClient.setQueryData(['room', room?.id], (oldData: any) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            data: {
              ...oldData.data,
              ...updateData,
            },
          };
        });
      }
      // Só usuários com permissão podem mudar privacidade
      if (userCanEditRoom && isPrivate !== !!room?.private) {
        await updateRoom({
          private: isPrivate,
        });

        // Atualizar cache manualmente com a nova configuração de privacidade
        queryClient.setQueryData(['room', room?.id], (oldData: any) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            data: {
              ...oldData.data,
              private: isPrivate,
            },
          };
        });
      }
      // Qualquer usuário pode alterar seu nome
      if (userName !== userMember?.member.name) {
        await patchUserMutation.mutateAsync({ name: userName });

        // Atualizar cache manualmente com o novo nome do usuário
        queryClient.setQueryData(['room', room?.id], (oldData: any) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            data: {
              ...oldData.data,
              members: oldData.data.members.map((member: any) => {
                if (member.member.id === user?.id) {
                  return {
                    ...member,
                    member: {
                      ...member.member,
                      name: userName,
                    },
                  };
                }
                return member;
              }),
            },
          };
        });
      }
      onClose();
      toast.success('Sala atualizada com sucesso');
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
            <div className="flex flex-col gap-3 lg:gap-4">
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
                disabled={!userCanEditRoom}
              />

              {/* Tema da sala */}
              <Select
                label="Tema da sala:"
                options={themeOptions}
                value={theme}
                onChange={setTheme}
                disabled={!userCanEditRoom || themeOptions.length <= 1}
              />

              {/* Toggle para permissões automáticas */}
              <div className="flex items-center justify-between gap-2 sm:gap-3">
                <label
                  className={twMerge(
                    'text-[0.65rem] sm:text-xs text-gray-600 dark:text-gray-400 font-medium',
                    !isOwner
                      ? 'text-gray-400 dark:text-gray-500'
                      : 'text-gray-700 dark:text-gray-300'
                  )}
                >
                  Dar todas as permissões para todos os usuários:
                </label>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <button
                    type="button"
                    className={twMerge(
                      'relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors',
                      autoGrantPermissions ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-700',
                      !isOwner ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
                    )}
                    onClick={() => isOwner && setAutoGrantPermissions(v => !v)}
                    disabled={!isOwner}
                    aria-pressed={autoGrantPermissions}
                  >
                    <span
                      className={twMerge(
                        'inline-block h-4 w-4 sm:h-5 sm:w-5 transform rounded-full bg-white transition-transform',
                        autoGrantPermissions
                          ? 'translate-x-4 sm:translate-x-5'
                          : 'translate-x-0.5 sm:translate-x-1'
                      )}
                    />
                  </button>
                  <span
                    className={twMerge(
                      'text-[0.65rem] sm:text-xs text-gray-600 dark:text-gray-400',
                      !isOwner ? 'opacity-60' : ''
                    )}
                  >
                    {autoGrantPermissions ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
              </div>

              <div className="text-[0.6rem] sm:text-[0.65rem] text-gray-500 dark:text-gray-400 leading-relaxed">
                <p>
                  Quando ativo, todos os usuários atuais e futuros receberão automaticamente todas
                  as permissões (editar sala, controlar votação e controlar membros). O proprietário
                  sempre possui todas as permissões.
                </p>
              </div>

              {/* Quem pode editar configurações */}
              <MultiSelect
                label="Quem pode editar configurações da sala:"
                options={memberOptions}
                value={ensureOwnerIncluded(whoCanEdit)}
                onChange={setWhoCanEdit}
                disabled={!isOwner || autoGrantPermissions}
                placeholder="Selecione os membros..."
                showAllOption={true}
              />
              <div className="text-[0.6rem] sm:text-[0.65rem] text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
                <p>
                  Quem controla edição da sala pode alterar o nome, tema e localização, além de
                  alternar entre sala privada e pública.
                </p>
              </div>

              {/* Quem pode controlar votação */}
              <MultiSelect
                label="Quem pode controlar votação:"
                options={memberOptions}
                value={ensureOwnerIncluded(whoCanOpenCards)}
                onChange={setWhoCanOpenCards}
                disabled={!isOwner || autoGrantPermissions}
                placeholder="Selecione os membros..."
                showAllOption={true}
              />
              <div className="text-[0.6rem] sm:text-[0.65rem] text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
                <p>
                  Quem controla a votação pode revelar e limpar as cartas votadas, além de iniciar e
                  pausar o timer.
                </p>
              </div>

              {/* Quem pode controlar membros */}
              <MultiSelect
                label="Quem pode controlar membros:"
                options={memberOptions}
                value={ensureOwnerIncluded(whoCanApproveEntries)}
                onChange={setWhoCanApproveEntries}
                disabled={!isOwner || autoGrantPermissions}
                placeholder="Selecione os membros..."
                showAllOption={true}
              />
              <div className="text-[0.6rem] sm:text-[0.65rem] text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
                <p>
                  Quem controla membros pode aprovar ou recusar entradas em salas privadas, além de
                  remover membros atuais.
                </p>
              </div>

              {/* Privacidade */}
              <div className="flex items-center justify-between gap-2 sm:gap-3">
                <label
                  className={twMerge(
                    'text-[0.65rem] sm:text-xs text-gray-600 dark:text-gray-400 font-medium',
                    !userCanEditRoom
                      ? 'text-gray-400 dark:text-gray-500'
                      : 'text-gray-700 dark:text-gray-300'
                  )}
                >
                  Sala privada:
                </label>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <button
                    type="button"
                    className={twMerge(
                      'relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors',
                      isPrivate ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-700',
                      !userCanEditRoom ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
                    )}
                    onClick={() => userCanEditRoom && setIsPrivate(v => !v)}
                    disabled={!userCanEditRoom}
                    aria-pressed={isPrivate}
                  >
                    <span
                      className={twMerge(
                        'inline-block h-4 w-4 sm:h-5 sm:w-5 transform rounded-full bg-white transition-transform',
                        isPrivate
                          ? 'translate-x-4 sm:translate-x-5'
                          : 'translate-x-0.5 sm:translate-x-1'
                      )}
                    />
                  </button>
                  <span
                    className={twMerge(
                      'text-[0.65rem] sm:text-xs text-gray-600 dark:text-gray-400',
                      !userCanEditRoom ? 'opacity-60' : ''
                    )}
                  >
                    {isPrivate ? 'Privada' : 'Pública'}
                  </span>
                </div>
              </div>

              <div className="text-[0.6rem] sm:text-[0.65rem] text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
                <p>
                  <strong>Salas privadas</strong> requerem aprovação do proprietário para entrada e
                  apenas ele pode modificar configurações; <strong>salas públicas</strong> permitem
                  entrada livre via link e edição por qualquer membro, porém entrada via busca por
                  distância ainda requer permissão.
                </p>
              </div>

              {/* Localização da sala */}
              <LocationSection
                room={room}
                user={user}
                lat={lat}
                lng={lng}
                mode="edit"
                onLocationChange={(newLat, newLng) => {
                  setLat(newLat);
                  setLng(newLng);
                }}
              />
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
          <div className="grid grid-cols-2 md:flex gap-2 sm:gap-3 justify-end">
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
