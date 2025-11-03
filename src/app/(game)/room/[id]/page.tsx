'use client';

import { HomeButton } from '@/components/HomeButton';
import { RoomClient } from '@/components/RoomClient';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useParams, useSearchParams } from 'next/navigation';

export default function Room() {
  const params = useParams();
  const searchParams = useSearchParams();

  const roomId = params.id as string;
  const access = searchParams.get('access') || undefined;

  return (
    <div className="relative min-h-[calc(100dvh-3rem-4rem)] mb-16 flex content-center items-center max-w-[calc(100%-1.5rem)] md:max-w-[90%]">
      <ThemeToggle className="fixed top-4 right-4 z-50" />
      <HomeButton className="fixed top-4 left-4 z-50" />
      <RoomClient roomId={roomId} access={access} />
    </div>
  );
}
