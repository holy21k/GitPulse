import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '⚡ Git-Pulse',
  description: 'Find your next open source contribution',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
