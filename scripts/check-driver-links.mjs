import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const BASE = path.join(ROOT, 'impressoras-termicas');
const OUT_DIR = path.join(ROOT, 'drivers', 'health');
const TIMEOUT_MS = Number(process.env.DRIVER_LINK_TIMEOUT_MS || 15000);
const CONCURRENCY = Number(process.env.DRIVER_LINK_CONCURRENCY || 6);
const UA = 'Guia-de-Impressoras-Link-Monitor/1.0 (+https://github.com/AlekseyMajeski/tutoriais)';

const candidateText = /\b(?:driver|drivers|download|baixar|software|spooler|instalador|installer|utility|utilitário|utilitario|apd|vcom|com virtual|suporte|support|microsoft|elgindevelopercommunity)\b/i;
const directFile = /\.(?:exe|msi|zip|7z|rar|dmg|pkg|deb|rpm|run|tar\.gz)(?:[?#].*)?$/i;

function stripTags(s) {
  return s.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
}

function modelFiles() {
  if (!fs.existsSync(BASE)) return [];
  return fs.readdirSync(BASE, { withFileTypes: true }).flatMap(brand => {
    if (!brand.isDirectory()) return [];
    return fs.readdirSync(path.join(BASE, brand.name), { withFileTypes: true }).flatMap(model => {
      if (!model.isDirectory()) return [];
      const file = path.join(BASE, brand.name, model.name, 'index.html');
      return fs.existsSync(file) ? [{ file, brand: brand.name, model: model.name }] : [];
    });
  });
}

function collectLinks() {
  const byUrl = new Map();
  for (const { file, brand, model } of modelFiles()) {
    const html = fs.readFileSync(file, 'utf8');
    const title = stripTags(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] || model);
    const anchors = [...html.matchAll(/<a\b([^>]*?)href=["']([^"']+)["']([^>]*)>([\s\S]*?)<\/a>/gi)]
      .map(m => ({ href: m[2], text: stripTags(m[4]) }))
      .filter(a => /^https?:\/\//i.test(a.href))
      .filter(a => candidateText.test(`${a.text} ${a.href}`));

    for (const a of anchors) {
      const key = a.href;
      if (!byUrl.has(key)) byUrl.set(key, { url: a.href, direct: directFile.test(a.href), usedBy: [] });
      byUrl.get(key).usedBy.push({ brand, model, title, text: a.text });
    }
  }
  return [...byUrl.values()];
}

async function request(url, method) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const headers = { 'user-agent': UA, accept: '*/*' };
    if (method === 'GET') headers.range = 'bytes=0-0';
    const res = await fetch(url, { method, redirect: 'follow', headers, signal: ctrl.signal });
    const meta = {
      status: res.status,
      finalUrl: res.url,
      contentType: res.headers.get('content-type') || '',
      contentLength: res.headers.get('content-length') || '',
    };
    try { await res.body?.cancel(); } catch {}
    return meta;
  } finally {
    clearTimeout(timer);
  }
}

function classify(result, direct) {
  if (result.error) return { level: 'WARN', reason: `erro de rede: ${result.error}` };
  const status = result.status;
  if (status >= 200 && status < 400) {
    if (direct && /text\/html/i.test(result.contentType || '')) {
      return { level: 'WARN', reason: `arquivo direto respondeu HTML (${status})` };
    }
    return { level: 'OK', reason: `HTTP ${status}` };
  }
  if ([401, 403, 429].includes(status)) return { level: 'WARN', reason: `HTTP ${status} (possível bloqueio/anti-bot)` };
  if ([404, 410].includes(status)) return { level: 'FAIL', reason: `HTTP ${status}` };
  if (status >= 500) return { level: 'WARN', reason: `HTTP ${status} (servidor instável; confirmar em nova execução)` };
  return { level: 'WARN', reason: `HTTP ${status}` };
}

async function checkOne(item) {
  const attempts = [];
  try {
    const head = await request(item.url, 'HEAD');
    attempts.push({ method: 'HEAD', ...head });
    if (head.status >= 200 && head.status < 400 && !(item.direct && /text\/html/i.test(head.contentType || ''))) {
      const cls = classify(head, item.direct);
      return { ...item, ...cls, attempts, checkedAt: new Date().toISOString() };
    }
    if (![401, 403, 405, 429].includes(head.status) && head.status < 500 && head.status !== 404 && head.status !== 410) {
      const cls = classify(head, item.direct);
      return { ...item, ...cls, attempts, checkedAt: new Date().toISOString() };
    }
  } catch (err) {
    attempts.push({ method: 'HEAD', error: err?.name === 'AbortError' ? 'timeout' : String(err?.message || err) });
  }

  await new Promise(r => setTimeout(r, 250));
  try {
    const get = await request(item.url, 'GET');
    attempts.push({ method: 'GET-range', ...get });
    const cls = classify(get, item.direct);
    return { ...item, ...cls, attempts, checkedAt: new Date().toISOString() };
  } catch (err) {
    const error = err?.name === 'AbortError' ? 'timeout' : String(err?.message || err);
    attempts.push({ method: 'GET-range', error });
    return { ...item, level: 'WARN', reason: `erro de rede: ${error}`, attempts, checkedAt: new Date().toISOString() };
  }
}

async function mapLimit(items, limit, fn) {
  const results = new Array(items.length);
  let cursor = 0;
  async function worker() {
    while (true) {
      const index = cursor++;
      if (index >= items.length) return;
      results[index] = await fn(items[index]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

const links = collectLinks();
console.log(`Verificando ${links.length} URLs de driver/suporte usadas nas páginas de modelo...`);
const results = await mapLimit(links, CONCURRENCY, checkOne);
const counts = results.reduce((acc, r) => ((acc[r.level] = (acc[r.level] || 0) + 1), acc), {});
const hardFailures = results.filter(r => r.level === 'FAIL');
const warnings = results.filter(r => r.level === 'WARN');

fs.mkdirSync(OUT_DIR, { recursive: true });
const report = {
  schemaVersion: 1,
  checkedAt: new Date().toISOString(),
  totals: { urls: results.length, ok: counts.OK || 0, warnings: counts.WARN || 0, failures: counts.FAIL || 0 },
  hardFailures,
  warnings,
  results,
};
fs.writeFileSync(path.join(OUT_DIR, 'latest.json'), JSON.stringify(report, null, 2) + '\n');

const lines = [
  '# Saúde dos links de drivers',
  '',
  `Verificado em: ${report.checkedAt}`,
  '',
  `- URLs: ${report.totals.urls}`,
  `- OK: ${report.totals.ok}`,
  `- Avisos: ${report.totals.warnings}`,
  `- Falhas confirmadas: ${report.totals.failures}`,
  '',
];
if (hardFailures.length) {
  lines.push('## Falhas confirmadas', '');
  for (const r of hardFailures) lines.push(`- **${r.reason}** — ${r.url} — usado em ${r.usedBy.map(x => `${x.brand}/${x.model}`).join(', ')}`);
  lines.push('');
}
if (warnings.length) {
  lines.push('## Avisos para acompanhamento', '');
  for (const r of warnings) lines.push(`- **${r.reason}** — ${r.url} — usado em ${r.usedBy.map(x => `${x.brand}/${x.model}`).join(', ')}`);
  lines.push('');
}
if (!hardFailures.length && !warnings.length) lines.push('Todos os links monitorados responderam normalmente.', '');
fs.writeFileSync(path.join(OUT_DIR, 'latest.md'), lines.join('\n'));

for (const r of results) console.log(`${r.level.padEnd(4)} ${r.reason.padEnd(48)} ${r.url}`);
console.log(`\nResumo: ${report.totals.ok} OK, ${report.totals.warnings} avisos, ${report.totals.failures} falhas confirmadas.`);

if (hardFailures.length) process.exitCode = 2;
