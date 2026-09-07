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

async function generatedTextFiles(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = [];
  const textExtensions = new Set(['.html', '.js', '.css', '.json', '.rsc', '.txt', '.map']);
  for (const entry of entries) {
    const item = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await generatedTextFiles(item));
    else if (entry.isFile() && textExtensions.has(path.extname(entry.name))) files.push(item);
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

// UCL's GitHub Pages host does not serve directories beginning with an
// underscore, even when Jekyll is disabled. Move vinext's client assets to a
// regular directory and update every generated reference to them.
const nextAssets = path.join(output, '_next');
const publicAssets = path.join(output, 'assets');
await fs.rename(nextAssets, publicAssets);
for (const file of await generatedTextFiles(output)) {
  const source = await fs.readFile(file, 'utf8');
  const updated = source.replaceAll('/_next/', '/assets/');
  if (updated !== source) await fs.writeFile(file, updated);
}

// GitHub Pages otherwise treats the output as a Jekyll site and does not
// publish vinext's `_next` directory, which contains the CSS and JavaScript.
await fs.writeFile(path.join(output, '.nojekyll'), '');

console.log(`Prepared ${pages.length} extensionless routes and disabled Jekyll.`);
