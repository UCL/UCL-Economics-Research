import fs from 'node:fs/promises';
import path from 'node:path';
import { FileBlob, SpreadsheetFile } from '@oai/artifact-tool';

const root = path.resolve(process.argv[2] || process.cwd());
const researchDir = path.join(root, 'research_staff');
const workbook = await SpreadsheetFile.importXlsx(
  await FileBlob.load(path.join(researchDir, 'research-staff.xlsx')),
);
const sheet = workbook.worksheets.getItem('Research staff');
const values = sheet.getUsedRange(true).values;
const headers = values[0].map((value) => String(value || '').trim());
const validFields = new Set(['Applied', 'Econometrics', 'Theory', 'Macroeconomics', 'Finance']);

const records = [];
for (const row of values.slice(1)) {
  if (!row[0]) break;
  records.push(Object.fromEntries(headers.map((header, index) => [header, row[index] ?? ''])));
}

const invalid = records.filter((record) => !validFields.has(String(record['Primary field']).trim()));
if (invalid.length) {
  throw new Error(`Invalid primary fields for: ${invalid.map((record) => record.Name).join(', ')}`);
}

const existing = JSON.parse(await fs.readFile(path.join(researchDir, 'staff.json'), 'utf8'));
const byName = new Map(existing.map((person) => [person.name, person]));
for (const record of records) {
  const person = byName.get(String(record.Name));
  if (!person) throw new Error(`Workbook staff member not found in staff.json: ${record.Name}`);
  person.title = String(record.Title || person.title || '');
  person.email = String(record['Email address'] || person.email || '').trim();
  person.personalUrl = String(record['Personal webpage'] || '').trim();
  person.primaryField = String(record['Primary field']).trim();
  person.secondaryField = String(record['Secondary field'] || '').trim();
  person.profileUrl = String(record['UCL profile'] || person.profileUrl || '').trim();
  person.classificationStatus = 'Edited in research staff workbook';
}

const staff = existing.filter((person) => byName.has(person.name));
const json = `${JSON.stringify(staff, null, 2)}\n`;
await fs.writeFile(path.join(researchDir, 'staff.json'), json);
await fs.writeFile(path.join(root, 'site', 'data', 'people.json'), json);
console.log(JSON.stringify({ imported: records.length, invalidPrimaryFields: invalid.length }));
