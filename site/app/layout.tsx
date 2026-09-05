import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Seminars | UCL Economics Research',
  description: 'UCL Economics research seminars for the 2026–27 academic year.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
