import fs from 'node:fs/promises';
import path from 'node:path';
import { SpreadsheetFile, Workbook } from './lib/workbook.mjs';

const columns = ['Date', 'Speaker', 'Institution', 'Speaker URL', 'Title', 'Paper URL', 'Status', 'Special start time', 'Special end time', 'Special location'];
const args = new Map(process.argv.slice(2).map((value, index, all) => value.startsWith('--') ? [value, all[index + 1]?.startsWith('--') ? true : all[index + 1]] : [value, value]));
const root = path.resolve(String(args.get('--project-root') || process.cwd()));
const outputDir = path.resolve(String(args.get('--output-dir') || path.join(root, 'outputs', 'seminars')));
const offline = args.has('--offline');
const selectedSeries = args.get('--series') ? new Set(String(args.get('--series')).split(',').map(value => value.trim())) : null;

function parseCsvMatrix(text) {
  const rows = []; let row = []; let value = ''; let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i], next = text[i + 1];
    if (c === '"' && quoted && next === '"') { value += '"'; i++; }
    else if (c === '"') quoted = !quoted;
    else if (c === ',' && !quoted) { row.push(value); value = ''; }
    else if ((c === '\n' || c === '\r') && !quoted) { if (c === '\r' && next === '\n') i++; row.push(value); if (row.some(Boolean)) rows.push(row); row = []; value = ''; }
    else value += c;
  }
  if (value || row.length) { row.push(value); rows.push(row); }
  return rows;
}

function parseCsv(text) {
  const rows = parseCsvMatrix(text);
  const headers = rows.shift()?.map(x => x.trim()) || [];
  return rows.map(values => Object.fromEntries(headers.map((header, i) => [header, (values[i] || '').trim()])));
}

function splitSpeaker(text='') {
  const match = text.match(/^(.+?)\s*\(([^)]+)\)\s*$/);
  return match ? [match[1].trim(), match[2].trim()] : [text.trim(), ''];
}

function normaliseDate(value='') {
  const clean = value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) return clean;
  const match = clean.match(/^(\d{1,2})[- ]([A-Za-z]{3})[- ](\d{4})$/);
  if (!match) return clean;
  const month = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].indexOf(match[2].slice(0,3)) + 1;
  return `${match[3]}-${String(month).padStart(2,'0')}-${match[1].padStart(2,'0')}`;
}

function standardise(rows) {
  return rows.map(row => {
    const [speaker, inferredInstitution] = splitSpeaker(row.Speaker || row['Speaker suggestion'] || '');
    return {
      Date: normaliseDate(row.Date || row.date || ''), Speaker: speaker,
      Institution: row.Institution || row.Affiliation || row['speaker-affiliation'] || inferredInstitution,
      'Speaker URL': row['Speaker URL'] || row.SpeakerURL || row['speaker-website'] || '', Title: row.Title || row.title || '',
      'Paper URL': row['Paper URL'] || row.PaperURL || row['paper-link'] || '', Status: row.Status || (row.Date || row.date ? 'Scheduled' : ''),
      'Special start time': row['Special start time'] || '', 'Special end time': row['Special end time'] || '',
      'Special location': row['Special location'] || (/^Not at/i.test(row.Location || '') ? row.Location : ''),
      _time: row.Time || row.time || '', _location: row.location || '',
    };
  }).filter(row => row.Speaker);
}

function macroDate(value, term) {
  const match = value.trim().match(/^(\d{1,2})\s+([A-Za-z]+)$/);
  if (!match) return '';
  const month = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'].indexOf(match[2].slice(0,3).toLowerCase()) + 1;
  const year = term === 1 ? 2026 : 2027;
  return month ? `${year}-${String(month).padStart(2,'0')}-${match[1].padStart(2,'0')}` : '';
}

function parseMacroPlanningSheet(text) {
  const institutions = {Exeter:'University of Exeter',PSE:'Paris School of Economics',NYU:'New York University',Cemfi:'CEMFI',Duke:'Duke University',Princeton:'Princeton University',CREI:'CREI','Chicago Booth':'Chicago Booth','Fed Atlanta':'Federal Reserve Bank of Atlanta',EIEF:'Einaudi Institute for Economics and Finance','Stanford GSB':'Stanford Graduate School of Business',Columbia:'Columbia University',Emory:'Emory University',Esade:'ESADE',Bocconi:'Bocconi University',Kellog:'Kellogg School of Management',Berkeley:'University of California Berkeley',Geneve:'University of Geneva','Columbia Business School':'Columbia Business School'};
  const speakerCorrections = {'John Grisby':'John Grigsby','Johannes Boem':'Johannes Boehm'};
  let term = 1; const rows = [];
  for (const cells of parseCsvMatrix(text)) {
    const first = (cells[0] || '').trim();
    const termMatch = first.match(/^TERM\s*(\d)/i); if (termMatch) { term = Number(termMatch[1]); continue; }
    const date = macroDate(first, term), rawSpeaker = (cells[1] || '').trim();
    if (!date || !rawSpeaker) continue;
    const rawInstitution = (cells[2] || '').trim();
    rows.push({Date:date,Speaker:speakerCorrections[rawSpeaker] || rawSpeaker,Institution:institutions[rawInstitution] || rawInstitution,Status:'Scheduled'});
  }
  return rows;
}

function parseFinancePlanningSheet(text) {
  const institutions = {
    Princeton: 'Princeton University', LBS: 'London Business School', Duke: 'Duke University',
    Imperial: 'Imperial College London', MIT: 'Massachusetts Institute of Technology',
    BU: 'Boston University', Oxford: 'University of Oxford',
  };
  const rows = [];
  for (const cells of parseCsvMatrix(text)) {
    const dateCell = (cells[0] || '').trim();
    const match = dateCell.match(/^([A-Za-z]{3})\s+(\d{1,2})/);
    if (!match) continue;
    let speaker = (cells[1] || '').trim();
    if (!speaker || /^\(offered/i.test(speaker)) continue;
    const tentative = /likely|not fully confirmed/i.test(speaker);
    speaker = speaker.replace(/\s*\(likely,?\s*not fully confirmed\)\s*/i, '').trim();
    const month = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'].indexOf(match[1].toLowerCase()) + 1;
    if (!month) continue;
    const year = month >= 9 ? 2026 : 2027;
    const affiliation = (cells[2] || '').trim();
    rows.push({
      Date: `${year}-${String(month).padStart(2, '0')}-${match[2].padStart(2, '0')}`,
      Speaker: speaker,
      Institution: institutions[affiliation] || affiliation,
      Status: tentative ? 'TBA' : 'Scheduled',
      'Special start time': (cells[6] || '').trim(),
    });
  }
  return rows;
}

function parseAppliedPlanningSheet(text) {
  let term = 1;
  const rows = [];
  const monthNumbers = {
    jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
    jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
  };

  function normalisePlanningTime(hourText, minuteText = '', meridiem = '') {
    let hour = Number(hourText);
    const suffix = meridiem.toLowerCase();
    if (suffix === 'pm' && hour < 12) hour += 12;
    if (suffix === 'am' && hour === 12) hour = 0;
    if (!suffix && hour < 8) hour += 12;
    return `${String(hour).padStart(2, '0')}:${minuteText || '00'}`;
  }

  for (const cells of parseCsvMatrix(text)) {
    const dateCell = (cells[0] || '').trim();
    if (/^term\s*1/i.test(dateCell)) { term = 1; continue; }
    if (/^term\s*2/i.test(dateCell)) { term = 2; continue; }
    if (/^term\s*3/i.test(dateCell)) { term = 3; continue; }

    const monthFirst = dateCell.match(/^([A-Za-z]+)\s+(\d{1,2})$/);
    const dayFirst = dateCell.match(/^(\d{1,2})\s+([A-Za-z]+)$/);
    const dateMatch = monthFirst || dayFirst;
    if (!dateMatch) continue;
    const monthName = monthFirst ? dateMatch[1] : dateMatch[2];
    const day = monthFirst ? dateMatch[2] : dateMatch[1];
    const month = monthNumbers[monthName.slice(0, 3).toLowerCase()];
    if (!month) continue;

    let speaker = (cells[1] || '').trim();
    if (!speaker || /reading week|open job market practice talk slot|practice job talks/i.test(speaker)) continue;

    const planningNotes = cells.slice(3).filter(Boolean).join(' ');
    const cancelled = /cancelled|canceled/i.test(`${speaker} ${planningNotes}`);
    speaker = speaker
      .replace(/\s*\((?:cancelled|canceled|no hotel needed)\)\s*$/i, '')
      .replace(/\*+$/, '')
      .trim();
    if (!speaker) continue;

    const timeMatch = planningNotes.match(/(\d{1,2}):(\d{2})\s*(am|pm)?\s*[-–]\s*(\d{1,2}):(\d{2})\s*(am|pm)?/i);
    const specialLocation = /archaeology\s*612/i.test(planningNotes)
      ? 'Archaeology 612'
      : /ifs conference room/i.test(planningNotes)
        ? 'IFS conference room'
        : /at the ifs/i.test(planningNotes)
          ? 'IFS'
          : '';

    const year = term === 1 || month >= 9 ? 2026 : 2027;
    rows.push({
      Date: `${year}-${String(month).padStart(2, '0')}-${day.padStart(2, '0')}`,
      Speaker: speaker,
      Status: cancelled ? 'Cancelled' : 'Scheduled',
      'Special start time': timeMatch ? normalisePlanningTime(timeMatch[1], timeMatch[2], timeMatch[3]) : '',
      'Special end time': timeMatch ? normalisePlanningTime(timeMatch[4], timeMatch[5], timeMatch[6]) : '',
      'Special location': specialLocation,
    });
  }
  return rows;
}

function csvCell(value = '') {
  const text = String(value ?? '');
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

async function saveOfflineSource(item, records) {
  if (!item.source.offlineFile) return;
  const file = path.join(root, item.source.offlineFile);
  const text = [
    columns.join(','),
    ...records.map((record) => columns.map((column) => csvCell(record[column] || '')).join(',')),
  ].join('\n') + '\n';
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, text);
}

function parseIfsDate(value='') {
  const match = value.trim().match(/^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/);
  if (!match) return '';
  const month = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'].indexOf(match[2].slice(0,3).toLowerCase()) + 1;
  return month ? `${match[3]}-${String(month).padStart(2,'0')}-${match[1].padStart(2,'0')}` : '';
}

function parseIfsFlourish(html, seriesFilter) {
  const corrections = {
    'Kartik Srivastava (Univeristy of Warwick': 'Kartik Srivastava (University of Warwick)',
    'David Jaegar (St Andrews)': 'David Jaeger (University of St Andrews)',
    'Claudio Ferraz (Univesity of British Columbia)': 'Claudio Ferraz (University of British Columbia)',
    'Jonathan Weigel (University of Califonia, Berkeley)': 'Jonathan Weigel (University of California, Berkeley)',
    'Arna Olafsson (Copenhagen Businees School)': 'Arna Olafsson (Copenhagen Business School)',
    'Krishna Pendakur (Simon Fraser Univeristy)': 'Krishna Pendakur (Simon Fraser University)',
  };
  const match = html.match(/_Flourish_data\s*=\s*(\{"rows":\[.*?\]\})\s*,?\s*\n/);
  if (!match) throw new Error('IFS schedule data was not found in the embedded table');
  const rows = JSON.parse(match[1]).rows || [];
  return rows
    .map(row => row.columns || [])
    .filter(cells => (cells[3] || '').trim().toLowerCase() === seriesFilter.trim().toLowerCase())
    .map(cells => ({
      Date: parseIfsDate(cells[1] || ''),
      Speaker: corrections[(cells[4] || '').trim()] || (cells[4] || '').trim(),
      Title: /^(TBC|TBA)$/i.test((cells[5] || '').trim()) ? '' : (cells[5] || '').trim(),
      Status: /^(TBC|TBA)$/i.test((cells[5] || '').trim()) ? 'TBA' : 'Scheduled',
      Time: (cells[2] || '').trim(),
    }))
    .filter(row => row.Date && row.Speaker);
}

async function readSource(item) {
  const source = item.source;
  if (source.type === 'unconfigured') return [];
  if (offline) {
    if (!source.offlineFile) return [];
    const text = await fs.readFile(path.join(root, source.offlineFile), 'utf8');
    const headers = parseCsvMatrix(text)[0]?.map(value => value.trim()) || [];
    const parsed = headers.includes('Date') && headers.includes('Speaker')
      ? parseCsv(text)
      : source.adapter === 'finance-planning-sheet'
        ? parseFinancePlanningSheet(text)
        : source.adapter === 'macro-planning-sheet'
          ? parseMacroPlanningSheet(text)
          : source.adapter === 'applied-planning-sheet'
            ? parseAppliedPlanningSheet(text)
            : parseCsv(text);
    return standardise(parsed);
  }
  if (source.type === 'google-sheet') {
    const url = `https://docs.google.com/spreadsheets/d/${source.spreadsheetId}/export?format=csv&gid=${source.gid}`;
    const response = await fetch(url); if (!response.ok) throw new Error(`${item.name}: ${response.status}`);
    const text = await response.text();
    const parsed = source.adapter === 'macro-planning-sheet'
      ? parseMacroPlanningSheet(text)
      : source.adapter === 'finance-planning-sheet'
        ? parseFinancePlanningSheet(text)
        : source.adapter === 'applied-planning-sheet'
          ? parseAppliedPlanningSheet(text)
        : parseCsv(text);
    return standardise(parsed);
  }
  if (source.type === 'html') {
    const response = await fetch(source.embedUrl || source.url); if (!response.ok) throw new Error(`${item.name}: ${response.status}`);
    const html = await response.text();
    if (source.adapter === 'ifs-flourish') return standardise(parseIfsFlourish(html, source.seriesFilter));
    const embeddedData = html.match(/const data = (\{.*?\});\s*\n\s*\/\/ Function/s);
    if (embeddedData) {
      const rows = JSON.parse(embeddedData[1]).seminars || [];
      return standardise(rows.filter(row => (!source.dateFrom || row.date >= source.dateFrom) && (!source.dateTo || row.date <= source.dateTo)));
    }
    const rows = [...html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)].map(match => [...match[1].matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi)].map(cell => cell[1].replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim()));
    return standardise(rows.slice(1).map(cells => ({Date:cells[0],Speaker:cells[1],Title:cells[2],Status:'Scheduled'})));
  }
  return [];
}

async function createWorkbook(item, records) {
  const workbook = Workbook.create(); const sheet = workbook.worksheets.add('Seminars');
  const data = records.length ? records : [Object.fromEntries(columns.map(column => [column, '']))];
  sheet.getRange(`A1:J${data.length + 1}`).values = [columns, ...data.map(record => columns.map(column => column === 'Date' && record[column] ? new Date(`${record[column]}T00:00:00Z`) : record[column] || ''))];
  sheet.showGridLines = false; sheet.freezePanes.freezeRows(1);
  const header = sheet.getRange('A1:J1'); header.format.fill = '#001B44'; header.format.font = { bold:true, color:'#FFFFFF' }; header.format.rowHeight = 42; header.format.horizontalAlignment = 'center'; header.format.verticalAlignment = 'center'; header.format.wrapText = true;
  sheet.getRange('H1:J1').format.fill = '#7A4E00';
  const body = sheet.getRange(`A2:J${data.length + 1}`); body.format.font = { name:'Arial', size:10 }; body.format.verticalAlignment = 'center'; body.format.wrapText = true; body.format.borders = { insideHorizontal:{style:'thin',color:'#D8DEE3'} };
  sheet.getRange(`A2:A${data.length + 1}`).setNumberFormat('yyyy-mm-dd');
  [110,180,190,220,260,220,100,125,125,190].forEach((width, i) => sheet.getRangeByIndexes(0,i,data.length+1,1).format.columnWidthPx = width);
  body.format.autofitRows();
  sheet.getRange(`H2:J${data.length + 1}`).format.fill = '#EAF2F8';
  for (let r = 0; r < data.length; r++) {
    for (let c = 0; c < 7; c++) if (!data[r][columns[c]] || String(data[r][columns[c]]).trim().toUpperCase() === 'TBA') sheet.getCell(r + 1, c).format.fill = '#FFF2CC';
    for (let c = 7; c < 10; c++) if (data[r][columns[c]]) { sheet.getCell(r + 1, c).format.fill = '#F6BE00'; sheet.getCell(r + 1, c).format.font = {name:'Arial',size:10,bold:true,color:'#17212B'}; }
  }
  sheet.getRange(`G2:G${data.length + 1}`).dataValidation = { rule:{ type:'list', values:['Scheduled','JMC','Cancelled','Postponed','TBA'] } };
  const table = sheet.tables.add(`A1:J${data.length + 1}`, true, `${item.id.replaceAll('-','_')}_seminars`); table.style = 'TableStyleMedium2'; table.showBandedRows = false;
  const noteRow = data.length + 3;
  sheet.getRange(`A${noteRow}:B${noteRow}`).values = [['Overrides', 'Blue columns are optional. A gold value replaces the series default for that seminar.']];
  sheet.getRange(`A${noteRow}`).format.font = { name:'Arial', size:9, bold:true, color:'#4B5563' };
  sheet.getRange(`B${noteRow}`).format.font = { name:'Arial', size:9, italic:true, color:'#4B5563' };
  if (item.source.url) {
    const sourceRow = data.length + 4;
    sheet.getRange(`A${sourceRow}:B${sourceRow}`).values = [['Source', item.source.url]];
    sheet.getRange(`A${sourceRow}`).format.font = { name:'Arial', size:9, bold:true, color:'#4B5563' };
    sheet.getRange(`B${sourceRow}`).format.font = { name:'Arial', size:9, italic:true, color:'#4B5563' };
    sheet.getRange(`B${sourceRow}`).format.columnWidthPx = 180;
  }
  await fs.mkdir(outputDir, { recursive:true }); const out = await SpreadsheetFile.exportXlsx(workbook); const file = path.join(outputDir, `${item.id}-2026-27.xlsx`); await out.save(file);
  const inspect = await workbook.inspect({kind:'table',range:`Seminars!A1:J${Math.min(data.length+1,8)}`,include:'values,formulas',tableMaxRows:8,tableMaxCols:10});
  const errors = await workbook.inspect({kind:'match',searchTerm:'#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!|#SPILL!|#CALC!',options:{useRegex:true,maxResults:50},summary:'formula error scan'});
  const previewEndRow = data.length + (item.source.url ? 4 : 3);
  const preview = await workbook.render({sheetName:'Seminars',range:`A1:J${previewEndRow}`,scale:1.5}); if (preview) await fs.writeFile(path.join(outputDir, `${item.id}-preview.png`), new Uint8Array(await preview.arrayBuffer()));
  console.log(JSON.stringify({file,rows:records.length,inspect:inspect.ndjson,errorScan:errors.ndjson}));
}

const config = JSON.parse(await fs.readFile(path.join(root, 'seminars/config/series.json'), 'utf8'));
const siteSeriesIds = {'applied-economics':'applied','econometrics':'econometrics','economic-theory':'theory','finance':'finance','macroeconomics':'macro','ifs-seminars':'ifs','ifs-development':'ifs-development','ifs-labour':'ifs-labour'};
const siteDataFile = path.join(root,'site/data/seminars.json');
let siteRecords = [];
if (selectedSeries || offline) { try { siteRecords = JSON.parse(await fs.readFile(siteDataFile, 'utf8')); } catch {} }
for (const item of config) {
  if (selectedSeries && !selectedSeries.has(item.id)) continue;
  let records=[]; try { records=await readSource(item); } catch(error) { console.error(String(error)); if (item.source.offlineFile) records=standardise(parseCsv(await fs.readFile(path.join(root,item.source.offlineFile),'utf8'))); }
  if (!offline) await saveOfflineSource(item, records);
  await createWorkbook(item, records);
  if (offline && !item.source.offlineFile) continue;
  siteRecords = siteRecords.filter(record => record.series !== siteSeriesIds[item.id]);
  for (const record of records) {
    if (/^cancelled$/i.test(record.Status || '')) continue;
    const override=item.overrides?.[record.Date]||{};
    const defaultParts = String(override.time || record._time || item.defaultTime).split(/[–-]/).map(value => value.trim());
    const hasSpecialTime = Boolean(record['Special start time'] || record['Special end time']);
    const start = record['Special start time'] || (hasSpecialTime ? '' : defaultParts[0]) || 'TBA';
    const finish = record['Special end time'] || (hasSpecialTime ? '' : defaultParts[1]) || '';
    siteRecords.push({id:`${item.id}-${record.Date}`,series:siteSeriesIds[item.id],date:record.Date,speaker:record.Speaker,institution:record.Institution,speakerUrl:record['Speaker URL']||undefined,title:record.Title||undefined,paperUrl:record['Paper URL']||undefined,status:record.Status||'Scheduled',time:finish ? `${start}–${finish}` : start,location:record['Special location']||override.location||record._location||item.defaultLocation});
  }
}
siteRecords.sort((a,b) => a.date.localeCompare(b.date) || a.series.localeCompare(b.series));
await fs.mkdir(path.join(root,'site/data'),{recursive:true});
await fs.writeFile(siteDataFile,JSON.stringify(siteRecords,null,2)+'\n');
const organiserData = Object.fromEntries(config.map((item) => [
  siteSeriesIds[item.id],
  (item.organisers || []).map((organiser) => organiser.name),
]));
await fs.writeFile(path.join(root, 'site/data/series-organisers.json'), JSON.stringify(organiserData, null, 2) + '\n');
