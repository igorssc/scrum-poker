import { MemberProps } from '@/protocols/Member';
import { RoomProps } from '@/protocols/Room';
import { useQueryClient } from '@tanstack/react-query';

type UserProps = {
  id: string;
  name: string;
};

type SignInEventProps = {
  type: string;
  data: {
    user: {
      status: string;
      member: UserProps;
    };
  };
};

type SignInAcceptEventProps = {
  type: string;
  data: {
    user: UserProps & { user_id: string };
  };
};

type SignInRefuseEventProps = {
  type: string;
  data: {
    user: UserProps & { user_id: string };
  };
};

type SignOutEventProps = {
  type: string;
  data: {
    user: UserProps;
  };
};

export const useWebSocketEventHandlers = (roomId: string, clear: () => void) => {
  const queryClient = useQueryClient();

  const handleEvent = (event: any) => {
    // Eventos de gerenciamento de usuários - atualizar diretamente no cache
    if (event.type === 'sign-in') {
      const eventData = event as SignInEventProps;
      if (eventData.data.user.status === 'LOGGED') return;

      const { id, name } = eventData.data.user.member;

      // Adicionar novo usuário PENDING ao cache
      queryClient.setQueryData<{ data: { members: MemberProps[] } & RoomProps }>(
        ['room', roomId],
        oldData => {
          if (!oldData) return oldData;

          // Verificar se o usuário já existe
          const userExists = oldData.data.members.some(member => member.member.id === id);
          if (userExists) return oldData;

          // Adicionar novo membro com status PENDING
          return {
            ...oldData,
            data: {
              ...oldData.data,
              members: [
                ...oldData.data.members,
                {
                  id: id,
                  status: 'PENDING' as const,
                  vote: null,
                  created_at: new Date().toISOString(),
                  member: {
                    id,
                    name,
                    created_at: new Date().toISOString(),
                  },
                },
              ],
            },
          };
        }
      );
    }

    if (event.type === 'sign-in-accept') {
      const eventData = event as SignInAcceptEventProps;
      const { user_id: id } = eventData.data.user;

      if (!id) return;

      // Atualizar status do usuário para LOGGED no cache
      queryClient.setQueryData<{ data: { members: MemberProps[] } & RoomProps }>(
        ['room', roomId],
        oldData => {
          if (!oldData) return oldData;

          console.log(oldData, eventData);

          return {
            ...oldData,
            data: {
              ...oldData.data,
              members: oldData.data.members.map(member => {
                if (member.member.id === id) {
                  return {
                    ...member,
                    status: 'LOGGED',
                  };
                }
                return member;
              }),
            },
          };
        }
      );
    }

    if (event.type === 'sign-in-refuse') {
      const eventData = event as SignInRefuseEventProps;
      const { user_id: id } = eventData.data.user;

      if (!id) return;

      // Remover usuário do cache (usuário foi recusado)
      queryClient.setQueryData<{ data: { members: MemberProps[] } & RoomProps }>(
        ['room', roomId],
        oldData => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            data: {
              ...oldData.data,
              members: oldData.data.members.filter(member => member.member.id !== id),
            },
          };
        }
      );
    }

    if (event.type === 'sign-out') {
      const eventData = event as SignOutEventProps;
      const { id } = eventData.data.user;

      // Remover usuário do cache
      queryClient.setQueryData<{ data: { members: MemberProps[] } & RoomProps }>(
        ['room', roomId],
        oldData => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            data: {
              ...oldData.data,
              members: oldData.data.members.filter(member => member.member.id !== id),
            },
          };
        }
      );
    }

    // Eventos de sala (Board)
    if (event.type === 'clear-votes') {
      queryClient.setQueryData<{ data: { members: MemberProps[] } & RoomProps }>(
        ['room', roomId],
        oldData => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            data: {
              ...oldData.data,
              cards_open: false,
              members: oldData.data.members.map(member => ({
                ...member,
                vote: null,
              })),
            },
          };
        }
      );
    }

    if (event.type === 'votes-revealed') {
      queryClient.setQueryData<{ data: { members: MemberProps[] } & RoomProps }>(
        ['room', roomId],
        oldData => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            data: {
              ...oldData.data,
              cards_open: true,
            },
          };
        }
      );
    }

    if (event.type === 'update-room') {
      if (event.data?.room) {
        queryClient.setQueryData<{ data: { members: MemberProps[] } & RoomProps }>(
          ['room', roomId],
          oldData => {
            if (!oldData) return oldData;

            return {
              ...oldData,
              data: {
                ...oldData.data,
                ...event?.data?.room,
              },
            };
          }
        );
      }
    }

    if (event.type === 'vote-member') {
      const userId = event?.data?.user?.id;
      const vote = event?.data?.user?.vote || null;

      if (userId) {
        queryClient.setQueryData<{ data: { members: MemberProps[] } & RoomProps }>(
          ['room', roomId],
          oldData => {
            if (!oldData) return oldData;

            return {
              ...oldData,
              data: {
                ...oldData.data,
                members: oldData.data.members.map(member => {
                  if (member.id === userId) {
                    return {
                      ...member,
                      vote,
                    };
                  }
                  return member;
                }),
              },
            };
          }
        );
      }
    }

    if (event.type === 'delete-room') {
      clear();
    }

    if (event.type === 'update-user') {
      const userId = event?.data?.user_id || event?.data?.user?.id;
      const userData = event?.data?.user || event?.data?.member || {};
      const memberData = event?.data?.member_data || {};

      if (userId) {
        queryClient.setQueryData<{ data: { members: MemberProps[] } & RoomProps }>(
          ['room', roomId],
          oldData => {
            if (!oldData) return oldData;

            return {
              ...oldData,
              data: {
                ...oldData.data,
                members: oldData.data.members.map(member => {
                  if (member.member.id === userId) {
                    return {
                      ...member,
                      ...memberData,
                      member: {
                        ...member.member,
                        ...userData,
                      },
                    };
                  }
                  return member;
                }),
              },
            };
          }
        );
      }
    }
  };

  return { handleEvent };
};
