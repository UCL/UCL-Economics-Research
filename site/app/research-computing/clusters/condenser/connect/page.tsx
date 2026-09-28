import type { Metadata } from 'next';
import { MarkdownGuide } from '@/components/markdown-guide';

export const metadata: Metadata = { title: 'Connect to a Condenser virtual machine | UCL Economics Research' };
export default function Page() { return <MarkdownGuide file="connect.md" heading="Connect to a Condenser virtual machine" />; }
