import type { Metadata } from 'next';
import { JobMarketPage } from '@/components/job-market-page';
export const metadata: Metadata = { title: 'Job market 2026–27 | UCL Economics Research', description: 'UCL Economics job market candidates and previous placements.' };
export default function Page() { return <JobMarketPage year="2026-27" />; }
