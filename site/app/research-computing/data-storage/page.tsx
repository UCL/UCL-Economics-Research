import type { Metadata } from 'next';
import { MarkdownGuide } from '@/components/markdown-guide';
import source from '@/content/research-computing/data-storage.md?raw';

export const metadata: Metadata = { title: 'Data storage | Research Computing | UCL Economics Research' };

export default function Page() {
  return <MarkdownGuide source={source} heading="Data storage" active="Data storage" />;
}
