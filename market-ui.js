import {businessTypes} from './ventures.js';
import {competitionFor,positioningTypes,setPositioning,marketInfluence} from './competition.js';
import {projectDay} from './engine.js';
export function createMarketUI(root,getState,onChange){
  let selected='cafe';
  const money=n=>n.toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
  function render(){
    const s=getState();if(selected!=='cafe'&&!s.ventures.some(v=>v.id===selected))selected='cafe';
    const target=selected==='cafe'?s:s.ventures.find(v=>v.id===selected),rival=competitionFor(selected,s.day,s.sandbox);
    const market=marketInfluence(selected,target.price,target.positioning,s.day,s.sandbox);
    root.innerHTML=`<label for="marketBusiness">Negócio para analisar</label><select id="marketBusiness"><option value="cafe" ${selected==='cafe'?'selected':''}>Rede Café Aurora</option>${s.ventures.map(v=>`<option value="${v.id}" ${selected===v.id?'selected':''}>${businessTypes[v.id].name}</option>`).join('')}</select><div class="rival-card"><span>MERCADO LOCAL</span><h3>${rival.name}</h3><p>${rival.active?`${rival.campaign} · preço de referência ${money(rival.price)} · próxima mudança no dia ${rival.nextChange}.`:'Concorrência local ativa a partir do dia 45, no modo livre.'}</p><p class="fixed">${rival.active?`Comparação de preço afeta a demanda em ${Math.round(market.effect*100)}%, limitada a ±12%. Calendário e eventos continuam influenciando o movimento.`:'A campanha de 30 dias mantém suas regras de demanda. O posicionamento se desbloqueia ao continuar a empresa.'}</p></div><p>Seu preço: <strong>${money(target.price)}</strong> · posicionamento atual: <strong>${positioningTypes[target.positioning].name}</strong>.</p><div class="positioning-grid">${Object.entries(positioningTypes).map(([id,type])=>`<article class="positioning-option ${target.positioning===id?'selected':''}"><strong>${type.name}</strong><p>${type.description}</p><button class="secondary" data-positioning="${id}" aria-pressed="${target.positioning===id}" ${s.over||!s.sandbox||target.positioning===id?'disabled':''}>${target.positioning===id?'Em uso':'Escolher posicionamento'}</button></article>`).join('')}</div><div id="positioningComparison" ${!s.sandbox?'hidden':''}><h3>Compare com seu preço atual</h3><div class="table-wrap"><table><thead><tr><th>Posicionamento</th><th>Demanda</th><th>Vendas possíveis</th><th>Despesas</th><th>Lucro operacional</th></tr></thead><tbody>${Object.entries(positioningTypes).map(([id,type])=>{
      const copy=structuredClone(s),v=selected==='cafe'?copy:copy.ventures.find(v=>v.id===selected);v.positioning=id;
      const report=projectDay(copy),r=selected==='cafe'?report.cafe:report.ventures.find(v=>v.id===selected);
      return `<tr><td>${type.name}</td><td>${r.demand}</td><td>${r.sold}</td><td>${money(r.expenses)}</td><td class="${r.profit>=0?'positive':'negative'}">${money(r.profit)}</td></tr>`;
    }).join('')}</tbody></table></div><p class="fixed">Cenário normal com estoque, capacidade, preços e calendário atuais. O posicionamento altera demanda, sensibilidade ao preço e custos; não compra estoque nem muda o preço automaticamente. Uma loja suspensa não paga o custo de posicionamento.</p></div>`;
  }
  root.onchange=e=>{if(e.target.id==='marketBusiness'){selected=e.target.value;render();root.querySelector('#marketBusiness').focus({preventScroll:true})}};
  root.onclick=e=>{const button=e.target.closest('[data-positioning]');if(!button)return;const id=button.dataset.positioning,type=positioningTypes[id];if(!confirm(`Usar ${type.name}? Custo adicional de ${money(type.daily)} por dia de operação. A alteração começa no próximo expediente e mantém seu preço atual.`))return;if(setPositioning(getState(),selected,id))onChange('Posicionamento salvo. Compare previsões, preços e estoque antes de abrir o dia.')};
  return {render};
}
