import { useRoomStore } from '@/hooks/useRoom';
import { Button } from './Button';
import { Loading } from './Loading';
import { useRouter } from 'next/navigation';

type WaitingRoomProps = {
  roomName?: string;
  roomId: string;
};

export const WaitingRoom = ({ roomId, roomName }: WaitingRoomProps) => {
  const router = useRouter();
  const { logout } = useRoomStore();

  const handleLogout = () => {
    logout();

    window.location.replace(`/room/${roomId}`);
  };

  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-sinera text-4xl text-center">Scrum poker</h1>
      <p className="text-center mb-6">
        Aguardando aprovação de entrada na sala: <b>{roomName}</b>.
      </p>
      <Loading />
      <Button onClick={handleLogout}>Sair</Button>
    </div>
  );
};
