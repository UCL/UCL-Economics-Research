import { SiteNav } from '@/components/site-nav';

const resources = [
  {
    name: 'Econ Brief',
    description: 'executive summaries of recent publications',
    href: 'https://ucleconbrief.co.uk',
  },
  {
    name: 'UCL Macro Monitor',
    href: 'https://www.macromonitor.org',
  },
] as const;

export default function ResourcesPage() {
  return (
    <div className="site">
      <header className="brand"><div><b aria-label="UCL">UCL</b><span>Economics Research</span></div></header>
      <SiteNav active="/resources" />
      <main>
        <header className="resources-heading">
          <p className="eyebrow">UCL Economics</p>
          <h1>Resources</h1>
        </header>
        <div className="resource-list">
          {resources.map((resource) => (
            <a href={resource.href} key={resource.name} target="_blank" rel="noreferrer">
              <strong>{resource.name}</strong>
              {'description' in resource && <span>{resource.description}</span>}
            </a>
          ))}
        </div>
      </main>
      <footer><div><strong>UCL Economics Research</strong><span>Prototype · 2026–27</span></div><a href="mailto:l.nesheim@ucl.ac.uk">Contact Professor Lars Nesheim</a></footer>
    </div>
  );
}
