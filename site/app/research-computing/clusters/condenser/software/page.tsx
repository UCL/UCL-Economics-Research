import type { Metadata } from 'next';
import { MarkdownGuide } from '@/components/markdown-guide';
import source from '@/content/research-computing/condenser/software.md?raw';

export const metadata: Metadata = { title: 'Install software on a Condenser Ubuntu VM | UCL Economics Research' };
export default function Page() { return <MarkdownGuide source={source} heading="Install software on a Condenser Ubuntu VM" />; }
