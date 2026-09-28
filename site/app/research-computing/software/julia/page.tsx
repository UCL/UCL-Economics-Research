import type { Metadata } from 'next';
import { MarkdownGuide } from '@/components/markdown-guide';
import source from '@/content/research-computing/software/julia.md?raw';

export const metadata: Metadata = { title: 'Julia | Research Computing | UCL Economics Research' };
export default function Page() { return <MarkdownGuide source={source} heading="Julia" active="Software" />; }
