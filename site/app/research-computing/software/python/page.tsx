import type { Metadata } from 'next';
import { SoftwarePackagePage } from '@/components/software-package-page';

export const metadata: Metadata = { title: 'Python | Research Computing | UCL Economics Research' };
export default function Page() { return <SoftwarePackagePage name="Python" slug="python" />; }
