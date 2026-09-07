import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Resources | UCL Economics Research',
  description: 'Research resources from UCL Economics.',
};

export default function ResourcesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
