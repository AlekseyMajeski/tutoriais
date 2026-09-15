import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const BASE = path.join(ROOT, 'impressoras-termicas');

const downloadText = /\b(?:driver|drivers|download|baixar|instalador|software|spooler|apd|vcom)\b/i;
const directExt = /\.(?:exe|msi|zip|7z|rar|dmg|pkg|deb|rpm|run|tar\.gz)(?:[?#].*)?$/i;

function stripTags(s) {
  return s.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
}

function attrValue(attrs, name) {
  return attrs.match(new RegExp(`\\b${name}=["']([^"']+)["']`, 'i'))?.[1] || '';
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
    if (u.searchParams.has('wpdmdl')) return true;
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
    .map(m => {
      const attrs = `${m[1]} ${m[3]}`;
      const className = attrValue(attrs, 'class');
      return {
        href: m[2],
        text: stripTags(m[4]),
        className,
        primary: /(?:^|\s)btn(?:\s|$)/i.test(className) && /(?:^|\s)primary(?:\s|$)/i.test(className),
        button: /(?:^|\s)btn(?:\s|$)/i.test(className),
      };
    })
    .filter(a => /^https?:\/\//i.test(a.href))
    .filter(a => downloadText.test(`${a.text} ${a.href}`));

  for (const a of anchors) {
    rows.push({ file: rel, title, ...a, direct: isDirectLike(a.href) });
  }
}

const direct = rows.filter(r => r.direct);
const primaryIntermediate = rows.filter(r => r.primary && !r.direct);
const buttonIntermediate = rows.filter(r => r.button && !r.primary && !r.direct);
const referenceIntermediate = rows.filter(r => !r.button && !r.direct);

console.log(`Auditoria UX de download: ${rows.length} links candidatos em ${new Set(rows.map(r => r.file)).size} páginas.`);
console.log(`Downloads diretos/prováveis: ${direct.length}`);
console.log(`CTAs PRINCIPAIS com página intermediária: ${primaryIntermediate.length}`);
console.log(`Botões secundários com página intermediária: ${buttonIntermediate.length}`);
console.log(`Referências/fontes intermediárias: ${referenceIntermediate.length}`);

if (primaryIntermediate.length) {
  console.log('\nPRIORIDADE — CTA PRINCIPAL NÃO INICIA DOWNLOAD DIRETO:');
  for (const r of primaryIntermediate) console.log(`- ${r.file} — ${r.text || '(sem texto)'} — ${r.href}`);
}

if (buttonIntermediate.length) {
  console.log('\nREVISAR DEPOIS — BOTÃO SECUNDÁRIO/INTERMEDIÁRIO:');
  for (const r of buttonIntermediate) console.log(`- ${r.file} — ${r.text || '(sem texto)'} — ${r.href}`);
}

console.log('\nDOWNLOADS DIRETOS/ENDPOINTS DE ARQUIVO:');
for (const r of direct.filter(r => r.button || r.primary)) {
  const role = r.primary ? 'PRIMARY' : 'BUTTON';
  console.log(`- [${role}] ${r.file} — ${r.text || '(sem texto)'} — ${r.href}`);
}
