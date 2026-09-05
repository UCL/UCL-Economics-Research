import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Recent publications | UCL Economics Research',
  description: 'Recent economics journal articles and books by UCL Economics staff.',
};

export default function PublicationsLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
