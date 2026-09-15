(()=>{
  const body=document.body;
  if(!body||!body.classList.contains('model-page')||body.dataset.modelUxReady==='1')return;
  body.dataset.modelUxReady='1';

  const hero=document.querySelector('.guide-hero');
  const heroMain=hero?.querySelector('.guide-grid > div:first-child')||hero;

  const legacyDownload=document.getElementById('driver');
  if(!document.getElementById('download')&&legacyDownload){
    legacyDownload.id='download';
  }
  document.querySelectorAll('a[href="#driver"]').forEach(a=>a.setAttribute('href','#download'));
  const skip=document.querySelector('.skip-link[href="#driver"]');
  if(skip)skip.setAttribute('href','#download');

  const inferSection=(id,patterns)=>{
    if(document.getElementById(id))return document.getElementById(id);
    const sections=[...document.querySelectorAll('main section.section')];
    const section=sections.find(s=>{
      const title=s.querySelector('h2')?.textContent?.trim()||'';
      return patterns.some(re=>re.test(title));
    });
    if(section)section.id=id;
    return section||null;
  };

  const configuration=document.getElementById('configuracao');
  if(!configuration){
    inferSection('instalacao',[/instala[cç][aã]o/i,/como instalar/i,/instalar .*windows/i,/instala[cç][aã]o .*computador/i]);
  }
  inferSection('problemas',[/problemas? comuns/i,/solu[cç][aã]o de problemas/i]);
  const primarySetup=document.getElementById('instalacao')||document.getElementById('configuracao');

  if(heroMain&&!hero?.querySelector('.btn.primary')){
    const download=document.getElementById('download');
    const source=download?.querySelector('.btn.primary')||download?.querySelector('.btn')||document.querySelector('main .btn.primary');
    if(source){
      let buttons=heroMain.querySelector('.buttons');
      if(!buttons){
        buttons=document.createElement('div');
        buttons.className='buttons';
        const chips=heroMain.querySelector('.chips');
        if(chips)chips.after(buttons);
        else{
          const lead=heroMain.querySelector('.lead');
          if(lead)lead.after(buttons); else heroMain.appendChild(buttons);
        }
      }
      const cta=source.cloneNode(true);
      cta.classList.add('btn','primary');
      cta.classList.remove('soft','disabled');
      buttons.prepend(cta);
      if(primarySetup&&!buttons.querySelector(`a[href="#${primarySetup.id}"]`)){
        const install=document.createElement('a');
        install.className='btn soft';
        install.href=`#${primarySetup.id}`;
        install.textContent=primarySetup.id==='configuracao'?'Como configurar':'Como instalar';
        buttons.appendChild(install);
      }
    }
  }

  if(heroMain&&!heroMain.querySelector('.connection-nav')){
    const setupDef=primarySetup?[primarySetup.id,primarySetup.id==='configuracao'?'📶':'🔌',primarySetup.id==='configuracao'?'Configurar':'Instalar']:null;
    const defs=[
      setupDef,
      ['rede','🌐','Rede/IP'],
      ['serial','🔗','Serial'],
      ['problemas','⚠','Problemas']
    ].filter(Boolean);
    const available=defs.filter(([id])=>document.getElementById(id)).slice(0,4);
    if(available.length>=2){
      const nav=document.createElement('div');
      nav.className='connection-nav';
      nav.innerHTML=`<strong>Atalhos</strong><div class="connection-links">${available.map(([id,icon,label])=>`<a href="#${id}">${icon} ${label}</a>`).join('')}</div>`;
      const trust=heroMain.querySelector('.model-trust');
      if(trust)trust.after(nav);
      else{
        const buttons=heroMain.querySelector('.buttons');
        if(buttons)buttons.after(nav); else heroMain.appendChild(nav);
      }
    }
  }

  let mobile=document.querySelector('.mobile-actions');
  if(!mobile){
    const targets=[
      ['download','⬇ Driver','primary-mobile'],
      primarySetup?[primarySetup.id,primarySetup.id==='configuracao'?'📶 Configurar':'🔧 Instalar','']:null,
      ['problemas','⚠ Problemas','']
    ].filter(Boolean).filter(([id])=>document.getElementById(id));
    if(targets.length>=2){
      mobile=document.createElement('nav');
      mobile.className='mobile-actions';
      mobile.setAttribute('aria-label','Ações rápidas');
      mobile.innerHTML=targets.map(([id,label,cls])=>`<a href="#${id}"${cls?` class="${cls}"`:''}>${label}</a>`).join('');
      const footer=document.querySelector('.footer');
      if(footer)footer.before(mobile); else body.appendChild(mobile);
    }
  }else{
    mobile.setAttribute('aria-label',mobile.getAttribute('aria-label')||'Ações rápidas');
    mobile.querySelectorAll('a[href="#driver"]').forEach(a=>a.setAttribute('href','#download'));
    const first=mobile.querySelector('a[href="#download"]')||mobile.querySelector('a');
    if(first)first.classList.add('primary-mobile');
  }
})();
