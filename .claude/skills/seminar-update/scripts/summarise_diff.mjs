#!/usr/bin/env node
// Summarise what a seminar import changed for one series, comparing the working copy of
// site/data/seminars.json against a git ref (default HEAD). Prints Markdown.
// Usage, from anywhere inside the repository:
//   node summarise_diff.mjs <series-id> [--base <git-ref>]   the review summary
//   node summarise_diff.mjs <series-id> --files               the series' expected files, one per line
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const argv = process.argv.slice(2);
const seriesId = argv.find((a) => !a.startsWith('--'));
if (!seriesId) { console.error('usage: summarise_diff.mjs <series-id> [--base <ref>] [--files]'); process.exit(2); }
const baseIndex = argv.indexOf('--base');
const base = baseIndex >= 0 ? argv[baseIndex + 1] : 'HEAD';
const filesOnly = argv.includes('--files');

const root = execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim();
const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8' });
const dataFile = 'site/data/seminars.json';
const academicYear = '2026-27';

const config = JSON.parse(fs.readFileSync(path.join(root, 'seminars/config/series.json'), 'utf8'));
const series = config.find((s) => s.id === seriesId);
if (!series) { console.error(`unknown series: ${seriesId}; ids: ${config.map((s) => s.id).join(', ')}`); process.exit(2); }

const oldRecords = JSON.parse(git('show', `${base}:${dataFile}`));
const newRecords = JSON.parse(fs.readFileSync(path.join(root, dataFile), 'utf8'));
const mine = (records) => new Map(records.filter((r) => r.id.startsWith(`${seriesId}-`)).map((r) => [r.id, r]));
const before = mine(oldRecords);
const after = mine(newRecords);
const siteSeriesId = [...after.values(), ...before.values()][0]?.series;

// Expected files for this series.
const expectedFiles = [dataFile];
if (series.source?.offlineFile) expectedFiles.unshift(series.source.offlineFile);
if (siteSeriesId) expectedFiles.push(`site/public/calendars/${siteSeriesId}-${academicYear}.ics`);
if (filesOnly) { console.log(expectedFiles.join('\n')); process.exit(0); }

// Field-level comparison.
const ignored = new Set(['id', 'series']);
const describe = (r) => `${r.date} ${r.speaker || '(no speaker)'}`;
const quote = (v) => (v === undefined || v === '' ? 'empty' : `"${v}"`);
const added = [], removed = [], changed = [];
for (const [id, r] of after) if (!before.has(id)) added.push(r);
for (const [id, r] of before) if (!after.has(id)) removed.push(r);
for (const [id, r] of after) {
  const o = before.get(id); if (!o) continue;
  const keys = new Set([...Object.keys(o), ...Object.keys(r)].filter((k) => !ignored.has(k)));
  const edits = [];
  for (const k of [...keys].sort()) {
    if ((o[k] ?? '') === (r[k] ?? '')) continue;
    if ((o[k] ?? '') === '') edits.push(`${k} added ${quote(r[k])}`);
    else if ((r[k] ?? '') === '') edits.push(`${k} removed (was ${quote(o[k])})`);
    else edits.push(`${k} changed from ${quote(o[k])} to ${quote(r[k])}`);
  }
  if (edits.length) changed.push({ record: r, edits });
}
const byDate = (a, b) => a.date.localeCompare(b.date);
added.sort(byDate); removed.sort(byDate); changed.sort((a, b) => byDate(a.record, b.record));

const out = [];
out.push(`# ${series.name} import summary (against ${base})`, '');
const total = added.length + removed.length + changed.length;
out.push(`## Changes (${total})`, '');
if (!total) out.push('- none');
const lines = [
  ...added.map((r) => [r.date, `- ${describe(r)}: added (${r.time || 'time TBA'}, ${r.location || 'location TBA'}, title ${r.title ? quote(r.title) : 'TBA'})`]),
  ...removed.map((r) => [r.date, `- ${describe(r)}: removed (title ${r.title ? quote(r.title) : 'TBA'})`]),
  ...changed.map(({ record, edits }) => [record.date, `- ${describe(record)}: ${edits.join('; ')}`]),
].sort((a, b) => a[0].localeCompare(b[0]));
out.push(...lines.map((l) => l[1]));
out.push('');

// Flags.
const today = new Date().toISOString().slice(0, 10);
const flags = [];
if (!total) flags.push('No changes for this series. Either nothing changed at the source, or the importer could not reach it and rebuilt from the offline snapshot: check its stderr for an error line naming the series.');
const bySpeaker = new Map();
for (const r of after.values()) if (r.speaker) bySpeaker.set(r.speaker, [...(bySpeaker.get(r.speaker) || []), r.date]);
for (const [speaker, dates] of bySpeaker) if (dates.length > 1) flags.push(`Same speaker on more than one date: ${speaker} on ${dates.sort().join(', ')}. A second visit, or a stray row?`);
const upcoming = [...after.values()].filter((r) => r.date >= today).sort(byDate);
const horizon = new Date(Date.now() + 28 * 864e5).toISOString().slice(0, 10);
const untitled = upcoming.filter((r) => !r.title && r.date <= horizon);
if (untitled.length) flags.push(`Seminars in the next four weeks without a title: ${untitled.map(describe).join('; ')}.`);
const offStatus = upcoming.filter((r) => r.status && r.status !== 'Scheduled');
if (offStatus.length) flags.push(`Upcoming seminars whose status is not Scheduled: ${offStatus.map((r) => `${describe(r)} (${r.status})`).join('; ')}.`);
const moved = removed.filter((r) => added.some((a) => a.speaker === r.speaker));
if (moved.length) flags.push(`Date moved rather than cancelled? ${moved.map((r) => `${r.speaker} from ${r.date} to ${added.filter((a) => a.speaker === r.speaker).map((a) => a.date).join('/')}`).join('; ')}.`);
if (removed.length && !moved.length) flags.push('A seminar was removed from the source. Confirm it was meant to disappear rather than be marked Cancelled or Postponed.');
const overrides = Object.entries(series.overrides || {});
if (overrides.length) flags.push(`Overrides in seminars/config/series.json for this series: ${overrides.map(([d, o]) => `${d} (${Object.keys(o).join(', ')})`).join('; ')}. Each is a manual patch over the source; if the source now carries the same value it is redundant.`);
if (series.excludedDates?.length) flags.push(`Excluded dates in series.json: ${series.excludedDates.join(', ')}.`);
out.push('## Flags', '');
out.push(...(flags.length ? flags.map((f) => `- ${f}`) : ['- none']), '');

// Files.
const modified = git('diff', '--name-only').split('\n').filter(Boolean);
const staged = git('diff', '--cached', '--name-only').split('\n').filter(Boolean);
const untracked = git('ls-files', '--others', '--exclude-standard').split('\n').filter(Boolean);
const changedFiles = [...new Set([...modified, ...staged])];
const expectedChanged = changedFiles.filter((f) => expectedFiles.includes(f));
const incidental = changedFiles.filter((f) => !expectedFiles.includes(f));
out.push('## Files', '');
out.push(`- Expected for this series: ${expectedFiles.join(', ')}`);
out.push(`- Expected and changed: ${expectedChanged.length ? expectedChanged.join(', ') : 'none'}`);
out.push(`- Incidental (reverted at finalize): ${incidental.length ? incidental.join(', ') : 'none'}`);
out.push(`- Untracked: ${untracked.length ? untracked.join(', ') : 'none'}`);
out.push('');
console.log(out.join('\n'));
