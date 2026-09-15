(()=>{
  const onGithub=location.hostname.endsWith('github.io');
  const root=onGithub?'/tutoriais/':'/';
  const siteUrl=path=>onGithub?path:path.replace(/^\/tutoriais\//,'/');

  const footer=document.querySelector('.footer .wrap');
  if(footer&&!footer.querySelector('.legal-footer-links')){
    const links=document.createElement('div');
    links.className='legal-footer-links';
    links.innerHTML=`<a href="${root}sobre/">Sobre</a><a href="${root}politica-editorial/">Política editorial</a><a href="${root}politica-de-privacidade/">Privacidade</a><a href="${root}publicidade-e-afiliados/">Publicidade e afiliados</a><a href="${root}termos-de-uso/">Termos</a><a href="${root}contato/">Contato</a>`;
    footer.appendChild(links);
  }

  const slots=[...document.querySelectorAll('.ad-slot[data-ad-position]')];
  const image='https://99588517054034056dc4ed3dd2f332bd.cdn.bubble.io/f1773080248378x692615836036907000/Gemini_Generated_Image_yt2sf4yt2sf4yt2s%281%29.webp';
  const base='https://www.facity.com.br/';
  const copies={
    'after-download':{
      title:'Usa impressora térmica no restaurante?',
      text:'A Facity reúne PDV, mesas, delivery, cardápio digital e impressão em um só sistema.',
      cta:'Teste grátis por 10 dias',
      visual:true
    },
    'after-installation':{
      title:'Menos retrabalho entre pedido e impressão',
      text:'Centralize pedidos do salão, delivery e balcão e envie cada etapa para o setor certo.',
      cta:'Conhecer a Facity'
    },
    'after-troubleshooting':{
      title:'Seu PDV pode trabalhar de forma mais simples',
      text:'Organize pedidos, produção, caixa e atendimento com a Facity Sistemas.',
      cta:'Ver como funciona'
    }
  };

  slots.forEach((slot,index)=>{
    const position=slot.dataset.adPosition||`slot-${index+1}`;
    const copy=copies[position]||copies['after-installation'];
    const url=new URL(base);
    url.searchParams.set('utm_source','guia-impressoras');
    url.searchParams.set('utm_medium','house_ad');
    url.searchParams.set('utm_campaign','tutoriais_impressoras');
    url.searchParams.set('utm_content',position);

    slot.classList.add('is-active','house-ad-slot',`house-ad-slot--${position}`);
    slot.setAttribute('aria-label','Publicidade Facity Sistemas');
    slot.innerHTML=`<a class="house-ad ${copy.visual?'house-ad--visual':'house-ad--compact'}" href="${url.toString()}" target="_blank" rel="sponsored noopener" aria-label="${copy.title} — Facity Sistemas"><div class="house-ad__visual" ${copy.visual?'':'hidden'}><img src="${image}" alt="Facity Sistemas — controle mesas, delivery e caixa em um só sistema" loading="lazy" decoding="async"></div><div class="house-ad__content"><span class="house-ad__label">Publicidade</span><div class="house-ad__copy"><strong>${copy.title}</strong><span>${copy.text}</span></div><span class="house-ad__cta">${copy.cta} →</span></div></a>`;
  });

  if(document.body.classList.contains('model-page')){
    const sources=['data/impressoras.json','data/impressoras-extra.json','data/impressoras-extra2.json'];
    Promise.all(sources.map(file=>fetch(root+file).then(r=>r.ok?r.json():[]).catch(()=>[]))).then(parts=>{
      const items=[...new Map(parts.flat().map(p=>[p.id,p])).values()];
      const currentPath=location.pathname.replace(/\/+$/,'/') ;
      const current=items.find(p=>{
        const candidate=siteUrl(p.url).replace(/\/+$/,'/');
        return candidate===currentPath;
      });
      if(!current)return;
      const preferred=['bematech-mp-4200-th','epson-tm-t20','epson-tm-t20x','epson-tm-t20x-ii','epson-tm-t20ii','epson-tm-t20iii','bematech-mp-4200-hs','elgin-i9','elgin-i8','elgin-i7-plus'];
      const score=p=>{
        const i=preferred.indexOf(p.id);
        return i<0?999:i;
      };
      const related=items.filter(p=>p.status==='publicado'&&p.id!==current.id&&p.categoria===current.categoria&&(p.marcaSlug===current.marcaSlug||score(p)<999)).sort((a,b)=>{
        const sameA=a.marcaSlug===current.marcaSlug?0:1;
        const sameB=b.marcaSlug===current.marcaSlug?0:1;
        return sameA-sameB||score(a)-score(b)||a.modelo.localeCompare(b.modelo,'pt-BR');
      }).slice(0,4);
      if(!related.length)return;
      const section=document.createElement('section');
      section.className='section related-guides';
      section.innerHTML=`<div class="wrap"><div class="section-head"><div><span class="eyebrow">Continue no Guia</span><h2>Outros drivers e tutoriais relacionados</h2><p>Veja modelos da mesma marca e impressoras populares de automação comercial.</p></div></div><div class="grid">${related.map(p=>`<article class="panel related-guide-card"><span class="kicker">${p.marca}</span><h3><a href="${siteUrl(p.url)}">${p.modelo}</a></h3><p>${p.descricao||'Driver, instalação e solução de problemas.'}</p></article>`).join('')}</div></div>`;
      const pageFooter=document.querySelector('.footer');
      if(pageFooter&&!document.querySelector('.related-guides'))pageFooter.before(section);
    });
  }
})();
