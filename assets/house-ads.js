(()=>{
  const onGithub=location.hostname.endsWith('github.io');
  const root=onGithub?'/tutoriais/':'/';
  const siteUrl=path=>onGithub?path:path.replace(/^\/tutoriais\//,'/');

  const currentSlug=location.pathname.match(/\/impressoras-termicas\/([^/]+)\/?$/)?.[1]||'';
  const supportSlugs=['nao-imprime','offline','usb-nao-reconhece','imprime-em-branco','impressao-fraca','nao-corta-papel','descobrir-ip','configurar-rede','driver-windows-11','58mm-vs-80mm'];
  const supportPage=supportSlugs.includes(currentSlug);
  if(supportPage){
    document.body.classList.add('support-page');
    if(!document.querySelector('link[data-support-v3]')){
      const css=document.createElement('link');
      css.rel='stylesheet';
      css.href=root+'assets/support-v3.css';
      css.dataset.supportV3='1';
      document.head.appendChild(css);
    }
  }

  const hybridSlugs=['genericas','pos-58','pos-80','xprinter-driver'];
  const hybridPage=hybridSlugs.includes(currentSlug);
  if(hybridPage){
    document.body.classList.add('hybrid-page');
    if(!document.querySelector('link[data-hybrid-v3]')){
      const css=document.createElement('link');
      css.rel='stylesheet';
      css.href=root+'assets/hybrid-v3.css';
      css.dataset.hybridV3='1';
      document.head.appendChild(css);
    }

    const heroMain=document.querySelector('.guide-hero .guide-grid > div:first-child');
    const config={
      'genericas':{primary:'#identificar',primaryLabel:'Identificar minha impressora',secondary:'#guias',secondaryLabel:'Ver POS-58 / POS-80',route:['Etiqueta','Autoteste','VID/PID','Driver correto']},
      'pos-58':{primary:'#instalar',primaryLabel:'Começar identificação',secondary:'../xprinter-driver/',secondaryLabel:'Se for XPrinter',route:['Identificar','Confirmar fabricante','Baixar','Testar']},
      'pos-80':{primary:'#instalar',primaryLabel:'Começar identificação',secondary:'../xprinter-driver/',secondaryLabel:'Se for XPrinter',route:['Identificar','Conferir interface','Baixar','Testar']},
      'xprinter-driver':{primary:'#downloads',primaryLabel:'Ver drivers oficiais',secondary:'#identificar',secondaryLabel:'Confirmar meu modelo',route:['Modelo exato','58 ou 80 mm','Download oficial','Teste']}
    }[currentSlug];
    if(heroMain&&config&&!heroMain.querySelector('.hybrid-hero-actions')){
      const actions=document.createElement('div');
      actions.className='hybrid-hero-actions';
      actions.innerHTML=`<a class="btn primary" href="${config.primary}">${config.primaryLabel}</a><a class="btn soft" href="${config.secondary}">${config.secondaryLabel}</a>`;
      const route=document.createElement('div');
      route.className='hybrid-route';
      route.setAttribute('aria-label','Fluxo recomendado');
      route.innerHTML=config.route.map((label,i)=>`<span>${i+1}. ${label}</span>`).join('');
      const notice=heroMain.querySelector('.notice');
      if(notice){notice.after(route);route.before(actions)}else heroMain.append(actions,route);
    }

    const sections=[...document.querySelectorAll('main section.section')];
    const downloadSection=currentSlug==='xprinter-driver'?document.getElementById('downloads'):sections.find(s=>/Xprinter POS-(?:58|80)|Xprinter.*(?:58|80) mm/i.test(s.querySelector('h2')?.textContent||''));
    if(downloadSection)downloadSection.classList.add('hybrid-download-section');

    if(!document.querySelector('.hybrid-mobile-actions')&&config){
      const mobile=document.createElement('nav');
      mobile.className='hybrid-mobile-actions';
      mobile.setAttribute('aria-label','Ações rápidas');
      mobile.innerHTML=`<a href="${config.primary}">${config.primaryLabel}</a><a href="${currentSlug==='xprinter-driver'?'#identificar':'#problemas'}">${currentSlug==='xprinter-driver'?'Confirmar modelo':'Problemas'}</a>`;
      const footerNode=document.querySelector('.footer');
      if(footerNode)footerNode.before(mobile); else document.body.appendChild(mobile);
    }
  }

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

  if(document.body.classList.contains('model-page')&&!supportPage&&!hybridPage){
    if(!document.querySelector('script[data-model-page-ux]')){
      const uxScript=document.createElement('script');
      uxScript.src=root+'assets/model-page.js';
      uxScript.dataset.modelPageUx='1';
      document.head.appendChild(uxScript);
    }

    const sources=['data/impressoras.json','data/impressoras-extra.json','data/impressoras-extra2.json'];
    Promise.all(sources.map(file=>fetch(root+file).then(r=>r.ok?r.json():[]).catch(()=>[]))).then(parts=>{
      const items=[...new Map(parts.flat().map(p=>[p.id,p])).values()];
      const currentPath=location.pathname.replace(/\/+$/,'/');
      const current=items.find(p=>{
        const candidate=siteUrl(p.url).replace(/\/+$/,'/');
        return candidate===currentPath;
      });
      if(!current)return;

      const pageFooter=document.querySelector('.footer');
      const issueLinks=[
        ['offline/','Impressora offline','Fila, USB, COM e IP'],
        ['usb-nao-reconhece/','USB não reconhece','Cabo, porta e Gerenciador de Dispositivos'],
        ['imprime-em-branco/','Imprime em branco','Bobina, lado térmico e cabeça'],
        ['impressao-fraca/','Impressão fraca','Papel, limpeza e densidade'],
        ['nao-corta-papel/','Não corta o papel','Guilhotina, driver e ESC/POS'],
        ['configurar-rede/','Configurar em rede','Ethernet, IP e Windows']
      ];
      if(pageFooter&&!document.querySelector('.problem-guides')){
        const problems=document.createElement('section');
        problems.className='section problem-guides';
        problems.innerHTML=`<div class="wrap"><div class="section-head"><div><span class="eyebrow">Diagnóstico rápido</span><h2>Problemas comuns de impressoras térmicas</h2><p>Antes de trocar driver ou equipamento, identifique se a falha está no papel, USB, rede, Windows ou no mecanismo.</p></div></div><div class="grid">${issueLinks.map(([path,title,text])=>`<article class="panel"><h3><a href="${root}impressoras-termicas/${path}">${title}</a></h3><p>${text}.</p></article>`).join('')}</div></div>`;
        pageFooter.before(problems);
      }

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
      const hubBrands=['epson','bematech','elgin','sweda','tanca'];
      const brandHub=hubBrands.includes(current.marcaSlug)?`<p><a href="${root}impressoras-termicas/${current.marcaSlug}/">Ver todos os drivers e tutoriais ${current.marca} →</a></p>`:'';
      section.innerHTML=`<div class="wrap"><div class="section-head"><div><span class="eyebrow">Continue no Guia</span><h2>Outros drivers e tutoriais relacionados</h2><p>Veja modelos da mesma marca e impressoras populares de automação comercial.</p>${brandHub}</div></div><div class="grid">${related.map(p=>`<article class="panel related-guide-card"><span class="kicker">${p.marca}</span><h3><a href="${siteUrl(p.url)}">${p.modelo}</a></h3><p>${p.descricao||'Driver, instalação e solução de problemas.'}</p></article>`).join('')}</div></div>`;
      if(pageFooter&&!document.querySelector('.related-guides'))pageFooter.before(section);
    });
  }
})();
