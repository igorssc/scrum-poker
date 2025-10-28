'use client';

import { useEffect, useState } from 'react';

export const DebugServiceWorker = () => {
  const [swStatus, setSwStatus] = useState('Loading...');
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Debug do service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        setSwStatus(`SW Ready: ${registration.scope}`);
      });

      navigator.serviceWorker.addEventListener('message', event => {
        console.log('SW Message:', event.data);
      });
    } else {
      setSwStatus('Service Worker not supported');
    }

    // Debug de conectividade
    setIsOnline(navigator.onLine);
    
    const handleOnline = () => {
      setIsOnline(true);
      console.log('Online detected');
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      console.log('Offline detected');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Debug do histórico de navegação
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      console.log('PopState event:', event.state, window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div 
      style={{
        position: 'fixed',
        top: '10px',
        left: '10px',
        background: 'rgba(0,0,0,0.8)',
        color: 'white',
        padding: '10px',
        fontSize: '12px',
        zIndex: 9999,
        borderRadius: '4px'
      }}
    >
      <div>SW: {swStatus}</div>
      <div>Online: {isOnline ? 'Yes' : 'No'}</div>
      <div>URL: {typeof window !== 'undefined' ? window.location.pathname : 'Loading'}</div>
    </div>
  );
};