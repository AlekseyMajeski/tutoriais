import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const BASE = path.join(ROOT, 'impressoras-termicas');

const downloadText = /\b(?:driver|drivers|download|baixar|instalador|software|spooler|apd|vcom)\b/i;
const directExt = /\.(?:exe|msi|zip|7z|rar|dmg|pkg|deb|rpm|run|tar\.gz)(?:[?#].*)?$/i;

function stripTags(s) {
  return s.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
}

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (entry.isFile() && entry.name === 'index.html') out.push(full);
  }
  return out;
}

function isDirectLike(href) {
  if (directExt.test(href)) return true;
  try {
    const u = new URL(href);
    // WordPress Download Manager: endpoint que responde com o arquivo/attachment.
    if (u.searchParams.has('wpdmdl')) return true;
    // Alguns servidores usam rotas explícitas de download sem extensão no href.
    if (/\/(?:download|downloads|arquivo|file)\//i.test(u.pathname) && /(?:download|baixar|driver)/i.test(href)) return true;
  } catch {}
  return false;
}

const rows = [];
for (const file of walk(BASE)) {
  const html = fs.readFileSync(file, 'utf8');
  const title = stripTags(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] || path.basename(path.dirname(file)));
  const rel = path.relative(ROOT, file).replaceAll(path.sep, '/');
  const anchors = [...html.matchAll(/<a\b([^>]*?)href=["']([^"']+)["']([^>]*)>([\s\S]*?)<\/a>/gi)]
    .map(m => ({ href: m[2], text: stripTags(m[4]) }))
    .filter(a => /^https?:\/\//i.test(a.href))
    .filter(a => downloadText.test(`${a.text} ${a.href}`));

  for (const a of anchors) {
    rows.push({ file: rel, title, text: a.text, href: a.href, direct: isDirectLike(a.href) });
  }
}

const direct = rows.filter(r => r.direct);
const intermediate = rows.filter(r => !r.direct);
console.log(`Auditoria UX de download: ${rows.length} links candidatos em ${new Set(rows.map(r => r.file)).size} páginas.`);
console.log(`Downloads diretos/prováveis: ${direct.length}`);
console.log(`Páginas/intermediários a revisar: ${intermediate.length}`);

if (intermediate.length) {
  console.log('\nREVISAR — BOTÃO/LINK NÃO PARECE DOWNLOAD DIRETO:');
  for (const r of intermediate) {
    console.log(`- ${r.file} — ${r.text || '(sem texto)'} — ${r.href}`);
  }
}

console.log('\nDOWNLOADS DIRETOS/ENDPOINTS DE ARQUIVO:');
for (const r of direct) {
  console.log(`- ${r.file} — ${r.text || '(sem texto)'} — ${r.href}`);
}
