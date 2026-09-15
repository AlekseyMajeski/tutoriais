(()=>{
  if(!document.body.classList.contains('hub-page'))return;
  const modelSection=document.getElementById('modelos');
  const wrap=modelSection?.querySelector(':scope > .wrap');
  if(!wrap||document.querySelector('.hub-search'))return;

  const breadcrumb=[...document.querySelectorAll('.breadcrumbs a, .breadcrumbs')].pop();
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
