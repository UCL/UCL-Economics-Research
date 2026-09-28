import type { Metadata } from 'next';
import { MarkdownGuide } from '@/components/markdown-guide';
import source from '@/content/research-computing/condenser/connect.md?raw';

export const metadata: Metadata = { title: 'Connect to a Condenser virtual machine | UCL Economics Research' };
export default function Page() { return <MarkdownGuide source={source} heading="Connect to a Condenser virtual machine" />; }
