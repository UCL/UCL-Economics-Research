import type { Metadata } from 'next';
import { SoftwarePackagePage } from '@/components/software-package-page';

export const metadata: Metadata = { title: 'R and RStudio | Research Computing | UCL Economics Research' };
export default function Page() { return <SoftwarePackagePage name="R and RStudio" slug="r-rstudio" />; }
