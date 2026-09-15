# Checklist SEO — Guia de Impressoras

Este arquivo define o padrão obrigatório para cada novo tutorial publicado. Enquanto o domínio definitivo não existir, o GitHub Pages é apenas a URL pública provisória; nenhuma integração de Search Console, GA4, AdSense ou `ads.txt` deve ser amarrada ao endereço provisório.

## Antes de publicar

- Confirmar marca, modelo e revisão exatos.
- Pesquisar como o modelo é procurado: com/sem hífen, siglas e nomes alternativos.
- Priorizar fonte oficial do fabricante para driver, manual, firmware e especificações.
- Nunca inventar URL de download, versão, compatibilidade ou especificação.
- Se o modelo for legado, deixar isso explícito.
- Separar claramente revisões parecidas: por exemplo TM-T20 ≠ TM-T20II ≠ TM-T20X; MP-4200 TH ≠ TH ADV ≠ HS.

## Padrão ouro da página de modelo

Cada modelo prioritário deve seguir, quando aplicável, a estrutura:

1. resposta rápida no topo: qual é o driver/pacote correto e para qual revisão;
2. aviso de revisão/modelo para evitar download errado;
3. download e origem do arquivo;
4. instalação USB;
5. Windows 11/10 quando houver compatibilidade verificável ou alerta de legado quando não houver;
6. Ethernet/IP e Serial quando existirem;
7. autoteste;
8. troubleshooting por sintoma;
9. links para guias gerais (offline, USB, rede, impressão fraca etc.);
10. links estáticos para modelos da mesma família e para o hub da marca;
11. bloco comercial separado e identificado, sem parecer download;
12. fontes técnicas e data de revisão.

## HTML / SEO on-page

- `<title>` único e descritivo, incluindo marca + modelo + intenção principal (driver/download/instalação/configuração).
- `<meta name="description">` único e útil.
- `<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1">`.
- `<link rel="canonical">` apontando para a URL pública atual.
- Um único `<h1>` com marca/modelo e intenção natural, sem keyword stuffing.
- Headings H2/H3 naturais para driver, instalação, Windows, rede/IP, Serial, autoteste e problemas, quando aplicável.
- JSON-LD preferencial em `@graph` com `WebPage` + `TechArticle` + `BreadcrumbList` nas páginas prioritárias.
- `datePublished` somente quando a data for conhecida; `dateModified` deve refletir revisão real.
- `author` pode ser `Guia de Impressoras`; `publisher` pode ser `Facity Sistemas` com URL oficial da Facity.
- Breadcrumbs visíveis devem apontar para Início → Térmicas → Marca → Modelo.
- Texto original: não copiar descrição longa de fabricante ou terceiros.
- Evitar schema sem benefício ou que não corresponda ao conteúdo realmente visível.

## Migração de domínio: escrever hoje sem quebrar amanhã

- Assets de páginas aninhadas devem usar caminhos relativos, por exemplo `../../../assets/house-ads.js`; evitar hardcode `/tutoriais/assets/...` dentro do HTML de modelos.
- Links internos preferencialmente relativos quando a página e o destino pertencem ao site.
- O JavaScript compartilhado pode detectar GitHub Pages versus domínio próprio, mas o HTML não deve depender do prefixo `/tutoriais/` para carregar assets.
- Canonicals permanecem no GitHub Pages até o domínio definitivo existir; trocar todos de uma vez na migração.
- Não inventar domínio futuro em canonical, sitemap ou JSON-LD.

## Descoberta e links internos

- Cadastrar o modelo em exatamente um dos catálogos carregados pelo site.
- Incluir aliases usados em pesquisas (ex.: `MP4200`, `MP 4200`, `TM T20`, etc.).
- Incluir a URL no `sitemap.xml` quando for página de modelo/brand hub; guias temáticos também podem usar `sitemap-guides.xml`.
- Confirmar que `assets/site.js` continua carregando todos os catálogos.
- Manter `assets/house-ads.js` na página para rodapé institucional, publicidade Facity e links relacionados.
- Sempre que fizer sentido, linkar modelos anteriores/seguintes da mesma família no HTML estático.
- Linkar a página-hub da marca.
- Linkar guias temáticos relevantes: offline, USB não reconhece, imprime em branco, impressão fraca, não corta, descobrir IP, configurar rede e Windows 11.
- Modelos de maior procura devem receber links estáticos na Home e na categoria, além da ordenação dinâmica.

## Confiança / E-E-A-T prático

- Mostrar fonte(s) técnica(s) ao final do tutorial.
- Informar data de revisão quando possível.
- Explicar diferenças de variante em vez de tratar nomes parecidos como o mesmo hardware.
- Corrigir conflitos entre fontes de forma explícita.
- Não usar linguagem que faça o Guia parecer suporte oficial do fabricante.
- Se o download for espelho/comunidade/terceiro, identificar isso antes do clique; nunca rotular como oficial.
- Publicidade nunca deve parecer botão de download.
- A Facity pode ser identificada como mantenedora/publicadora sem interferir no critério técnico do conteúdo.

## Publicidade e afiliados

- Blocos promocionais devem ser identificados como `Publicidade`.
- Links pagos/afiliados devem usar `rel="sponsored"` (podendo combinar com `noopener` quando abrirem nova aba).
- Não colocar CTA comercial com texto ambíguo como “Baixar driver”.
- Separar visualmente driver, publicidade e compra de produto.
- Até os links reais de afiliado existirem, usar somente placeholder textual/desabilitado; não inventar ofertas ou URLs.

## Pós-publicação

- Abrir a URL e conferir título, canonical, links e responsividade.
- Testar a busca usando nome normal e aliases.
- Confirmar presença no sitemap adequado.
- Conferir se há links internos apontando para a nova página.
- Conferir se `house-ads.js` carrega por caminho relativo correto.
- Revisar console do navegador quando possível e evitar erros 404 de assets.
- Search Console só entra depois do domínio definitivo, conforme decisão atual do projeto.

## Quando o domínio definitivo entrar

- Configurar o domínio próprio no GitHub Pages.
- Atualizar canonical, sitemap, robots, JSON-LD e URLs absolutas para o domínio final.
- Revisar qualquer ocorrência residual de `alekseymajeski.github.io/tutoriais`.
- Confirmar que assets e links internos funcionam na raiz do novo domínio.
- Criar/validar a propriedade definitiva no Google Search Console e enviar sitemap(s).
- Preservar/redirecionar URLs antigas sempre que tecnicamente possível.
- Configurar GA4 somente com o Measurement ID definitivo.
- Configurar AdSense somente depois da aprovação e então publicar `ads.txt` com o publisher ID real.
- Revisar Política de Privacidade/consentimento para refletir Analytics e AdSense efetivamente ativos.
- Revisar links de afiliados/Mercado Livre e aplicar `rel="sponsored"`.

## Regra principal

O objetivo não é criar muitas páginas parecidas. Cada tutorial precisa resolver uma necessidade real de quem pesquisou aquele modelo: encontrar o arquivo correto, instalar, configurar e corrigir falhas com o mínimo de risco. TM-T20, MP-4200 TH e Elgin i9 são as páginas de referência para o padrão ouro; novos modelos devem se aproximar dessa estrutura quando o conteúdo técnico permitir.
