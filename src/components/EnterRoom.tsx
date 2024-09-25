'use client';
import { FormEvent, useRef } from 'react';
import { useRoomStore } from '../hooks/useRoom';

export const EnterRoom = () => {
  const roomName = useRef<HTMLInputElement>(null);
  const userName = useRef<HTMLInputElement>(null);

  const { createRoom, room } = useRoomStore();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const hasRoomName = !!roomName.current?.value;
    const hasUserName = !!userName.current?.value;

    if (!hasRoomName || !hasUserName) return;

    createRoom({
      roomName: roomName.current.value,
      userName: userName.current.value,
      theme: 'primary',
    });
  };

  return (
    <div className="py-4 w-full">
      {JSON.stringify(room)}
      <form onSubmit={handleSubmit}>
        <label htmlFor="">user</label>
        <input
          type="text"
          className="border border-black mx-auto"
          ref={userName}
          required
        />
        <label htmlFor="">room</label>
        <input
          type="text"
          className="border border-black mx-auto"
          ref={roomName}
          required
        />
        <button type="submit">Criar sala</button>
      </form>
    </div>
  );
};
