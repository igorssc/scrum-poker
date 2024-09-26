'use client';
import { FormEvent, useRef } from 'react';
import { useRoomStore } from '../hooks/useRoom';
import { Button } from './Button';
import { Input } from './Input';

type EnterRoomProps = {
  roomId: string;
  roomName?: string;
  access?: string;
};

export const EnterRoom = ({ roomId, roomName, access }: EnterRoomProps) => {
  const userName = useRef<HTMLInputElement>(null);

  const { createRoom, enterRoom, room } = useRoomStore();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const hasUserName = !!userName.current?.value;

    if (!hasUserName) return;

    enterRoom({ roomId, userName: userName.current.value, access });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-8 py-4 w-full justify-between items-stretch"
    >
      <Input type="text" value={roomName} label="Nome da sala" disabled />
      <Input type="text" ref={userName} label="Nome de usuário" required />
      <Button type="submit">Entrar</Button>
    </form>
  );
};
