import fs from 'node:fs/promises';
import path from 'node:path';
import { FileBlob, SpreadsheetFile } from './lib/workbook.mjs';

const root = path.resolve(process.argv[2] || process.cwd());
const workbookPath = path.join(root, 'research_staff', 'research-staff.xlsx');
const outputPath = path.join(root, 'outputs', '01a0719b-f374-7590-b5ae-261ff64e352b', 'research-staff.xlsx');
const previewPath = path.join(root, 'outputs', '01a0719b-f374-7590-b5ae-261ff64e352b', 'research-staff-mother-tongue-preview.png');
const workbook = await SpreadsheetFile.importXlsx(await FileBlob.load(workbookPath));
const sheet = workbook.worksheets.getItem('Research staff');

sheet.getRange('K1').values = [['Mother tongue']];
sheet.getRange('K1').format = {
  fill: '#001B44',
  font: { name: 'Arial', size: 10, bold: true, color: '#FFFFFF' },
  horizontalAlignment: 'center',
  verticalAlignment: 'center',
  wrapText: true,
};
sheet.getRange('K1').format.rowHeight = 36;
sheet.getRange('K2:K69').values = Array.from({ length: 68 }, () => ['UNSURE']);
sheet.getRange('K2:K69').format = {
  fill: '#FFF2CC',
  font: { name: 'Arial', size: 10, color: '#7A4F00' },
  verticalAlignment: 'center',
};
sheet.getRange('K1:K69').format.columnWidthPx = 130;

const check = await workbook.inspect({ kind: 'table', range: 'Research staff!A1:K12', include: 'values,formulas', tableMaxRows: 12, tableMaxCols: 11 });
const errors = await workbook.inspect({ kind: 'match', searchTerm: '#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!|#SPILL!|#CALC!', options: { useRegex: true, maxResults: 100 }, summary: 'final formula error scan' });
const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(workbookPath);
await output.save(outputPath);
const preview = await workbook.render({ sheetName: 'Research staff', range: 'A1:K74', scale: 0.9 });
if (preview) await fs.writeFile(previewPath, new Uint8Array(await preview.arrayBuffer()));
console.log(JSON.stringify({ check: check.ndjson, errors: errors.ndjson }));
