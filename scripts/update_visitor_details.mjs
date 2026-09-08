import fs from 'node:fs/promises';
import path from 'node:path';
import { FileBlob, SpreadsheetFile } from '@oai/artifact-tool';

const root = path.resolve(process.argv[2] || process.cwd());
const workbookPath = path.join(root, 'visitors', 'visitors-2026-27.xlsx');
const outputDir = path.join(root, 'outputs', '01a0719b-f374-7590-b5ae-261ff64e352b');
const outputPath = path.join(outputDir, 'visitors-2026-27.xlsx');

const workbook = await SpreadsheetFile.importXlsx(await FileBlob.load(workbookPath));
const sheet = workbook.worksheets.getItem('Visitors');
const usedRange = sheet.getUsedRange(true);
const values = usedRange.values;
const headers = values[0].map((value) => String(value || '').trim());
const column = Object.fromEntries(headers.map((header, index) => [header, index]));

for (const required of ['Name', 'Institution', 'Start date', 'End date', 'Office']) {
  if (!(required in column)) throw new Error(`Missing required column: ${required}`);
}

const updates = new Map([
  ['Luigi Pistaferri', { office: 'Drayton House 116' }],
  ['Philip Haile', { office: 'Drayton House 106' }],
  ['Robert Porter', {
    institution: 'Northwestern University',
    startDate: new Date('2026-11-16T00:00:00Z'),
    endDate: new Date('2026-12-04T00:00:00Z'),
  }],
]);

const found = new Set();
for (let rowIndex = 1; rowIndex < values.length; rowIndex += 1) {
  const name = String(values[rowIndex][column.Name] || '').trim();
  const update = updates.get(name);
  if (!update) continue;
  found.add(name);
  if (update.institution) sheet.getCell(rowIndex, column.Institution).values = [[update.institution]];
  if (update.startDate) sheet.getCell(rowIndex, column['Start date']).values = [[update.startDate]];
  if (update.endDate) sheet.getCell(rowIndex, column['End date']).values = [[update.endDate]];
  if (update.startDate && 'Date display' in column) sheet.getCell(rowIndex, column['Date display']).values = [['']];
  if (update.office) sheet.getCell(rowIndex, column.Office).values = [[update.office]];
}

const missing = [...updates.keys()].filter((name) => !found.has(name));
if (missing.length) throw new Error(`Visitors not found in workbook: ${missing.join(', ')}`);

sheet.getRangeByIndexes(1, column['Start date'], values.length - 1, 2).setNumberFormat('d mmm yyyy');
workbook.recalculate();

const checks = [];
for (const name of updates.keys()) {
  const rowIndex = values.findIndex((row, index) => index > 0 && String(row[column.Name] || '').trim() === name);
  checks.push({
    name,
    row: rowIndex + 1,
    range: `A${rowIndex + 1}:F${rowIndex + 1}`,
  });
}

const verification = await workbook.inspect({
  kind: 'region',
  sheetId: 'Visitors',
  range: `A1:F${values.length}`,
  maxChars: 12000,
});
const errors = await workbook.inspect({
  kind: 'match',
  searchTerm: '#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!|#SPILL!|#CALC!',
  options: { useRegex: true, maxResults: 100 },
  summary: 'final formula error scan',
});
const preview = await workbook.render({ sheetName: 'Visitors', autoCrop: 'all', scale: 1 });

await fs.mkdir(outputDir, { recursive: true });
await fs.writeFile(path.join(outputDir, 'visitors-updated-preview.png'), new Uint8Array(await preview.arrayBuffer()));
const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(outputPath);
await fs.copyFile(outputPath, workbookPath);

console.log(JSON.stringify({ workbookPath, outputPath, checks, verification: verification.ndjson, errors: errors.ndjson }));
