'use client';
import { RoomProvider } from '@/context/RoomContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PropsWithChildren } from 'react';

const queryClient = new QueryClient();

export const Providers = ({ children }: PropsWithChildren) => {
  return (
    <QueryClientProvider client={queryClient}>
      <RoomProvider>{children}</RoomProvider>
    </QueryClientProvider>
  );
};
