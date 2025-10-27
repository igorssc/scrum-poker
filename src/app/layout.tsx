import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';
import { Providers } from '../components/Providers';
import { SampleCards } from '@/components/SampleCards';
import { Glass } from '@/components/Glass';
import { GlobalTheme } from '@/components/GlobalTheme';
import { twMerge } from 'tailwind-merge';

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
        <Providers>
          <SampleCards>
            <Glass>{children}</Glass>
          </SampleCards>
        </Providers>
      </body>
    </html>
  );
}
