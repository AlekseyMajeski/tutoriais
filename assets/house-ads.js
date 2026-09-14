(()=>{
  const slots=[...document.querySelectorAll('.ad-slot[data-ad-position]')];
  if(!slots.length)return;

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
})();
