import fs from 'node:fs/promises';
import path from 'node:path';
import { SpreadsheetFile, Workbook } from '@oai/artifact-tool';

const root = path.resolve(process.argv[2] || process.cwd());
const students = JSON.parse(await fs.readFile(path.join(root, 'phd_students', 'students.json'), 'utf8'));
const outputDir = path.join(root, 'outputs', '01a0b9b0-d08c-7570-a5e5-4aa529e107a6');
const sourceUrl = 'https://www.ucl.ac.uk/social-historical-sciences/economics/our-staff/research-students-and-teaching-assistants-0';

const workbook = Workbook.create();
const sheet = workbook.worksheets.add('PhD students');
sheet.showGridLines = false;
sheet.getRange('A2').values = [['UCL Economics PhD students']];
sheet.getRange('A2').format = { font: { name: 'Arial', size: 14, bold: true, color: '#001B44' }, verticalAlignment: 'center' };
sheet.getRange('A2:E2').format.borders = { bottom: { style: 'thin', color: '#001B44' } };
sheet.getRange('A3').values = [[`Source: ${sourceUrl} (accessed 19 September 2026)`]];
sheet.getRange('A3').format = { font: { name: 'Arial', size: 9, italic: true, color: '#52616E' } };

const headers = ['Name', 'Email', 'Key research areas', 'Main field', 'Secondary field'];
const sorted = students.toSorted((a, b) => a.name.localeCompare(b.name, 'en-GB'));
const rows = sorted.map((student) => [student.name, student.email, student.researchAreas, student.mainField, student.secondaryField]);
const lastRow = rows.length + 5;
sheet.getRange(`A5:E${lastRow}`).values = [headers, ...rows];
sheet.freezePanes.freezeRows(5);
const header = sheet.getRange('A5:E5');
header.format = {
  fill: '#001B44',
  font: { name: 'Arial', size: 10, bold: true, color: '#FFFFFF' },
  horizontalAlignment: 'center',
  verticalAlignment: 'center',
};
header.format.rowHeightPx = 30;
const body = sheet.getRange(`A6:E${lastRow}`);
body.format = {
  font: { name: 'Arial', size: 10, color: '#17212B' },
  verticalAlignment: 'top',
  wrapText: true,
  borders: { insideHorizontal: { style: 'thin', color: '#D8DEE3' } },
};
[175, 220, 390, 145, 145].forEach((width, column) => {
  sheet.getRangeByIndexes(4, column, rows.length + 1, 1).format.columnWidthPx = width;
});
body.format.autofitRows();
const table = sheet.tables.add(`A5:E${lastRow}`, true, 'PhD_Students');
table.style = 'TableStyleMedium2';
table.showBandedRows = false;
sheet.tabColor = '#001B44';

workbook.recalculate();
const check = await workbook.inspect({
  kind: 'table',
  range: `PhD students!A2:E${lastRow}`,
  include: 'values,formulas',
  tableMaxRows: 12,
  tableMaxCols: 5,
});
const errors = await workbook.inspect({
  kind: 'match',
  searchTerm: '#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!|#SPILL!|#CALC!',
  options: { useRegex: true, maxResults: 100 },
  summary: 'final formula error scan',
});
await fs.mkdir(outputDir, { recursive: true });
const xlsx = await SpreadsheetFile.exportXlsx(workbook);
const outputPath = path.join(outputDir, 'phd-students.xlsx');
await xlsx.save(outputPath);
const preview = await workbook.render({ sheetName: 'PhD students', range: `A1:E${lastRow}`, scale: 1.1 });
await fs.writeFile(path.join(outputDir, 'phd-students-preview.png'), new Uint8Array(await preview.arrayBuffer()));
console.log(JSON.stringify({ outputPath, count: rows.length, check: check.ndjson, errors: errors.ndjson }));
