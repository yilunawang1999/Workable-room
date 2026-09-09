import assert from 'node:assert/strict';
import { readFile, access, readdir } from 'node:fs/promises';
import { resolve, join } from 'node:path';

const directory = resolve('dist-pages');
const html = await readFile(join(directory, 'index.html'), 'utf8');
assert.match(html, /<title>A workable world/);
assert.match(html, /<div id="root"><\/div>/);
assert.doesNotMatch(html, /\/src\/|\/_vinext\/|\/node_modules\//);
const refs = [...html.matchAll(/(?:src|href)="([^"]+)"/g)].map(match => match[1]);
assert(refs.some(path => path.endsWith('.js')), 'No JavaScript entry was emitted');
assert(refs.some(path => path.endsWith('.css')), 'No stylesheet was emitted');
const expectedBase = process.env.PAGES_BASE_PATH;
let checked = 0;
for (const reference of refs) {
  assert(!/^https?:|^\/\//.test(reference), `Unexpected external asset: ${reference}`);
  if (expectedBase) {
    const base = expectedBase === './' ? './' : `/${expectedBase.replace(/^\/+|\/+$/g, '')}/`.replace(/^\/\/$/, '/');
    assert(reference.startsWith(base), `${reference} does not use ${base}`);
  }
  // Vite HTML references either the asset folder or the copied favicon.
  const asset = reference.includes('/assets/') ? reference.slice(reference.indexOf('/assets/') + 1) : reference.endsWith('favicon.svg') ? 'favicon.svg' : reference.replace(/^\.\//, '').replace(/^\//, '');
  await access(join(directory, asset));
  checked++;
}
const manifest = JSON.parse(await readFile(join(directory, '.vite/manifest.json'), 'utf8'));
assert(manifest['index.html']?.isEntry, 'Missing static HTML entry');
for (const entry of Object.values(manifest)) {
  for (const file of [entry.file, ...(entry.css ?? []), ...(entry.assets ?? [])]) {
    await access(join(directory, file));
    checked++;
  }
  for (const dependency of [...(entry.imports ?? []), ...(entry.dynamicImports ?? [])]) {
    assert(manifest[dependency], `Missing dependent chunk ${dependency}`);
  }
}
const files = await readdir(directory);
assert(!files.includes('server'), 'Worker output must not be uploaded to GitHub Pages');
console.log(`Static output verified: ${checked} asset references, including lazy-loaded scene chunks.`);
console.log(`HTML paths: ${refs.join(', ')}`);
