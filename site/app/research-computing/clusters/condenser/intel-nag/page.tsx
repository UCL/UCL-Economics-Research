import type { Metadata } from 'next';
import { MarkdownGuide } from '@/components/markdown-guide';
import source from '@/content/research-computing/condenser/intel-nag-condenser.md?raw';

export const metadata: Metadata = { title: 'Intel oneAPI and NAG on Condenser | UCL Economics Research' };
export default function Page() { return <MarkdownGuide source={source} heading="Intel oneAPI and NAG on Condenser" />; }
