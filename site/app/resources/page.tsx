import { SiteNav } from '@/components/site-nav';
import { BrandHeader } from '@/components/brand-header';
import { sitePath } from '@/lib/site-path';

const resources = [
  {
    name: 'Research Computing',
    description: 'computing resources for research staff and students',
    href: '/research-computing',
  },
  {
    name: 'Data',
    description: 'data resources for economic research',
    href: '/data',
  },
  {
    name: 'UCL Macro Monitor',
    href: 'https://www.macromonitor.org',
  },
] as const;

export default function ResourcesPage() {
  return (
    <div className="site">
      <BrandHeader />
      <SiteNav active="/resources" />
      <main>
        <header className="resources-heading">
          <p className="eyebrow">UCL Economics</p>
          <h1>Resources</h1>
        </header>
        <div className="resource-list">
          {resources.map((resource) => (
            <a
              href={resource.href.startsWith('/') ? sitePath(`${resource.href}/`) : resource.href}
              key={resource.name}
              {...(!resource.href.startsWith('/') && { target: '_blank', rel: 'noreferrer' })}
            >
              <strong>{resource.name}</strong>
              {'description' in resource && <span>{resource.description}</span>}
            </a>
          ))}
        </div>
      </main>
      <footer><div><strong>UCL Economics Research</strong><span>2026–27</span></div><a href="mailto:l.nesheim@ucl.ac.uk">Contact Professor Lars Nesheim</a></footer>
    </div>
  );
}
