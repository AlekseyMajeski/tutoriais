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

console.log(`Official download upgrade: ${changed} página(s) alterada(s).`);
