import type { Metadata } from 'next';
import { MarkdownGuide } from '@/components/markdown-guide';
import source from '@/content/research-computing/software/matlab.md?raw';

export const metadata: Metadata = { title: 'MATLAB | Research Computing | UCL Economics Research' };
export default function Page() { return <MarkdownGuide source={source} heading="MATLAB" active="Software" />; }
