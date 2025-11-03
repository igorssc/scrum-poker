import { Footer } from '@/components/Footer';
import { Glass } from '@/components/Glass';
import '@/styles/globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { SampleCards } from '../../components/SampleCards';

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
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 relative h-full">
        <SampleCards>
          <Glass>{children}</Glass>
        </SampleCards>
        <Footer variant="minimal" />
      </div>
    </div>
  );
}
