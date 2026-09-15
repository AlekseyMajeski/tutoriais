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

async function fetchText(url) {
  const res = await fetch(url, { headers: { 'user-agent': UA, accept: 'text/html,application/xhtml+xml,*/*;q=0.8' }, redirect: 'follow' });
  const text = await res.text();
  return { status: res.status, finalUrl: res.url, contentType: res.headers.get('content-type') || '', text };
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
        if (links.length) {
          scriptFindings.push({ scriptUrl, status: r.status, links });
          console.log(`SCRIPT ${scriptUrl}`);
          for (const link of links) console.log(`  -> ${link}`);
        }
      } catch (error) {
        scriptFindings.push({ scriptUrl, error: String(error?.message || error), links: [] });
      }
    }

    report.push({ ...target, status: page.status, finalUrl: page.finalUrl, contentType: page.contentType, pageLength: page.text.length, candidates, scripts, scriptFindings });
  } catch (error) {
    console.log(`ERROR ${String(error?.message || error)}`);
    report.push({ ...target, error: String(error?.message || error), candidates: [], scripts: [], scriptFindings: [] });
  }
}

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(path.join(OUT_DIR, 'hidden-driver-link-discovery.json'), JSON.stringify({ checkedAt: new Date().toISOString(), targets: report }, null, 2) + '\n');
const lines = ['# Descoberta de links de drivers ocultos', '', `Verificado em: ${new Date().toISOString()}`, ''];
for (const r of report) {
  lines.push(`## ${r.model}`, '', `- Página: ${r.finalUrl || r.url}`, `- HTTP: ${r.status ?? 'erro'}`, `- Candidatos na página: ${r.candidates.length}`, '');
  for (const c of r.candidates) lines.push(`- ${c}`);
  for (const s of r.scriptFindings.filter(x => x.links?.length)) {
    lines.push('', `Script: ${s.scriptUrl}`);
    for (const c of s.links) lines.push(`- ${c}`);
  }
  lines.push('');
}
fs.writeFileSync(path.join(OUT_DIR, 'hidden-driver-link-discovery.md'), lines.join('\n'));
