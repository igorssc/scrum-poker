import { create } from 'zustand';
import { getCoordinates } from '../utils/getCoordinates';
import api from '../services/api';
import { createJSONStorage, persist } from 'zustand/middleware';
import { RoomProps as RoomPropsProtocols } from '../protocols/Room';
import { MemberProps } from '../protocols/Member';

type CreateRoomProps = {
  roomName: string;
  userName: string;
  theme: string;
};

type EnterRoomProps = {
  roomId: string;
  userName: string;
  access?: string;
};

type RoomProps = {
  id: string;
  owner_id: string;
  access: string;
};

type UserProps = {
  id: string;
};

type RoomState = {
  room: RoomProps;
  user: UserProps;
  createRoom: (props: CreateRoomProps) => Promise<void>;
  enterRoom: (props: EnterRoomProps) => Promise<void>;
  acceptUser: (userId: string) => Promise<void>;
  logout: () => Promise<void>;
};

export const useRoomStore = create(
  persist<RoomState>(
    (set, get) => ({
      room: {} as RoomProps,
      user: {} as UserProps,

      createRoom: async ({ roomName, userName, theme }: CreateRoomProps) => {
        const { latitude, longitude } = await getCoordinates();

        try {
          const { data } = await api.post<RoomPropsProtocols>('rooms', {
            name: roomName,
            user_name: userName,
            lat: latitude,
            lng: longitude,
            theme,
          });

          const room = {
            id: data.id,
            access: data.access,
            owner_id: data.owner_id,
          } as RoomProps;

          const user = {
            id: room.owner_id,
          } as UserProps;

          set(() => ({ room, user }));
        } catch {}
      },

      enterRoom: async ({ roomId, userName, access }: EnterRoomProps) => {
        try {
          const { data } = await api.post<{
            room: RoomProps;
            member: MemberProps;
            user: UserProps;
          }>(`rooms/${roomId}/sign-in`, {
            user_name: userName,
            access: access,
          });

          const room = {
            id: data.room.id,
            access: data.room.access,
            owner_id: data.room.owner_id,
          } as RoomProps;

          const user = {
            id: data.user.id,
          } as UserProps;

          set(() => ({ room, user }));
        } catch {}
      },

      acceptUser: async (userId: string) => {
        const { room, user } = get();

        await api.post(`rooms/${room.id}/sign-in/accept`, {
          owner_id: user.id,
          user_id: userId,
          access: room.access,
        });
      },

      logout: async () => {
        const { room, user } = get();

        await api.post(`rooms/${room.id}/sign-out`, {
          user_action_id: user.id,
          user_id: user.id,
          room_id: room.id,
        });

        set(() => ({
          room: {} as RoomProps,
          user: {} as UserProps,
        }));
      },
    }),
    {
      name: 'use-room-storage',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
