import fs from 'node:fs';
import path from 'node:path';

const ROOT=process.cwd();
const checks=[];
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
const exists=p=>fs.existsSync(path.join(ROOT,p));
const add=(page,name,ok)=>checks.push({page,name,ok:Boolean(ok)});

const home=read('index.html');
add('home','busca principal',/data-search/.test(home));
add('home','resultados logo após hero',home.indexOf('home-live-results')>home.indexOf('home-search-hero')&&home.indexOf('home-live-results')<home.indexOf('home-brands'));
add('home','marcas',/id="marcas"/.test(home));
add('home','problemas rápidos',/home-help/.test(home));
add('home','CSS v3',/assets\/home-v3\.css/.test(home));

const thermal=read('impressoras-termicas/index.html');
add('termicas','busca principal',/data-search/.test(thermal));
add('termicas','resultados antes das marcas',thermal.indexOf('home-live-results')>thermal.indexOf('home-search-hero')&&thermal.indexOf('home-live-results')<thermal.indexOf('id="marcas"'));
add('termicas','genéricas destacadas',/generic-printer-guides/.test(thermal));
add('termicas','problemas por sintoma',/id="problemas"/.test(thermal));
add('termicas','CSS v3',/assets\/home-v3\.css/.test(thermal));

for(const brand of ['epson','bematech','elgin','tanca','sweda']){
  const p=`impressoras-termicas/${brand}/index.html`,html=read(p);
  add(`hub:${brand}`,'classe hub-page',/class="hub-page"/.test(html));
  add(`hub:${brand}`,'CSS compartilhado',/assets\/hub-v3\.css/.test(html));
  add(`hub:${brand}`,'busca local',/assets\/hub-page\.js/.test(html));
  add(`hub:${brand}`,'seção modelos',/id="modelos"/.test(html));
  add(`hub:${brand}`,'no máximo 1 publicidade no hub',(html.match(/data-ad-position=/g)||[]).length<=1);
}

const support=['nao-imprime','offline','usb-nao-reconhece','imprime-em-branco','impressao-fraca','nao-corta-papel','descobrir-ip','configurar-rede','driver-windows-11','58mm-vs-80mm'];
for(const slug of support){
  const p=`impressoras-termicas/${slug}/index.html`;
  if(!exists(p))continue;
  const html=read(p);
  add(`support:${slug}`,'loader compartilhado',/assets\/house-ads\.js/.test(html));
  add(`support:${slug}`,'hero',/guide-hero/.test(html));
  add(`support:${slug}`,'conteúdo principal',/<main[\s>]/.test(html));
  add(`support:${slug}`,'no máximo 1 publicidade',(html.match(/data-ad-position=/g)||[]).length<=1);
}

for(const slug of ['genericas','pos-58','pos-80','xprinter-driver']){
  const p=`impressoras-termicas/${slug}/index.html`,html=read(p);
  add(`hybrid:${slug}`,'loader compartilhado',/assets\/house-ads\.js/.test(html));
  add(`hybrid:${slug}`,'hero',/guide-hero/.test(html));
  add(`hybrid:${slug}`,'publicidade contida',(html.match(/data-ad-position=/g)||[]).length<=2);
}

for(const asset of ['assets/home-v3.css','assets/hub-v3.css','assets/support-v3.css','assets/hybrid-v3.css','assets/model-page.js','assets/ux-v2.css']) add('assets',asset,exists(asset));

const homeCss=read('assets/home-v3.css');
const hubCss=read('assets/hub-v3.css');
const supportCss=read('assets/support-v3.css');
const hybridCss=read('assets/hybrid-v3.css');
const uxCss=read('assets/ux-v2.css');
add('responsive','home tablet',/@media\(max-width:900px\)/.test(homeCss));
add('responsive','home mobile',/@media\(max-width:620px\)/.test(homeCss));
add('responsive','hubs tablet',/@media\(max-width:900px\)/.test(hubCss));
add('responsive','hubs mobile',/@media\(max-width:620px\)/.test(hubCss));
add('responsive','suporte desktop amplo',/@media\(min-width:1200px\)/.test(supportCss));
add('responsive','suporte mobile',/@media\(max-width:620px\)/.test(supportCss));
add('responsive','híbridas tablet',/@media\(max-width:900px\)/.test(hybridCss));
add('responsive','híbridas mobile',/@media\(max-width:700px\)/.test(hybridCss));
add('responsive','modelos desktop amplo',/@media\(min-width:1440px\)[\s\S]*?\.model-page/.test(uxCss));
add('responsive','modelos mobile',/@media\(max-width:700px\)[\s\S]*?\.model-page/.test(uxCss));
add('publicidade','layout desktop dedicado',/@media\(min-width:1000px\)[\s\S]*?\.house-ad--visual/.test(uxCss));
add('publicidade','limite de largura em monitor grande',/@media\(min-width:1440px\)\{\.house-ad\{max-width:1040px/.test(uxCss));

const failed=checks.filter(c=>!c.ok);
const byPage=new Map();
for(const c of checks){if(!byPage.has(c.page))byPage.set(c.page,[]);byPage.get(c.page).push(c)}
const md=['# Site UX audit','',`Executada em: ${new Date().toISOString()}`,'',`- Verificações: **${checks.length}**`,`- Falhas: **${failed.length}**`,''];
for(const [page,list] of byPage){md.push(`## ${page}`,'');for(const c of list)md.push(`- ${c.ok?'✅':'❌'} ${c.name}`);md.push('')}
if(failed.length){md.push('## Falhas','');for(const c of failed)md.push(`- ${c.page}: ${c.name}`)}
fs.mkdirSync(path.join(ROOT,'artifacts'),{recursive:true});
fs.writeFileSync(path.join(ROOT,'artifacts/site-ux-audit.json'),JSON.stringify({checkedAt:new Date().toISOString(),checks,failed},null,2)+'\n');
fs.writeFileSync(path.join(ROOT,'artifacts/site-ux-audit.md'),md.join('\n')+'\n');
console.log(md.join('\n'));
if(failed.length)process.exitCode=2;
