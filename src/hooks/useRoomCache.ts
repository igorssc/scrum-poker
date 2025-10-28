'use client';

import { RoomContext } from '@/context/RoomContext';
import { MemberProps } from '@/protocols/Member';
import { RoomProps } from '@/protocols/Room';
import { useQueryClient } from '@tanstack/react-query';
import { useContextSelector } from 'use-context-selector';

type CachedRoomData = { data: { members: MemberProps[] } & RoomProps };

export function useRoomCache() {
  const queryClient = useQueryClient();

  const { room } = useContextSelector(RoomContext, context => ({
    room: context.room,
  }));

  const getCachedRoomData = (): CachedRoomData | undefined => {
    if (!room?.id) return undefined;

    return queryClient.getQueryData<CachedRoomData>(['room', room.id]);
  };

  const invalidateRoomCache = () => {
    if (!room?.id) return;

    queryClient.invalidateQueries({
      queryKey: ['room', room.id],
    });
  };

  const setRoomCache = (data: CachedRoomData) => {
    if (!room?.id) return;

    queryClient.setQueryData(['room', room.id], data);
  };

  return {
    cachedRoomData: getCachedRoomData(),
    invalidateRoomCache,
    setRoomCache,
    roomId: room?.id,
  };
}
