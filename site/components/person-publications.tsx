'use client';

import { Fragment } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { sitePath } from '@/lib/site-path';

type Publication = { id: string; title: string; year: number; date: string; authors: string[]; venue: string; url: string; type: string };
type PersonPublicationPage = {
  slug: string;
  name: string;
  title: string;
  profileUrl: string;
  email: string;
  publications: { journal: Publication[]; working: Publication[]; other: Publication[] };
};

const groups = [
  { id: 'journal', label: 'Journal articles' },
  { id: 'working', label: 'Working papers' },
  { id: 'other', label: 'Other' },
] as const;

function PublicationList({ items, person }: { items: Publication[]; person: string }) {
  if (!items.length) return <p className="publications-empty">No publications in this category.</p>;
  return (
    <div className="publication-list person-publication-list">
      {items.map((publication) => (
        <article key={publication.id}>
          <time>{publication.year || 'Date unavailable'}</time>
          <div>
            <h2>{publication.url ? <a href={publication.url} target="_blank" rel="noreferrer">{publication.title}</a> : publication.title}</h2>
            <p>{publication.authors.map((author, index) => <Fragment key={`${author}-${index}`}>{index > 0 && ', '}{author === person ? <strong>{author}</strong> : author}</Fragment>)}</p>
            {publication.venue && <p className="publication-meta">{publication.venue}</p>}
          </div>
        </article>
      ))}
    </div>
  );
}

export function PersonPublications({ person }: { person: PersonPublicationPage }) {
  return (
    <>
      <header className="person-publications-heading">
        <a href={sitePath('/people/')}>← People</a>
        <h1>{person.name}</h1>
        <p>{person.title}</p>
      </header>
      <Tabs defaultValue="journal" className="person-publication-tabs">
        <div className="tab-scroll"><TabsList variant="line" className="tabs">
          {groups.map((group) => (
            <TabsTrigger value={group.id} key={group.id}>
              {group.label}
            </TabsTrigger>
          ))}
        </TabsList></div>
        {groups.map((group) => <TabsContent value={group.id} key={group.id}><PublicationList items={person.publications[group.id]} person={person.name} /></TabsContent>)}
      </Tabs>
    </>
  );
}
