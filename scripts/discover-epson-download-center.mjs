import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, 'drivers', 'audit');
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/152 Safari/537.36';
const BASE = 'https://download-center.epson.com';

const targets = [
  { id: 'tm-m10', device: 'TM-m10', os: 'WIN1164', region: 'US', language: 'en', match: /Advanced Printer Driver 5.*TM-m10|TM-m10.*Advanced Printer Driver 5/i },
  { id: 'tm-t70ii', device: 'TM-T70II', os: 'WIN1164', region: 'US', language: 'en', match: /Advanced Printer Driver 5.*TM-T70II|TM-T70II.*Advanced Printer Driver 5/i },
  { id: 'tm-t81', device: 'TM-T81', os: 'WIN1164', region: 'US', language: 'en', match: /Advanced Printer Driver 4.*TM-T81|TM-T81.*Advanced Printer Driver 4/i },
  { id: 'tm-t20x-ii', device: 'TM-T20X-II', os: 'WIN1164', region: 'BR', language: 'pt', match: /Advanced Printer Driver 6.*TM-T20X-II|TM-T20X-II.*Advanced Printer Driver 6/i }
];

function flattenModules(json) {
  const out = [];
  const seen = new Set();
  function visit(value, path = '') {
    if (!value) return;
    if (Array.isArray(value)) {
      value.forEach((v, i) => visit(v, `${path}[${i}]`));
      return;
    }
    if (typeof value !== 'object') return;
    const text = JSON.stringify(value);
    const hasModuleish = /module_id|moduleId|software|driver|version|title|name/i.test(text);
    if (hasModuleish) {
      const key = value.module_id || value.moduleId || value.id || `${path}:${text.slice(0, 200)}`;
      if (!seen.has(key)) {
        seen.add(key);
        out.push({ path, value });
      }
    }
    for (const [k, v] of Object.entries(value)) visit(v, path ? `${path}.${k}` : k);
  }
  visit(json);
  return out;
}

function field(obj, names) {
  for (const name of names) {
    if (obj && obj[name] != null) return obj[name];
  }
  return null;
}

function moduleSummary(entry) {
  const o = entry.value;
  return {
    path: entry.path,
    moduleId: field(o, ['module_id', 'moduleId', 'id']),
    name: field(o, ['module_name', 'moduleName', 'software_name', 'softwareName', 'name', 'title']),
    version: field(o, ['version', 'version_name', 'versionName']),
    date: field(o, ['release_date', 'releaseDate', 'uploaded_at', 'uploadedAt', 'date']),
    size: field(o, ['size', 'file_size', 'fileSize']),
    os: field(o, ['os', 'os_name', 'osName']),
    raw: o
  };
}

async function getJson(url) {
  const res = await fetch(url, {
    headers: {
      'user-agent': UA,
      accept: 'application/json,text/plain,*/*',
      referer: `${BASE}/softwares/`
    },
    redirect: 'follow'
  });
  const text = await res.text();
  let json = null;
  try { json = JSON.parse(text); } catch {}
  return { status: res.status, contentType: res.headers.get('content-type') || '', finalUrl: res.url, text, json };
}

async function probeDownload(url) {
  const res = await fetch(url, {
    method: 'GET',
    headers: { 'user-agent': UA, accept: '*/*', range: 'bytes=0-1023', referer: `${BASE}/softwares/` },
    redirect: 'follow'
  });
  const meta = {
    status: res.status,
    finalUrl: res.url,
    contentType: res.headers.get('content-type') || '',
    contentDisposition: res.headers.get('content-disposition') || '',
    contentLength: res.headers.get('content-length') || ''
  };
  try { await res.body?.cancel(); } catch {}
  return meta;
}

const results = [];
for (const target of targets) {
  const api = new URL('/api/v1/modules/', BASE);
  api.searchParams.set('device_id', target.device);
  api.searchParams.set('os', target.os);
  api.searchParams.set('region', target.region);
  api.searchParams.set('language', target.language);
  console.log(`\n=== ${target.device} ===`);
  const response = await getJson(api.href);
  console.log(`API ${response.status} ${response.contentType} ${response.finalUrl}`);
  if (!response.json) {
    console.log(`BODY ${response.text.slice(0, 1000).replace(/\s+/g, ' ')}`);
    results.push({ ...target, apiUrl: api.href, apiStatus: response.status, error: 'API não retornou JSON', modules: [] });
    continue;
  }

  const modules = flattenModules(response.json).map(moduleSummary);
  const relevant = modules.filter(m => target.match.test(JSON.stringify(m.raw)) || target.match.test(`${m.name || ''} ${m.version || ''}`));
  console.log(`MODULES ${modules.length} | RELEVANT ${relevant.length}`);
  relevant.slice(0, 20).forEach(m => console.log(`MATCH id=${m.moduleId} version=${m.version} name=${m.name} path=${m.path}`));

  const probed = [];
  for (const m of relevant.slice(0, 10)) {
    if (!m.moduleId) continue;
    const download = new URL('/download/', BASE);
    download.searchParams.set('module_id', String(m.moduleId));
    download.searchParams.set('device_id', target.device);
    download.searchParams.set('os', target.os);
    download.searchParams.set('region', target.region);
    download.searchParams.set('language', target.language);
    try {
      const probe = await probeDownload(download.href);
      const binary = probe.status >= 200 && probe.status < 400 && !/text\/html|application\/json/i.test(probe.contentType) && (/attachment/i.test(probe.contentDisposition) || /octet-stream|zip|x-msdownload|application\/x-/i.test(probe.contentType) || /\.(?:exe|zip|msi|rar|7z)(?:[?#].*)?$/i.test(probe.finalUrl));
      console.log(`${binary ? 'PASS' : 'CHECK'} ${download.href} -> ${probe.status} ${probe.contentType} ${probe.finalUrl}`);
      probed.push({ module: m, downloadUrl: download.href, probe, verifiedBinary: binary });
    } catch (error) {
      console.log(`ERROR ${download.href} ${String(error?.message || error)}`);
      probed.push({ module: m, downloadUrl: download.href, error: String(error?.message || error), verifiedBinary: false });
    }
  }

  results.push({ ...target, apiUrl: api.href, apiStatus: response.status, modules, relevant, probed });
}

fs.mkdirSync(OUT_DIR, { recursive: true });
const report = { checkedAt: new Date().toISOString(), results };
fs.writeFileSync(path.join(OUT_DIR, 'epson-download-center-discovery.json'), JSON.stringify(report, null, 2) + '\n');
const md = ['# Epson Download Center discovery', '', `Verificado em: ${report.checkedAt}`, ''];
for (const r of results) {
  md.push(`## ${r.device}`, '', `- API: ${r.apiUrl}`, `- HTTP: ${r.apiStatus}`, `- Correspondências: ${r.relevant?.length || 0}`, '');
  for (const p of r.probed || []) {
    md.push(`- **${p.verifiedBinary ? 'PASS' : 'CHECK'}** ${p.module.name || 'módulo'} ${p.module.version || ''}`.trim());
    md.push(`  - module_id: ${p.module.moduleId}`);
    md.push(`  - download: ${p.downloadUrl}`);
    if (p.probe) md.push(`  - resposta: HTTP ${p.probe.status} ${p.probe.contentType} → ${p.probe.finalUrl}`);
  }
  md.push('');
}
fs.writeFileSync(path.join(OUT_DIR, 'epson-download-center-discovery.md'), md.join('\n'));
