'use client';
import { RoomProvider } from '@/context/RoomContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PropsWithChildren } from 'react';
import toast, { Toaster } from 'react-hot-toast';

const queryClient = new QueryClient();

export const Providers = ({ children }: PropsWithChildren) => {
  return (
    <QueryClientProvider client={queryClient}>
      <RoomProvider>
        {children}
        <Toaster
          position="bottom-right"
          containerStyle={{
            bottom: 20,
            right: 20,
            zIndex: 9999,
          }}
          gutter={8}
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
              maxWidth: '350px',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              fontSize: '14px',
              padding: '12px 16px',
            },
            success: {
              duration: 3000,
              style: {
                background: '#10b981',
                color: '#fff',
              },
              iconTheme: {
                primary: '#fff',
                secondary: '#10b981',
              },
            },
            error: {
              duration: 5000,
              style: {
                background: '#ef4444',
                color: '#fff',
              },
              iconTheme: {
                primary: '#fff',
                secondary: '#ef4444',
              },
            },
            loading: {
              style: {
                background: '#3b82f6',
                color: '#fff',
              },
              iconTheme: {
                primary: '#fff',
                secondary: '#3b82f6',
              },
            },
          }}
        />
      </RoomProvider>
    </QueryClientProvider>
  );
};
