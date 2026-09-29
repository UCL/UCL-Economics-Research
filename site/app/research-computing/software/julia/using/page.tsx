import type { Metadata } from 'next';
import { MarkdownGuide } from '@/components/markdown-guide';
import source from '@/content/research-computing/software/julia/using.md?raw';

export const metadata: Metadata = { title: 'Using Julia — Julia | UCL Economics Research' };
export default function Page() { return <MarkdownGuide source={source} heading="Using Julia" active="Software" />; }

