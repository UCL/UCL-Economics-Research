import type { Metadata } from 'next';
import { MarkdownGuide } from '@/components/markdown-guide';
import source from '@/content/research-computing/software/vscode/using.md?raw';

export const metadata: Metadata = { title: 'Using VS Code | UCL Economics Research' };
export default function Page() { return <MarkdownGuide source={source} heading="Using VS Code" active="Software" />; }
