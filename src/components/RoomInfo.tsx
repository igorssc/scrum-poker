'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useContextSelector } from 'use-context-selector';
import { RoomContext } from '@/context/RoomContext';
import { MemberProps } from '@/protocols/Member';
import { RoomProps } from '@/protocols/Room';

export function RoomInfo() {
  const queryClient = useQueryClient();
  
  const { room } = useContextSelector(RoomContext, (context) => ({
    room: context.room,
  }));

  // Acessar o cache da query que está rodando na página principal
  const cachedRoomData = queryClient.getQueryData<{ 
    data: { members: MemberProps[] } & RoomProps 
  }>(['room', room?.id]);

  if (!cachedRoomData) {
    return <div>Loading room info from cache...</div>;
  }

  const roomData = cachedRoomData.data;

  return (
    <div>
      <h3>{roomData.name}</h3>
      <p>Members: {roomData.members.length}</p>
      <ul>
        {roomData.members.map((member) => (
          <li key={member.member.id}>
            {member.member.name} - {member.status}
          </li>
        ))}
      </ul>
    </div>
  );
}