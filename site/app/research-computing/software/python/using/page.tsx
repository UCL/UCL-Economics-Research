import type { Metadata } from 'next';
import { MarkdownGuide } from '@/components/markdown-guide';
import source from '@/content/research-computing/software/python/using.md?raw';

export const metadata: Metadata = { title: 'Using Python — Python | UCL Economics Research' };
export default function Page() { return <MarkdownGuide source={source} heading="Using Python" active="Software" />; }

