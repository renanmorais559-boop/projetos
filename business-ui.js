import {businessTypes,openBusiness,buyBusinessStock,configureBusiness,projectBusiness} from './ventures.js';
export function createBusinessUI(root,getState,onChange){
  const money=n=>n.toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
  function render(){
    const s=getState();
    root.innerHTML=Object.entries(businessTypes).sort((a,b)=>a[1].unlockDay-b[1].unlockDay).map(([id,type])=>{
      const v=s.ventures.find(v=>v.id===id),locked=s.day<type.unlockDay;
      if(!v)return `<article class="venture-card"><div class="venture-art ${id}"><span>${type.icon}</span><small>${type.category}</small></div><div class="venture-body"><h3>${type.name}</h3><p>${type.description}</p><div class="business-stats"><span>Abertura<strong>${money(type.opening)}</strong></span><span>Operação/dia<strong>${money(type.rent)}</strong></span><span>Custo/unidade<strong>${money(type.cost)}</strong></span></div><p class="fixed">${locked?`Disponível a partir do dia ${type.unlockDay}.`:`Após abrir: ${money(s.cash-type.opening)} em caixa. A loja começa sem estoque.`}</p><button class="secondary" data-open-business="${id}" ${locked||s.over||s.cash<type.opening?'disabled':''}>${locked?`🔒 Desbloqueia no dia ${type.unlockDay}`:'Abrir este negócio'}</button></div></article>`;
      const projection=projectBusiness(v,{factor:1});
      return `<article class="venture-card"><div class="venture-art ${id}"><span>${type.icon}</span><small>${v.paused?'SUSPENSA':'EM OPERAÇÃO'} · ${type.category}</small></div><div class="venture-body"><h3>${type.name}</h3><div class="business-stats"><span>Estoque<strong>${v.stock} un.</strong></span><span>Reputação<strong>${v.reputation}/100</strong></span><span>Capacidade<strong>${v.paused?0:v.staff?type.staffedCapacity:type.capacity}/dia</strong></span></div><label for="price-${id}">Preço por unidade · ${money(v.price)}</label><input id="price-${id}" data-business="${id}" data-field="price" type="range" min="${type.minPrice}" max="${type.maxPrice}" value="${v.price}" ${s.over?'disabled':''}><label class="venture-staff"><input data-business="${id}" data-field="staff" type="checkbox" ${v.staff?'checked':''} ${s.over?'disabled':''}> Atendente · ${money(type.wage)}/dia</label><label for="quantity-${id}">Repor estoque · ${money(type.cost)}/un.</label><div class="venture-buy"><input id="quantity-${id}" type="number" min="1" max="1000" value="30" ${s.over?'disabled':''}><button class="secondary" data-buy-business="${id}" ${s.over?'disabled':''}>Comprar</button></div><p class="business-projection ${projection.profit<0?'negative':'positive'}">Cenário normal: ${projection.sold} vendas · ${money(projection.profit)} de lucro operacional.</p><p class="fixed">${v.paused?`Loja suspensa: mantém estoque e reputação; paga ${money(type.rent/2)}/dia de manutenção, sem salários.`:v.stock===0?'⚠ Sem estoque: esta loja vai gerar despesas sem vendas.':`Operação ${money(type.rent)}/dia${v.staff?` + salário ${money(type.wage)}`:''}. A previsão muda com os eventos do dia.`}</p><button class="secondary" data-pause-business="${id}" ${s.over?'disabled':''}>${v.paused?'Retomar operação':'Suspender temporariamente'}</button></div></article>`;
    }).join('');
  }
  root.onclick=e=>{
    const pause=e.target.closest('[data-pause-business]');
    if(pause){const s=getState(),id=pause.dataset.pauseBusiness,v=s.ventures.find(v=>v.id===id);if(v&&configureBusiness(s,id,'paused',!v.paused))onChange(v.paused?'Loja suspensa. Manutenção de metade da operação diária; estoque e reputação preservados.':'Loja voltou a operar. Confira estoque e equipe antes de abrir o dia.');return;}
    const open=e.target.closest('[data-open-business]'),buy=e.target.closest('[data-buy-business]');
    if(open){
      const id=open.dataset.openBusiness,type=businessTypes[id];
      if(!confirm(`Abrir ${type.name} por ${money(type.opening)}? A operação custa ${money(type.rent)} por dia e será necessário comprar estoque separadamente.`))return;
      if(openBusiness(getState(),id))onChange(`${type.name} abriu! Compre estoque antes de encerrar o dia.`);
    }else if(buy){
      const id=buy.dataset.buyBusiness,quantity=Number(document.getElementById(`quantity-${id}`).value);
      if(buyBusinessStock(getState(),id,quantity))onChange(`Estoque recebido em ${businessTypes[id].name}.`);
      else onChange('Confira o caixa e informe de 1 a 1.000 unidades inteiras.');
    }
  };
  root.onchange=e=>{
    const {business,field}=e.target.dataset;
    if(business&&field&&configureBusiness(getState(),business,field,field==='staff'?e.target.checked:Number(e.target.value)))
      onChange('Decisão do negócio salva. As projeções foram atualizadas.');
  };
  return {render};
}
