'use client';

import { BrandHeader } from '@/components/brand-header';
import { SiteNav } from '@/components/site-nav';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import studentsData from '@/data/phd-students.json';

type Field = 'Applied Economics' | 'Economic Theory' | 'Macroeconomics' | 'Econometrics' | 'Finance';
type FieldId = 'all' | Field;
type Student = { name: string; email: string; researchAreas: string; profileUrl: string; mainField: Field; secondaryField: Field | '' };

const surname = (name: string) => name.trim().split(/\s+/).at(-1) || name;
const students = (studentsData as Student[]).toSorted((a, b) =>
  surname(a.name).localeCompare(surname(b.name), 'en-GB') || a.name.localeCompare(b.name, 'en-GB'),
);
const fields: { id: FieldId; label: string }[] = [
  { id: 'all', label: 'All Fields' },
  { id: 'Applied Economics', label: 'Applied Economics' },
  { id: 'Economic Theory', label: 'Economic Theory' },
  { id: 'Macroeconomics', label: 'Macroeconomics' },
  { id: 'Econometrics', label: 'Econometrics' },
  { id: 'Finance', label: 'Finance' },
];
const surnameGroups = [
  { id: 'a-h', label: 'A–H', letters: 'ABCDEFGH' },
  { id: 'i-p', label: 'I–P', letters: 'IJKLMNOP' },
  { id: 'q-z', label: 'Q–Z', letters: 'QRSTUVWXYZ' },
];
const maxStudentsPerPage = 24;

const matchesField = (student: Student, field: FieldId) =>
  field === 'all' || student.mainField === field || student.secondaryField === field;

function StudentTable({ matches }: { matches: Student[] }) {
  const rows = Array.from({ length: Math.ceil(matches.length / 4) }, (_, index) => matches.slice(index * 4, index * 4 + 4));
  return <div className="phd-table-wrap"><table className="phd-table" aria-label="PhD students">
    <tbody>{rows.map((row) => <tr key={row[0].email}>
      {row.map((student) => <td key={student.email}>
        <h2>{student.profileUrl ? <a href={student.profileUrl} target="_blank" rel="noreferrer">{student.name}</a> : student.name}</h2>
        <a className="phd-email" href={`mailto:${student.email}`}>{student.email}</a>
        <p>{student.researchAreas}</p>
      </td>)}
    </tr>)}</tbody>
  </table></div>;
}

function FieldStudents({ field }: { field: FieldId }) {
  const matches = students.filter((student) => matchesField(student, field));
  const pages = surnameGroups
    .map((group) => ({
      ...group,
      students: matches.filter((student) => group.letters.includes(surname(student.name)[0]?.toUpperCase())),
    }))
    .filter((group) => group.students.length > 0);

  if (matches.length <= maxStudentsPerPage) return <StudentTable matches={matches} />;

  return (
    <Tabs defaultValue={pages[0].id} className="surname-tabs">
      <TabsList variant="line" className="tabs surname-tab-list" aria-label="Surname range">
        {pages.map((page) => <TabsTrigger value={page.id} key={page.id}>{page.label}</TabsTrigger>)}
      </TabsList>
      {pages.map((page) => (
        <TabsContent value={page.id} key={page.id}><StudentTable matches={page.students} /></TabsContent>
      ))}
    </Tabs>
  );
}

export default function PhdStudentsPage() {
  return <div className="site">
    <BrandHeader />
    <SiteNav active="/phd-students" />
    <main>
      <header className="people-heading"><h1>PhD students</h1><p>{students.length} research students</p></header>
      <Tabs defaultValue="all" className="people-tabs">
        <TabsList variant="line" className="tabs field-tab-list" aria-label="Research field">
          {fields.map((field) => <TabsTrigger value={field.id} key={field.id}>{field.label}</TabsTrigger>)}
        </TabsList>
        {fields.map((field) => <TabsContent value={field.id} key={field.id}><FieldStudents field={field.id} /></TabsContent>)}
      </Tabs>
    </main>
    <footer><div><strong>UCL Economics Research</strong><span>2026–27</span></div><a href="mailto:l.nesheim@ucl.ac.uk">Contact Professor Lars Nesheim</a></footer>
  </div>;
}
