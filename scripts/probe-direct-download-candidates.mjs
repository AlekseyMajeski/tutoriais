import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const MANIFEST = path.join(ROOT, 'drivers', 'direct-download-candidates.json');
const OUT_DIR = path.join(ROOT, 'drivers', 'audit');
const TIMEOUT_MS = Number(process.env.DIRECT_DOWNLOAD_TIMEOUT_MS || 20000);
const UA = 'Guia-de-Impressoras-Direct-Download-Probe/1.0 (+https://github.com/AlekseyMajeski/tutoriais)';

const manifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));

function looksBinaryContentType(type = '') {
  const t = type.toLowerCase();
  if (!t) return false;
  if (/text\/html|application\/(?:json|xml)|text\/plain/.test(t)) return false;
  return /application\/(?:octet-stream|zip|x-zip-compressed|x-msdownload|vnd\.microsoft\.portable-executable)|application\/x-executable/.test(t);
}

function looksBinaryByName(url = '') {
  try {
    const pathname = new URL(url).pathname.toLowerCase();
    return /\.(?:exe|msi|zip|7z|rar|dmg|pkg|deb|rpm|run|tar\.gz)$/.test(pathname);
  } catch {
    return false;
  }
}

async function request(url, method) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const headers = { 'user-agent': UA, accept: '*/*' };
    if (method === 'GET') headers.range = 'bytes=0-1023';
    const res = await fetch(url, { method, headers, redirect: 'follow', signal: ctrl.signal });
    const meta = {
      method,
      status: res.status,
      finalUrl: res.url,
      contentType: res.headers.get('content-type') || '',
      contentLength: res.headers.get('content-length') || '',
      contentDisposition: res.headers.get('content-disposition') || '',
      acceptRanges: res.headers.get('accept-ranges') || ''
    };
    let prefixHex = '';
    if (method === 'GET' && res.body && res.status >= 200 && res.status < 400) {
      const reader = res.body.getReader();
      const { value } = await reader.read();
      if (value) prefixHex = Buffer.from(value.subarray(0, 16)).toString('hex');
      try { await reader.cancel(); } catch {}
    } else {
      try { await res.body?.cancel(); } catch {}
    }
    return { ...meta, prefixHex };
  } finally {
    clearTimeout(timer);
  }
}

function classify(meta, originalUrl) {
  if (!meta) return { verified: false, reason: 'sem resposta' };
  if (!(meta.status >= 200 && meta.status < 400)) return { verified: false, reason: `HTTP ${meta.status}` };

  const attachment = /attachment/i.test(meta.contentDisposition || '');
  const binaryType = looksBinaryContentType(meta.contentType || '');
  const binaryName = looksBinaryByName(meta.finalUrl || originalUrl);
  const html = /text\/html/i.test(meta.contentType || '');

  if (attachment || binaryType || (binaryName && !html)) {
    return {
      verified: true,
      reason: attachment ? 'Content-Disposition attachment' : binaryType ? `tipo binario ${meta.contentType}` : 'URL de arquivo sem resposta HTML'
    };
  }
  return { verified: false, reason: `resposta nao binaria (${meta.contentType || 'sem content-type'})` };
}

async function probe(candidate) {
  const attempts = [];
  try {
    const head = await request(candidate.url, 'HEAD');
    attempts.push(head);
    const headClass = classify(head, candidate.url);
    if (headClass.verified) return { ...candidate, ...headClass, attempts };
  } catch (err) {
    attempts.push({ method: 'HEAD', error: err?.name === 'AbortError' ? 'timeout' : String(err?.message || err) });
  }

  try {
    const get = await request(candidate.url, 'GET');
    attempts.push(get);
    const getClass = classify(get, candidate.url);
    return { ...candidate, ...getClass, attempts };
  } catch (err) {
    const error = err?.name === 'AbortError' ? 'timeout' : String(err?.message || err);
    attempts.push({ method: 'GET-range', error });
    return { ...candidate, verified: false, reason: `erro de rede: ${error}`, attempts };
  }
}

const results = [];
for (const candidate of manifest.candidates) {
  const result = await probe(candidate);
  results.push(result);
  console.log(`${result.verified ? 'PASS' : 'FAIL'} ${candidate.id} — ${result.reason}`);
  const last = result.attempts.at(-1);
  if (last?.status) console.log(`     HTTP ${last.status} | ${last.contentType || '-'} | ${last.finalUrl || candidate.url}`);
}

const verified = results.filter(r => r.verified);
const unverified = results.filter(r => !r.verified);
const report = {
  schemaVersion: 1,
  checkedAt: new Date().toISOString(),
  totals: { candidates: results.length, verified: verified.length, unverified: unverified.length },
  verified,
  unverified,
  results
};

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(path.join(OUT_DIR, 'direct-download-candidates.json'), JSON.stringify(report, null, 2) + '\n');

const md = [
  '# Auditoria de candidatos de download direto',
  '',
  `Verificado em: ${report.checkedAt}`,
  '',
  `- Candidatos: ${report.totals.candidates}`,
  `- Verificados como arquivo: ${report.totals.verified}`,
  `- Nao verificados: ${report.totals.unverified}`,
  '',
  '## Verificados',
  '',
  ...verified.map(r => `- **${r.brand} ${r.model} ${r.os} ${r.version}** — ${r.url} — ${r.reason}`),
  '',
  '## Nao verificados',
  '',
  ...(unverified.length ? unverified.map(r => `- **${r.brand} ${r.model} ${r.os} ${r.version}** — ${r.url} — ${r.reason}`) : ['Nenhum.']),
  ''
].join('\n');
fs.writeFileSync(path.join(OUT_DIR, 'direct-download-candidates.md'), md);
