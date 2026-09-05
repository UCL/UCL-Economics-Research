'use client';

import { Fragment, useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SiteNav } from '@/components/site-nav';

type Publication = {
  id: string;
  title: string;
  year: number;
  authors: string[];
  venue: string;
  url: string;
  staff: string[];
  paperFields: string[];
  category: 'Journal article' | 'Book' | 'Other';
  isEconomics: boolean;
};

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 15 }, (_, index) => currentYear - index);
const fields = ['Applied', 'Econometrics', 'Theory', 'Macroeconomics', 'Finance'];

const nameParts = (name: string) => name
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9 ]/g, ' ')
  .split(/\s+/)
  .filter(Boolean);

function isUclAuthor(author: string, staff: string[]) {
  const authorParts = nameParts(author);
  return staff.some((person) => {
    const staffParts = nameParts(person);
    return authorParts.join(' ') === staffParts.join(' ') || (
      authorParts.at(-1) === staffParts.at(-1) &&
      authorParts[0]?.[0] === staffParts[0]?.[0]
    );
  });
}

function AuthorNames({ authors, staff }: { authors: string[]; staff: string[] }) {
  return authors.map((author, index) => (
    <Fragment key={`${author}-${index}`}>
      {index > 0 && ', '}
      {isUclAuthor(author, staff) ? <strong>{author}</strong> : author}
    </Fragment>
  ));
}

function PublicationGroup({ title, items }: { title: string; items: Publication[] }) {
  const [visible, setVisible] = useState(100);
  if (!items.length) return null;
  return (
    <section className="publication-group">
      <div className="publication-section-heading">
        <h2>{title}</h2>
        <p>{items.length.toLocaleString('en-GB')}</p>
      </div>
      <div className="publication-list">
        {items.slice(0, visible).map((publication) => (
          <article key={publication.id}>
            <div>
              <h2>{publication.url ? <a href={publication.url} target="_blank" rel="noreferrer">{publication.title}</a> : publication.title}</h2>
              <p><AuthorNames authors={publication.authors} staff={publication.staff} /></p>
              {(publication.venue || publication.staff.length > 0) && (
                <p className="publication-meta">
                  {publication.venue}{publication.venue && publication.staff.length > 0 ? ' · ' : ''}
                  {publication.staff.map((person, index) => (
                    <Fragment key={person}>{index > 0 && ', '}<strong>{person}</strong></Fragment>
                  ))}
                </p>
              )}
            </div>
          </article>
        ))}
      </div>
      {visible < items.length && (
        <Button className="publication-more" variant="outline" onClick={() => setVisible((count) => count + 100)}>Show 100 more</Button>
      )}
    </section>
  );
}

function YearPublications({ items, year }: { items: Publication[]; year: number }) {
  const journalArticles = items.filter((publication) => publication.category === 'Journal article');
  const books = items.filter((publication) => publication.category === 'Book');
  if (!journalArticles.length && !books.length) {
    return <p className="publications-empty">No qualifying economics journal articles or books are currently listed for {year}.</p>;
  }
  return <>
    <PublicationGroup title="Refereed journal articles" items={journalArticles} />
    <PublicationGroup title="Books" items={books} />
  </>;
}

export default function PublicationsPage() {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedField, setSelectedField] = useState('Applied');
  const [selectedYear, setSelectedYear] = useState(currentYear);
  useEffect(() => {
    void fetch('/publications.json')
      .then((response) => response.json() as Promise<Publication[]>)
      .then((records) => setPublications(records))
      .catch(() => setPublications([]))
      .finally(() => setLoading(false));
  }, []);
  const selectedPublications = useMemo(() => publications.filter((publication) =>
    publication.year === selectedYear &&
    publication.paperFields.includes(selectedField) &&
    publication.isEconomics &&
    publication.category !== 'Other'
  ), [publications, selectedField, selectedYear]);

  return (
    <div className="site">
      <header className="brand"><div><b aria-label="UCL">UCL</b><span>Economics Research</span></div></header>
      <SiteNav active="/publications" />
      <main>
        <header className="publications-heading">
          <p className="eyebrow">UCL Economics</p>
          <h1>Recent publications</h1>
        </header>
        <div className="publication-filter">
          <p>Field</p>
          <Tabs value={selectedField} onValueChange={setSelectedField} className="publication-tabs">
            <div className="tab-scroll"><TabsList variant="line" className="tabs">
              {fields.map((field) => <TabsTrigger key={field} value={field}>{field}</TabsTrigger>)}
            </TabsList></div>
          </Tabs>
          <p>Year</p>
          <Tabs value={String(selectedYear)} onValueChange={(value) => setSelectedYear(Number(value))} className="publication-tabs">
            <div className="tab-scroll"><TabsList variant="line" className="tabs">
              {years.map((year) => <TabsTrigger key={year} value={String(year)}>{year}</TabsTrigger>)}
            </TabsList></div>
          </Tabs>
        </div>
        <div className="publication-results" aria-live="polite">
          {loading ? <p>Loading publications…</p> : (
            <YearPublications key={`${selectedField}-${selectedYear}`} year={selectedYear} items={selectedPublications} />
          )}
        </div>
        <p className="publication-source">Each paper is classified using the primary field of its UCL author. Papers with multiple UCL authors appear under the union of their primary fields.</p>
      </main>
      <footer><div><strong>UCL Economics Research</strong><span>Prototype · publication data under review</span></div><a href="mailto:l.nesheim@ucl.ac.uk">Contact Professor Lars Nesheim</a></footer>
    </div>
  );
}
