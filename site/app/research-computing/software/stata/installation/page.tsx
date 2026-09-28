import type { Metadata } from 'next';
import { MarkdownGuide } from '@/components/markdown-guide';
import source from '@/content/research-computing/software/stata/installation.md?raw';

export const metadata: Metadata = { title: 'Installation and licence — Stata | UCL Economics Research' };
export default function Page() { return <MarkdownGuide source={source} heading="Installation and licence" active="Software" />; }

