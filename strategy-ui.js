import {businessTypes} from './ventures.js';
import {strategyPreview,applyStrategy} from './strategy.js';
export function createStrategyUI(root,getState,onApply){
  const money=n=>n.toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
  let selected='cafe',choice=null,lastDay=null;
  const model=s=>selected==='cafe'?s:s.ventures.find(v=>v.id===selected);
  function reset(s){const v=model(s);choice={price:v.price,staff:v.staff,marketing:selected==='cafe'?s.marketing:0};lastDay=s.day;}
  function numbers(){
    const s=getState(),rows=strategyPreview(s,selected,choice);
    root.querySelector('#labPriceValue').textContent=money(choice.price);
    root.querySelector('#labRows').innerHTML=rows.map(r=>`<tr><td>${r.label}</td><td>${r.current.sold} → ${r.proposed.sold}</td><td>${money(r.current.profit)}</td><td class="${r.proposed.profit>=0?'positive':'negative'}">${money(r.proposed.profit)}</td><td class="${r.delta>=0?'positive':'negative'}">${money(r.delta)}</td><td class="${r.companyCash>=0?'positive':'negative'}">${money(r.companyCash)}</td></tr>`).join('');
    root.querySelector('#labAlert').textContent=model(s).paused?'Esta loja está suspensa: alterar preço e equipe não muda as vendas até retomar a operação.':rows[0].companyCash<0?'A proposta deixa o caixa da empresa negativo no cenário fraco. Reveja custos ou estoque antes de aplicar.':'Compare os três cenários. A proposta usa seu estoque atual; não compra mercadorias nem altera capacidade instalada.';
    root.querySelector('#labApply').disabled=s.over;
  }
  function render(){
    const s=getState();if(selected!=='cafe'&&!s.ventures.some(v=>v.id===selected)){selected='cafe';choice=null}
    if(!choice||lastDay!==s.day)reset(s);
    const type=selected==='cafe'?{minPrice:10,maxPrice:35}:businessTypes[selected];
    root.innerHTML=`<label for="labBusiness">Negócio para comparar</label><select id="labBusiness"><option value="cafe" ${selected==='cafe'?'selected':''}>Rede Café Aurora</option>${s.ventures.map(v=>`<option value="${v.id}" ${selected===v.id?'selected':''}>${businessTypes[v.id].name}</option>`).join('')}</select><div class="lab-controls"><div><label for="labPrice">Preço proposto <strong id="labPriceValue"></strong></label><input id="labPrice" type="range" min="${type.minPrice}" max="${type.maxPrice}" value="${choice.price}"></div><label class="venture-staff"><input id="labStaff" type="checkbox" ${choice.staff?'checked':''}> Atendente na proposta</label>${selected==='cafe'?`<div><label for="labMarketing">Publicidade proposta</label><select id="labMarketing"><option value="0" ${choice.marketing===0?'selected':''}>Sem campanha · R$ 0/dia</option><option value="40" ${choice.marketing===40?'selected':''}>Local · R$ 40/dia</option><option value="100" ${choice.marketing===100?'selected':''}>Intensa · R$ 100/dia</option></select></div>`:''}</div><div class="table-wrap"><table><thead><tr><th>Movimento</th><th>Vendas atuais → proposta</th><th>Lucro atual da loja</th><th>Lucro proposto</th><th>Diferença</th><th>Caixa da empresa ao fechar</th></tr></thead><tbody id="labRows"></tbody></table></div><p id="labAlert" class="lesson"></p><button id="labReset" class="secondary">Usar decisões atuais</button> <button id="labApply" class="secondary">Aplicar proposta ao negócio</button>`;
    numbers();
  }
  root.oninput=e=>{if(e.target.id==='labPrice'){choice.price=Number(e.target.value);numbers()}};
  root.onchange=e=>{
    if(e.target.id==='labBusiness'){selected=e.target.value;reset(getState());render()}
    else if(e.target.id==='labStaff'){choice.staff=e.target.checked;numbers()}
    else if(e.target.id==='labMarketing'){choice.marketing=Number(e.target.value);numbers()}
  };
  root.onclick=e=>{
    if(e.target.id==='labReset'){reset(getState());render()}
    if(e.target.id==='labApply'&&confirm('Aplicar o preço, equipe e publicidade desta proposta? A decisão passa a valer nos próximos expedientes; nenhum dia será avançado agora.')&&applyStrategy(getState(),selected,choice)){
      onApply('Proposta aplicada. Decisões salvas e previsões atualizadas.');
    }
  };
  return {render};
}
