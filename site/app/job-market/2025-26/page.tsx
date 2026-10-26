import type { Metadata } from 'next';
import { JobMarketPage } from '@/components/job-market-page';
export const metadata: Metadata = { title: 'Job market placements 2025–26 | UCL Economics Research', description: 'UCL Economics 2025–26 candidates and current positions.' };
export default function Page() { return <JobMarketPage year="2025-26" />; }
