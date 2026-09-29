import type { Metadata } from 'next';
import { MarkdownGuide } from '@/components/markdown-guide';
import source from '@/content/research-computing/software/r-rstudio/using.md?raw';

export const metadata: Metadata = { title: 'Using R and RStudio — R and RStudio | UCL Economics Research' };
export default function Page() { return <MarkdownGuide source={source} heading="Using R and RStudio" active="Software" />; }

