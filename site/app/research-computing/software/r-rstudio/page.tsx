import type { Metadata } from 'next';
import { MarkdownGuide } from '@/components/markdown-guide';
import source from '@/content/research-computing/software/r-rstudio.md?raw';

export const metadata: Metadata = { title: 'R and RStudio | Research Computing | UCL Economics Research' };
export default function Page() { return <MarkdownGuide source={source} heading="R and RStudio" active="Software" />; }
