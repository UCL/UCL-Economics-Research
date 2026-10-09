'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SiteNav } from '@/components/site-nav';
import { BrandHeader } from '@/components/brand-header';
import peopleData from '@/data/people.json';
import photoData from '@/data/people-photos.json';
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

const surname = (name: string) => name === 'Aureo De Paula Neto'
  ? 'Paula'
  : name.trim().split(/\s+/).at(-1) || name;
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
const maxPeoplePerPage = 12;
const photos = photoData as Record<string, string>;

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
          {photos[person.email] && <img className="person-photo" src={sitePath(photos[person.email])} alt="" width={72} height={72} loading="lazy" onError={(event) => { event.currentTarget.hidden = true; }} />}
          <h2>{webpage ? <a href={webpage} target="_blank" rel="noreferrer">{person.name}</a> : person.name}</h2>
          <p>{person.title}</p>
          <div className="person-links">
            {person.profileUrl && <a href={person.profileUrl} target="_blank" rel="noreferrer">UCL profile</a>}
            {publicationIndex.has(person.name) && <a href={sitePath(`/people/${publicationIndex.get(person.name)!.slug}/`)}>Publications</a>}
            <a href={`mailto:${person.email}`}>{person.email}</a>
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
  const groups = field === 'all' || field === 'Applied'
    ? [matches]
    : surnameGroups.map((group) => matches.filter((person) => group.letters.includes(person.surnameInitial)));
  const pages = groups.flatMap((members, groupIndex) =>
    Array.from({ length: Math.ceil(members.length / maxPeoplePerPage) }, (_, index) => {
      const pagePeople = members.slice(index * maxPeoplePerPage, (index + 1) * maxPeoplePerPage);
      const first = surname(pagePeople[0].name).charAt(0).toUpperCase();
      const last = surname(pagePeople[pagePeople.length - 1].name).charAt(0).toUpperCase();
      return {
        id: `group-${groupIndex}-${index}`,
        label: first === last ? first : `${first}–${last}`,
        people: pagePeople,
      };
    }),
  );

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
      <BrandHeader />
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
      <footer><div><strong>UCL Economics Research</strong><span>2026–27</span></div><a href="mailto:l.nesheim@ucl.ac.uk">Contact Professor Lars Nesheim</a></footer>
    </div>
  );
}
