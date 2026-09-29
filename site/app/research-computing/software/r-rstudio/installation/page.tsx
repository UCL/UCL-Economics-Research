import type { Metadata } from 'next';
import { MarkdownGuide } from '@/components/markdown-guide';
import source from '@/content/research-computing/software/r-rstudio/installation.md?raw';

export const metadata: Metadata = { title: 'Installation and licence — R and RStudio | UCL Economics Research' };
export default function Page() { return <MarkdownGuide source={source} heading="Installation and licence" active="Software" />; }

