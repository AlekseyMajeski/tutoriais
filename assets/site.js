(()=>{
  const root=document.querySelector('[data-catalog-root]');
  if(!root)return;

  const onGithub=location.hostname.endsWith('github.io');
  const hrefFor=url=>onGithub?url:url.replace(/^\/tutoriais\//,'/');
  const source=document.body.dataset.catalog;
  const extraSources=source&&source.includes('impressoras.json')?[
    source.replace('impressoras.json','impressoras-extra.json'),
    source.replace('impressoras.json','impressoras-extra2.json'),
    source.replace('impressoras.json','impressoras-xprinter.json'),
    source.replace('impressoras.json','impressoras-zebra.json'),
    source.replace('impressoras.json','impressoras-brother.json'),
    source.replace('impressoras.json','impressoras-honeywell.json'),
    source.replace('impressoras.json','impressoras-sato.json'),
    source.replace('impressoras.json','impressoras-bixolon.json'),
    source.replace('impressoras.json','impressoras-star.json'),
    source.replace('impressoras.json','impressoras-tsc.json'),
    source.replace('impressoras.json','impressoras-tsc-healthcare.json'),
    source.replace('impressoras.json','impressoras-tsc-rfid.json'),
    source.replace('impressoras.json','impressoras-tsc-mobile.json'),
    source.replace('impressoras.json','impressoras-tsc-current.json')
  ]:[];
  const preset=document.body.dataset.category||'todos';
  const search=document.querySelector('[data-search]');
  const filters=[...document.querySelectorAll('[data-filter]')];
  const empty=document.querySelector('[data-empty]');
  const catalogBlock=document.querySelector('.catalog-results');
  const summary=document.querySelector('[data-search-summary]');
  const isHome=document.body.classList.contains('home-page');
  let items=[],active=preset;

  const genericGuides=[
    {id:'generica-pos-58',marca:'Genérica',marcaSlug:'generica',modelo:'POS-58',aliases:['POS58','POS 58','58mm printer','58 mm','thermal printer 58','mini printer 58','impressora termica generica 58'],categoria:'termica',categoriaLabel:'Térmica genérica',papel:['58 mm'],interfaces:['USB em variantes','Bluetooth em variantes'],sistemas:['Windows 11','Windows 10'],status:'publicado',url:'/tutoriais/impressoras-termicas/pos-58/',descricao:'Como identificar o hardware real, conferir VID/PID e instalar o driver correto de uma POS-58 sem usar pacote aleatório.'},
    {id:'generica-pos-80',marca:'Genérica',marcaSlug:'generica',modelo:'POS-80',aliases:['POS80','POS 80','80mm printer','80 mm','thermal printer 80','impressora termica generica 80'],categoria:'termica',categoriaLabel:'Térmica genérica',papel:['80 mm'],interfaces:['USB em variantes','Ethernet em variantes','Serial em variantes'],sistemas:['Windows 11','Windows 10'],status:'publicado',url:'/tutoriais/impressoras-termicas/pos-80/',descricao:'Identificação, VID/PID, driver e instalação de impressoras POS-80 genéricas no Windows.'},
    {id:'xprinter-driver',marca:'Xprinter',marcaSlug:'xprinter',modelo:'Drivers Xprinter',aliases:['X printer','Xprinter POS58','Xprinter POS80','XP 58','XP 80','芯烨'],categoria:'termica',categoriaLabel:'Térmica',papel:['58 mm','80 mm'],interfaces:['USB','Ethernet/Serial em modelos'],sistemas:['Windows','Linux conforme modelo'],status:'publicado',url:'/tutoriais/impressoras-termicas/xprinter-driver/',descricao:'Como identificar o modelo Xprinter e escolher o driver oficial correto para as famílias de 58 mm e 80 mm.'}
  ];

  const popularThermal=['bematech-mp-4200-th','epson-tm-t20','epson-tm-t20x','epson-tm-t20x-ii','epson-tm-t20ii','epson-tm-t20iii','bematech-mp-4200-hs','bematech-mp-4200-th-adv','elgin-i9','elgin-i9-full-2','elgin-i8','elgin-i7-plus','tanca-tp-650','xprinter-xp-80t','xprinter-xp-t80q','xprinter-xp-t890h','xprinter-xp-58iih','zebra-zd220','zebra-zd230','zebra-zd421','zebra-gk420d','zebra-gk420t','brother-ql-800','brother-ql-810w','honeywell-pc42e-t','honeywell-pc42t','tsc-da210','tsc-da220'];
  const popularRank=p=>{const i=popularThermal.indexOf(p.id);return i<0?9999:i};
  const norm=s=>(s||'').toString().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
  const compact=s=>norm(s).replace(/\s+/g,'');
  const initialQuery=new URLSearchParams(window.location.search).get('q')||'';
  if(search&&initialQuery)search.value=initialQuery;
  const live=p=>p.status==='publicado';
  const osMatch=(p,v)=>(p.sistemas||[]).some(s=>norm(s).includes(norm(v)));
  function hay(p){return [p.marca,p.modelo,p.descricao,p.categoriaLabel,...(p.interfaces||[]),...(p.papel||[]),...(p.sistemas||[]),...(p.aliases||[])].join(' ')}
  function match(p,q){if(!q)return true;return norm(hay(p)).includes(norm(q))||compact(hay(p)).includes(compact(q))}
  function activeMatch(p){const baseOk=preset==='todos'||p.categoria===preset;if(!baseOk)return false;if(active===preset||active==='todos')return true;return p.categoria===active||p.marcaSlug===active||osMatch(p,active)}
  function card(p){
    const tags=[p.categoriaLabel,...(p.sistemas||[]),...(p.interfaces||[]),...(p.papel||[])].filter(Boolean).slice(0,6).map(t=>`<span class="tag">${t}</span>`).join('');
    const status=live(p)?'<span class="badge live">Disponível</span>':'<span class="badge soon">Em breve</span>';
    const action=live(p)?`<a class="card-link" href="${hrefFor(p.url)}">Driver e tutorial →</a>`:'<span class="card-link muted">Tutorial em preparação</span>';
    return `<article class="card"><div class="card-top"><div><span class="kicker">${p.marca}</span><h3>${p.modelo}</h3></div>${status}</div><p>${p.descricao||''}</p><div class="card-tags">${tags}</div>${action}</article>`;
  }
  function group(title,text,list){if(!list.length)return'';return `<section class="catalog-group"><div class="catalog-group-head"><div><h2>${title}</h2><p>${text}</p></div><span class="result-count">${list.length}</span></div><div class="grid">${list.map(card).join('')}</div></section>`}
  function render(){
    const q=search?.value||'';
    const list=items.filter(p=>activeMatch(p)&&match(p,q));
    list.sort((a,b)=>{const statusDiff=Number(live(b))-Number(live(a));if(statusDiff)return statusDiff;if(!q){const rankDiff=popularRank(a)-popularRank(b);if(rankDiff)return rankDiff}return a.marca.localeCompare(b.marca,'pt-BR')||a.modelo.localeCompare(b.modelo,'pt-BR')});
    const published=list.filter(live),upcoming=list.filter(p=>!live(p));
    const publishedText=!q?'Os modelos com maior procura e uso aparecem primeiro.':'Tutoriais completos com driver e instalação.';
    root.innerHTML=group('Disponíveis agora',publishedText,published)+group('Em preparação','Modelos já cadastrados para as próximas publicações.',upcoming);
    if(empty)empty.hidden=Boolean(list.length);

    const engaged=!isHome||Boolean(q.trim())||active!==preset;
    if(catalogBlock)catalogBlock.hidden=!engaged;
    if(summary&&engaged){
      if(q.trim())summary.textContent=`${list.length} resultado${list.length===1?'':'s'} para “${q.trim()}”`;
      else summary.textContent=`${list.length} modelo${list.length===1?'':'s'} neste filtro`;
    }
  }

  if(preset==='termica'&&!document.querySelector('.generic-printer-guides')){
    const section=document.createElement('section');
    section.className='section generic-printer-guides';
    section.innerHTML=`<div class="wrap"><div class="section-head"><div><span class="eyebrow">POS-58 • POS-80 • Xprinter</span><h2>Impressoras térmicas genéricas</h2><p>Se a impressora só diz POS-58, POS-80, Thermal Printer ou Mini Printer, identifique o hardware antes de baixar qualquer driver.</p></div></div><div class="grid"><article class="panel"><h3><a href="${hrefFor('/tutoriais/impressoras-termicas/genericas/')}">Central de impressoras genéricas</a></h3><p>Etiqueta, autoteste, VID/PID e escolha segura do driver.</p></article><article class="panel"><h3><a href="${hrefFor('/tutoriais/impressoras-termicas/pos-58/')}">Driver POS-58</a></h3><p>Windows 11, USB e identificação do controlador.</p></article><article class="panel"><h3><a href="${hrefFor('/tutoriais/impressoras-termicas/pos-80/')}">Driver POS-80</a></h3><p>Windows 11, USB/rede e teste da fila.</p></article><article class="panel"><h3><a href="${hrefFor('/tutoriais/impressoras-termicas/xprinter-driver/')}">Drivers Xprinter</a></h3><p>Encontre o modelo exato e use os centros oficiais de 58/80 mm.</p></article></div></div>`;
    if(catalogBlock)catalogBlock.before(section);
  }

  const load=u=>fetch(u).then(r=>{if(!r.ok)throw new Error();return r.json()});
  Promise.all([load(source),...extraSources.map(u=>load(u).catch(()=>[]))]).then(parts=>{
    items=[...new Map([...parts.flat(),...genericGuides].map(p=>[p.id,p])).values()];
    render();
  }).catch(()=>{root.innerHTML='<div class="notice warn">Não foi possível carregar o catálogo agora. Recarregue a página.</div>';if(catalogBlock)catalogBlock.hidden=false});
  search?.addEventListener('input',render);
  filters.forEach(btn=>{btn.setAttribute('aria-pressed',String(btn.dataset.filter===active));btn.addEventListener('click',()=>{active=btn.dataset.filter;filters.forEach(b=>b.setAttribute('aria-pressed',String(b===btn)));render()})});
})();