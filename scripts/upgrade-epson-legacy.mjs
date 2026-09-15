import fs from 'node:fs';

function replaceChecked(file, pairs) {
  let html = fs.readFileSync(file, 'utf8');
  const before = html;
  for (const [from, to] of pairs) html = html.replaceAll(from, to);
  if (html !== before) {
    fs.writeFileSync(file, html);
    console.log(`atualizado: ${file}`);
    return 1;
  }
  return 0;
}

let changed = 0;

const m30Support = 'https://epson.com.br/Suporte/Ponto-de-venda/Impressoras-t%C3%A9rmicas/Epson-TM-m30/s/SPT_C31CE95011';
const m30Apd = 'https://support.epson.net/terms/pos/swinfo.php?id=1770&lang=en';
changed += replaceChecked('impressoras-termicas/epson/tm-m30/index.html', [
  ['<strong>Drivers por sistema operacional</strong><p>Escolha o sistema na página de suporte para obter os pacotes compatíveis com sua TM-m30.</p>', '<strong>EPSON Advanced Printer Driver 5 for TM-m30</strong><p>A lista oficial global da Epson aponta o <b>APD 5 específico da TM-m30</b> como driver de impressão para Windows.</p>'],
  [`<a class="btn primary" href="${m30Support}" target="_blank" rel="noopener">Abrir downloads</a>`, `<a class="btn primary" href="${m30Apd}" target="_blank" rel="noopener">Abrir APD 5 específico</a>`],
  ['<h3>Baixe o software Epson</h3><p>Selecione seu sistema operacional no suporte oficial.</p>', '<h3>No Windows, use o APD 5 da TM-m30</h3><p>Abra a página oficial específica do <b>EPSON Advanced Printer Driver 5 for TM-m30</b>, aceite a licença e obtenha o pacote oferecido atualmente pela Epson.</p>'],
  ['<span class="trust-item">✓ Produto e suporte oficiais Epson</span>', '<span class="trust-item">✓ APD 5 específico confirmado pela Epson</span>'],
]);

const t81Support = 'https://epson.com.br/Suporte/Ponto-de-venda/Impressoras-t%C3%A9rmicas/Epson-TM-T81/s/SPT_PIECTMT81';
const t81Apd = 'https://support.epson.net/terms/pos/swinfo.php?id=1730&lang=pt';
changed += replaceChecked('impressoras-termicas/epson/tm-t81/index.html', [
  ['<strong>Página oficial de suporte TM-T81</strong><p>A Epson seleciona downloads conforme o sistema operacional. Em modelos legados, a oferta pode variar por versão do Windows.</p>', '<strong>EPSON Advanced Printer Driver 4 for TM-T81</strong><p>A Epson ainda mantém uma página oficial específica do <b>APD 4 da TM-T81</b>. É a referência correta para Windows deste modelo legado; não use APD da T81III por semelhança de nome.</p>'],
  [`<a class="btn primary" href="${t81Support}" target="_blank" rel="noopener">Abrir suporte oficial</a>`, `<a class="btn primary" href="${t81Apd}" target="_blank" rel="noopener">Abrir APD 4 específico</a>`],
  ['<h3>Abra o suporte Epson</h3><p>Selecione o sistema operacional e use o driver oferecido para a TM-T81.</p>', '<h3>Use o APD 4 específico da TM-T81</h3><p>Abra a página oficial do APD 4 em português, aceite os termos da Epson e obtenha o pacote disponibilizado para este modelo.</p>'],
  ['<span class="trust-item">✓ Suporte oficial Epson</span>', '<span class="trust-item">✓ APD 4 específico em português</span>'],
]);

console.log(`Epson legacy upgrade: ${changed} página(s) alterada(s).`);
