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

const m50Support = 'https://epson.com.br/Suporte/Ponto-de-venda/Impressoras-t%C3%A9rmicas/sh/s530';
const m50Apd = 'https://support.epson.net/terms/pos/swinfo.php?id=1910&lang=en';
changed += replaceChecked('impressoras-termicas/epson/tm-m50/index.html', [
  ['<strong>Central de suporte POS</strong><p>Procure por TM-m50 e selecione o sistema operacional antes do download.</p>', '<strong>EPSON Advanced Printer Driver 6 for TM-m50</strong><p>A Epson relaciona o <b>APD 6 específico da TM-m50</b> como driver Windows deste modelo.</p>'],
  [`<a class="btn primary" target="_blank" rel="noopener" href="${m50Support}">Abrir suporte Epson</a>`, `<a class="btn primary" target="_blank" rel="noopener" href="${m50Apd}">Abrir APD 6 específico</a>`],
  ['<h3>Baixe o driver Epson</h3><p>Abra o suporte oficial, selecione o Windows e instale o pacote indicado para a TM-m50.</p>', '<h3>No Windows, use o APD 6 da TM-m50</h3><p>Abra a página oficial específica do APD 6, aceite a licença Epson e baixe o pacote oferecido atualmente para a TM-m50.</p>'],
  ['<span class="trust-item">✓ Documentação oficial Epson</span>', '<span class="trust-item">✓ APD 6 específico confirmado pela Epson</span>'],
]);

const p20Support = 'https://epson.com.br/Suporte/Ponto-de-venda/Impressoras-m%C3%B3veis/Epson-Mobilink-TM-P20II/s/SPT_C31CJ99001';
const p20Apd = 'https://support.epson.net/terms/pos/swinfo.php?id=1930&lang=en';
changed += replaceChecked('impressoras-termicas/epson/tm-p20ii/index.html', [
  ['<strong>Suporte TM-P20II</strong><p>Drivers, utilitários, WebConfig, Technical Reference Guide e SDKs.</p>', '<strong>EPSON Advanced Printer Driver 6 for TM-P20II</strong><p>A lista oficial Epson aponta o <b>APD 6 específico da TM-P20II</b> para impressão via Windows.</p>'],
  [`<a class="btn primary" target="_blank" rel="noopener" href="${p20Support}">Abrir suporte Epson</a>`, `<a class="btn primary" target="_blank" rel="noopener" href="${p20Apd}">Abrir APD 6 específico</a>`],
  ['<span class="trust-item">✓ Suporte oficial Epson</span>', '<span class="trust-item">✓ APD 6 específico confirmado pela Epson</span>'],
]);

const p60Support = 'https://epson.com.br/Suporte/Ponto-de-venda/Impressoras-m%C3%B3veis/sh/s531';
const p60Apd = 'https://support.epson.net/terms/pos/swinfo.php?id=1850&lang=en';
changed += replaceChecked('impressoras-termicas/epson/tm-p60ii/index.html', [
  ['<strong>Página do produto</strong><p>Especificações e acesso ao suporte oficial da TM-P60II.</p>', '<strong>EPSON Advanced Printer Driver 5 for TM-P60II</strong><p>A Epson relaciona o <b>APD 5 específico da TM-P60II</b> para Windows. O modelo é de geração anterior às P20II/P80II, que usam APD 6.</p>'],
  ['<a class="btn primary" target="_blank" rel="noopener" href="https://epson.com.br/Para-empresas/Impressoras/Impressoras-de-Pontos-de-Venda/Impressora-de-Recibos-Epson-TM-P60II/p/C31CC79011">Abrir Epson</a>', `<a class="btn primary" target="_blank" rel="noopener" href="${p60Apd}">Abrir APD 5 específico</a>`],
  ['<h3>Instale o utilitário Epson</h3><p>Use o suporte oficial para baixar a ferramenta compatível com seu sistema.</p>', '<h3>No Windows, use o APD 5 da TM-P60II</h3><p>Para criar a fila de impressão, use o APD 5 específico. Para Wi‑Fi/Bluetooth e diagnóstico, mantenha também os utilitários Epson indicados no suporte oficial.</p>'],
  ['<span class="trust-item">✓ Produto oficial Epson</span>', '<span class="trust-item">✓ APD 5 específico confirmado pela Epson</span>'],
]);

const p80Support = 'https://epson.com.br/Suporte/Ponto-de-venda/Impressoras-m%C3%B3veis/Epson-Mobilink-TM-P80II/s/SPT_C31CK00001';
const p80Apd = 'https://support.epson.net/terms/pos/swinfo.php?id=1940&lang=en';
changed += replaceChecked('impressoras-termicas/epson/tm-p80ii/index.html', [
  ['<strong>Suporte TM-P80II</strong><p>Drivers, utilitários, WebConfig e documentação técnica.</p>', '<strong>EPSON Advanced Printer Driver 6 for TM-P80II</strong><p>O Download Center da Epson lista o <b>APD 6 v6.12</b>, publicado em <b>09/02/2026</b>, para a TM-P80II no Windows 11 x64.</p>'],
  [`<a class="btn primary" target="_blank" rel="noopener" href="${p80Support}">Abrir suporte Epson</a>`, `<a class="btn primary" target="_blank" rel="noopener" href="${p80Apd}">Abrir APD 6 específico</a>`],
  ['<span class="trust-item">✓ Produto oficial Epson</span>', '<span class="trust-item">✓ APD 6.12 confirmado em 09/02/2026</span>'],
]);

console.log(`Epson legacy upgrade: ${changed} página(s) alterada(s).`);
