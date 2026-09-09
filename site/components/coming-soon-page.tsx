import { SiteNav } from '@/components/site-nav';

export function ComingSoonPage({ title, path }: { title: string; path: string }) {
  return (
    <div className="site">
      <header className="brand"><div><b aria-label="UCL">UCL</b><span>Economics Research</span></div></header>
      <SiteNav active={path} />
      <main className="coming-soon"><h1>{title}</h1><p>Coming soon</p></main>
      <footer><div><strong>UCL Economics Research</strong><span>Prototype · 2026–27</span></div><a href="mailto:l.nesheim@ucl.ac.uk">Contact Professor Lars Nesheim</a></footer>
    </div>
  );
}
