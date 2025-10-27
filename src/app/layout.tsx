import { GlobalTheme } from '@/components/GlobalTheme';
import '@/styles/globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { twMerge } from 'tailwind-merge';
import { Providers } from '../components/Providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Scrum poker',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={twMerge(inter.className)} style={{ visibility: 'hidden' }}>
        <GlobalTheme />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
