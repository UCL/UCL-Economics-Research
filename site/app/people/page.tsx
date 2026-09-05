'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SiteNav } from '@/components/site-nav';
import peopleData from '@/data/people.json';

type Person = { name: string; title: string; email: string; profileUrl: string; personalUrl: string; surnameInitial: string };
const people = peopleData as Person[];
const groups = [
  { id: 'a-h', label: 'A–H', letters: 'ABCDEFGH' },
  { id: 'i-p', label: 'I–P', letters: 'IJKLMNOP' },
  { id: 'q-z', label: 'Q–Z', letters: 'QRSTUVWXYZ' },
];

function PeopleGrid({ letters }: { letters: string }) {
  const matches = people.filter((person) => letters.includes(person.surnameInitial));
  return (
    <div className="people-grid">
      {matches.map((person) => (
        <article className="person-card" key={person.email}>
          <h2>{person.personalUrl ? <a href={person.personalUrl}>{person.name}</a> : person.name}</h2>
          <p>{person.title}</p>
          <div className="person-links">
            {person.profileUrl && <a href={person.profileUrl} target="_blank" rel="noreferrer">UCL profile</a>}
            <a href={`mailto:${person.email}`}>{person.email}</a>
          </div>
        </article>
      ))}
    </div>
  );
}

export default function PeoplePage() {
  return (
    <div className="site">
      <header className="brand"><div><b aria-label="UCL">UCL</b><span>Economics Research</span></div></header>
      <SiteNav active="/people" />
      <main>
        <header className="people-heading"><h1>People</h1><p>{people.length} academic and teaching staff</p></header>
        <Tabs defaultValue="a-h" className="people-tabs">
          <TabsList variant="line" className="tabs">
            {groups.map((group) => <TabsTrigger value={group.id} key={group.id}>{group.label}</TabsTrigger>)}
          </TabsList>
          {groups.map((group) => <TabsContent value={group.id} key={group.id}><PeopleGrid letters={group.letters} /></TabsContent>)}
        </Tabs>
      </main>
      <footer><div><strong>UCL Economics Research</strong><span>Prototype · 2026–27</span></div><a href="mailto:l.nesheim@ucl.ac.uk">Contact Professor Lars Nesheim</a></footer>
    </div>
  );
}
