(()=>{
  if(!document.body.classList.contains('hub-page'))return;
  const modelSection=document.getElementById('modelos');
  const wrap=modelSection?.querySelector(':scope > .wrap');
  if(!wrap||document.querySelector('.hub-search'))return;

  const isTscHub=/\/impressoras-termicas\/tsc\/?$/.test(location.pathname);
  const injectGroup=({key,title,text,cards})=>{
    if(!isTscHub||wrap.querySelector(`[data-tsc-${key}]`))return;
    const head=document.createElement('div');
    head.className='section-head';
    head.dataset[`tsc${key[0].toUpperCase()}${key.slice(1)}`]='';
    head.innerHTML=`<div><h2>${title}</h2><p>${text}</p></div>`;
    const grid=document.createElement('div');
    grid.className='grid';
    grid.dataset[`tsc${key[0].toUpperCase()}${key.slice(1)}`]='';
    grid.innerHTML=cards.join('');
    const firstIndustrial=[...wrap.querySelectorAll('.section-head')].find(el=>/^MB Series/i.test(el.textContent));
    if(firstIndustrial){wrap.insertBefore(head,firstIndustrial);wrap.insertBefore(grid,firstIndustrial)}
    else{wrap.append(head,grid)}
  };

  injectGroup({key:'healthcare',title:'TH/DH Healthcare — ambientes de saúde',text:'Variantes com gabinete antimicrobiano/easy-to-disinfect e fonte conforme IEC 60601-1, mantendo o driver Seagull documentado pela TSC.',cards:[
    '<article class="panel"><h3><a href="./th240thc/">TSC TH240THC</a></h3><p>203 dpi, até 8 ips, direta/transferência, touchscreen e versão Healthcare.</p></article>',
    '<article class="panel"><h3><a href="./th340thc/">TSC TH340THC</a></h3><p>300 dpi, até 6 ips, direta/transferência, touchscreen e versão Healthcare.</p></article>',
    '<article class="panel"><h3><a href="./dh240thc/">TSC DH240THC</a></h3><p>203 dpi, até 8 ips, térmica direta, touchscreen e versão Healthcare.</p></article>',
    '<article class="panel"><h3><a href="./dh340thc/">TSC DH340THC</a></h3><p>300 dpi, até 6 ips, térmica direta, touchscreen e versão Healthcare.</p></article>'
  ]});

  injectGroup({key:'rfid',title:'RFID — UHF / RAIN',text:'Modelos RFID explicitamente identificados pela TSC e presentes nos Drivers by Seagull ou no suporte oficial da mesma família.',cards:[
    '<article class="panel"><h3><a href="./alpha-40l-rfid/">TSC Alpha-40L RFID</a></h3><p>Móvel de 203 dpi e até 5 ips, RAIN UHF, largura de 104 mm e driver Alpha-40L (R).</p></article>',
    '<article class="panel"><h3><a href="./th240trchc/">TSC TH240TRCHC</a></h3><p>203 dpi, até 8 ips, RFID UHF, Healthcare, touchscreen e cartucho de ribbon.</p></article>',
    '<article class="panel"><h3><a href="./th340trchc/">TSC TH340TRCHC</a></h3><p>300 dpi, até 6 ips, RFID UHF, Healthcare, touchscreen e cartucho de ribbon.</p></article>'
  ]});

  injectGroup({key:'mobile',title:'Alpha Series — impressoras móveis',text:'Modelos móveis de 203 dpi com USB e conectividade sem fio, para etiquetas e recibos em campo.',cards:[
    '<article class="panel"><h3><a href="./alpha-2r/">TSC Alpha-2R</a></h3><p>2 polegadas, 203 dpi, até 4 ips, largura de impressão de 48 mm e wireless.</p></article>',
    '<article class="panel"><h3><a href="./alpha-3r/">TSC Alpha-3R</a></h3><p>Legacy/descontinuada, 203 dpi, até 4 ips, largura de 72 mm, USB, Bluetooth MFi e Wi-Fi.</p></article>',
    '<article class="panel"><h3><a href="./alpha-30r/">TSC Alpha-30R</a></h3><p>3 polegadas, 203 dpi, Basic até 5 ips e Premium até 6 ips, largura de 72 mm.</p></article>',
    '<article class="panel"><h3><a href="./alpha-30l/">TSC Alpha-30L</a></h3><p>3 polegadas, 203 dpi, até 5 ips, largura de impressão de 72 mm e wireless.</p></article>',
    '<article class="panel"><h3><a href="./alpha-40l/">TSC Alpha-40L</a></h3><p>4 polegadas, 203 dpi, até 5 ips, largura de impressão de 104 mm e wireless.</p></article>',
    '<article class="panel"><h3><a href="./re310/">TSC RE310</a></h3><p>3 polegadas, 203 dpi, até 4 ips, largura de impressão de 72 mm, mídia 20–80 mm e wireless.</p></article>'
  ]});

  injectGroup({key:'current',title:'TH Series — desktop 2 polegadas',text:'Modelos compactos de 2 polegadas com touchscreen, 203/300 dpi e driver Seagull documentado para as séries TH220 e TH320.',cards:[
    '<article class="panel"><h3><a href="./th220t/">TSC TH220T</a></h3><p>203 dpi, até 8 ips, direta/transferência, touchscreen, mídia até 60 mm e ribbon até 90 m.</p></article>',
    '<article class="panel"><h3><a href="./th320t/">TSC TH320T</a></h3><p>300 dpi, até 6 ips, direta/transferência, touchscreen, mídia até 60 mm e ribbon até 90 m.</p></article>'
  ]});

  const title=document.querySelector('.home-hero h1')?.textContent||'Modelos';
  const brand=(title.match(/(?:Drivers\s+)?([A-Za-zÀ-ÿ0-9 ]+?)(?:\s+(?:para|TM-|MP-|i9|SI-|TP-)|$)/i)?.[1]||'').trim();
  const cards=[...wrap.querySelectorAll('.grid .panel')];
  if(!cards.length)return;

  const searchSection=document.createElement('div');
  searchSection.className='wrap hub-search';
  searchSection.innerHTML=`<div class="hub-search-box"><label class="hub-search-field"><span aria-hidden="true">⌕</span><input type="search" autocomplete="off" aria-label="Pesquisar modelo" placeholder="Pesquisar modelo${brand?` ${brand}`:''}…"></label><div class="hub-search-meta"><strong>${cards.length}</strong> modelos no guia</div></div><div class="hub-search-empty">Nenhum modelo encontrado. Tente apenas parte do nome, por exemplo <b>T20</b>, <b>4200</b> ou <b>i9</b>.</div>`;
  modelSection.before(searchSection);

  const input=searchSection.querySelector('input');
  const meta=searchSection.querySelector('.hub-search-meta');
  const empty=searchSection.querySelector('.hub-search-empty');
  const normalize=s=>(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'');

  const groups=[...wrap.children].reduce((acc,node)=>{
    if(node.classList?.contains('section-head'))acc.push({head:node,grids:[]});
    else if(node.classList?.contains('grid')){
      if(!acc.length)acc.push({head:null,grids:[]});
      acc[acc.length-1].grids.push(node);
    }
    return acc;
  },[]);

  function render(){
    const q=normalize(input.value);
    let visible=0;
    cards.forEach(card=>{
      const show=!q||normalize(card.textContent).includes(q);
      card.classList.toggle('hub-hidden',!show);
      if(show)visible++;
    });
    groups.forEach(group=>{
      const groupVisible=group.grids.some(grid=>[...grid.querySelectorAll('.panel')].some(card=>!card.classList.contains('hub-hidden')));
      if(group.head)group.head.classList.toggle('hub-hidden',!groupVisible);
      group.grids.forEach(grid=>grid.classList.toggle('hub-hidden',!groupVisible));
    });
    meta.innerHTML=q?`<strong>${visible}</strong> resultado${visible===1?'':'s'}`:`<strong>${cards.length}</strong> modelos no guia`;
    empty.classList.toggle('is-visible',visible===0);
  }
  input.addEventListener('input',render);
})();
