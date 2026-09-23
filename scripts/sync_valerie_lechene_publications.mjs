import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const researchDir = path.join(root, 'research_staff');
const sourceUrl = 'https://www.valerielechene.com/home/research';
const staffName = 'Valerie Lechene';

const norm = (value = '') => value
  .normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
  .toLowerCase().replace(/behaviour/g, 'behavior').replace(/labour/g, 'labor')
  .replace(/[^a-z0-9]+/g, ' ').trim();
const slug = (value) => norm(value).replace(/ /g, '-');

const publications = JSON.parse(await fs.readFile(path.join(researchDir, 'publications.json'), 'utf8'));
const curated = JSON.parse(await fs.readFile(path.join(researchDir, 'valerie_lechene_publications.json'), 'utf8'));
const publicPath = path.join(root, 'site', 'public', 'publications.json');
const publicPublications = JSON.parse(await fs.readFile(publicPath, 'utf8'));

for (const publication of publications) {
  publication.staff = (publication.staff || []).filter((name) => name !== staffName);
  publication.fields = publication.staff.length ? (publication.fields || []) : [];
}

let added = 0;
let matched = 0;
for (const item of curated) {
  const identifiers = new Set([item.title, ...(item.aliases || [])].map(norm));
  let publication = item.doi
    ? publications.find((candidate) => norm(candidate.doi) === norm(item.doi))
    : publications.find((candidate) => identifiers.has(norm(candidate.title)));
  if (!publication) {
    publication = {
      id: item.doi ? slug(item.doi) : `valerie-lechene-${slug(item.title)}-${item.year || 'undated'}`,
      topicField: '',
      isEconomics: true,
      sourceType: 'personal website',
      classificationConfidence: 'High',
      classificationSource: 'Author personal website',
      classificationNeedsReview: false,
      classificationScores: { Applied: 1 },
      classificationUclAuthors: [staffName],
      classificationUnresolvedAuthors: [],
      staff: [],
      fields: [],
    };
    publications.push(publication);
    added += 1;
  } else {
    matched += 1;
  }
  Object.assign(publication, {
    title: item.title,
    year: item.year,
    date: item.date,
    authors: item.authors,
    venue: item.venue,
    doi: item.doi,
    url: item.url,
    type: item.type,
    category: item.category,
    sourceType: 'personal website',
    isEconomics: true,
    paperPrimaryField: 'Applied',
    paperSecondaryField: '',
    paperFields: ['Applied'],
    classificationConfidence: 'High',
    classificationSource: 'Author personal website',
    classificationNeedsReview: false,
    classificationScores: { Applied: 1 },
    classificationUclAuthors: [staffName],
    classificationUnresolvedAuthors: [],
    source: 'Valerie Lechene personal website',
    sourceUrl,
  });
  publication.staff = [...new Set([...(publication.staff || []), staffName])];
  publication.fields = [...new Set([...(publication.fields || []), 'Applied'])];
}

const pretty = `${JSON.stringify(publications, null, 2)}\n`;
await fs.writeFile(path.join(researchDir, 'publications.json'), pretty);
await fs.writeFile(path.join(root, 'site', 'data', 'publications.json'), pretty);
for (const item of curated.filter((candidate) => ['Journal article', 'Book'].includes(candidate.category))) {
  const databaseRecord = item.doi
    ? publications.find((candidate) => norm(candidate.doi) === norm(item.doi))
    : publications.find((candidate) => norm(candidate.title) === norm(item.title));
  let publicRecord = item.doi
    ? publicPublications.find((candidate) => norm(candidate.doi) === norm(item.doi))
    : publicPublications.find((candidate) => norm(candidate.title) === norm(item.title));
  if (!publicRecord) {
    publicRecord = {
      id: databaseRecord.id, title: databaseRecord.title, year: databaseRecord.year,
      date: databaseRecord.date, authors: databaseRecord.authors, venue: databaseRecord.venue,
      doi: databaseRecord.doi, url: databaseRecord.url, type: databaseRecord.type,
      sourceType: 'personal website', topicField: '', isEconomics: true,
      category: databaseRecord.category, staff: [staffName], fields: ['Applied'], paperFields: ['Applied'],
    };
    publicPublications.push(publicRecord);
  } else {
    publicRecord.staff = [...new Set([...(publicRecord.staff || []), staffName])];
    publicRecord.fields = [...new Set([...(publicRecord.fields || []), 'Applied'])];
    publicRecord.paperFields = [...new Set([...(publicRecord.paperFields || []), 'Applied'])];
  }
}
await fs.writeFile(publicPath, `${JSON.stringify(publicPublications, null, 2)}\n`);

const peoplePath = path.join(root, 'site', 'data', 'people.json');
const personPagesPath = path.join(root, 'site', 'data', 'person-publications.json');
const indexPath = path.join(root, 'site', 'data', 'people-publication-index.json');
const people = JSON.parse(await fs.readFile(peoplePath, 'utf8'));
const pages = JSON.parse(await fs.readFile(personPagesPath, 'utf8'));
const index = JSON.parse(await fs.readFile(indexPath, 'utf8'));
const person = people.find((candidate) => candidate.name === staffName);
const sectionByTitle = new Map(curated.map((item) => [norm(item.title), item.section]));
const grouped = { journal: [], working: [], other: [] };
for (const publication of publications.filter((candidate) => (candidate.staff || []).includes(staffName))) {
  const section = sectionByTitle.get(norm(publication.title));
  grouped[section].push({
    id: publication.id,
    title: publication.title,
    year: publication.year || 0,
    date: publication.date || '',
    authors: publication.authors || [],
    venue: publication.venue || '',
    url: publication.url || '',
    type: publication.type || '',
  });
}
for (const items of Object.values(grouped)) {
  items.sort((a, b) => (b.year || 0) - (a.year || 0) || a.title.localeCompare(b.title));
}
const page = {
  slug: 'valerie-lechene',
  name: staffName,
  title: person.title,
  profileUrl: person.profileUrl,
  email: person.email,
  publications: grouped,
};
const pagePosition = pages.findIndex((candidate) => candidate.name === staffName);
if (pagePosition >= 0) pages[pagePosition] = page;
else pages.push(page);
const indexEntry = { name: staffName, slug: page.slug, count: curated.length };
const indexPosition = index.findIndex((candidate) => candidate.name === staffName);
if (indexPosition >= 0) index[indexPosition] = indexEntry;
else index.push(indexEntry);
await fs.writeFile(personPagesPath, `${JSON.stringify(pages, null, 2)}\n`);
await fs.writeFile(indexPath, `${JSON.stringify(index, null, 2)}\n`);

console.log(JSON.stringify({ curated: curated.length, matched, added, total: publications.length, pageCounts: Object.fromEntries(Object.entries(grouped).map(([key, value]) => [key, value.length])) }));
