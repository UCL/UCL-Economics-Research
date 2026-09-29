import type { Metadata } from 'next';
import { MarkdownGuide } from '@/components/markdown-guide';
import source from '@/content/research-computing/software/matlab/installation.md?raw';

export const metadata: Metadata = { title: 'Installation and licence — MATLAB | UCL Economics Research' };
export default function Page() { return <MarkdownGuide source={source} heading="Installation and licence" active="Software" />; }

