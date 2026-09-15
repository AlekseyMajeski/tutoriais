# Checklist SEO — Guia de Impressoras

Este arquivo define o padrão obrigatório para cada novo tutorial publicado.

## Antes de publicar

- Confirmar marca, modelo e revisão exatos.
- Pesquisar como o modelo é procurado: com/sem hífen, siglas e nomes alternativos.
- Priorizar fonte oficial do fabricante para driver, manual, firmware e especificações.
- Nunca inventar URL de download, versão, compatibilidade ou especificação.
- Se o modelo for legado, deixar isso explícito.

## HTML / SEO on-page

- `<title>` único e descritivo, incluindo marca + modelo + intenção principal (driver/instalação/configuração).
- `<meta name="description">` único e útil.
- `<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1">`.
- `<link rel="canonical">` apontando para a URL pública atual.
- Um único `<h1>` com marca/modelo.
- Headings H2/H3 naturais para: driver, instalação, rede/IP, Serial, autoteste e problemas, quando aplicável.
- JSON-LD `TechArticle` com `headline` e `dateModified`.
- Breadcrumbs visíveis.
- Texto original: não copiar descrição longa de fabricante ou terceiros.

## Descoberta e links internos

- Cadastrar o modelo em exatamente um dos catálogos carregados pelo site.
- Incluir aliases usados em pesquisas (ex.: `MP4200`, `MP 4200`, `TM T20`, etc.).
- Incluir a URL no `sitemap.xml`.
- Confirmar que `assets/site.js` continua carregando todos os catálogos.
- Manter `assets/house-ads.js` na página para adicionar rodapé institucional e guias relacionados.
- Sempre que fizer sentido, linkar modelos anteriores/seguintes da mesma família no texto.
- Modelos de maior procura podem receber links estáticos na Home e na categoria, além da ordenação dinâmica.

## Confiança / E-E-A-T prático

- Mostrar fonte(s) técnica(s) ao final do tutorial.
- Informar data de revisão quando possível.
- Explicar diferenças de variante em vez de tratar nomes parecidos como o mesmo hardware.
- Corrigir conflitos entre fontes de forma explícita.
- Não usar linguagem que faça o Guia parecer suporte oficial do fabricante.
- Publicidade nunca deve parecer botão de download.

## Publicidade e afiliados

- Blocos promocionais devem ser identificados como `Publicidade`.
- Links pagos/afiliados devem usar `rel="sponsored"` (podendo combinar com `noopener` quando abrirem nova aba).
- Não colocar CTA comercial com texto ambíguo como “Baixar driver”.
- Separar visualmente driver, publicidade e compra de produto.

## Pós-publicação

- Abrir a URL e conferir título, canonical, links e responsividade.
- Testar a busca usando nome normal e aliases.
- Confirmar presença no sitemap.
- Conferir se há links internos apontando para a nova página.
- Quando Search Console estiver configurado, usar Inspeção de URL nas páginas prioritárias e acompanhar Cobertura/Indexação.

## Quando o domínio definitivo entrar

- Configurar o domínio próprio no GitHub Pages.
- Atualizar canonical, sitemap, robots e URLs dos catálogos para o domínio final.
- Criar/validar nova propriedade no Google Search Console e enviar o sitemap.
- Preservar ou redirecionar URLs antigas sempre que possível.
- Configurar GA4 apenas com o ID definitivo.
- Configurar AdSense somente depois da aprovação e então publicar `ads.txt` com o publisher ID real.
- Revisar Política de Privacidade/consentimento para refletir Analytics e AdSense efetivamente ativos.

## Regra principal

O objetivo não é criar muitas páginas parecidas. Cada tutorial precisa resolver uma necessidade real de quem pesquisou aquele modelo: encontrar o arquivo correto, instalar, configurar e corrigir falhas com o mínimo de risco.
