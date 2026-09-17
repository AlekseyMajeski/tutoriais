import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const STRICT = process.env.STRICT_SEO === '1';
const SITE = 'https://alekseymajeski.github.io/tutoriais';
const errors = [];
const warnings = [];

const rel = file => path.relative(ROOT, file).replaceAll('\\', '/');
const read = file => fs.readFileSync(file, 'utf8');

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === '.git' || entry.name === 'node_modules') return [];
      return walk(full);
    }
    return [full];
  });
}

const files = walk(ROOT);
const htmlFiles = files.filter(f => f.endsWith('.html'));

function has(re, text) { return re.test(text); }

for (const file of htmlFiles) {
  const r = rel(file);
  const html = read(file);

  if (!has(/<title>[^<]+<\/title>/i, html)) errors.push(`${r}: sem <title>`);
  if (!has(/<meta\s+name=["']description["'][^>]+content=["'][^"']+/i, html) && !has(/<meta\s+content=["'][^"']+["'][^>]+name=["']description["']/i, html)) warnings.push(`${r}: sem meta description`);
  if (!has(/<link\s+rel=["']canonical["'][^>]+href=["']https?:\/\//i, html)) warnings.push(`${r}: sem canonical absoluto`);
  if (!has(/<h1\b/i, html)) warnings.push(`${r}: sem H1`);

  if (/\b(?:src|href)=["']\/tutoriais\//i.test(html)) {
    errors.push(`${r}: caminho absoluto /tutoriais/ em src/href; pode quebrar no domínio definitivo`);
  }

  const isModel = /^impressoras-termicas\/[^/]+\/[^/]+\/index\.html$/.test(r);
  if (isModel) {
    if (!has(/<meta\s+name=["']robots["']/i, html)) warnings.push(`${r}: tutorial sem meta robots explícito`);
    if (!has(/application\/ld\+json/i, html)) warnings.push(`${r}: tutorial sem JSON-LD`);
    if (!html.includes('BreadcrumbList')) warnings.push(`${r}: tutorial sem BreadcrumbList no JSON-LD`);
    if (!html.includes('house-ads.js')) errors.push(`${r}: tutorial sem house-ads.js`);
    if (!has(/data-ad-position=["']after-download["']/i, html)) warnings.push(`${r}: sem slot after-download`);
    if (!has(/data-ad-position=["']after-troubleshooting["']/i, html)) warnings.push(`${r}: sem slot after-troubleshooting`);
  }
}

const catalogPaths = [
  'data/impressoras.json',
  'data/impressoras-extra.json',
  'data/impressoras-extra2.json',
  'data/impressoras-xprinter.json',
  'data/impressoras-zebra.json',
  'data/impressoras-brother.json',
  'data/impressoras-honeywell.json',
  'data/impressoras-tsc.json',
  'data/impressoras-tsc-healthcare.json',
  'data/impressoras-tsc-rfid.json',
  'data/impressoras-tsc-mobile.json',
  'data/impressoras-tsc-current.json'
];

let catalog = [];
for (const p of catalogPaths) {
  const full = path.join(ROOT, p);
  try {
    const data = JSON.parse(read(full));
    if (!Array.isArray(data)) throw new Error('raiz não é array');
    catalog.push(...data.map(item => ({ ...item, __source: p })));
  } catch (err) {
    errors.push(`${p}: JSON inválido (${err.message})`);
  }
}

const seenIds = new Map();
const seenUrls = new Map();
for (const item of catalog) {
  if (!item.id) { errors.push(`${item.__source}: item sem id`); continue; }
  if (seenIds.has(item.id)) errors.push(`id duplicado: ${item.id} (${seenIds.get(item.id)} e ${item.__source})`);
  seenIds.set(item.id, item.__source);

  if (item.url) {
    if (seenUrls.has(item.url)) errors.push(`URL duplicada no catálogo: ${item.url}`);
    seenUrls.set(item.url, item.id);
  }

  if (item.status === 'publicado' && item.url) {
    const local = item.url.replace(/^\/tutoriais\//, '').replace(/\/$/, '/index.html');
    const full = path.join(ROOT, local);
    if (!fs.existsSync(full)) errors.push(`${item.id}: publicado no catálogo, mas página não existe: ${local}`);
  }
}

const sitemapFiles = [
  'sitemap.xml',
  'sitemap-guides.xml',
  'sitemap-zebra.xml',
  'sitemap-brother.xml',
  'sitemap-honeywell.xml',
  'sitemap-tsc.xml',
  'sitemap-tsc-healthcare.xml',
  'sitemap-tsc-rfid.xml',
  'sitemap-tsc-mobile.xml',
  'sitemap-tsc-current.xml'
]
  .map(p => path.join(ROOT, p))
  .filter(fs.existsSync);
const sitemapText = sitemapFiles.map(read).join('\n');

for (const item of catalog.filter(i => i.status === 'publicado' && i.url)) {
  const absolute = item.url.startsWith('http') ? item.url : `${SITE}${item.url.replace(/^\/tutoriais/, '')}`;
  if (!sitemapText.includes(absolute)) errors.push(`${item.id}: URL publicada fora dos sitemaps: ${absolute}`);
}

const modelPages = htmlFiles.filter(f => /^impressoras-termicas\/[^/]+\/[^/]+\/index\.html$/.test(rel(f)));
for (const file of modelPages) {
  const r = rel(file);
  const url = `/tutoriais/${r.replace(/index\.html$/, '')}`;
  if (!seenUrls.has(url)) errors.push(`${r}: página de modelo fora dos catálogos (${url})`);
}

console.log(`SEO audit: ${htmlFiles.length} HTMLs, ${catalog.length} itens de catálogo, ${modelPages.length} páginas de modelo.`);
if (warnings.length) {
  console.log(`\nAVISOS (${warnings.length})`);
  warnings.forEach(x => console.log(`- ${x}`));
}
if (errors.length) {
  console.log(`\nERROS (${errors.length})`);
  errors.forEach(x => console.log(`- ${x}`));
}

if (!warnings.length && !errors.length) console.log('\nAUDIT PASS');
else if (!errors.length) console.log('\nAUDIT PASS com avisos');
else console.log(`\nAUDIT ${STRICT ? 'FAIL' : 'REPORT'} — use STRICT_SEO=1 para bloquear em erros.`);

if (STRICT && errors.length) process.exit(1);
