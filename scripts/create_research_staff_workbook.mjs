import fs from 'node:fs/promises';
import path from 'node:path';
import { SpreadsheetFile, Workbook } from '@oai/artifact-tool';

const root = path.resolve(process.argv[2] || process.cwd());
const researchDir = path.join(root, 'research_staff');
const outputDir = path.join(root, 'outputs', '01a0719b-f374-7590-b5ae-261ff64e352b');
const staff = JSON.parse(await fs.readFile(path.join(researchDir, 'staff.json'), 'utf8'));

const workbook = Workbook.create();
const sheet = workbook.worksheets.add('Research staff');
const headers = [
  'Name', 'Title', 'Email address', 'Personal webpage', 'Primary field', 'Secondary field', 'UCL profile',
  'Google Scholar search', 'Google Scholar status', 'Classification status', 'Mother tongue',
];
const rows = staff.map((person) => [
  person.name,
  person.title,
  person.email,
  person.personalUrl,
  person.primaryField,
  person.secondaryField,
  person.profileUrl,
  person.googleScholarSearch,
  person.googleScholarStatus,
  person.classificationStatus,
  person.motherTongue || 'UNSURE',
]);

sheet.getRange(`A1:K${rows.length + 1}`).values = [headers, ...rows];
sheet.showGridLines = false;
sheet.freezePanes.freezeRows(1);
const header = sheet.getRange('A1:K1');
header.format = {
  fill: '#001B44',
  font: { name: 'Arial', size: 10, bold: true, color: '#FFFFFF' },
  horizontalAlignment: 'center',
  verticalAlignment: 'center',
  wrapText: true,
};
header.format.rowHeight = 36;
const body = sheet.getRange(`A2:K${rows.length + 1}`);
body.format.font = { name: 'Arial', size: 10, color: '#17212B' };
body.format.verticalAlignment = 'center';
body.format.wrapText = true;
body.format.borders = { insideHorizontal: { style: 'thin', color: '#D8DEE3' } };
sheet.getRange(`E2:F${rows.length + 1}`).conditionalFormats.add('containsText', {
  text: 'UNSURE',
  format: { fill: '#FFF2CC', font: { bold: true, color: '#7A4F00' } },
});
sheet.getRange(`J2:J${rows.length + 1}`).conditionalFormats.add('containsText', {
  text: 'review',
  format: { fill: '#FFF2CC' },
});
[185, 220, 210, 260, 125, 125, 260, 290, 220, 200].forEach((width, column) => {
  sheet.getRangeByIndexes(0, column, rows.length + 1, 1).format.columnWidthPx = width;
});
sheet.getRange(`K1:K${rows.length + 1}`).format.columnWidthPx = 130;
sheet.getRange(`K2:K${rows.length + 1}`).conditionalFormats.add('containsText', {
  text: 'UNSURE',
  format: { fill: '#FFF2CC', font: { bold: true, color: '#7A4F00' } },
});
body.format.autofitRows();
const table = sheet.tables.add(`A1:K${rows.length + 1}`, true, 'Research_Staff');
table.style = 'TableStyleMedium2';
table.showBandedRows = false;

const noteRow = rows.length + 3;
sheet.getRange(`A${noteRow}:B${noteRow + 4}`).values = [
  ['Notes', 'Primary and secondary fields are working classifications for the Publications page. Yellow cells require editorial review.'],
  ['Fields', 'Applied, Econometrics, Theory, Macroeconomics, Finance, or UNSURE.'],
  ['Staff source', 'https://www.ucl.ac.uk/social-historical-sciences/economics/our-staff/academic-and-teaching-staff'],
  ['Publication metadata', 'UCL Profiles and OpenAlex. Google Scholar automated export was unavailable.'],
  ['Updated', '5 September 2026'],
];
sheet.getRange(`A${noteRow}:A${noteRow + 4}`).format.font = { name: 'Arial', size: 9, bold: true, color: '#4B5563' };
sheet.getRange(`B${noteRow}:B${noteRow + 4}`).format.font = { name: 'Arial', size: 9, italic: true, color: '#4B5563' };
sheet.getRange(`B${noteRow}:B${noteRow + 4}`).format.columnWidthPx = 640;

const check = await workbook.inspect({
  kind: 'table',
  range: 'Research staff!A1:K15',
  include: 'values,formulas',
  tableMaxRows: 15,
  tableMaxCols: 11,
});
const errors = await workbook.inspect({
  kind: 'match',
  searchTerm: '#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!|#SPILL!|#CALC!',
  options: { useRegex: true, maxResults: 100 },
  summary: 'final formula error scan',
});
await fs.mkdir(outputDir, { recursive: true });
const xlsx = await SpreadsheetFile.exportXlsx(workbook);
await xlsx.save(path.join(researchDir, 'research-staff.xlsx'));
await xlsx.save(path.join(outputDir, 'research-staff.xlsx'));
const preview = await workbook.render({ sheetName: 'Research staff', range: `A1:H${noteRow + 4}`, scale: 1.1 });
await fs.writeFile(path.join(outputDir, 'research-staff-preview.png'), new Uint8Array(await preview.arrayBuffer()));
console.log(JSON.stringify({ count: staff.length, check: check.ndjson, errors: errors.ndjson }));
