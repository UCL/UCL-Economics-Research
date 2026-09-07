import fs from 'node:fs/promises';
import path from 'node:path';
import { SpreadsheetFile, Workbook } from '@oai/artifact-tool';

const root = path.resolve(process.argv[2] || process.cwd());
const outputDir = path.join(root, 'outputs', '01a0719b-f374-7590-b5ae-261ff64e352b');
const visitorsDir = path.join(root, 'visitors');
const eventsDir = path.join(root, 'events');

const readJson = async (relativePath) =>
  JSON.parse(await fs.readFile(path.join(root, relativePath), 'utf8'));

const toDate = (value) => value ? new Date(`${value}T00:00:00Z`) : null;

function applyTableStyle(sheet, range, tableName, widths) {
  const used = sheet.getRange(range);
  used.format.font = { name: 'Arial', size: 10, color: '#17212B' };
  used.format.verticalAlignment = 'center';
  used.format.wrapText = true;
  const header = used.getRow(0);
  header.format = {
    fill: '#001B44',
    font: { name: 'Arial', size: 10, bold: true, color: '#FFFFFF' },
    horizontalAlignment: 'center',
    verticalAlignment: 'center',
    wrapText: true,
  };
  header.format.rowHeight = 34;
  for (let column = 0; column < widths.length; column++) {
    sheet.getRangeByIndexes(0, column, used.rowCount, 1).format.columnWidthPx = widths[column];
  }
  used.getRangeByIndexes(1, 0, used.rowCount - 1, used.columnCount).format.borders = {
    insideHorizontal: { style: 'thin', color: '#D8DEE3' },
  };
  sheet.showGridLines = false;
  sheet.freezePanes.freezeRows(1);
  const table = sheet.tables.add(range, true, tableName);
  table.style = 'TableStyleMedium2';
  table.showBandedRows = false;
}

async function saveWorkbook(workbook, canonicalPath, outputPath, previewPath, sheetName, renderRange) {
  const file = await SpreadsheetFile.exportXlsx(workbook);
  await file.save(canonicalPath);
  await file.save(outputPath);
  const preview = await workbook.render({ sheetName, range: renderRange, scale: 1.15 });
  await fs.writeFile(previewPath, new Uint8Array(await preview.arrayBuffer()));
}

await fs.mkdir(outputDir, { recursive: true });
await fs.mkdir(visitorsDir, { recursive: true });
await fs.mkdir(eventsDir, { recursive: true });

const visitors = await readJson('site/data/visitors.json');
const visitorWorkbook = Workbook.create();
const visitorSheet = visitorWorkbook.worksheets.add('Visitors');
const visitorHeaders = ['Name', 'Institution', 'Webpage', 'Start date', 'End date', 'Date display', 'Office'];
const visitorRows = visitors.map((visitor) => [
  visitor.name,
  visitor.institution,
  visitor.webpage,
  toDate(visitor.startDate),
  toDate(visitor.endDate),
  visitor.dateLabel || '',
  visitor.office,
]);
visitorSheet.getRange(`A1:G${visitorRows.length + 1}`).values = [visitorHeaders, ...visitorRows];
applyTableStyle(visitorSheet, `A1:G${visitorRows.length + 1}`, 'Visitors_2026_27', [180, 225, 255, 105, 105, 185, 100]);
visitorSheet.getRange(`D2:E${visitorRows.length + 1}`).setNumberFormat('d mmm yyyy');
visitorSheet.getRange(`C2:C${visitorRows.length + 1}`).conditionalFormats.add('containsBlanks', { fill: '#FFF2CC' });
visitorSheet.getRange(`D2:F${visitorRows.length + 1}`).conditionalFormats.addCustom('=AND($D2="",$E2="",$F2="")', { fill: '#FFF2CC' });
visitorSheet.getRange(`G2:G${visitorRows.length + 1}`).format.fill = '#EAF2F8';
const visitorNoteRow = visitorRows.length + 3;
visitorSheet.getRange(`A${visitorNoteRow}:B${visitorNoteRow + 2}`).values = [
  ['Notes', 'This workbook is the manually maintained source for the Visitors webpage. Yellow cells need information; blue Office cells are optional.'],
  ['Dates', 'Use Start date and End date when known. Use Date display only for an approximate period such as “November 2026 (dates TBA)”.'],
  ['Initial source', 'UCL Economics Research seminar schedule and updates supplied by the project owner.'],
];
visitorSheet.getRange(`A${visitorNoteRow}:A${visitorNoteRow + 2}`).format.font = { name: 'Arial', size: 9, bold: true, color: '#4B5563' };
visitorSheet.getRange(`B${visitorNoteRow}:B${visitorNoteRow + 2}`).format.font = { name: 'Arial', size: 9, italic: true, color: '#4B5563' };
visitorSheet.getRange(`B${visitorNoteRow}:B${visitorNoteRow + 2}`).format.columnWidthPx = 600;

const visitorCheck = await visitorWorkbook.inspect({ kind: 'table', range: 'Visitors!A1:G12', include: 'values,formulas', tableMaxRows: 12, tableMaxCols: 7 });
const visitorErrors = await visitorWorkbook.inspect({ kind: 'match', searchTerm: '#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!|#SPILL!|#CALC!', options: { useRegex: true, maxResults: 100 }, summary: 'final formula error scan' });
await saveWorkbook(
  visitorWorkbook,
  path.join(visitorsDir, 'visitors-2026-27.xlsx'),
  path.join(outputDir, 'visitors-2026-27.xlsx'),
  path.join(outputDir, 'visitors-preview.png'),
  'Visitors',
  `A1:G${visitorNoteRow + 2}`,
);

const events = await readJson('site/data/events.json');
const eventWorkbook = Workbook.create();
const eventSheet = eventWorkbook.worksheets.add('Events');
const eventHeaders = ['Event type', 'Title', 'Speaker', 'Event URL', 'Date display', 'Start date', 'End date', 'Location', 'Location URL', 'Organisers', 'Booking URL'];
const eventRows = events.map((event) => [
  event.type,
  event.title,
  event.speaker || '',
  event.eventUrl,
  event.dates,
  toDate(event.startDate),
  toDate(event.endDate),
  event.location,
  event.locationUrl,
  event.organisers.join('; '),
  event.bookingUrl,
]);
eventSheet.getRange(`A1:K${eventRows.length + 1}`).values = [eventHeaders, ...eventRows];
applyTableStyle(eventSheet, `A1:K${eventRows.length + 1}`, 'Events_2026_27', [150, 245, 220, 250, 150, 105, 105, 155, 240, 230, 240]);
eventSheet.getRange(`F2:G${eventRows.length + 1}`).setNumberFormat('d mmm yyyy');
eventSheet.getRange(`D2:D${eventRows.length + 1}`).conditionalFormats.add('containsBlanks', { fill: '#FFF2CC' });
eventSheet.getRange(`H2:H${eventRows.length + 1}`).conditionalFormats.add('containsText', { text: 'TBA', format: { fill: '#FFF2CC' } });
eventSheet.getRange(`K2:K${eventRows.length + 1}`).conditionalFormats.add('containsBlanks', { fill: '#FFF2CC' });
const eventNoteRow = eventRows.length + 3;
eventSheet.getRange(`A${eventNoteRow}:B${eventNoteRow + 2}`).values = [
  ['Notes', 'This workbook is the manually maintained source for the Events webpage. Yellow cells need information.'],
  ['Dates', 'Date display is shown on the webpage. Add exact Start date and End date when available.'],
  ['Organisers', 'Separate multiple organisers with semicolons.'],
];
eventSheet.getRange(`A${eventNoteRow}:A${eventNoteRow + 2}`).format.font = { name: 'Arial', size: 9, bold: true, color: '#4B5563' };
eventSheet.getRange(`B${eventNoteRow}:B${eventNoteRow + 2}`).format.font = { name: 'Arial', size: 9, italic: true, color: '#4B5563' };
eventSheet.getRange(`B${eventNoteRow}:B${eventNoteRow + 2}`).format.columnWidthPx = 600;

const eventCheck = await eventWorkbook.inspect({ kind: 'table', range: `Events!A1:K${eventRows.length + 1}`, include: 'values,formulas', tableMaxRows: 8, tableMaxCols: 11 });
const eventErrors = await eventWorkbook.inspect({ kind: 'match', searchTerm: '#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!|#SPILL!|#CALC!', options: { useRegex: true, maxResults: 100 }, summary: 'final formula error scan' });
await saveWorkbook(
  eventWorkbook,
  path.join(eventsDir, 'events-2026-27.xlsx'),
  path.join(outputDir, 'events-2026-27.xlsx'),
  path.join(outputDir, 'events-preview.png'),
  'Events',
  `A1:K${eventNoteRow + 2}`,
);

console.log(JSON.stringify({
  visitors: { count: visitors.length, check: visitorCheck.ndjson, errors: visitorErrors.ndjson },
  events: { count: events.length, check: eventCheck.ndjson, errors: eventErrors.ndjson },
}));
