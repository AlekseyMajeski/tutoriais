# Acervo de drivers — Guia de Impressoras

Este diretório controla a preservação de drivers usados nos tutoriais.

## Objetivo

Preservar drivers relevantes para impressoras térmicas e de automação comercial sem inflar o histórico Git e sem republicar software contra a licença do fabricante.

Os binários autorizados serão publicados como **GitHub Release assets**. O repositório Git mantém apenas catálogo, origem, versão, tamanho, SHA-256 e evidência de licença/permissão.

## Estados de redistribuição

- `allowed`: há permissão explícita; pode ser publicado em GitHub Releases.
- `prohibited`: licença/termo proíbe redistribuição; manter apenas link oficial.
- `unknown`: não foi encontrada permissão explícita; não republicar até obter autorização.

## Arquivos

- `archive-manifest.json`: fila priorizada de drivers e status de redistribuição.
- `audit/latest.json`: último resultado estruturado da coleta/auditoria.
- `audit/latest.md`: resumo humano com tamanho e SHA-256.
- `../scripts/audit-driver-preservation.mjs`: coleta oficial, hashing e busca de sinais de licença.
- `../.github/workflows/driver-preservation-audit.yml`: auditoria reproduzível no GitHub Actions.

## Regra de segurança

Um arquivo só entra em GitHub Releases quando houver evidência explícita de que a redistribuição é permitida. A simples disponibilidade pública do driver no site do fabricante não é considerada autorização para republicá-lo.

Para Epson, manter somente links oficiais enquanto os termos do fabricante proibirem redistribuição do software proprietário.
