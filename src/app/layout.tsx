import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';
import { Providers } from '../components/Providers';
import { Theme } from '@/components/Theme';
import { cookies } from 'next/headers';
import { THEME } from '@/enums/theme';
import { SampleCards } from '@/components/SampleCards';
import { Glass } from '@/components/Glass';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Scrum poker',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const defaultTheme = cookieStore.get('scrum-poker-theme')?.value as THEME;

  return (
    <html lang="pt-BR">
      <body className={inter.className} style={{ visibility: 'hidden' }}>
        <Providers>
          <Theme defaultTheme={defaultTheme} />
          <SampleCards>
            <Glass>
              {children}
            </Glass>
          </SampleCards>
        </Providers>
      </body>
    </html>
  );
}
