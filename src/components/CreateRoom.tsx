'use client';
import { FormEvent, useRef } from 'react';
import { useRoomStore } from '../hooks/useRoom';
import { Input } from './Input';
import { Button } from './Button';

export const CreateRoom = () => {
  const roomName = useRef<HTMLInputElement>(null);
  const userName = useRef<HTMLInputElement>(null);

  const { createRoom } = useRoomStore();

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
    <>
      <div className="py-4 w-full flex justify-center items-center">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label htmlFor="">user</label>
          <Input
            type="text"
            className="border border-black mx-auto"
            ref={userName}
            required
          />
          <label htmlFor="">room</label>
          <Input
            type="text"
            className="border border-black mx-auto"
            ref={roomName}
            required
          />
          <Button type="submit">Criar sala</Button>
        </form>
      </div>
    </>
  );
};
