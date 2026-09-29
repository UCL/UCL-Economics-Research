import type { Metadata } from 'next';
import { MarkdownGuide } from '@/components/markdown-guide';
import source from '@/content/research-computing/software/python/code-library.md?raw';

export const metadata: Metadata = { title: 'UCL code library — Python | UCL Economics Research' };
export default function Page() { return <MarkdownGuide source={source} heading="UCL code library" active="Software" />; }

