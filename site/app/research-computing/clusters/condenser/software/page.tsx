import type { Metadata } from 'next';
import { MarkdownGuide } from '@/components/markdown-guide';

export const metadata: Metadata = { title: 'Install software on a Condenser Ubuntu VM | UCL Economics Research' };
export default function Page() { return <MarkdownGuide file="software.md" heading="Install software on a Condenser Ubuntu VM" />; }
