'use client';
import { FormEvent, useRef } from 'react';
import { useRoomStore } from '../hooks/useRoom';
import { Button } from './Button';
import { Input } from './Input';

type EnterRoomProps = {
  roomId: string;
  access?: string;
};

export const EnterRoom = ({ roomId, access }: EnterRoomProps) => {
  const userName = useRef<HTMLInputElement>(null);

  const { createRoom, enterRoom, room } = useRoomStore();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const hasUserName = !!userName.current?.value;

    if (!hasUserName) return;

    enterRoom({ roomId, userName: userName.current.value, access });
  };

  return (
    <div className="py-4 w-full">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label htmlFor="">user</label>
        <Input
          type="text"
          className="border border-black mx-auto"
          ref={userName}
          required
        />
        <Button type="submit">Entrar</Button>
      </form>
    </div>
  );
};
