import { Button } from './Button';
import { Loading } from './Loading';
import { useContextSelector } from 'use-context-selector';
import { RoomContext } from '@/context/RoomContext';

type WaitingRoomProps = {
  roomName?: string;
  roomId: string;
};

export const WaitingRoom = ({ roomId, roomName }: WaitingRoomProps) => {
  const { logout } = useContextSelector(RoomContext, (context) => ({
    logout: context.logout,
  }));

  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-sinera text-4xl text-center">Scrum poker</h1>
      <p className="text-center mb-6">
        Aguardando aprovação de entrada na sala: <b>{roomName}</b>.
      </p>
      <Loading />
      <Button onClick={logout}>Sair</Button>
    </div>
  );
};
