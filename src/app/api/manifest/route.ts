import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Detecta o tema preferido através de headers ou query params
  const { searchParams } = new URL(request.url);
  const theme = searchParams.get('theme') || 'light';

  // Cores baseadas no tema
  const colors = {
    light: {
      background_color: '#ffffff',
      theme_color: '#8b5cf6',
    },
    dark: {
      background_color: '#1f2937', // gray-800
      theme_color: '#374151', // gray-700 (tom mais neutro para dark mode)
    },
  };

  const selectedColors = colors[theme as keyof typeof colors] || colors.light;

  const manifest = {
    name: 'Scrum Poker - Planning Poker Online',
    short_name: 'Scrum Poker',
    description:
      'Planning Poker para equipes ágeis. Estime tarefas de forma colaborativa com seu time.',
    start_url: '/',
    display: 'standalone',
    background_color: selectedColors.background_color,
    theme_color: selectedColors.theme_color,
    orientation: 'portrait-primary',
    categories: ['business', 'productivity', 'utilities'],
    lang: 'pt-BR',
    scope: '/',
    id: 'scrum-poker-app',
    icons: [
      {
        src: '/favicon.ico',
        sizes: '48x48',
        type: 'image/x-icon',
      },
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    screenshots: [
      {
        src: '/screenshot-wide.png',
        sizes: '1280x720',
        type: 'image/png',
        form_factor: 'wide',
      },
      {
        src: '/screenshot-mobile.png',
        sizes: '390x844',
        type: 'image/png',
        form_factor: 'narrow',
      },
    ],
  };

  return NextResponse.json(manifest, {
    headers: {
      'Content-Type': 'application/manifest+json',
      'Cache-Control': 'public, max-age=300', // Cache por 5 minutos
    },
  });
}
