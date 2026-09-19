import fs from 'node:fs/promises';
import path from 'node:path';
import { FileBlob, SpreadsheetFile } from '@oai/artifact-tool';

const root = path.resolve(process.argv[2] || process.cwd());
const workbookPath = path.join(root, 'phd_students', 'phd-students.xlsx');
const outputPath = path.join(root, 'site', 'data', 'phd-students.json');
const workbook = await SpreadsheetFile.importXlsx(await FileBlob.load(workbookPath));
const sheet = workbook.worksheets.getItem('PhD students');
const values = sheet.getUsedRange(true).values;
const requiredHeaders = ['Name', 'Email', 'Key research areas', 'Main field', 'Secondary field'];
const validFields = new Set(['Applied Economics', 'Economic Theory', 'Macroeconomics', 'Econometrics', 'Finance']);

const headerIndex = values.findIndex((row) => requiredHeaders.every((header) => row.map((value) => String(value || '').trim()).includes(header)));
if (headerIndex < 0) throw new Error(`Could not find the required headers: ${requiredHeaders.join(', ')}`);

const headers = values[headerIndex].map((value) => String(value || '').trim());
const records = values.slice(headerIndex + 1)
  .filter((row) => row.some((value) => value !== null && String(value).trim() !== ''))
  .map((row) => Object.fromEntries(headers.map((header, index) => [header, row[index] ?? ''])));

const existing = JSON.parse(await fs.readFile(outputPath, 'utf8'));
const existingByEmail = new Map(existing.map((student) => [String(student.email).trim().toLowerCase(), student]));
const seenEmails = new Set();
const students = records.map((record, index) => {
  const rowNumber = headerIndex + index + 2;
  const name = String(record.Name || '').trim();
  const email = String(record.Email || '').trim();
  const researchAreas = String(record['Key research areas'] || '').trim();
  const mainField = String(record['Main field'] || '').trim();
  const secondaryField = String(record['Secondary field'] || '').trim();
  if (!name || !email || !researchAreas || !mainField) {
    throw new Error(`Missing required student data in workbook row ${rowNumber}.`);
  }
  const emailKey = email.toLowerCase();
  if (seenEmails.has(emailKey)) throw new Error(`Duplicate email in workbook: ${email}`);
  seenEmails.add(emailKey);
  if (!validFields.has(mainField)) throw new Error(`Invalid Main field for ${name}: ${mainField}`);
  if (secondaryField && !validFields.has(secondaryField)) throw new Error(`Invalid Secondary field for ${name}: ${secondaryField}`);
  return {
    name,
    email,
    researchAreas,
    profileUrl: String(existingByEmail.get(emailKey)?.profileUrl || ''),
    mainField,
    secondaryField,
  };
});

await fs.writeFile(outputPath, `${JSON.stringify(students, null, 2)}\n`);
console.log(JSON.stringify({ workbook: workbookPath, generated: outputPath, students: students.length }));
