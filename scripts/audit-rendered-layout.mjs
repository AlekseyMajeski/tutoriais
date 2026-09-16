import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright-core';

const BASE=(process.env.QA_BASE_URL||'https://alekseymajeski.github.io/tutoriais').replace(/\/$/,'');
const CHROME=process.env.CHROME_PATH;
if(!CHROME)throw new Error('CHROME_PATH não definido');

const outDir=path.join(process.cwd(),'artifacts','rendered-qa');
fs.mkdirSync(outDir,{recursive:true});

const pages=[
  {id:'home',path:'/',kind:'home'},
  {id:'termicas',path:'/impressoras-termicas/',kind:'home'},
  {id:'epson',path:'/impressoras-termicas/epson/',kind:'hub'},
  {id:'tm-t20',path:'/impressoras-termicas/epson/tm-t20/',kind:'model'},
  {id:'mp-4200-th',path:'/impressoras-termicas/bematech/mp-4200-th/',kind:'model'},
  {id:'nao-imprime',path:'/impressoras-termicas/nao-imprime/',kind:'support'},
  {id:'pos-80',path:'/impressoras-termicas/pos-80/',kind:'hybrid'},
  {id:'xprinter',path:'/impressoras-termicas/xprinter-driver/',kind:'hybrid'}
];
const viewports=[
  {id:'390',width:390,height:844,mobile:true},
  {id:'430',width:430,height:932,mobile:true},
  {id:'1366',width:1366,height:768,mobile:false},
  {id:'1920',width:1920,height:1080,mobile:false}
];

const checks=[];
const add=(page,viewport,name,ok,detail='')=>checks.push({page,viewport,name,ok:Boolean(ok),detail});
const getBox=async(locator)=>await locator.count()?locator.first().boundingBox():null;
const browser=await chromium.launch({headless:true,executablePath:CHROME,args:['--no-sandbox','--disable-dev-shm-usage']});

for(const vp of viewports){
  const context=await browser.newContext({viewport:{width:vp.width,height:vp.height},deviceScaleFactor:1});
  for(const def of pages){
    const page=await context.newPage();
    const url=`${BASE}${def.path}?qa=${Date.now()}`;
    let response;
    try{
      response=await page.goto(url,{waitUntil:'networkidle',timeout:45000});
    }catch(error){
      add(def.id,vp.id,'carrega a página',false,error.message);
      await page.close();
      continue;
    }
    add(def.id,vp.id,'carrega a página',response?.ok(),`HTTP ${response?.status()}`);
    await page.waitForTimeout(250);

    const basic=await page.evaluate(()=>{
      const viewportWidth=document.documentElement.clientWidth;
      const overflowers=[...document.querySelectorAll('body *')].map(el=>{
        const r=el.getBoundingClientRect();
        const s=getComputedStyle(el);
        return {
          tag:el.tagName.toLowerCase(),
          id:el.id||'',
          cls:typeof el.className==='string'?el.className.trim().replace(/\s+/g,'.').slice(0,100):'',
          text:(el.textContent||'').trim().replace(/\s+/g,' ').slice(0,70),
          left:Math.round(r.left),right:Math.round(r.right),width:Math.round(r.width),
          overflowX:s.overflowX,position:s.position
        };
      }).filter(x=>x.width>0&&(x.right>viewportWidth+2||x.left<-2)).sort((a,b)=>(b.right-viewportWidth)-(a.right-viewportWidth)).slice(0,12);
      return {
        scrollWidth:document.documentElement.scrollWidth,
        clientWidth:viewportWidth,
        headerHeight:document.querySelector('.topbar')?.getBoundingClientRect().height||0,
        h1:document.querySelector('h1')?.textContent?.trim()||'',
        visibleDisabledOffer:[...document.querySelectorAll('.buy-box .btn.disabled')].some(el=>el.getClientRects().length>0),
        overflowers
      };
    });
    const overflowDetail=basic.overflowers.length?`${basic.scrollWidth}/${basic.clientWidth}px | ${basic.overflowers.map(x=>`${x.tag}${x.id?`#${x.id}`:''}${x.cls?`.`+x.cls:''}[${x.left}..${x.right};w${x.width};${x.overflowX}]`).join(' | ')}`:`${basic.scrollWidth}/${basic.clientWidth}px`;
    add(def.id,vp.id,'sem overflow horizontal',basic.scrollWidth<=basic.clientWidth+2,overflowDetail);
    add(def.id,vp.id,'H1 presente',Boolean(basic.h1),basic.h1);
    add(def.id,vp.id,'cabeçalho compacto',basic.headerHeight>0&&basic.headerHeight<=82,`${basic.headerHeight.toFixed(1)}px`);
    if(def.kind==='model')add(def.id,vp.id,'sem oferta desativada visível',!basic.visibleDisabledOffer);

    if(def.kind==='home'){
      const search=await getBox(page.locator('[data-search]'));
      add(def.id,vp.id,'busca visível',Boolean(search));
      if(search)add(def.id,vp.id,'busca perto do topo',search.y<vp.height*.78,`y=${search.y.toFixed(0)}px`);
    }

    if(def.kind==='hub'){
      const search=await getBox(page.locator('.hub-search-field input'));
      add(def.id,vp.id,'busca da marca visível',Boolean(search));
      if(search)add(def.id,vp.id,'busca da marca perto do topo',search.y<vp.height*.8,`y=${search.y.toFixed(0)}px`);
    }

    if(def.kind==='model'){
      const cta=await getBox(page.locator('.guide-hero .btn.primary'));
      add(def.id,vp.id,'CTA principal visível',Boolean(cta));
      if(cta)add(def.id,vp.id,'CTA principal acima da dobra',cta.y<vp.height*.92,`y=${cta.y.toFixed(0)}px`);
      if(vp.mobile){
        const mobile=await getBox(page.locator('.mobile-actions'));
        add(def.id,vp.id,'barra mobile presente',Boolean(mobile));
        if(mobile)add(def.id,vp.id,'barra mobile dentro da viewport',mobile.y+mobile.height<=vp.height+2,`bottom=${(mobile.y+mobile.height).toFixed(0)}px`);
      }
    }

    if(vp.mobile&&def.kind!=='model'){
      const nav=await page.locator('.topbar .nav a').evaluateAll(nodes=>nodes.filter(n=>{
        const s=getComputedStyle(n);const r=n.getBoundingClientRect();return s.display!=='none'&&s.visibility!=='hidden'&&r.width>0&&r.height>0;
      }).length);
      add(def.id,vp.id,'tem caminho de navegação no topo',nav>=1,`${nav} link(s) visível(is)`);
    }

    // Screenshot inicial: representa exatamente o que o visitante vê antes de rolar.
    await page.screenshot({path:path.join(outDir,`${def.id}-${vp.id}-top.png`),fullPage:false});

    const ad=page.locator('.house-ad--visual').first();
    if(await ad.count()){
      await ad.scrollIntoViewIfNeeded();
      await page.waitForTimeout(600);
      const adState=await ad.evaluate(el=>{
        const img=el.querySelector('img');
        const content=el.querySelector('.house-ad__content');
        const rect=img?.getBoundingClientRect();
        const naturalRatio=img?.naturalWidth&&img?.naturalHeight?img.naturalWidth/img.naturalHeight:0;
        const renderedRatio=rect?.width&&rect?.height?rect.width/rect.height:0;
        return {
          loaded:Boolean(img?.naturalWidth),
          objectFit:img?getComputedStyle(img).objectFit:'',
          contentDisplay:content?getComputedStyle(content).display:'',
          naturalRatio,renderedRatio,width:rect?.width||0,height:rect?.height||0
        };
      });
      add(def.id,vp.id,'banner Facity carrega',adState.loaded,`${adState.width.toFixed(0)}×${adState.height.toFixed(0)}px`);
      add(def.id,vp.id,'banner Facity usa contain',adState.objectFit==='contain',adState.objectFit);
      add(def.id,vp.id,'banner sem texto duplicado',adState.contentDisplay==='none',adState.contentDisplay);
      if(adState.naturalRatio&&adState.renderedRatio){
        const drift=Math.abs(adState.naturalRatio-adState.renderedRatio)/adState.naturalRatio;
        add(def.id,vp.id,'proporção da arte preservada',drift<.03,`desvio ${(drift*100).toFixed(1)}%`);
      }
      await page.screenshot({path:path.join(outDir,`${def.id}-${vp.id}-ad.png`),fullPage:false});
    }

    if(vp.mobile){
      const targets=await page.locator('.btn:visible,.mobile-actions a:visible,.hybrid-mobile-actions a:visible,.home-filters .filter:visible').evaluateAll(nodes=>nodes.slice(0,30).map(n=>({text:(n.textContent||'').trim().slice(0,50),h:n.getBoundingClientRect().height})));
      const tooSmall=targets.filter(t=>t.h<38);
      add(def.id,vp.id,'alvos principais com altura utilizável',tooSmall.length===0,tooSmall.map(t=>`${t.text}:${t.h.toFixed(0)}`).join(', '));
    }

    await page.close();
  }
  await context.close();
}
await browser.close();

const failed=checks.filter(c=>!c.ok);
const critical=failed.filter(c=>!['banner Facity carrega'].includes(c.name));
const lines=['# QA renderizado multi-viewport','',`Base: ${BASE}`,`Executado em: ${new Date().toISOString()}`,'',`- Verificações: **${checks.length}**`,`- Falhas: **${failed.length}**`,`- Falhas críticas: **${critical.length}**`,''];
for(const vp of viewports){
  lines.push(`## ${vp.width}×${vp.height}`,'');
  for(const def of pages){
    const list=checks.filter(c=>c.viewport===vp.id&&c.page===def.id);
    const bad=list.filter(c=>!c.ok);
    lines.push(`- ${bad.length?'❌':'✅'} **${def.id}** — ${list.length-bad.length}/${list.length}${bad.length?` — ${bad.map(c=>`${c.name}${c.detail?` (${c.detail})`:''}`).join('; ')}`:''}`);
  }
  lines.push('');
}
if(failed.length){lines.push('## Falhas detalhadas','');for(const c of failed)lines.push(`- ${c.page} @ ${c.viewport}: ${c.name}${c.detail?` — ${c.detail}`:''}`)}
fs.writeFileSync(path.join(outDir,'report.json'),JSON.stringify({base:BASE,checkedAt:new Date().toISOString(),checks,failed,critical},null,2)+'\n');
fs.writeFileSync(path.join(outDir,'report.md'),lines.join('\n')+'\n');
console.log(lines.join('\n'));
if(critical.length)process.exitCode=2;
