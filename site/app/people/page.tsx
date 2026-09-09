'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SiteNav } from '@/components/site-nav';
import peopleData from '@/data/people.json';
import publicationIndexData from '@/data/people-publication-index.json';
import { sitePath } from '@/lib/site-path';

type Person = {
  name: string;
  title: string;
  email: string;
  profileUrl: string;
  personalUrl: string;
  surnameInitial: string;
  primaryField: string;
  secondaryField: string;
  researchKeywords?: string[];
};
type FieldId = 'all' | 'Applied' | 'Econometrics' | 'Theory' | 'Finance' | 'Macroeconomics';

const surname = (name: string) => name.trim().split(/\s+/).at(-1) || name;
const people = (peopleData as Person[]).toSorted((a, b) =>
  surname(a.name).localeCompare(surname(b.name), 'en-GB') || a.name.localeCompare(b.name, 'en-GB'),
);
const publicationIndex = new Map((publicationIndexData as { name: string; slug: string; count: number }[]).map((item) => [item.name, item]));
const fields: { id: FieldId; label: string }[] = [
  { id: 'all', label: 'All Fields' },
  { id: 'Applied', label: 'Applied Economics' },
  { id: 'Econometrics', label: 'Econometrics' },
  { id: 'Theory', label: 'Economic Theory' },
  { id: 'Finance', label: 'Finance' },
  { id: 'Macroeconomics', label: 'Macroeconomics' },
];
const surnameGroups = [
  { id: 'a-h', label: 'A–H', letters: 'ABCDEFGH' },
  { id: 'i-p', label: 'I–P', letters: 'IJKLMNOP' },
  { id: 'q-z', label: 'Q–Z', letters: 'QRSTUVWXYZ' },
];
const maxPeoplePerPage = 24;

function PeopleGrid({ matches }: { matches: Person[] }) {
  return (
    <div className="people-grid">
      {matches.map((person) => {
        const webpage = person.personalUrl || person.profileUrl;
        const researchKeywords = person.researchKeywords?.filter(Boolean) ?? [];
        const researchAreas = researchKeywords.length
          ? researchKeywords
          : [person.primaryField, person.secondaryField].filter(Boolean);
        return <article className="person-card" key={person.email}>
          <h2>{webpage ? <a href={webpage} target="_blank" rel="noreferrer">{person.name}</a> : person.name}</h2>
          <p>{person.title}</p>
          <div className="person-links">
            {person.profileUrl && <a href={person.profileUrl} target="_blank" rel="noreferrer">UCL profile</a>}
            <a href={`mailto:${person.email}`}>{person.email}</a>
            {publicationIndex.has(person.name) && <a href={sitePath(`/people/${publicationIndex.get(person.name)!.slug}/`)}>Publications</a>}
          </div>
          <p className="research-keywords">
            <span>{researchAreas.join(' · ')}</span>
          </p>
        </article>;
      })}
    </div>
  );
}

function FieldPeople({ field }: { field: FieldId }) {
  const matches = field === 'all'
    ? people
    : people.filter((person) => person.primaryField === field || person.secondaryField === field);
  const pages = surnameGroups
    .map((group) => ({ ...group, people: matches.filter((person) => group.letters.includes(person.surnameInitial)) }))
    .filter((group) => group.people.length > 0);

  if (matches.length <= maxPeoplePerPage) return <PeopleGrid matches={matches} />;

  return (
    <Tabs defaultValue={pages[0].id} className="surname-tabs">
      <TabsList variant="line" className="tabs surname-tab-list" aria-label="Surname range">
        {pages.map((page) => <TabsTrigger value={page.id} key={page.id}>{page.label}</TabsTrigger>)}
      </TabsList>
      {pages.map((page) => (
        <TabsContent value={page.id} key={page.id}><PeopleGrid matches={page.people} /></TabsContent>
      ))}
    </Tabs>
  );
}

export default function PeoplePage() {
  return (
    <div className="site">
      <header className="brand"><div><b aria-label="UCL">UCL</b><span>Economics Research</span></div></header>
      <SiteNav active="/people" />
      <main>
        <header className="people-heading"><h1>People</h1><p>{people.length} academic and teaching staff</p></header>
        <Tabs defaultValue="all" className="people-tabs">
          <TabsList variant="line" className="tabs field-tab-list" aria-label="Research field">
            {fields.map((field) => <TabsTrigger value={field.id} key={field.id}>{field.label}</TabsTrigger>)}
          </TabsList>
          {fields.map((field) => (
            <TabsContent value={field.id} key={field.id}><FieldPeople field={field.id} /></TabsContent>
          ))}
        </Tabs>
      </main>
      <footer><div><strong>UCL Economics Research</strong><span>Prototype · 2026–27</span></div><a href="mailto:l.nesheim@ucl.ac.uk">Contact Professor Lars Nesheim</a></footer>
    </div>
  );
}
