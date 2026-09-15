import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const BASE = path.join(ROOT, 'impressoras-termicas');

const officialHosts = {
  bematech: ['bematech.com.br', 'elgin.com.br'],
  c3tech: ['c3technology.com.br', 'c3tech.com.br'],
  controlid: ['controlid.com.br'],
  daruma: ['daruma.com.br'],
  dimep: ['dimep.com.br'],
  elgin: ['elgin.com.br'],
  epson: ['epson.com.br', 'epson.com', 'epson-biz.com', 'epson.net'],
  sweda: ['sweda.com.br'],
  tanca: ['tanca.com.br'],
  waytec: ['waytec.com.br'],
};

const directFile = /\.(?:exe|msi|zip|7z|rar|dmg|pkg|deb|rpm|run|tar\.gz)(?:[?#].*)?$/i;
const candidateText = /\b(?:driver|drivers|download|baixar|software|spooler|instalador|installer|utility|utilitário|utilitario|apd|vcom|com virtual|suporte|support|microsoft|elgindevelopercommunity)\b/i;

function stripTags(s) {
  return s.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
}

function files() {
  return fs.readdirSync(BASE, { withFileTypes: true }).flatMap(brand => {
    if (!brand.isDirectory()) return [];
    return fs.readdirSync(path.join(BASE, brand.name), { withFileTypes: true }).flatMap(model => {
      if (!model.isDirectory()) return [];
      const file = path.join(BASE, brand.name, model.name, 'index.html');
      return fs.existsSync(file) ? [{ file, brand: brand.name, model: model.name }] : [];
    });
  });
}

function hostOf(href) {
  try { return new URL(href).hostname.toLowerCase(); } catch { return ''; }
}

function isOfficial(brand, host) {
  return (officialHosts[brand] || []).some(domain => host === domain || host.endsWith(`.${domain}`));
}

function isElginDeveloperSource(brand, href) {
  if (!['elgin', 'bematech'].includes(brand)) return false;
  try {
    const url = new URL(href);
    const host = url.hostname.toLowerCase();
    const path = decodeURIComponent(url.pathname).toLowerCase();
    return (host === 'raw.githubusercontent.com' || host === 'github.com') && path.startsWith('/elgindevelopercommunity/');
  } catch {
    return false;
  }
}

function classify(brand, href) {
  const host = hostOf(href);
  const direct = directFile.test(href);
  if (host === 'catalog.update.microsoft.com' || host.endsWith('.catalog.update.microsoft.com')) return 'trusted-distribution';
  if (isElginDeveloperSource(brand, href) && direct) return 'official-direct';
  if (isElginDeveloperSource(brand, href)) return 'official-page';
  if (isOfficial(brand, host) && direct) return 'official-direct';
  if (isOfficial(brand, host)) return 'official-page';
  if (direct) return 'third-party-direct';
  return 'other';
}

const rows = [];
for (const { file, brand, model } of files()) {
  const html = fs.readFileSync(file, 'utf8');
  const title = stripTags(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] || model);
  const anchors = [...html.matchAll(/<a\b([^>]*?)href=["']([^"']+)["']([^>]*)>([\s\S]*?)<\/a>/gi)]
    .map(m => ({ href: m[2], text: stripTags(m[4]) }))
    .filter(a => /^https?:\/\//i.test(a.href))
    .filter(a => candidateText.test(`${a.text} ${a.href}`));

  const candidates = anchors.map(a => ({ ...a, kind: classify(brand, a.href) }));
  const best = candidates.find(a => a.kind === 'official-direct')
    || candidates.find(a => a.kind === 'trusted-distribution')
    || candidates.find(a => a.kind === 'official-page')
    || candidates.find(a => a.kind === 'third-party-direct')
    || candidates[0];

  const status = candidates.some(a => a.kind === 'official-direct') ? 'OFFICIAL_DIRECT'
    : candidates.some(a => a.kind === 'trusted-distribution') ? 'TRUSTED_DISTRIBUTION'
    : candidates.some(a => a.kind === 'official-page') ? 'OFFICIAL_PAGE_ONLY'
    : candidates.some(a => a.kind === 'third-party-direct') ? 'THIRD_PARTY_DIRECT_ONLY'
    : 'NO_DRIVER_LINK';

  rows.push({ brand, model, title, status, best, candidates });
}

const counts = rows.reduce((acc, r) => ((acc[r.status] = (acc[r.status] || 0) + 1), acc), {});
console.log(`Download audit: ${rows.length} páginas de modelo.`);
for (const key of ['OFFICIAL_DIRECT','TRUSTED_DISTRIBUTION','OFFICIAL_PAGE_ONLY','THIRD_PARTY_DIRECT_ONLY','NO_DRIVER_LINK']) {
  console.log(`${key}: ${counts[key] || 0}`);
}

console.log('\nPÁGINAS QUE AINDA NÃO TÊM DOWNLOAD OFICIAL DIRETO:');
for (const r of rows.filter(r => r.status !== 'OFFICIAL_DIRECT')) {
  console.log(`- [${r.status}] ${r.brand}/${r.model} — ${r.title}`);
  if (r.best) console.log(`  melhor atual: ${r.best.kind} | ${r.best.text} | ${r.best.href}`);
}

console.log('\nPÁGINAS COM DOWNLOAD OFICIAL DIRETO:');
for (const r of rows.filter(r => r.status === 'OFFICIAL_DIRECT')) {
  const direct = r.candidates.find(a => a.kind === 'official-direct');
  console.log(`- ${r.brand}/${r.model} | ${direct?.text || ''} | ${direct?.href || ''}`);
}
