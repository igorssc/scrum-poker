'use client';
import { FormEvent, useRef } from 'react';
import { Button } from './Button';
import { Input } from './Input';
import { useRouter } from 'next/navigation';
import { useContextSelector } from 'use-context-selector';
import { RoomContext } from '@/context/RoomContext';

type EnterRoomProps = {
  roomId: string;
  roomName?: string;
  access?: string;
};

export const EnterRoom = ({ roomId, roomName, access }: EnterRoomProps) => {
  const userName = useRef<HTMLInputElement>(null);

  const router = useRouter();

  const { enterRoom } = useContextSelector(RoomContext, (context) => ({
    enterRoom: context.enterRoom,
  }));

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const hasUserName = !!userName.current?.value;

    if (!hasUserName) return;

    if (userName.current) {
      enterRoom({ roomId, userName: userName.current.value, access });
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full">
      <h1 className="font-sinera text-4xl text-center">Scrum poker</h1>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-6 py-4 w-full justify-between items-stretch"
      >
        <Input
          type="text"
          value={roomName || ''}
          label="Nome da sala"
          disabled
        />
        <Input type="text" ref={userName} label="Nome de usuário" required />
        <div className="flex gap-4 w-full justify-center flex-col">
          <Button type="submit" className="mt-4">
            Entrar
          </Button>
          <Button variant="secondary" onClick={() => router.push('/')}>Voltar ao início</Button>
        </div>
      </form>
    </div>
  );
};
