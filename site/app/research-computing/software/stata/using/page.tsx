import type { Metadata } from 'next';
import { MarkdownGuide } from '@/components/markdown-guide';
import source from '@/content/research-computing/software/stata/using.md?raw';

export const metadata: Metadata = { title: 'Using Stata — Stata | UCL Economics Research' };
export default function Page() { return <MarkdownGuide source={source} heading="Using Stata" active="Software" />; }

