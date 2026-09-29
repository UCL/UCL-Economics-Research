import type { Metadata } from 'next';
import { MarkdownGuide } from '@/components/markdown-guide';
import source from '@/content/research-computing/software/matlab/using.md?raw';

export const metadata: Metadata = { title: 'Using MATLAB — MATLAB | UCL Economics Research' };
export default function Page() { return <MarkdownGuide source={source} heading="Using MATLAB" active="Software" />; }

