import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const seminars = JSON.parse(await fs.readFile(path.join(root, 'site/data/seminars.json'), 'utf8'));
const outputDirectory = path.join(root, 'site/public/calendars');
const academicYear = '2026-27';
const seriesNames = {
  applied: 'Applied Economics',
  econometrics: 'CeMMAP',
  theory: 'THEBES',
  finance: 'Finance',
  macro: 'Macroeconomics',
  'phd-seminar': 'PhD Student Seminar',
  ifs: 'IFS Seminar',
  'ifs-development': 'IFS/UCL/LSE Development Seminar',
  'ifs-labour': 'IFS/UCL Labour Seminar',
};

function escapeText(value) {
  return String(value || '')
    .replaceAll('\\', '\\\\')
    .replaceAll('\n', '\\n')
    .replaceAll(',', '\\,')
    .replaceAll(';', '\\;');
}

function foldLine(line) {
  const parts = [];
  let current = '';
  for (const character of line) {
    const candidate = current + character;
    const limit = parts.length === 0 ? 75 : 74;
    if (Buffer.byteLength(candidate, 'utf8') > limit) {
      parts.push(current);
      current = character;
    } else {
      current = candidate;
    }
  }
  parts.push(current);
  return parts.join('\r\n ');
}

function parseClock(value, inheritedPeriod) {
  const match = String(value).trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/i);
  if (!match) return null;
  let hour = Number(match[1]);
  const minute = Number(match[2] || 0);
  const period = (match[3] || inheritedPeriod || '').toLowerCase();
  if (minute > 59 || hour > (period ? 12 : 23)) return null;
  if (period === 'am' && hour === 12) hour = 0;
  if (period === 'pm' && hour !== 12) hour += 12;
  return { hour, minute };
}

function parseTimeRange(value) {
  const parts = String(value || '').split(/[–—-]/).map((part) => part.trim());
  if (!parts[0] || /^(tba|tbd)$/i.test(parts[0])) return null;
  const endPeriod = parts[1]?.match(/(am|pm)$/i)?.[1];
  const start = parseClock(parts[0], endPeriod);
  if (!start) return null;
  let end = parts[1] ? parseClock(parts[1]) : null;
  if (!end) {
    end = { hour: (start.hour + 1) % 24, minute: start.minute };
  } else if (end.hour * 60 + end.minute <= start.hour * 60 + start.minute) {
    end.hour += 12;
  }
  return { start, end };
}

function localDateTime(date, clock) {
  return `${date.replaceAll('-', '')}T${String(clock.hour).padStart(2, '0')}${String(clock.minute).padStart(2, '0')}00`;
}

function eventLines(seminar) {
  const times = parseTimeRange(seminar.time);
  if (!times) return null;
  const seriesName = seriesNames[seminar.series];
  const summary = [seminar.speaker, seminar.title].filter(Boolean).join(' — ') || `${seriesName} seminar`;
  const description = [
    seminar.institution,
    seminar.paperUrl && `Paper: ${seminar.paperUrl}`,
    seminar.speakerUrl && `Speaker: ${seminar.speakerUrl}`,
    `Seminar series: ${seriesName}`,
  ].filter(Boolean).join('\n');
  const status = /^cancelled$/i.test(seminar.status || '') ? 'CANCELLED' : 'CONFIRMED';
  return [
    'BEGIN:VEVENT',
    `UID:${escapeText(seminar.id)}@economics.ucl.ac.uk`,
    'DTSTAMP:20260901T000000Z',
    `DTSTART;TZID=Europe/London:${localDateTime(seminar.date, times.start)}`,
    `DTEND;TZID=Europe/London:${localDateTime(seminar.date, times.end)}`,
    `SUMMARY:${escapeText(summary)}`,
    `DESCRIPTION:${escapeText(description)}`,
    `LOCATION:${escapeText(seminar.location)}`,
    `STATUS:${status}`,
    'SEQUENCE:0',
    'END:VEVENT',
  ];
}

await fs.mkdir(outputDirectory, { recursive: true });
let totalEvents = 0;
for (const [seriesId, seriesName] of Object.entries(seriesNames)) {
  const events = seminars
    .filter((seminar) => seminar.series === seriesId)
    .map(eventLines)
    .filter(Boolean);
  totalEvents += events.length;
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'PRODID:-//UCL Economics Research//Seminar calendars//EN',
    `X-WR-CALNAME:${escapeText(`${seriesName} seminars ${academicYear}`)}`,
    'X-WR-TIMEZONE:Europe/London',
    'REFRESH-INTERVAL;VALUE=DURATION:PT12H',
    'X-PUBLISHED-TTL:PT12H',
    ...events.flat(),
    'END:VCALENDAR',
  ];
  const calendar = `${lines.map(foldLine).join('\r\n')}\r\n`;
  await fs.writeFile(path.join(outputDirectory, `${seriesId}-${academicYear}.ics`), calendar);
}

console.log(`Generated ${Object.keys(seriesNames).length} seminar calendars with ${totalEvents} timed events.`);
