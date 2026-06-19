import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/providers';

export const metadata: Metadata = {
  title: 'GreenFlag',
  description: 'Set your standards. Meet your match.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-black text-white">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
