import type { Metadata } from 'next';
import { SoftwarePackagePage } from '@/components/software-package-page';

export const metadata: Metadata = { title: 'MATLAB | Research Computing | UCL Economics Research' };
export default function Page() { return <SoftwarePackagePage name="MATLAB" slug="matlab" />; }
