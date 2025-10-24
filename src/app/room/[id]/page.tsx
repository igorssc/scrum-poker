import { RoomClient } from '@/components/RoomClient';

type RoomPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    access?: string;
  }>;
};

export default async function Room({ params, searchParams }: RoomPageProps) {
  const { id: roomId } = await params;
  const { access } = await searchParams;

  return <RoomClient roomId={roomId} access={access} />;
}
