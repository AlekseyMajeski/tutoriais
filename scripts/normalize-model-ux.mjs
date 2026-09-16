import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const BASE = path.join(ROOT, 'impressoras-termicas');

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (entry.isFile() && entry.name === 'index.html') out.push(full);
  }
  return out;
}

let changed = 0;
for (const file of walk(BASE)) {
  let html = fs.readFileSync(file, 'utf8');
  if (!/body[^>]+class=["'][^"']*model-page/i.test(html)) continue;

  const rel = path.relative(ROOT, file).replaceAll(path.sep, '/');
  const depth = rel.split('/').length - 1;
  const prefix = '../'.repeat(depth);
  const loader = `<script src="${prefix}assets/model-page.js" defer></script>`;

  if (/<script[^>]+src=["'][^"']*assets\/model-page\.js[^"']*["']/i.test(html)) continue;

  if (/<script[^>]+src=["'][^"']*assets\/house-ads\.js[^"']*["'][^>]*><\/script>/i.test(html)) {
    html = html.replace(/(<script[^>]+src=["'][^"']*assets\/house-ads\.js[^"']*["'][^>]*><\/script>)/i, `${loader}\n$1`);
  } else {
    html = html.replace('</body>', `${loader}\n</body>`);
  }

  fs.writeFileSync(file, html);
  changed += 1;
  console.log(`normalizado UX: ${rel}`);
}

console.log(`Model UX normalize: ${changed} página(s) alterada(s).`);
