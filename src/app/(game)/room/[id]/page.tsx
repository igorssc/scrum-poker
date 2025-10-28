'use client';

import { RoomClient } from '@/components/RoomClient';
import { ThemeToggle } from '@/components/ThemeToggle';
import { HomeButton } from '../../../../components/HomeButton';
import { OfflineGuard } from '@/components/OfflineGuard';
import { useParams, useSearchParams } from 'next/navigation';

export default function Room() {
  const params = useParams();
  const searchParams = useSearchParams();
  
  const roomId = params.id as string;
  const access = searchParams.get('access') || undefined;

  return (
    <OfflineGuard>
      <div className="relative min-h-[calc(100dvh-2rem)] flex content-center items-center max-w-[90%]">
        <ThemeToggle className="fixed top-4 right-4 z-50" />
        <HomeButton className="fixed top-4 left-4 z-50" />
        <RoomClient roomId={roomId} access={access} />
      </div>
    </OfflineGuard>
  );
}
