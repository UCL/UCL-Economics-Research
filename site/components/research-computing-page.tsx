import type { ReactNode } from 'react';
import { BrandHeader } from '@/components/brand-header';
import { SiteNav } from '@/components/site-nav';
import { sitePath } from '@/lib/site-path';

export type ResearchComputingSection = 'Clusters' | 'Software' | 'Data storage' | 'Research' | 'Teaching' | 'FAQ';

const tabs: ReadonlyArray<{ label: ResearchComputingSection; path: string }> = [
  { label: 'Clusters', path: '/research-computing/clusters/' },
  { label: 'Software', path: '/research-computing/software/' },
  { label: 'Data storage', path: '/research-computing/data-storage/' },
  { label: 'Research', path: '/research-computing/research/' },
  { label: 'Teaching', path: '/research-computing/teaching/' },
  { label: 'FAQ', path: '/research-computing/faq/' },
];

export function ResearchComputingPage({ active, heading = active, children }: { active: ResearchComputingSection; heading?: string; children: ReactNode }) {
  return (
    <div className="site">
      <BrandHeader />
      <SiteNav active="/resources" />
      <main className="research-computing">
        <header className="research-computing-heading">
          <p className="eyebrow">UCL Economics</p>
          <div className="research-computing-title-row">
            <h1>Research Computing</h1>
            <a href="https://myservices.ucl.ac.uk/self-service" target="_blank" rel="noreferrer">IT support (MyServices)</a>
          </div>
        </header>
        <nav className="research-computing-tabs" aria-label="Research Computing sections">
          {tabs.map((tab) => (
            <a href={sitePath(tab.path)} className={tab.label === active ? 'active' : undefined} aria-current={tab.label === active ? 'page' : undefined} key={tab.label}>
              {tab.label}
            </a>
          ))}
        </nav>
        <section className="research-computing-content">
          <h2>{heading}</h2>
          {children}
        </section>
      </main>
      <footer><div><strong>UCL Economics Research</strong><span>2026–27</span></div><a href="mailto:l.nesheim@ucl.ac.uk">Contact Professor Lars Nesheim</a></footer>
    </div>
  );
}
