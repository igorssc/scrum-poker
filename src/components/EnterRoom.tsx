'use client';
import { FormEvent, useRef } from 'react';
import { useRoomStore } from '../hooks/useRoom';
import { Button } from './Button';
import { Input } from './Input';
import { useRouter } from 'next/navigation';

type EnterRoomProps = {
  roomId: string;
  roomName?: string;
  access?: string;
};

export const EnterRoom = ({ roomId, roomName, access }: EnterRoomProps) => {
  const userName = useRef<HTMLInputElement>(null);

  const router = useRouter();

  const { createRoom, enterRoom, room } = useRoomStore();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const hasUserName = !!userName.current?.value;

    if (!hasUserName) return;

    enterRoom({ roomId, userName: userName.current.value, access });
  };

  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-sinera text-4xl text-center">Scrum poker</h1>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-6 py-4 w-full justify-between items-stretch"
      >
        <Input type="text" value={roomName} label="Nome da sala" disabled />
        <Input type="text" ref={userName} label="Nome de usuário" required />
        <Button type="submit" className="mt-4">
          Entrar
        </Button>
        <Button onClick={() => router.push('/')}>Voltar ao início</Button>
      </form>
    </div>
  );
};
