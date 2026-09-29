import type { Metadata } from 'next';
import { MarkdownGuide } from '@/components/markdown-guide';
import source from '@/content/research-computing/software/matlab/code-library.md?raw';

export const metadata: Metadata = { title: 'UCL code library — MATLAB | UCL Economics Research' };
export default function Page() { return <MarkdownGuide source={source} heading="UCL code library" active="Software" />; }

