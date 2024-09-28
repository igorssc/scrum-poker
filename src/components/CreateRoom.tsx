'use client';
import { Dispatch, FormEvent, SetStateAction, useRef } from 'react';
import { Input } from './Input';
import { Button } from './Button';
import { useContextSelector } from 'use-context-selector';
import { RoomContext } from '@/context/RoomContext';

type CreateRoomProps = {
  setIsLookingForRoom: Dispatch<SetStateAction<boolean>>;
};

export const CreateRoom = ({ setIsLookingForRoom }: CreateRoomProps) => {
  const roomName = useRef<HTMLInputElement>(null);
  const userName = useRef<HTMLInputElement>(null);

  const { createRoom } = useContextSelector(RoomContext, (context) => ({
    createRoom: context.createRoom,
  }));

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
      <div className="flex flex-col gap-8">
        <h1 className="font-sinera text-4xl text-center">Scrum poker</h1>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-8 py-4 w-full justify-between items-stretch"
        >
          <Input type="text" ref={roomName} label="Nome da sala" required />
          <Input type="text" ref={userName} label="Nome de usuário" required />
          <Button type="submit" className="mt-4">
            Criar sala
          </Button>
          <Button onClick={() => setIsLookingForRoom(true)}>
            Encontrar salas
          </Button>
        </form>
      </div>
    </>
  );
};
