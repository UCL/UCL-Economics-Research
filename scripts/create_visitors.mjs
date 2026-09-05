import fs from 'node:fs/promises';
import path from 'node:path';
import { SpreadsheetFile, Workbook } from '@oai/artifact-tool';

const root = path.resolve(process.argv[2] || process.cwd());
const outputDir = path.resolve(process.argv[3] || path.join(root, 'outputs', 'visitors'));
const seminars = JSON.parse(await fs.readFile(path.join(root, 'site/data/seminars.json'), 'utf8'));

const visitors = seminars
  .filter((seminar) => seminar.speaker && seminar.institution && seminar.institution.trim().toUpperCase() !== 'UCL')
  .map((seminar) => ({
    name: seminar.speaker,
    institution: seminar.institution,
    webpage: seminar.speakerUrl || '',
    startDate: seminar.date,
    endDate: seminar.date,
    office: '',
  }))
  .filter((visitor, index, all) =>
    all.findIndex((candidate) => candidate.name.toLowerCase() === visitor.name.toLowerCase() && candidate.startDate === visitor.startDate) === index,
  )
  .sort((a, b) => a.startDate.localeCompare(b.startDate) || a.name.localeCompare(b.name));

await fs.mkdir(path.join(root, 'site/data'), { recursive: true });
await fs.writeFile(path.join(root, 'site/data/visitors.json'), `${JSON.stringify(visitors, null, 2)}\n`);

const workbook = Workbook.create();
const sheet = workbook.worksheets.add('Visitors');
const columns = ['Name', 'Institution', 'Webpage', 'Start date', 'End date', 'Office'];
const values = visitors.map((visitor) => [
  visitor.name,
  visitor.institution,
  visitor.webpage,
  new Date(`${visitor.startDate}T00:00:00Z`),
  new Date(`${visitor.endDate}T00:00:00Z`),
  visitor.office,
]);

sheet.getRange(`A1:F${values.length + 1}`).values = [columns, ...values];
sheet.showGridLines = false;
sheet.freezePanes.freezeRows(1);
const header = sheet.getRange('A1:F1');
header.format = {
  fill: '#001B44',
  font: { name: 'Arial', size: 10, bold: true, color: '#FFFFFF' },
  horizontalAlignment: 'center',
  verticalAlignment: 'center',
  wrapText: true,
};
header.format.rowHeight = 34;
const body = sheet.getRange(`A2:F${values.length + 1}`);
body.format.font = { name: 'Arial', size: 10 };
body.format.verticalAlignment = 'center';
body.format.wrapText = true;
body.format.borders = { insideHorizontal: { style: 'thin', color: '#D8DEE3' } };
sheet.getRange(`D2:E${values.length + 1}`).setNumberFormat('d mmm yyyy');
sheet.getRange(`F2:F${values.length + 1}`).format.fill = '#EAF2F8';
for (let row = 0; row < visitors.length; row++) {
  if (!visitors[row].webpage) sheet.getCell(row + 1, 2).format.fill = '#FFF2CC';
}
[190, 240, 275, 115, 115, 120].forEach((width, column) => {
  sheet.getRangeByIndexes(0, column, values.length + 1, 1).format.columnWidthPx = width;
});
body.format.autofitRows();
const table = sheet.tables.add(`A1:F${values.length + 1}`, true, 'Visitors_2026_27');
table.style = 'TableStyleMedium2';
table.showBandedRows = false;

const noteRow = values.length + 3;
sheet.getRange(`A${noteRow}:B${noteRow + 4}`).values = [
  ['Notes', 'Start and end dates initially match the seminar date. Blue office cells are optional. Yellow webpage cells need completion.'],
  ['Source', 'UCL Economics Research seminar master data'],
  ['CeMMAP', 'https://docs.google.com/spreadsheets/d/1m4kIt32b5ut34sHdTX0hMt8MQSNLOO3k2OOi9koyARw/edit?gid=1445265049'],
  ['THEBES', 'https://uclthebes.github.io/seminars'],
  ['Macroeconomics', 'https://docs.google.com/spreadsheets/d/1mZnw3MU8QYuj9SdLU0wkKSasI0Domeli5g86uQzjzwY/edit?gid=993288109'],
];
sheet.getRange(`A${noteRow}:A${noteRow + 4}`).format.font = { name: 'Arial', size: 9, bold: true, color: '#4B5563' };
sheet.getRange(`B${noteRow}:B${noteRow + 4}`).format.font = { name: 'Arial', size: 9, italic: true, color: '#4B5563' };

await fs.mkdir(outputDir, { recursive: true });
const outputPath = path.join(outputDir, 'visitors-2026-27.xlsx');
const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(outputPath);
const check = await workbook.inspect({ kind: 'table', range: 'Visitors!A1:F12', include: 'values,formulas', tableMaxRows: 12, tableMaxCols: 6 });
const errors = await workbook.inspect({ kind: 'match', searchTerm: '#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!|#SPILL!|#CALC!', options: { useRegex: true, maxResults: 100 }, summary: 'final formula error scan' });
const preview = await workbook.render({ sheetName: 'Visitors', range: `A1:F${noteRow + 4}`, scale: 1.25 });
await fs.writeFile(path.join(outputDir, 'visitors-preview.png'), new Uint8Array(await preview.arrayBuffer()));
console.log(JSON.stringify({ outputPath, visitors: visitors.length, check: check.ndjson, errors: errors.ndjson }));
