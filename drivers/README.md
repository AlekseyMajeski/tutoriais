# Acervo de drivers — Guia de Impressoras

Este diretório controla a preservação dos drivers usados nos tutoriais.

## Estratégia atual

O site público deve priorizar a melhor experiência possível sem depender de uma cópia pública nossa:

1. **Download público:** sempre que houver URL estável para o arquivo oficial, o botão aponta diretamente para o `.zip`, `.exe` ou pacote do fabricante, sem obrigar o usuário a navegar por outra página.
2. **Fallback oficial:** quando o fabricante não oferece URL direta estável, o botão aponta para a página oficial específica do modelo/driver.
3. **Preservação privada:** mantemos uma cópia interna das versões oficiais relevantes, com versão, origem, data, tamanho e SHA-256. Essa cópia não é publicada no site nem em Release público enquanto a redistribuição não estiver autorizada.
4. **Mirror público:** GitHub Releases só é usado quando a licença do pacote ou uma autorização do fabricante permitir redistribuição.

O repositório Git público mantém apenas catálogo, URLs, hashes, auditorias e automação. Os binários do arquivo privado devem ficar fora deste repositório.

## Estados

### Entrega pública

- `official-direct`: download direto do arquivo hospedado pelo fabricante ou repositório oficial.
- `official-page`: fabricante exige passar pela página oficial de suporte/download.
- `trusted-distribution`: fonte de distribuição confiável, como Microsoft Update Catalog.
- `public-mirror`: cópia nossa publicada somente quando a redistribuição estiver autorizada.

### Preservação

- `archived-private`: temos uma cópia interna verificada pelo SHA-256.
- `pending-archive`: arquivo identificado, mas a cópia privada ainda precisa ser preservada.
- `unavailable`: a origem desapareceu e ainda não existe cópia preservada conhecida.

### Redistribuição

- `allowed`: há permissão explícita; pode ser publicado em GitHub Releases.
- `prohibited`: licença/termo proíbe redistribuição; manter somente fonte oficial no site.
- `unknown`: não foi encontrada permissão explícita; manter a cópia somente no arquivo privado.

## Monitoramento automático

O workflow **Driver link health** verifica semanalmente as URLs de driver e suporte usadas nas páginas de modelos. Ele também roda quando essas páginas ou o verificador são alterados.

- `404` e `410` são tratados como falha crítica.
- erros persistentes de servidor/rede também geram falha.
- `401`, `403` e `429` entram como aviso porque muitos fabricantes bloqueiam robôs sem que o link esteja realmente fora do ar.
- quando há falha crítica, o workflow abre ou atualiza automaticamente a issue `[monitor] Links de drivers com falha`.
- quando os links voltam ao normal, essa issue é fechada automaticamente.

Arquivos relacionados:

- `archive-manifest.json`: fila priorizada de drivers e metadados do acervo.
- `audit/latest.json`: último resultado estruturado da coleta/auditoria de preservação.
- `audit/latest.md`: resumo humano com tamanho e SHA-256.
- `../scripts/audit-driver-preservation.mjs`: coleta oficial, hashing e busca de sinais de licença.
- `../scripts/check-driver-links.mjs`: monitor de disponibilidade das URLs públicas.
- `../.github/workflows/driver-preservation-audit.yml`: auditoria reproduzível de candidatos ao arquivo.
- `../.github/workflows/driver-link-health.yml`: monitor periódico dos links usados no site.

## Regra de segurança

A cópia privada serve para preservação e continuidade interna. Ela não altera a origem pública exibida ao usuário. Enquanto houver fonte oficial funcional, o site continua usando essa fonte.

Para Epson, manter somente links oficiais na distribuição pública enquanto os termos do fabricante proibirem redistribuição do software proprietário.
