import type { Metadata } from 'next';
import { MarkdownGuide } from '@/components/markdown-guide';
import source from '@/content/research-computing/it-support.md?raw';

export const metadata: Metadata = { title: 'IT Support | Research Computing | UCL Economics Research' };

export default function Page() {
  return <MarkdownGuide source={source} heading="IT Support" active="IT Support" />;
}
