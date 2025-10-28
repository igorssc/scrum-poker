'use client';
import { Dispatch, FormEvent, SetStateAction, useRef, useState } from 'react';
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
  const [isCreating, setIsCreating] = useState(false);

  const { createRoom } = useContextSelector(RoomContext, context => ({
    createRoom: context.createRoom,
  }));

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const hasRoomName = !!roomName.current?.value;
    const hasUserName = !!userName.current?.value;

    if (!hasRoomName || !hasUserName || !roomName.current || !userName.current) return;

    setIsCreating(true);

    try {
      await createRoom({
        roomName: roomName.current.value,
        userName: userName.current.value,
        theme: 'nature',
      });
    } catch (error) {
      // Error já tratado no RoomContext com toast
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-5 sm:gap-6 md:gap-8 w-full pb-2 pt-4">
        <h1 className="font-sinera text-2xl sm:text-3xl md:text-4xl text-center">Scrum poker</h1>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-6 py-4 w-full justify-between items-stretch"
        >
          <Input type="text" ref={roomName} label="Nome da sala" required />
          <Input type="text" ref={userName} label="Nome de usuário" required />

          <div className="flex gap-3 sm:gap-4 w-full justify-center flex-col">
            <Button type="submit" className="mt-2 sm:mt-3 md:mt-4" isLoading={isCreating}>
              Criar sala
            </Button>
            <Button
              variant="secondary"
              onClick={() => setIsLookingForRoom(true)}
              disabled={isCreating}
            >
              Encontrar salas
            </Button>
          </div>
        </form>
      </div>
    </>
  );
};
