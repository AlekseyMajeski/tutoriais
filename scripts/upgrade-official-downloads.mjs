import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();

function replaceAllChecked(file, replacements) {
  const full = path.join(ROOT, file);
  let text = fs.readFileSync(full, 'utf8');
  let changed = false;
  for (const [from, to] of replacements) {
    if (text.includes(from)) {
      text = text.replaceAll(from, to);
      changed = true;
    }
  }
  if (changed) {
    fs.writeFileSync(full, text);
    console.log(`atualizado: ${file}`);
  }
  return changed;
}

let changed = 0;

const mp4200Base = 'https://raw.githubusercontent.com/ElginDeveloperCommunity/Impressoras/master/Impressoras%20N%C3%A3o%20Fiscais/Utilit%C3%A1rios%20Bematech/MP-4200%20TH';
changed += replaceAllChecked('impressoras-termicas/bematech/mp-4200-th/index.html', [
  ['https://baseg.com.br/download/723/', `${mp4200Base}/Drivers/Spooler_Bematech/DriverSpoolerGeralBematech_V5.0.0.4.zip`],
  ['https://baseg.com.br/download/736/', `${mp4200Base}/Drivers/Driver_USB_Bematech_(Binarios)_V4.0.2.zip`],
  ['https://baseg.com.br/download/729/', `${mp4200Base}/Utilit%C3%A1rios/Bematech%20User%20Software%20v2.10.05%20for%2064%20bits.exe`],
  ['O fabricante atual não expõe um binário legado estável e direto para esta revisão. Por isso, o spooler abaixo é identificado claramente como <b>espelho independente</b>.', 'A Elgin/Bematech mantém o spooler legado da MP-4200 TH no repositório técnico oficial de desenvolvedores. Os links abaixo apontam diretamente para esses arquivos.'],
  ['⬇️ Baixar pelo espelho', '⬇️ Baixar driver oficial'],
  ['Fonte do arquivo: Base G, repositório independente. Prefira sempre o suporte atual da Elgin quando houver pacote oficial equivalente.', 'Fonte do arquivo: repositório técnico oficial ElginDeveloperCommunity (Elgin S/A).'],
]);

const dimepProduct = 'https://www.dimep.com.br/produto/automacao-comercial/d-print-dual/';
const dimepWindows = 'https://www.dimep.com.br/wp-content/uploads/2025/12/D_PrintDual_Windows.zip';
const dimepLinux = 'https://www.dimep.com.br/wp-content/uploads/2025/12/D_PrintDual_Linux.zip';
changed += replaceAllChecked('impressoras-termicas/dimep/d-print-dual/index.html', [
  [`<a class="btn primary" href="${dimepProduct}" target="_blank" rel="noopener">Drivers oficiais DIMEP</a>`, `<a class="btn primary" href="${dimepWindows}" rel="noopener">⬇️ Baixar driver Windows</a>`],
  [`<a class="btn primary" href="${dimepProduct}" target="_blank" rel="noopener">Abrir download oficial</a>`, `<a class="btn primary" href="${dimepWindows}" rel="noopener">⬇️ Download direto Windows</a>`],
  [`<a class="btn soft" href="${dimepProduct}" target="_blank" rel="noopener">Abrir suporte DIMEP</a>`, `<a class="btn soft" href="${dimepLinux}" rel="noopener">⬇️ Download direto Linux</a>`],
  ['A DIMEP disponibiliza o driver Windows na própria página oficial do produto.', 'Driver Windows publicado diretamente pela DIMEP em seu domínio oficial.'],
  ['Há também pacote Linux e guia de instalação Linux oficial.', 'Pacote Linux publicado diretamente pela DIMEP; o guia de instalação também está disponível na página oficial do produto.'],
]);

const tp550Support = 'https://tanca.com.br/drivers.php';
const tp550Windows = 'https://www.tanca.com.br/assets/conteudo/drivers/TP-550/Driver_Utilitarios_TP-550.zip';
changed += replaceAllChecked('impressoras-termicas/tanca/tp-550/index.html', [
  [`<a class="btn primary" href="${tp550Support}" target="_blank" rel="noopener">Abrir suporte Tanca</a>`, `<a class="btn primary" href="${tp550Windows}" rel="noopener">⬇️ Baixar driver oficial</a>`],
  ['<strong>Central oficial de drivers</strong><p>Procure TP-550 na central da Tanca e use o pacote correspondente à revisão da sua impressora.</p><a class="btn primary" href="https://tanca.com.br/drivers.php" target="_blank" rel="noopener">Abrir suporte oficial</a>', `<strong>Driver e utilitários TP-550</strong><p>Pacote ZIP publicado diretamente no domínio oficial da Tanca para a TP-550.</p><a class="btn primary" href="${tp550Windows}" rel="noopener">⬇️ Download direto oficial</a>`],
  ['<strong>Não use driver aleatório</strong><p>Não publicamos um executável direto porque não foi possível validar nesta rodada um URL estável de binário oficial específico da TP-550.</p>', '<strong>Fonte verificada</strong><p>O arquivo acima está hospedado no domínio oficial da Tanca. Evite cópias de terceiros quando este pacote atender sua revisão.</p>'],
  ['<span class="trust-item">✓ Sem link de binário não verificado</span>', '<span class="trust-item">✓ Download direto no domínio Tanca</span>'],
]);

const elginRepoBase = 'https://raw.githubusercontent.com/ElginDeveloperCommunity/Impressoras/master/Impressoras%20de%20Etiqueta/Elgin';
const l42ProFullProduct = 'https://www.elgin.com.br/impressora-termica-eti-elgin-l42pro-full/p';
const l42ProFullWindows = `${elginRepoBase}/L42PRO%20FULL/Drivers/L42PRO%20FULL_Windows_driver_2022.1.exe`;
const l42ProFullLinux = `${elginRepoBase}/L42PRO%20FULL/Drivers/L42PRO%20FULL_linux_driver_v1.0.1.zip`;
const l42ProFullMac = `${elginRepoBase}/L42PRO%20FULL/Drivers/L42PRO%20FULL_mac_driver_v1.0.1.pkg`;
changed += replaceAllChecked('impressoras-termicas/elgin/l42-pro-full/index.html', [
  [`<a class="btn primary" rel="noopener" href="${l42ProFullProduct}">Suporte oficial Elgin</a>`, `<a class="btn primary" rel="noopener" href="${l42ProFullWindows}">⬇️ Baixar driver Windows</a>`],
  ['<strong>Download seguro:</strong> a Elgin oferece Download Center em sua estrutura de suporte, mas este guia não publica um executável direto sem validar um endereço estável específico para a L42 Pro Full. Use o suporte oficial para obter o pacote correspondente ao seu sistema.', '<strong>Downloads verificados:</strong> o repositório técnico oficial ElginDeveloperCommunity possui uma pasta específica da <b>L42PRO FULL</b>, com drivers para Windows, Linux e macOS. Os links abaixo apontam diretamente para esses arquivos.'],
  [`<a class="btn primary" rel="noopener" href="${l42ProFullProduct}">Abrir página oficial Elgin</a>`, `<div class="buttons"><a class="btn primary" rel="noopener" href="${l42ProFullWindows}">⬇️ Windows 2022.1</a><a class="btn soft" rel="noopener" href="${l42ProFullLinux}">⬇️ Linux 1.0.1</a><a class="btn soft" rel="noopener" href="${l42ProFullMac}">⬇️ macOS 1.0.1</a><a class="btn soft" target="_blank" rel="noopener" href="${l42ProFullProduct}">Página do produto</a></div>`],
  ['<p>Entre no suporte oficial Elgin e selecione o material da L42 Pro Full para seu sistema.</p>', '<p>Use o driver específico da L42 Pro Full acima: Windows 2022.1, Linux 1.0.1 ou macOS 1.0.1.</p>'],
  [`<li><a target="_blank" rel="noopener" href="${l42ProFullProduct}">Elgin — página oficial L42 Pro Full</a></li>`, `<li><a target="_blank" rel="noopener" href="${l42ProFullProduct}">Elgin — página oficial L42 Pro Full</a></li><li><a target="_blank" rel="noopener" href="https://github.com/ElginDeveloperCommunity/Impressoras/tree/master/Impressoras%20de%20Etiqueta/Elgin/L42PRO%20FULL/Drivers">ElginDeveloperCommunity — drivers L42PRO FULL</a></li>`],
]);

const l42DtProduct = 'https://www.elgin.com.br/impressora-de-etiquetas-termica-elgin-direta-l42dt/p';
const l42DtWindows = `${elginRepoBase}/L42DT/Drivers/Windows_DriverL42DT_7.4.3_M-5.exe`;
const l42DtLinux = `${elginRepoBase}/L42DT/Drivers/Linux_DriverL42DT_V1.0.0.rar`;
changed += replaceAllChecked('impressoras-termicas/elgin/l42dt/index.html', [
  [`<a class="btn primary" target="_blank" rel="noopener" href="${l42DtProduct}">Suporte oficial Elgin</a>`, `<a class="btn primary" rel="noopener" href="${l42DtWindows}">⬇️ Baixar driver Windows</a>`],
  ['<strong>Download seguro:</strong> a página oficial atual da Elgin oferece acesso ao Download Center, mas nesta verificação não foi possível confirmar um URL estável de binário específico da L42DT. Por isso este guia não inventa nem espelha um executável.', '<strong>Downloads verificados:</strong> a área técnica oficial ElginDeveloperCommunity mantém drivers específicos da <b>L42DT</b> para Windows e Linux. Os botões abaixo apontam diretamente para esses arquivos.'],
  [`<p><a class="btn primary" target="_blank" rel="noopener" href="${l42DtProduct}">Abrir página oficial da L42DT</a></p>`, `<div class="buttons"><a class="btn primary" rel="noopener" href="${l42DtWindows}">⬇️ Windows 7.4.3 M-5</a><a class="btn soft" rel="noopener" href="${l42DtLinux}">⬇️ Linux 1.0.0</a><a class="btn soft" target="_blank" rel="noopener" href="${l42DtProduct}">Página do produto</a></div>`],
  ['<p>Acesse a página Elgin acima e siga para o Download Center/manual correspondente ao modelo e ao sistema operacional.</p>', '<p>Baixe acima o pacote específico da L42DT para Windows ou Linux e mantenha a página oficial do produto como referência de suporte.</p>'],
  [`<li><a target="_blank" rel="noopener" href="${l42DtProduct}">Elgin — L42DT, página oficial do produto e suporte</a></li>`, `<li><a target="_blank" rel="noopener" href="${l42DtProduct}">Elgin — L42DT, página oficial do produto e suporte</a></li><li><a target="_blank" rel="noopener" href="https://github.com/ElginDeveloperCommunity/Impressoras/tree/master/Impressoras%20de%20Etiqueta/Elgin/L42DT/Drivers">ElginDeveloperCommunity — drivers L42DT</a></li>`],
]);

const m30iiSupport = 'https://epson.com.br/Suporte/Ponto-de-venda/Impressoras-t%C3%A9rmicas/Epson-TM-m30II-Series/s/SPT_C31CJ27022';
changed += replaceAllChecked('impressoras-termicas/epson/tm-m30ii/index.html', [
  ['<strong>Drivers por sistema operacional</strong><p>Selecione seu sistema na página oficial da série TM-m30II.</p>', '<strong>Windows: Advanced Printer Driver 6 v6.12</strong><p>A Epson lista o APD 6 v6.12, de 07/05/2026, para a TM-m30II. O pacote informado é <b>APD_612_m30II_WM.exe</b> e inclui Windows 11 entre os sistemas compatíveis.</p>'],
  [`<a class="btn primary" href="${m30iiSupport}" target="_blank" rel="noopener">Abrir downloads</a>`, `<a class="btn primary" href="${m30iiSupport}" target="_blank" rel="noopener">Abrir APD 6.12 na Epson</a>`],
  ['<h3>Escolha o driver oficial</h3><p>Selecione o sistema operacional na página Epson.</p>', '<h3>No Windows, procure o APD 6.12</h3><p>Na área oficial da Epson, selecione Windows e procure <b>Advanced Printer Driver 6 v6.12</b> / <b>APD_612_m30II_WM.exe</b>. Não use um endereço de EXE deduzido: deixe a página oficial entregar o arquivo atual.</p>'],
  ['<span class="trust-item">✓ Technical Reference Guide</span>', '<span class="trust-item">✓ APD 6.12 confirmado em 07/05/2026</span>'],
]);

console.log(`Official download upgrade: ${changed} página(s) alterada(s).`);
