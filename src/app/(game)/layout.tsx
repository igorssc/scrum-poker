import { Glass } from '@/components/Glass';
import { SampleCards } from '@/components/SampleCards';
import '@/styles/globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

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
    <SampleCards>
      <Glass>{children}</Glass>
    </SampleCards>
  );
}
