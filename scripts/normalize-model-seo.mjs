import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const SITE = 'https://alekseymajeski.github.io/tutoriais';
const BASE = path.join(ROOT, 'impressoras-termicas');

const brandLabels = {
  bematech: 'Bematech',
  c3tech: 'C3Tech',
  controlid: 'Control iD',
  daruma: 'Daruma',
  dimep: 'DIMEP',
  elgin: 'Elgin',
  epson: 'Epson',
  sweda: 'Sweda',
  tanca: 'Tanca',
  waytec: 'Waytec',
};

function escapeJson(value) {
  return value.replaceAll('&amp;', '&').replaceAll('&quot;', '"').trim();
}

function stripTags(value) {
  return escapeJson(value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' '));
}

function modelFiles() {
  if (!fs.existsSync(BASE)) return [];
  return fs.readdirSync(BASE, { withFileTypes: true }).flatMap(brand => {
    if (!brand.isDirectory()) return [];
    const brandDir = path.join(BASE, brand.name);
    return fs.readdirSync(brandDir, { withFileTypes: true }).flatMap(model => {
      if (!model.isDirectory()) return [];
      const file = path.join(brandDir, model.name, 'index.html');
      return fs.existsSync(file) ? [{ file, brand: brand.name, model: model.name }] : [];
    });
  });
}

let changed = 0;
for (const { file, brand, model } of modelFiles()) {
  let html = fs.readFileSync(file, 'utf8');
  let next = html;

  if (!/<meta\s+name=["']robots["']/i.test(next)) {
    const robots = '<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1">';
    if (/<link\s+rel=["']canonical["']/i.test(next)) {
      next = next.replace(/(<link\s+rel=["']canonical["'])/i, `${robots}$1`);
    } else {
      next = next.replace('</head>', `${robots}</head>`);
    }
  }

  if (!next.includes('BreadcrumbList')) {
    const h1 = next.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1];
    const title = next.match(/<title>([\s\S]*?)<\/title>/i)?.[1];
    const modelLabel = stripTags(h1 || title || model);
    const brandLabel = brandLabels[brand] || brand;
    const url = `${SITE}/impressoras-termicas/${brand}/${model}/`;
    const breadcrumb = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Início', item: `${SITE}/` },
        { '@type': 'ListItem', position: 2, name: 'Impressoras térmicas', item: `${SITE}/impressoras-termicas/` },
        { '@type': 'ListItem', position: 3, name: brandLabel, item: `${SITE}/impressoras-termicas/${brand}/` },
        { '@type': 'ListItem', position: 4, name: modelLabel, item: url },
      ],
    };
    const jsonLd = `<script type="application/ld+json">${JSON.stringify(breadcrumb)}</script>`;
    next = next.replace('</head>', `${jsonLd}</head>`);
  }

  if (next !== html) {
    fs.writeFileSync(file, next);
    changed += 1;
    console.log(`normalizado: ${path.relative(ROOT, file).replaceAll('\\', '/')}`);
  }
}

console.log(`SEO normalize: ${changed} página(s) alterada(s).`);
