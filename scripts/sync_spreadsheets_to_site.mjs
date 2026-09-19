import fs from 'node:fs/promises';
import path from 'node:path';
import { FileBlob, SpreadsheetFile } from './lib/workbook.mjs';

const root = path.resolve(process.argv[2] || process.cwd());

function isoDate(value) {
  if (!value) return '';
  const date = typeof value === 'number'
    ? new Date(Math.round((value - 25569) * 86400) * 1000)
    : value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

async function valuesFromWorkbook(filePath, sheetName) {
  const blob = await FileBlob.load(filePath);
  const workbook = await SpreadsheetFile.importXlsx(blob);
  const sheet = workbook.worksheets.getItem(sheetName);
  return sheet.getUsedRange(true).values;
}

function recordsFromRows(rows) {
  const headers = rows[0].map((header) => String(header || '').trim());
  const dataRows = [];
  for (const row of rows.slice(1)) {
    if (row[0] === null || row[0] === '') break;
    dataRows.push(row);
  }
  return dataRows.map((row) => Object.fromEntries(headers.map((header, index) => [header, row[index] ?? ''])));
}

const visitorRows = recordsFromRows(await valuesFromWorkbook(path.join(root, 'visitors', 'visitors-2026-27.xlsx'), 'Visitors'));
const visitors = visitorRows.map((row) => ({
  name: String(row['Name']),
  institution: String(row['Institution']),
  webpage: String(row['Webpage']),
  email: String(row['Email']),
  startDate: isoDate(row['Start date']),
  endDate: isoDate(row['End date']),
  ...(row['Date display'] ? { dateLabel: String(row['Date display']) } : {}),
  office: String(row['Office']),
}));

const eventRows = recordsFromRows(await valuesFromWorkbook(path.join(root, 'events', 'events-2026-27.xlsx'), 'Events'));
const events = eventRows.map((row) => ({
  id: String(row['Title']).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
  type: String(row['Event type']),
  title: String(row['Title']),
  ...(row['Speaker'] ? { speaker: String(row['Speaker']) } : {}),
  eventUrl: String(row['Event URL']),
  dates: String(row['Date display']),
  startDate: isoDate(row['Start date']),
  endDate: isoDate(row['End date']),
  location: String(row['Location']),
  locationUrl: String(row['Location URL']),
  organisers: String(row['Organisers']).split(';').map((value) => value.trim()).filter(Boolean),
  bookingUrl: String(row['Booking URL']),
}));

await fs.writeFile(path.join(root, 'site', 'data', 'visitors.json'), `${JSON.stringify(visitors, null, 2)}\n`);
await fs.writeFile(path.join(root, 'site', 'data', 'events.json'), `${JSON.stringify(events, null, 2)}\n`);
console.log(`Updated site data from ${visitors.length} visitors and ${events.length} events.`);
await import('./sync_phd_students_to_site.mjs');
