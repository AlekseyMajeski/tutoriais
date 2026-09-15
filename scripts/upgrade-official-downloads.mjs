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

console.log(`Official download upgrade: ${changed} página(s) alterada(s).`);
