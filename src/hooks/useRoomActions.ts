import { RoomContext } from '@/context/RoomContext';
import { handleApiError } from '@/utils/errorHandler';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useContextSelector } from 'use-context-selector';

export const useRoomActions = () => {
  const { room, user } = useContextSelector(RoomContext, context => ({
    room: context.room,
    user: context.user,
  }));

  const queryClient = useQueryClient();

  // Mutation para atualizar sala (extraído do SettingsModalContent)
  const updateRoomMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/rooms/${room?.id}?user_id=${user?.id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );
      if (!res.ok) throw new Error('Erro ao atualizar sala');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['room', room?.id] });
    },
  });

  // Mutation para revelar cartas
  const revealCardsMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/rooms/${room?.id}/vote/reveal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user?.id }),
      });
      if (!res.ok) throw new Error('Erro ao revelar cartas');
      return res.json();
    },
    onSuccess: () => {
      // Atualizar cache manualmente - revelar as cartas
      queryClient.setQueryData(['room', room?.id], (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          data: {
            ...oldData.data,
            cards_open: true,
          },
        };
      });

      queryClient.invalidateQueries({ queryKey: ['room', room?.id] });
    },
  });

  // Mutation para limpar votos
  const clearVotesMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/rooms/${room?.id}/vote/clear`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user?.id }),
      });
      if (!res.ok) throw new Error('Erro ao limpar votos');
      return res.json();
    },
    onSuccess: () => {
      // Atualizar cache manualmente - limpar todos os votos e fechar cartas
      queryClient.setQueryData(['room', room?.id], (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          data: {
            ...oldData.data,
            cards_open: false,
            members: oldData.data.members.map((member: any) => ({
              ...member,
              vote: null,
            })),
          },
        };
      });

      queryClient.invalidateQueries({ queryKey: ['room', room?.id] });
    },
  });

  // Mutation para votar
  const voteMutation = useMutation({
    mutationFn: async (vote: string) => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/rooms/${room?.id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user?.id, vote }),
      });
      if (!res.ok) throw new Error('Erro ao votar');
      return res.json();
    },
    onSuccess: (_, vote) => {
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
                  vote: vote,
                };
              }
              return member;
            }),
          },
        };
      });

      queryClient.invalidateQueries({ queryKey: ['room', room?.id] });
    },
  });

  // Ação para revelar cartas
  const revealCards = async () => {
    try {
      await revealCardsMutation.mutateAsync();
    } catch (error) {
      handleApiError(error, 'Erro ao revelar cartas');
      throw error;
    }
  };

  // Ação para limpar votos
  const clearVotes = async () => {
    try {
      await clearVotesMutation.mutateAsync();
    } catch (error) {
      handleApiError(error, 'Erro ao limpar votos');
      throw error;
    }
  };

  // Ação para votar
  const vote = async (cardName: string) => {
    try {
      await voteMutation.mutateAsync(cardName);
    } catch (error) {
      handleApiError(error, 'Erro ao votar');
      throw error;
    }
  };

  return {
    revealCards,
    clearVotes,
    vote,
    updateRoom: updateRoomMutation.mutateAsync,
    isUpdatingRoom: updateRoomMutation.isPending,
    isRevealingCards: revealCardsMutation.isPending,
    isClearingVotes: clearVotesMutation.isPending,
    isVoting: voteMutation.isPending,
  };
};
