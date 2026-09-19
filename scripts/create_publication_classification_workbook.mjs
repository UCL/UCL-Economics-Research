import fs from 'node:fs/promises';
import path from 'node:path';
import { SpreadsheetFile, Workbook } from './lib/workbook.mjs';

const root = path.resolve(process.argv[2] || process.cwd());
const researchDir = path.join(root, 'research_staff');
const outputDir = path.join(root, 'outputs', '01a0719b-f374-7590-b5ae-261ff64e352b');
const publications = JSON.parse(await fs.readFile(path.join(researchDir, 'publications.json'), 'utf8'))
  .filter((item) => item.isEconomics && ['Journal article', 'Book'].includes(item.category) && item.year >= 2012 && item.year <= 2026);

const workbook = Workbook.create();
const sheet = workbook.worksheets.add('Classification');
const headers = ['Year', 'Type', 'Title', 'Authors', 'UCL authors', 'Journal or publisher', 'Assigned fields', 'Confidence', 'Classification method', 'Needs review', 'Manual primary', 'Manual secondary', 'Approved', 'Publication URL'];
const rows = publications.map((item) => [
  item.year,
  item.category,
  item.title,
  item.authors.join('; '),
  item.classificationUclAuthors.join('; '),
  item.venue,
  item.paperPrimaryField,
  item.classificationConfidence,
  item.classificationSource,
  item.classificationNeedsReview ? 'YES' : 'NO',
  '',
  '',
  '',
  item.url,
]);

sheet.getRange(`A1:N${rows.length + 1}`).values = [headers, ...rows];
sheet.showGridLines = false;
sheet.freezePanes.freezeRows(1);
sheet.getRange('A1:N1').format = {
  fill: '#001B44',
  font: { name: 'Arial', size: 10, bold: true, color: '#FFFFFF' },
  horizontalAlignment: 'center',
  verticalAlignment: 'center',
  wrapText: true,
};
sheet.getRange('A1:N1').format.rowHeight = 36;
const body = sheet.getRange(`A2:N${rows.length + 1}`);
body.format.font = { name: 'Arial', size: 10, color: '#17212B' };
body.format.verticalAlignment = 'top';
body.format.wrapText = true;
body.format.borders = { insideHorizontal: { style: 'thin', color: '#D8DEE3' } };
sheet.getRange(`G2:J${rows.length + 1}`).conditionalFormats.addCustom('=OR($G2="UNSURE",$H2="Low",$J2="YES")', { fill: '#FFF2CC' });
sheet.getRange(`K2:M${rows.length + 1}`).format.fill = '#EAF2F8';
sheet.getRange(`K2:L${rows.length + 1}`).dataValidation = { rule: { type: 'list', values: ['', 'Applied', 'Econometrics', 'Theory', 'Macroeconomics', 'Finance'] } };
sheet.getRange(`M2:M${rows.length + 1}`).dataValidation = { rule: { type: 'list', values: ['', 'YES', 'NO'] } };
[65, 105, 330, 300, 220, 220, 160, 85, 210, 85, 120, 120, 85, 280].forEach((width, column) => {
  sheet.getRangeByIndexes(0, column, rows.length + 1, 1).format.columnWidthPx = width;
});
body.format.autofitRows();
const table = sheet.tables.add(`A1:N${rows.length + 1}`, true, 'Publication_Classification');
table.style = 'TableStyleMedium2';
table.showBandedRows = false;

const noteRow = rows.length + 3;
sheet.getRange(`A${noteRow}:B${noteRow + 4}`).values = [
  ['Notes', 'Yellow classifications are uncertain and require review. Blue cells are manual editorial inputs.'],
  ['Method', 'Each paper uses the primary field of its UCL author. For multiple UCL authors, Assigned fields contains the union of their primary fields.'],
  ['Overrides', 'Enter a Manual primary or Manual secondary field to replace the suggestion, then set Approved to YES.'],
  ['Scope', 'Economics journal articles and books dated 2012–2026.'],
  ['Source', 'UCL Profiles and OpenAlex metadata.'],
];
sheet.getRange(`A${noteRow}:A${noteRow + 4}`).format.font = { name: 'Arial', size: 9, bold: true, color: '#4B5563' };
sheet.getRange(`B${noteRow}:B${noteRow + 4}`).format.font = { name: 'Arial', size: 9, italic: true, color: '#4B5563' };
sheet.getRange(`B${noteRow}:B${noteRow + 4}`).format.columnWidthPx = 680;

const check = await workbook.inspect({ kind: 'table', range: 'Classification!A1:N20', include: 'values,formulas', tableMaxRows: 20, tableMaxCols: 14 });
const errors = await workbook.inspect({ kind: 'match', searchTerm: '#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!|#SPILL!|#CALC!', options: { useRegex: true, maxResults: 100 }, summary: 'final formula error scan' });
await fs.mkdir(outputDir, { recursive: true });
const xlsx = await SpreadsheetFile.exportXlsx(workbook);
await xlsx.save(path.join(researchDir, 'publication-classification.xlsx'));
await xlsx.save(path.join(outputDir, 'publication-classification.xlsx'));
const preview = await workbook.render({ sheetName: 'Classification', range: 'A1:N40', scale: 1.05 });
if (preview) await fs.writeFile(path.join(outputDir, 'publication-classification-preview.png'), new Uint8Array(await preview.arrayBuffer()));
console.log(JSON.stringify({ records: rows.length, check: check.ndjson, errors: errors.ndjson }));
