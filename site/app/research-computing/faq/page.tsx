import type { Metadata } from 'next';
import { ResearchComputingPage } from '@/components/research-computing-page';
export const metadata: Metadata = { title: 'FAQ | Research Computing | UCL Economics Research' };
export default function Page() { return <ResearchComputingPage active="FAQ"><p className="research-computing-coming-soon">Coming soon</p></ResearchComputingPage>; }
