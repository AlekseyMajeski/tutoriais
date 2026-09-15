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

const pages = [];
for (const file of walk(BASE)) {
  const html = fs.readFileSync(file, 'utf8');
  if (!/body[^>]+class=["'][^"']*model-page/i.test(html)) continue;

  const rel = path.relative(ROOT, file).replaceAll(path.sep, '/');
  const downloadAt = index(/id=["']download["']/i, html);
  const installAt = index(/id=["']instalacao["']/i, html);
  const problemsAt = index(/id=["']problemas["']/i, html);
  const networkAt = index(/id=["']rede["']/i, html);
  const heroStart = index(/<section[^>]+class=["'][^"']*guide-hero/i, html);
  const heroEnd = heroStart >= 0 ? html.indexOf('</section>', heroStart) : -1;
  const heroHtml = heroStart >= 0 && heroEnd > heroStart ? html.slice(heroStart, heroEnd) : '';

  const checks = {
    h1: has(/<h1>[^<]+<\/h1>/i, html),
    hero: heroStart >= 0,
    heroPrimaryCta: has(/<a[^>]+class=["'][^"']*btn[^"']*primary[^"']*["'][^>]+href=/i, heroHtml) || has(/<a[^>]+href=["'][^"']+["'][^>]+class=["'][^"']*btn[^"']*primary/i, heroHtml),
    trust: has(/class=["'][^"']*model-trust/i, html),
    connectionNav: has(/class=["'][^"']*connection-nav/i, html),
    downloadSection: downloadAt >= 0,
    installationSection: installAt >= 0,
    problemsSection: problemsAt >= 0,
    mobileActions: has(/class=["'][^"']*mobile-actions/i, html),
    mobilePrimary: has(/class=["'][^"']*primary-mobile/i, html),
    fastInstall: has(/class=["'][^"']*install-fast/i, html),
    downloadBeforeInstall: downloadAt >= 0 && installAt >= 0 && downloadAt < installAt,
    installBeforeProblems: installAt >= 0 && problemsAt >= 0 && installAt < problemsAt,
    networkAfterInstall: networkAt < 0 || (installAt >= 0 && installAt < networkAt),
  };

  const critical = ['hero', 'heroPrimaryCta', 'downloadSection', 'installationSection', 'problemsSection', 'mobileActions', 'downloadBeforeInstall', 'installBeforeProblems'];
  const issues = critical.filter(k => !checks[k]);
  const enhancements = ['trust', 'connectionNav', 'mobilePrimary', 'fastInstall'].filter(k => !checks[k]);
  pages.push({ path: rel, checks, issues, enhancements });
}

const total = pages.length;
const keys = [...new Set(pages.flatMap(p => Object.keys(p.checks)))];
const coverage = Object.fromEntries(keys.map(k => [k, pages.filter(p => p.checks[k]).length]));
const criticalPages = pages.filter(p => p.issues.length);
const enhancementPages = pages.filter(p => p.enhancements.length);

const report = {
  checkedAt: new Date().toISOString(),
  totalModelPages: total,
  criticalPages: criticalPages.length,
  enhancementPages: enhancementPages.length,
  coverage,
  pages
};

fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, 'model-ux-audit.json'), JSON.stringify(report, null, 2) + '\n');

const labels = {
  h1: 'H1', hero: 'hero', heroPrimaryCta: 'CTA principal no hero', trust: 'bloco de confiança',
  connectionNav: 'atalhos de conexão', downloadSection: 'seção Download', installationSection: 'seção Instalação',
  problemsSection: 'seção Problemas', mobileActions: 'barra mobile', mobilePrimary: 'CTA mobile destacado',
  fastInstall: 'instalação rápida', downloadBeforeInstall: 'Download antes de Instalação',
  installBeforeProblems: 'Instalação antes de Problemas', networkAfterInstall: 'Rede depois de Instalação'
};

const md = ['# Auditoria estrutural de UX — páginas de modelo', '', `Executada em: ${report.checkedAt}`, '',
  `- Páginas de modelo: **${total}**`,
  `- Com pendência crítica: **${criticalPages.length}**`,
  `- Sem crítica, mas com melhoria estrutural pendente: **${enhancementPages.length}**`, '',
  '## Cobertura', ''];
for (const k of keys) md.push(`- ${labels[k] || k}: **${coverage[k]}/${total} (${pct(coverage[k], total)})**`);

if (criticalPages.length) {
  md.push('', '## Pendências críticas', '');
  for (const p of criticalPages) md.push(`- \`${p.path}\`: ${p.issues.map(k => labels[k] || k).join(', ')}`);
}
if (enhancementPages.length) {
  md.push('', '## Melhorias estruturais', '');
  for (const p of enhancementPages) md.push(`- \`${p.path}\`: ${p.enhancements.map(k => labels[k] || k).join(', ')}`);
}

fs.writeFileSync(path.join(OUT, 'model-ux-audit.md'), md.join('\n') + '\n');
console.log(md.join('\n'));
if (criticalPages.length) process.exitCode = 2;
