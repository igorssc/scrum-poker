import { DynamicManifest } from '@/components/DynamicManifest';
import { GlobalTheme } from '@/components/GlobalTheme';
import { PWAInstallBanner } from '@/components/PWAInstallBanner';
import { ServiceWorkerRegistration } from '@/components/ServiceWorkerRegistration';
import { DebugServiceWorker } from '@/components/DebugServiceWorker';
import '@/styles/globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { twMerge } from 'tailwind-merge';
import { Providers } from '../components/Providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Scrum Poker - Planning Poker',
  description:
    'Planning Poker para equipes ágeis. Estime tarefas de forma colaborativa com seu time usando Scrum Poker. Interface simples e intuitiva.',
  keywords:
    'scrum poker, planning poker, estimativa ágil, metodologia ágil, scrum, planning, poker, estimativa, desenvolvimento ágil',
  authors: [{ name: 'Igor Costa', url: 'https://github.com/igorssc' }],
  creator: 'Igor Costa',
  publisher: 'Igor Costa',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://scrumpoker.dev.br'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Scrum Poker - Planning Poker',
    description:
      'Planning Poker para equipes ágeis. Estime tarefas de forma colaborativa com seu time.',
    url: 'https://scrumpoker.dev.br',
    siteName: 'Scrum Poker',
    locale: 'pt_BR',
    type: 'website',
    images: [
      {
        url: 'https://scrumpoker.dev.br/og-image.png',
        secureUrl: 'https://scrumpoker.dev.br/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Scrum Poker - Planning Poker',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Scrum Poker - Planning Poker',
    description:
      'Planning Poker para equipes ágeis. Estime tarefas de forma colaborativa com seu time.',
    creator: '@igorssc',
    images: ['https://scrumpoker.dev.br/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'google-site-verification=1EANzAxO-q2AbTKizXGxDyH49kux9sHLtzZnpcbcALk',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <link rel="manifest" href="/api/manifest" />
        <meta name="theme-color" content="#8b5cf6" />
      </head>
      <body className={twMerge(inter.className)} style={{ visibility: 'hidden' }}>
        <GlobalTheme />
        <DynamicManifest />
        <ServiceWorkerRegistration />
        <DebugServiceWorker />
        <Providers>
          {children}
          <PWAInstallBanner />
        </Providers>
      </body>
    </html>
  );
}
