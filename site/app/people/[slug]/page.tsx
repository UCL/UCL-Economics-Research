import { notFound } from 'next/navigation';
import { SiteNav } from '@/components/site-nav';
import { PersonPublications } from '@/components/person-publications';
import publicationPages from '@/data/person-publications.json';

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return publicationPages.map((person) => ({ slug: person.slug }));
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const person = publicationPages.find((item) => item.slug === slug);
  if (!person) notFound();
  return (
    <div className="site">
      <header className="brand"><div><b aria-label="UCL">UCL</b><span>Economics Research</span></div></header>
      <SiteNav active="/people" />
      <main><PersonPublications person={person} /></main>
      <footer><div><strong>UCL Economics Research</strong><span>Prototype · publication data under review</span></div><a href="mailto:l.nesheim@ucl.ac.uk">Contact Professor Lars Nesheim</a></footer>
    </div>
  );
}
