import fs from 'node:fs/promises';
import path from 'node:path';

const output = path.resolve(process.argv[2] || 'site/dist/client');

async function htmlFiles(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const item = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await htmlFiles(item));
    else if (entry.isFile() && entry.name.endsWith('.html')) files.push(item);
  }
  return files;
}

const pages = (await htmlFiles(output))
  .filter((file) => !['index.html', '404.html'].includes(path.basename(file)))
  .sort((a, b) => b.length - a.length);

for (const file of pages) {
  const directory = file.slice(0, -'.html'.length);
  await fs.mkdir(directory, { recursive: true });
  await fs.rename(file, path.join(directory, 'index.html'));
}

console.log(`Prepared ${pages.length} extensionless routes for GitHub Pages.`);
