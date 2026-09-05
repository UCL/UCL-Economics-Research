import fs from 'node:fs/promises';
import path from 'node:path';
import { FileBlob, SpreadsheetFile } from '@oai/artifact-tool';

const root = path.resolve(process.argv[2] || process.cwd());
const outputDir = path.join(root, 'outputs', '01a0719b-f374-7590-b5ae-261ff64e352b');

for (const [relativePath, sheetName, previewName] of [
  ['visitors/visitors-2026-27.xlsx', 'Visitors', 'visitors-before-edit.png'],
  ['events/events-2026-27.xlsx', 'Events', 'events-before-edit.png'],
]) {
  const workbook = await SpreadsheetFile.importXlsx(await FileBlob.load(path.join(root, relativePath)));
  const summary = await workbook.inspect({
    kind: 'workbook,sheet,table',
    maxChars: 5000,
    tableMaxRows: 8,
    tableMaxCols: 10,
  });
  const preview = await workbook.render({ sheetName, autoCrop: 'all', scale: 1 });
  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(path.join(outputDir, previewName), new Uint8Array(await preview.arrayBuffer()));
  console.log(relativePath, summary.ndjson);
}
