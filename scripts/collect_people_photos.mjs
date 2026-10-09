import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const people = JSON.parse(await fs.readFile(path.join(root, 'site/data/people.json'), 'utf8'));
const output = path.join(root, 'site/public/people-photos');
await fs.mkdir(output, { recursive: true });
const photos = {};
const failures = [];
async function collect(person) {
  const id = person.uclProfileId || person.profileUrl?.match(/profiles\.ucl\.ac\.uk\/(\d+)/)?.[1];
  if (!id) return;
  try {
    const response = await fetch(`https://profiles.ucl.ac.uk/api/users/${id}/thumbnail`, { signal: AbortSignal.timeout(30000) });
    if (response.status === 404) return;
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const { thumbnail } = await response.json();
    if (!thumbnail) return;
    const bytes = Buffer.from(thumbnail, 'base64');
    const ext = bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10])) ? 'png'
      : bytes[0] === 255 && bytes[1] === 216 ? 'jpg'
      : bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP' ? 'webp'
      : /^GIF8[79]a$/.test(bytes.toString('ascii', 0, 6)) ? 'gif' : null;
    if (!ext) throw new Error('Unrecognised image format');
    await fs.writeFile(path.join(output, `${id}.${ext}`), bytes);
    photos[person.email] = `/people-photos/${id}.${ext}`;
  } catch (error) { failures.push({ name: person.name, error: String(error) }); }
}
for (let i = 0; i < people.length; i += 4) await Promise.all(people.slice(i, i + 4).map(collect));
await fs.writeFile(path.join(root, 'site/data/people-photos.json'), JSON.stringify(photos, null, 2) + '\n');
console.log(JSON.stringify({ people: people.length, portraits: Object.keys(photos).length, failures }));
