import type { Metadata } from 'next';
import { ResearchComputingPage } from '@/components/research-computing-page';
export const metadata: Metadata = { title: 'Teaching | Research Computing | UCL Economics Research' };
export default function Page() { return <ResearchComputingPage active="Teaching"><p className="research-computing-coming-soon">Coming soon</p></ResearchComputingPage>; }
