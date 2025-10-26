import { RoomClient } from '@/components/RoomClient';
import { ThemeToggle } from '@/components/ThemeToggle';

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

  return (
    <div className="relative min-h-[calc(100dvh-2rem)] flex content-center items-center max-w-[90%]">
      <ThemeToggle className="fixed top-4 right-4 z-50" />
      <RoomClient roomId={roomId} access={access} />
    </div>
  );
}
