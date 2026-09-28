import type { Metadata } from 'next';
import { MarkdownGuide } from '@/components/markdown-guide';
import source from '@/content/research-computing/software/stata.md?raw';

export const metadata: Metadata = { title: 'Stata | Research Computing | UCL Economics Research' };
export default function Page() { return <MarkdownGuide source={source} heading="Stata" active="Software" />; }
