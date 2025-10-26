import { Button } from './Button';
import { Loading } from './Loading';
import { useContextSelector } from 'use-context-selector';
import { RoomContext } from '@/context/RoomContext';

type WaitingRoomProps = {
  roomId: string;
  roomName?: string;
};

export const WaitingRoom = ({ roomId, roomName }: WaitingRoomProps) => {
  const { logout } = useContextSelector(RoomContext, (context) => ({
    logout: context.logout,
  }));

  return (
    <div className="flex flex-col gap-10 sm:gap-12 md:gap-16 w-full">
      <h1 className="font-sinera text-2xl sm:text-3xl md:text-4xl text-center">Scrum poker</h1>
      <p className="text-center mb-6 text-[0.65rem] sm:text-xs">
        Aguardando aprovação de entrada na sala: <b>{roomName}</b>.
      </p>
      <Loading />
      <Button onClick={() => logout({ redirect: `/room/${roomId}` })}>
        Sair
      </Button>
    </div>
  );
};
