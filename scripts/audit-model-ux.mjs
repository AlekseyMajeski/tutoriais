import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const BASE = path.join(ROOT, 'impressoras-termicas');
const OUT = path.join(ROOT, 'artifacts');

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

function has(re, html) { return re.test(html); }
function index(re, html) { const m = re.exec(html); return m ? m.index : -1; }
function pct(n, total) { return total ? `${(n * 100 / total).toFixed(1)}%` : '0.0%'; }
function sectionIndexByTitle(html, patterns) {
  const re = /<section\b[^>]*class=["'][^"']*section[^"']*["'][^>]*>[\s\S]*?<\/section>/gi;
  for (const match of html.matchAll(re)) {
    const title = match[0].match(/<h2[^>]*>([\s\S]*?)<\/h2>/i)?.[1]?.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() || '';
    if (patterns.some(p => p.test(title))) return match.index ?? -1;
  }
  return -1;
}

const pages = [];
for (const file of walk(BASE)) {
  const html = fs.readFileSync(file, 'utf8');
  if (!/body[^>]+class=["'][^"']*model-page/i.test(html)) continue;

  const rel = path.relative(ROOT, file).replaceAll(path.sep, '/');
  if (rel.split('/').length < 4) continue;

  const sharedUx = /assets\/house-ads\.js/i.test(html) && fs.existsSync(path.join(ROOT, 'assets', 'model-page.js'));
  const staticDownloadAt = index(/id=["']download["']/i, html);
  const legacyDownloadAt = index(/id=["']driver["']/i, html);
  const downloadAt = staticDownloadAt >= 0 ? staticDownloadAt : legacyDownloadAt;

  const staticInstallAt = index(/id=["']instalacao["']/i, html);
  const staticConfigAt = index(/id=["']configuracao["']/i, html);
  const inferredInstallAt = sectionIndexByTitle(html, [/instala[cç][aã]o/i,/como instalar/i,/instalar .*windows/i,/instala[cç][aã]o .*computador/i]);
  const installAt = staticInstallAt >= 0 ? staticInstallAt : (staticConfigAt >= 0 ? staticConfigAt : inferredInstallAt);

  const staticProblemsAt = index(/id=["']problemas["']/i, html);
  const inferredProblemsAt = sectionIndexByTitle(html, [/problemas? comuns/i,/solu[cç][aã]o de problemas/i]);
  const problemsAt = staticProblemsAt >= 0 ? staticProblemsAt : inferredProblemsAt;
  const networkAt = index(/id=["']rede["']/i, html);
  const heroStart = index(/<section[^>]+class=["'][^"']*guide-hero/i, html);
  const heroEnd = heroStart >= 0 ? html.indexOf('</section>', heroStart) : -1;
  const heroHtml = heroStart >= 0 && heroEnd > heroStart ? html.slice(heroStart, heroEnd) : '';
  const staticHeroPrimary = has(/<a[^>]+class=["'][^"']*btn[^"']*primary[^"']*["'][^>]+href=/i, heroHtml) || has(/<a[^>]+href=["'][^"']+["'][^>]+class=["'][^"']*btn[^"']*primary/i, heroHtml);
  const downloadableButtonExists = downloadAt >= 0 && has(/<a[^>]+class=["'][^"']*btn[^"']*["'][^>]+href=/i, html.slice(downloadAt));
  const adSlots = (html.match(/data-ad-position=/gi) || []).length;
  const hasMiddleAd = has(/data-ad-position=["']after-installation["']/i, html);
  const effectiveAds = sharedUx && hasMiddleAd ? Math.max(0, adSlots - 1) : adSlots;
  const staticFastInstall = has(/class=["'][^"']*install-fast/i, html);
  const runtimeFastInstall = sharedUx && installAt >= 0 && has(/class=["'][^"']*steps[^"']*["']/i, html.slice(installAt));

  const checks = {
    h1: has(/<h1>[^<]+<\/h1>/i, html),
    hero: heroStart >= 0,
    heroPrimaryCta: staticHeroPrimary || (sharedUx && downloadableButtonExists),
    trust: has(/class=["'][^"']*model-trust/i, html) || sharedUx,
    connectionNav: has(/class=["'][^"']*connection-nav/i, html) || (sharedUx && [installAt, networkAt, problemsAt].filter(n => n >= 0).length >= 2),
    downloadSection: downloadAt >= 0,
    installationSection: installAt >= 0,
    problemsSection: problemsAt >= 0,
    mobileActions: has(/class=["'][^"']*mobile-actions/i, html) || (sharedUx && downloadAt >= 0 && problemsAt >= 0),
    mobilePrimary: has(/class=["'][^"']*primary-mobile/i, html) || (sharedUx && downloadAt >= 0),
    fastInstall: staticFastInstall || runtimeFastInstall,
    downloadBeforeInstall: downloadAt >= 0 && installAt >= 0 && downloadAt < installAt,
    installBeforeProblems: installAt >= 0 && problemsAt >= 0 && installAt < problemsAt,
    networkAfterInstall: networkAt < 0 || (installAt >= 0 && installAt < networkAt),
    adDensity: effectiveAds <= 2,
    sharedUxLoader: sharedUx
  };

  const critical = ['hero', 'heroPrimaryCta', 'downloadSection', 'installationSection', 'problemsSection', 'mobileActions', 'downloadBeforeInstall', 'installBeforeProblems', 'sharedUxLoader'];
  const issues = critical.filter(k => !checks[k]);
  const enhancements = ['trust', 'connectionNav', 'mobilePrimary', 'fastInstall', 'adDensity'].filter(k => !checks[k]);
  const normalizedAtRuntime = sharedUx && (!staticHeroPrimary || staticDownloadAt < 0 || (staticInstallAt < 0 && staticConfigAt < 0) || !has(/class=["'][^"']*mobile-actions/i, html) || !has(/class=["'][^"']*connection-nav/i, html) || !has(/class=["'][^"']*model-trust/i, html) || !staticFastInstall || hasMiddleAd);
  pages.push({ path: rel, checks, issues, enhancements, normalizedAtRuntime, adSlots, effectiveAds });
}

const total = pages.length;
const keys = [...new Set(pages.flatMap(p => Object.keys(p.checks)))];
const coverage = Object.fromEntries(keys.map(k => [k, pages.filter(p => p.checks[k]).length]));
const criticalPages = pages.filter(p => p.issues.length);
const enhancementPages = pages.filter(p => p.enhancements.length);
const runtimePages = pages.filter(p => p.normalizedAtRuntime);

const report = {
  checkedAt: new Date().toISOString(),
  totalModelPages: total,
  criticalPages: criticalPages.length,
  enhancementPages: enhancementPages.length,
  normalizedAtRuntime: runtimePages.length,
  coverage,
  pages
};

fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, 'model-ux-audit.json'), JSON.stringify(report, null, 2) + '\n');

const labels = {
  h1: 'H1', hero: 'hero', heroPrimaryCta: 'CTA principal no hero', trust: 'bloco de confiança',
  connectionNav: 'atalhos de conexão', downloadSection: 'seção Download', installationSection: 'etapa Instalação/Configuração',
  problemsSection: 'seção Problemas', mobileActions: 'barra mobile', mobilePrimary: 'CTA mobile destacado',
  fastInstall: 'instalação/configuração rápida', downloadBeforeInstall: 'Download antes de Instalação/Configuração',
  installBeforeProblems: 'Instalação/Configuração antes de Problemas', networkAfterInstall: 'Rede depois da etapa principal',
  adDensity: 'no máximo 2 anúncios efetivos por tutorial', sharedUxLoader: 'normalizador compartilhado carregado'
};

const md = ['# Auditoria estrutural de UX — páginas de modelo', '', `Executada em: ${report.checkedAt}`, '',
  `- Páginas de modelo: **${total}**`,
  `- Com pendência crítica para o usuário: **${criticalPages.length}**`,
  `- Normalizadas em runtime pelo template compartilhado: **${runtimePages.length}**`,
  `- Sem crítica, mas com melhoria estática pendente: **${enhancementPages.length}**`, '',
  '## Cobertura efetiva', ''];
for (const k of keys) md.push(`- ${labels[k] || k}: **${coverage[k]}/${total} (${pct(coverage[k], total)})**`);

if (criticalPages.length) {
  md.push('', '## Pendências críticas', '');
  for (const p of criticalPages) md.push(`- \`${p.path}\`: ${p.issues.map(k => labels[k] || k).join(', ')}`);
}
if (runtimePages.length) {
  md.push('', '## HTML legado coberto pelo normalizador', '');
  for (const p of runtimePages) md.push(`- \`${p.path}\` — anúncios estáticos: ${p.adSlots}; efetivos após normalização: ${p.effectiveAds}`);
}
if (enhancementPages.length) {
  md.push('', '## Melhorias estáticas', '');
  for (const p of enhancementPages) md.push(`- \`${p.path}\`: ${p.enhancements.map(k => labels[k] || k).join(', ')}`);
}

fs.writeFileSync(path.join(OUT, 'model-ux-audit.md'), md.join('\n') + '\n');
console.log(md.join('\n'));
if (criticalPages.length) process.exitCode = 2;
