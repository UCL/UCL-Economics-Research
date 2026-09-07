import fs from 'node:fs/promises';
import path from 'node:path';
import { SpreadsheetFile, Workbook } from '@oai/artifact-tool';

const root = path.resolve(process.argv[2] || process.cwd());
const researchDir = path.join(root, 'research_staff');
const outputDir = path.join(root, 'outputs', '01a0719b-f374-7590-b5ae-261ff64e352b');
const staff = JSON.parse(await fs.readFile(path.join(researchDir, 'staff.json'), 'utf8'));
const publications = JSON.parse(await fs.readFile(path.join(researchDir, 'ucl_profile_publications.json'), 'utf8'));
const working = JSON.parse(await fs.readFile(path.join(researchDir, 'working_papers_web.json'), 'utf8'));
await fs.mkdir(outputDir, { recursive: true });

function styleSheet(sheet, rowCount, colCount, widths, tableName) {
  const last = String.fromCharCode(64 + colCount);
  sheet.showGridLines = false;
  sheet.freezePanes.freezeRows(1);
  sheet.getRange(`A1:${last}1`).format = {
    fill: '#001B44', font: { name: 'Arial', size: 10, bold: true, color: '#FFFFFF' },
    horizontalAlignment: 'center', verticalAlignment: 'center', wrapText: true,
  };
  sheet.getRange(`A1:${last}1`).format.rowHeight = 34;
  const body = sheet.getRange(`A2:${last}${rowCount}`);
  body.format.font = { name: 'Arial', size: 10, color: '#17212B' };
  body.format.verticalAlignment = 'top';
  body.format.wrapText = true;
  body.format.borders = { insideHorizontal: { style: 'thin', color: '#D8DEE3' } };
  widths.forEach((width, index) => sheet.getRangeByIndexes(0, index, rowCount, 1).format.columnWidthPx = width);
  body.format.autofitRows();
  const table = sheet.tables.add(`A1:${last}${rowCount}`, true, tableName);
  table.style = 'TableStyleMedium2';
  table.showBandedRows = false;
}

async function save(workbook, filename, previewSheet, previewRange) {
  const xlsx = await SpreadsheetFile.exportXlsx(workbook);
  await xlsx.save(path.join(researchDir, filename));
  await xlsx.save(path.join(outputDir, filename));
  const preview = await workbook.render({ sheetName: previewSheet, range: previewRange, scale: 1 });
  await fs.writeFile(path.join(outputDir, filename.replace('.xlsx', '-preview.png')), new Uint8Array(await preview.arrayBuffer()));
  const errors = await workbook.inspect({ kind: 'match', searchTerm: '#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!|#SPILL!|#CALC!', options: { useRegex: true, maxResults: 100 }, summary: 'formula error scan' });
  return errors.ndjson;
}

const staffBook = Workbook.create();
const staffSheet = staffBook.worksheets.add('Research staff');
const staffHeaders = ['Name', 'Title', 'Email address', 'Personal webpage', 'Primary field', 'Secondary field', 'UCL profile', 'Biography', 'Research keywords', 'Research summary', 'Teaching', 'UCL profile status', 'Profile updated', 'Working-paper webpage status', 'Mother tongue', 'ORCID', 'OpenAlex author ID', 'Google Scholar search', 'Google Scholar status', 'Classification status'];
const staffRows = staff.map(p => [p.name, p.title, p.email, p.personalUrl || '', p.primaryField, p.secondaryField, p.profileUrl || '', p.biography || '', (p.researchKeywords || []).join('; '), p.researchSummary || '', p.teaching || '', p.uclProfileStatus || '', p.uclProfileUpdated || '', p.personalWebsiteWorkingPaperStatus || '', p.motherTongue || 'UNSURE', p.orcid || '', p.openAlexAuthorId || '', p.googleScholarSearch || '', p.googleScholarStatus || '', p.classificationStatus || '']);
staffSheet.getRange(`A1:T${staffRows.length + 1}`).values = [staffHeaders, ...staffRows];
styleSheet(staffSheet, staffRows.length + 1, 20, [175,150,180,235,110,110,235,420,260,420,420,180,115,220,110,160,170,250,210,190], 'Research_Staff');
staffSheet.getRange(`D2:D${staffRows.length + 1}`).conditionalFormats.add('custom', { formula: '=D2=""', format: { fill: '#FFF2CC' } });
staffSheet.getRange(`L2:L${staffRows.length + 1}`).conditionalFormats.add('containsText', { text: 'No UCL', format: { fill: '#FFF2CC', font: { color: '#7A4F00', bold: true } } });
staffSheet.getRange(`O2:O${staffRows.length + 1}`).conditionalFormats.add('containsText', { text: 'UNSURE', format: { fill: '#FFF2CC', font: { color: '#7A4F00', bold: true } } });

const pubBook = Workbook.create();
const pubSheet = pubBook.worksheets.add('UCL profile publications');
const pubHeaders = ['Staff member', 'Primary field', 'Output type', 'Title', 'Year', 'Date displayed', 'Authors', 'Venue / details', 'DOI', 'Publication URL', 'Category', 'Section', 'Source'];
const pubRows = publications.map(p => [p.staffName, p.primaryField, p.outputType, p.title, p.year || '', p.dateDisplay || '', (p.authors || []).join('; '), p.venue || '', p.doi || '', p.url || '', p.category, p.section, p.source]);
pubSheet.getRange(`A1:M${pubRows.length + 1}`).values = [pubHeaders, ...pubRows];
styleSheet(pubSheet, pubRows.length + 1, 13, [175,110,165,420,75,115,350,280,180,235,110,95,110], 'UCL_Profile_Publications');
pubSheet.getRange(`D2:E${pubRows.length + 1}`).conditionalFormats.add('custom', { formula: '=OR($D2="",$E2="")', format: { fill: '#FFF2CC' } });

const workBook = Workbook.create();
const workSheet = workBook.worksheets.add('Working papers');
const workHeaders = ['Staff member', 'Title', 'Paper URL', 'Section heading', 'Source webpage', 'Source', 'Review status'];
const workRows = working.map(p => [p.staffName, p.title, p.url || '', p.sectionHeading || '', p.sourcePage || '', p.source, p.reviewStatus]);
workSheet.getRange(`A1:G${workRows.length + 1}`).values = [workHeaders, ...workRows];
styleSheet(workSheet, workRows.length + 1, 7, [180,430,260,230,260,130,110], 'Personal_Website_Working_Papers');
workSheet.getRange(`G2:G${workRows.length + 1}`).conditionalFormats.add('containsText', { text: 'Review', format: { fill: '#FFF2CC', font: { color: '#7A4F00', bold: true } } });

const results = {
  staff: await save(staffBook, 'research-staff.xlsx', 'Research staff', 'A1:H18'),
  publications: await save(pubBook, 'publications_ucl_profile.xlsx', 'UCL profile publications', 'A1:H22'),
  working: await save(workBook, 'working_papers.xlsx', 'Working papers', `A1:G${Math.min(working.length + 1, 24)}`),
};
console.log(JSON.stringify({ staff: staffRows.length, publications: pubRows.length, workingPapers: workRows.length, errors: results }));
