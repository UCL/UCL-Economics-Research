import type { Metadata } from 'next';
import { MarkdownGuide } from '@/components/markdown-guide';
import source from '@/content/research-computing/software/r-rstudio/code-library.md?raw';

export const metadata: Metadata = { title: 'UCL code library — R and RStudio | UCL Economics Research' };
export default function Page() { return <MarkdownGuide source={source} heading="UCL code library" active="Software" />; }

