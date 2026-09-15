import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, 'drivers', 'audit');
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/152 Safari/537.36 Guia-de-Impressoras/1.0';

const targets = [
  { id: 'tanca-tmp-500', model: 'TMP-500', url: 'https://www.tanca.com.br/drivers.php?cat=19&sub=73' },
  { id: 'tanca-tp-450', model: 'TP-450', url: 'https://www.tanca.com.br/drivers.php?cat=19&sub=82' },
  { id: 'tanca-tp-509', model: 'TP-509', url: 'https://www.tanca.com.br/drivers.php?cat=19&sub=49' },
  { id: 'epson-tm-m10', model: 'TM-m10', url: 'https://support.epson.net/setupnavi/?LG2=EN&MKN=TM-m10&OSC=WS&PINF=swlist' },
  { id: 'epson-tm-t70ii', model: 'TM-T70II', url: 'https://support.epson.net/setupnavi/?LG2=EN&MKN=TM-T70II&OSC=WS&PINF=swlist' },
  { id: 'epson-tm-t81', model: 'TM-T81', url: 'https://support.epson.net/setupnavi/?LG2=EN&MKN=TM-T81&OSC=WS&PINF=swlist' },
  { id: 'epson-tm-t20x-ii', model: 'TM-T20X-II', url: 'https://download-center.epson.com/softwares/?device_id=TM-T20X-II&language=pt&os=WIN1164&region=BR' }
];

// Hipoteses privadas para verificar arquivos legados. Elas NÃO devem virar links públicos
// a menos que o servidor oficial responda com conteúdo binário de arquivo.
const legacyProbeHints = [
  {
    id: 'tanca-tmp-500-current',
    model: 'TMP-500',
    url: 'https://www.tanca.com.br/assets/conteudo/drivers/TMP-500/Driver_Utilitarios_TMP-500.zip',
    basis: 'href presente no HTML oficial atual'
  },
  {
    id: 'tanca-tp-450-historical-package',
    model: 'TP-450',
    url: 'https://www.tanca.com.br/assets/conteudo/drivers/TP-450/Driver_Utilitarios_TP-450.zip',
    basis: 'nome histórico documentado + padrão do diretório oficial Tanca'
  },
  {
    id: 'tanca-tp-450-usb-serial',
    model: 'TP-450',
    url: 'https://www.tanca.com.br/assets/conteudo/drivers/TP-450/Driver%20USB%20Serial%20Tanca%20TP-450.zip',
    basis: 'nome histórico documentado + padrão do diretório oficial Tanca'
  },
  {
    id: 'tanca-tp-509-community-filename',
    model: 'TP-509',
    url: 'https://www.tanca.com.br/assets/conteudo/drivers/TP-509/Tanca_TP-509_DriverInstall_v2.62.exe',
    basis: 'nome/versionamento histórico preservado + diretório oficial Tanca'
  },
  {
    id: 'tanca-tp-509-package-pattern',
    model: 'TP-509',
    url: 'https://www.tanca.com.br/assets/conteudo/drivers/TP-509/Driver_Utilitarios_TP-509.zip',
    basis: 'padrão histórico de pacotes Tanca; exige validação binária'
  }
];

function decode(s) {
  return s.replaceAll('&amp;', '&').replaceAll('\\/', '/').replace(/\\u0026/gi, '&').replace(/\\u003d/gi, '=').replace(/\\u002f/gi, '/');
}

function extractCandidates(text, baseUrl, model) {
  const found = new Set();
  const patterns = [
    /(?:href|src|url|download(?:Url|URL)?|file(?:Url|URL)?|link)\s*[:=]\s*["']([^"']+)["']/gi,
    /["'](https?:\\?\/\\?\/[^"']+)["']/gi,
    /["']([^"']+\.(?:exe|msi|zip|7z|rar|dmg|pkg|deb|rpm|tar\.gz)(?:\?[^"']*)?)["']/gi
  ];
  for (const re of patterns) {
    for (const m of text.matchAll(re)) {
      const raw = decode(m[1]);
      if (!raw || raw.startsWith('#') || raw.startsWith('javascript:')) continue;
      let absolute;
      try { absolute = new URL(raw, baseUrl).href; } catch { continue; }
      if (/\.(?:exe|msi|zip|7z|rar|dmg|pkg|deb|rpm|tar\.gz)(?:[?#].*)?$/i.test(absolute) || /driver|download|arquivo|file|assets\/conteudo|dl_soft|dsc\/f\//i.test(absolute) || absolute.toLowerCase().includes(model.toLowerCase())) {
        found.add(absolute);
      }
    }
  }
  return [...found];
}

function extractScripts(text, baseUrl) {
  const out = new Set();
  for (const m of text.matchAll(/<script[^>]+src=["']([^"']+)["']/gi)) {
    try { out.add(new URL(decode(m[1]), baseUrl).href); } catch {}
  }
  return [...out];
}

function keywordContexts(text, keywords) {
  const contexts = new Set();
  const lower = text.toLowerCase();
  for (const keyword of keywords) {
    let from = 0;
    const needle = keyword.toLowerCase();
    while (from < lower.length) {
      const index = lower.indexOf(needle, from);
      if (index < 0) break;
      const start = Math.max(0, index - 180);
      const end = Math.min(text.length, index + needle.length + 260);
      const snippet = text.slice(start, end).replace(/\s+/g, ' ');
      contexts.add(snippet);
      from = index + needle.length;
      if (contexts.size >= 80) break;
    }
  }
  return [...contexts].slice(0, 80);
}

async function fetchText(url) {
  const res = await fetch(url, { headers: { 'user-agent': UA, accept: 'text/html,application/xhtml+xml,*/*;q=0.8' }, redirect: 'follow' });
  const text = await res.text();
  return { status: res.status, finalUrl: res.url, contentType: res.headers.get('content-type') || '', text };
}

async function probeBinary(hint) {
  async function once(method) {
    const headers = { 'user-agent': UA, accept: '*/*' };
    if (method === 'GET') headers.range = 'bytes=0-1023';
    const res = await fetch(hint.url, { method, headers, redirect: 'follow' });
    const meta = {
      method,
      status: res.status,
      finalUrl: res.url,
      contentType: res.headers.get('content-type') || '',
      contentLength: res.headers.get('content-length') || '',
      contentDisposition: res.headers.get('content-disposition') || ''
    };
    try { await res.body?.cancel(); } catch {}
    return meta;
  }
  const attempts = [];
  try {
    const head = await once('HEAD');
    attempts.push(head);
    const binary = head.status >= 200 && head.status < 400 && !/text\/html|application\/json/i.test(head.contentType) && (/\.(?:exe|zip|msi|rar|7z)(?:[?#].*)?$/i.test(head.finalUrl) || /attachment/i.test(head.contentDisposition));
    if (binary) return { ...hint, verified: true, attempts, reason: `HEAD ${head.status} ${head.contentType}` };
  } catch (error) {
    attempts.push({ method: 'HEAD', error: String(error?.message || error) });
  }
  try {
    const get = await once('GET');
    attempts.push(get);
    const binary = get.status >= 200 && get.status < 400 && !/text\/html|application\/json/i.test(get.contentType) && (/\.(?:exe|zip|msi|rar|7z)(?:[?#].*)?$/i.test(get.finalUrl) || /attachment|octet-stream|zip|x-msdownload/i.test(`${get.contentDisposition} ${get.contentType}`));
    return { ...hint, verified: binary, attempts, reason: `GET ${get.status} ${get.contentType || '-'}` };
  } catch (error) {
    attempts.push({ method: 'GET', error: String(error?.message || error) });
    return { ...hint, verified: false, attempts, reason: `erro: ${String(error?.message || error)}` };
  }
}

const report = [];
for (const target of targets) {
  console.log(`\n=== ${target.id} ===`);
  try {
    const page = await fetchText(target.url);
    const candidates = extractCandidates(page.text, page.finalUrl, target.model);
    const scripts = extractScripts(page.text, page.finalUrl);
    const scriptFindings = [];

    console.log(`PAGE HTTP ${page.status} ${page.finalUrl} (${page.text.length} chars)`);
    for (const c of candidates) console.log(`CANDIDATE ${c}`);

    for (const scriptUrl of scripts.slice(0, 30)) {
      if (!/^https?:/i.test(scriptUrl)) continue;
      try {
        const r = await fetch(scriptUrl, { headers: { 'user-agent': UA, accept: '*/*' }, redirect: 'follow' });
        const text = await r.text();
        const links = extractCandidates(text, r.url, target.model);
        const apiContexts = /download-center\.epson\.com/i.test(r.url) && /(?:softwares|_app)/i.test(r.url)
          ? keywordContexts(text, ['/api', 'baseURL', 'software', 'device_id', 'download_url', 'downloadUrl', 'file_url', 'fileUrl'])
          : [];
        if (links.length || apiContexts.length) {
          scriptFindings.push({ scriptUrl, status: r.status, links, apiContexts });
          console.log(`SCRIPT ${scriptUrl}`);
          for (const link of links) console.log(`  -> ${link}`);
          for (const context of apiContexts.slice(0, 20)) console.log(`  API-CONTEXT ${context}`);
        }
      } catch (error) {
        scriptFindings.push({ scriptUrl, error: String(error?.message || error), links: [], apiContexts: [] });
      }
    }

    report.push({ ...target, status: page.status, finalUrl: page.finalUrl, contentType: page.contentType, pageLength: page.text.length, candidates, scripts, scriptFindings });
  } catch (error) {
    console.log(`ERROR ${String(error?.message || error)}`);
    report.push({ ...target, error: String(error?.message || error), candidates: [], scripts: [], scriptFindings: [] });
  }
}

console.log('\n=== LEGACY OFFICIAL BINARY PROBES ===');
const legacyProbes = [];
for (const hint of legacyProbeHints) {
  const result = await probeBinary(hint);
  legacyProbes.push(result);
  const last = result.attempts.at(-1) || {};
  console.log(`${result.verified ? 'PASS' : 'FAIL'} ${hint.id} — ${result.reason} — ${last.finalUrl || hint.url}`);
}

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(path.join(OUT_DIR, 'hidden-driver-link-discovery.json'), JSON.stringify({ checkedAt: new Date().toISOString(), targets: report, legacyProbes }, null, 2) + '\n');
const lines = ['# Descoberta de links de drivers ocultos', '', `Verificado em: ${new Date().toISOString()}`, ''];
for (const r of report) {
  lines.push(`## ${r.model}`, '', `- Página: ${r.finalUrl || r.url}`, `- HTTP: ${r.status ?? 'erro'}`, `- Candidatos na página: ${r.candidates.length}`, '');
  for (const c of r.candidates) lines.push(`- ${c}`);
  for (const s of r.scriptFindings.filter(x => x.links?.length || x.apiContexts?.length)) {
    lines.push('', `Script: ${s.scriptUrl}`);
    for (const c of s.links || []) lines.push(`- ${c}`);
    for (const c of (s.apiContexts || []).slice(0, 20)) lines.push(`- API context: ${c}`);
  }
  lines.push('');
}
lines.push('## Probes de arquivos legados oficiais', '');
for (const p of legacyProbes) lines.push(`- **${p.verified ? 'PASS' : 'FAIL'} ${p.model}** — ${p.url} — ${p.reason} — base: ${p.basis}`);
lines.push('');
fs.writeFileSync(path.join(OUT_DIR, 'hidden-driver-link-discovery.md'), lines.join('\n'));
