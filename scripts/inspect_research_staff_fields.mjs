import fs from 'node:fs/promises';
import path from 'node:path';
import { FileBlob, SpreadsheetFile } from '@oai/artifact-tool';

const root = path.resolve(process.argv[2] || process.cwd());
const workbook = await SpreadsheetFile.importXlsx(
  await FileBlob.load(path.join(root, 'research_staff', 'research-staff.xlsx')),
);
const sheet = workbook.worksheets.getItem('Research staff');
const rows = sheet.getUsedRange(true).values;
const headers = rows[0].map((value) => String(value || '').trim());
const nameIndex = headers.indexOf('Name');
const primaryIndex = headers.indexOf('Primary field');
const valid = new Set(['Applied', 'Econometrics', 'Theory', 'Macroeconomics', 'Finance']);
const staffRows = rows.slice(1).filter((row) => row[nameIndex]);
const invalid = staffRows
  .filter((row) => !valid.has(String(row[primaryIndex] || '').trim()))
  .map((row) => ({ name: row[nameIndex], primaryField: row[primaryIndex] }));
const targets = new Set(['Ran Spiegler', 'Antonio Guarino', 'Lukasz Rachel']);
const targetRows = staffRows
  .filter((row) => targets.has(String(row[nameIndex])))
  .map((row) => Object.fromEntries(headers.map((header, index) => [header, row[index] ?? ''])));
const check = await workbook.inspect({
  kind: 'table',
  range: `Research staff!A1:J${Math.min(staffRows.length + 1, 75)}`,
  include: 'values,formulas',
  tableMaxRows: 75,
  tableMaxCols: 10,
  maxChars: 16000,
});
console.log(JSON.stringify({ count: staffRows.length, invalid, targetRows, headers }));
console.log(check.ndjson);
const preview = await workbook.render({ sheetName: 'Research staff', range: 'A1:J74', scale: 0.9 });
await fs.writeFile(path.join(root, 'outputs', '01a0719b-f374-7590-b5ae-261ff64e352b', 'research-staff-before-mother-tongue.png'), new Uint8Array(await preview.arrayBuffer()));
