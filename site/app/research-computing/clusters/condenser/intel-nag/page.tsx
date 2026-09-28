import type { Metadata } from 'next';
import { MarkdownGuide } from '@/components/markdown-guide';

export const metadata: Metadata = { title: 'Intel oneAPI and NAG on Condenser | UCL Economics Research' };
export default function Page() { return <MarkdownGuide file="intel-nag-condenser.md" heading="Intel oneAPI and NAG on Condenser" />; }
