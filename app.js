import {initial,buy,runDay,expand,districts,operationCost,borrow,repay,debt,netCash,upgrade,capacity,scenarios,targetFor,suppliers,inventoryCost,breakEven,availableOrder,acceptOrder} from './engine.js';
import {createTown} from './town.js';
import {profitChart} from './analytics.js';
import {forecast} from './planning.js';
import {summarize} from './progress.js';
import {loadGame,saveGame,encodeGame,decodeGame,MAX_BACKUP_BYTES} from './storage.js';
const $=id=>document.getElementById(id),money=n=>n.toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
let storage;
try{storage=window.localStorage}catch{}
const loaded=loadGame(storage);
let state=loaded.state;
let selectedDistrict=state.district??'center';
let selectedScreen=state.over?'results':'operation';
let town;
const screens={operation:'Operação',city:'Cidade',investment:'Investimentos',results:'Resultados'};
function showScreen(){
  for(const node of document.querySelectorAll('[data-view]'))node.hidden=node.dataset.view!==selectedScreen||(node.id==='planning'&&state.over)||(node.id==='review'&&!state.over);
  for(const button of document.querySelectorAll('[data-screen]'))button.setAttribute('aria-pressed',String(button.dataset.screen===selectedScreen));
  town?.setActive(selectedScreen==='city');
  $('screenStatus').textContent=`${screens[selectedScreen]} · Dia ${Math.min(30,state.day)} de 30`;
}
$('navigation').onclick=e=>{const button=e.target.closest('[data-screen]');if(button&&Object.hasOwn(screens,button.dataset.screen)){selectedScreen=button.dataset.screen;showScreen()}};
function persist(){ $('saveStatus').textContent=saveGame(storage,state)?'Progresso salvo neste navegador.':'Não foi possível salvar. Mantenha esta página aberta para continuar.'; }
function syncControls(){ $('supplier').value='regular';$('quantity').value=20; $('scenario').value=state.scenario;scenarioPreview(); $('price').value=state.price; $('marketing').value=state.marketing; $('staff').checked=state.staff; }
function render(){
  $('goalValue').textContent=money(targetFor(state));
  $('progress').max=targetFor(state);
  $('activeScenario').textContent=`Cenário atual: ${scenarios[state.scenario].name}`;
  $('profitChart').innerHTML=profitChart(state.history);
  $('chartSummary').textContent=state.history.length?`${state.history.filter(r=>r.profit>0).length} dias lucrativos em ${state.history.length} dias jogados.`:'Abra a loja para registrar seu primeiro resultado.';
  const order=availableOrder(state);
  $('acceptOrder').disabled=!order||state.contract!==null;
  $('orderStatus').textContent=order?`${order.client}: ${order.quantity} unidades por ${money(order.price)} cada · receita ${money(order.quantity*order.price)}. ${state.contract!==null?'Aceita: entrega automática ao encerrar este dia.':'Disponível só hoje. Você pode ignorar sem penalidade.'}`:'Novas encomendas aparecem nos dias 5, 12 e 20. Não há proposta disponível agora.';
  $('orderReadiness').textContent=order?`Estoque ${state.stock} / ${order.quantity} exigido · capacidade ${capacity(state)} / ${order.quantity} exigida. ${state.stock<order.quantity||capacity(state)<order.quantity?'Você ainda não consegue entregar: ajuste estoque e capacidade antes de encerrar o dia.':'A encomenda cabe agora; ela terá prioridade sobre o balcão.'}`:'';
  const plan=forecast(state);
  $('planning').hidden=state.over;
  $('forecastBody').innerHTML=plan.scenarios.map(r=>`<tr><td>${r.label}</td><td>${r.demand}</td><td>${r.sold}</td><td class="${r.profit>=0?'positive':'negative'}">${money(r.profit)}</td><td class="${r.cash>=0?'positive':'negative'}">${money(r.cash)}</td></tr>`).join('');
  $('planningAlerts').replaceChildren(...plan.alerts.map(text=>{const p=document.createElement('p');p.textContent=text;return p}));
  const summary=summarize(state);
  $('missionCount').textContent=`${summary.missions.filter(m=>m.done).length} / ${summary.missions.length} conquistas`;
  $('missions').innerHTML=summary.missions.map(m=>`<article class="mission ${m.done?'completed':''}"><strong>${m.done?'✓':'◇'} ${m.title}</strong><p>${m.description}</p><progress max="${m.target}" value="${m.value}" aria-label="${m.title}"></progress><span>${m.value} / ${m.target}${m.done?' · Conquistado':''}</span></article>`).join('');
  $('reviewTitle').textContent=summary.outcome;
  $('review').hidden=!state.over;
  $('reviewStats').textContent=`${summary.days} dias · ${summary.sold} vendas · atendimento ${summary.service===null?'sem demanda':summary.service+'%'} · lucro operacional acumulado ${money(summary.profit)} · caixa líquido ${money(summary.netCash)}`;
  $('reviewAdvice').replaceChildren(...summary.feedback.map(text=>{const p=document.createElement('p');p.textContent=text;return p}));

  $('stats').innerHTML=[['Caixa disponível',money(state.cash)],['Estoque',`${state.stock} unidades`],['Reputação',`${state.reputation}/100`],['Lucro acumulado',money(state.history.reduce((a,r)=>a+r.profit,0))]].map(([label,value])=>`<div class="stat"><span>${label}</span><strong>${value}</strong></div>`).join('');
  $('day').textContent=`DIA ${Math.min(30,state.day)} / 30`;$('progress').value=Math.max(0,netCash(state));
  $('creditStatus').textContent=state.loan?`Saldo a pagar: ${money(debt(state))} · ${state.loan.remaining} parcelas diárias de R$ 220. Caixa após quitar: ${money(netCash(state))}.`:`Sem dívida. Caixa líquido: ${money(netCash(state))}.`;
  $('borrow').disabled=state.over||Boolean(state.loan)||state.day>21;
  $('repay').disabled=state.over||!state.loan||state.cash<debt(state);
  $('upgrade').disabled=state.over||state.equipment||state.cash<900;
  $('upgrade').textContent=state.equipment?'Máquina profissional instalada':'Comprar máquina · R$ 900';
  $('equipmentStatus').textContent=state.equipment?'Sua rede tem +15 atendimentos/dia e economia de R$ 20/dia na operação.':`Investimento único de R$ 900. Caixa após comprar: ${money(state.cash-900)}. Capacidade: ${capacity(state)} → ${capacity(state)+15} vendas/dia.`;
  const threshold=breakEven(state);
  $('breakEven').textContent=threshold===null?'O estoque e a capacidade atuais não permitem cobrir os custos operacionais. Revise preço, custos ou reposição antes de abrir.':`Sem considerar encomendas, pelo menos ${threshold} vendas de balcão/dia cobrem os custos operacionais com os lotes atuais. Capacidade: ${capacity(state)}. Parcelas e investimentos exigem caixa adicional.`;
  $('inventoryValue').textContent=`Valor de custo do estoque: ${money(inventoryCost(state))}. Os lotes mais antigos são vendidos primeiro.`;
  purchasePreview();
  $('priceValue').textContent=money(state.price);
  $('network').textContent=`${state.branches} unidade${state.branches>1?'s':''} · capacidade de ${capacity(state)} vendas/dia · operação ${money(operationCost(state))}/dia`;
  town?.setState(selectedDistrict,state.district);
  const location=districts[selectedDistrict];
  $('districtMap').innerHTML=Object.entries(districts).map(([id,d])=>`<label class="district ${id===selectedDistrict?'selected':''}"><input type="radio" name="district" value="${id}" ${id===selectedDistrict?'checked':''} ${state.over||state.branches===2?'disabled':''}><strong>${d.name}</strong><span>${d.description}</span><span>Abertura ${money(d.cost)} · operação +${money(d.rent)}/dia</span><span>Demanda base +${d.demand} · capacidade +25</span>${state.district===id?'<b>Sua segunda unidade</b>':''}</label>`).join('');
  $('expand').disabled=state.over||state.branches===2||state.cash<location.cost;
  $('expand').textContent=state.branches===2?`Unidade em ${districts[state.district].name}`:`Abrir em ${location.name} · ${money(location.cost)}`;
  $('investmentPreview').textContent=state.branches===2?'Sua localização está definida. Mantenha estoque e caixa para operar as duas lojas.':`Após abrir: ${money(state.cash-location.cost)} em caixa. Custos de operação da rede: ${money(90+location.rent-(state.equipment?20:0))}/dia, antes de publicidade e salários.`;
  $('history').innerHTML=state.history.slice().reverse().map(r=>`<tr><td>${r.day}</td><td>${r.sold} / ${r.demand} clientes</td><td>${r.contractFailed?'Falhou':r.contractSold?`${r.contractSold} unidades`: '—'}</td><td>${money(r.revenue)}</td><td>${money(r.goodsCost)}</td><td>${money(r.expenses)}</td><td>${money(r.payment)}</td><td class="${r.profit>=0?'positive':'negative'}">${money(r.profit)}</td></tr>`).join('');
  for(const id of ['next','buy','price','marketing','staff','quantity','supplier'])$(id).disabled=state.over;
  showScreen();
}
$('acceptOrder').onclick=()=>{
  const order=availableOrder(state);if(!order)return;
  if(!confirm(`Aceitar ${order.quantity} unidades a ${money(order.price)} cada para ${order.client}? A entrega usa estoque e capacidade antes do balcão. Se não conseguir entregar, pagará R$ 80 e perderá 8 pontos de reputação.`))return;
  if(acceptOrder(state)){ $('notice').textContent='Encomenda aceita. Prepare estoque e capacidade antes de abrir.';persist();render()}
};
$('exportGame').onclick=()=>{
  try{
    const blob=new Blob([encodeGame(state)],{type:'application/json'});
    const url=URL.createObjectURL(blob),link=document.createElement('a');
    link.href=url;link.download=`primeiro-imperio-dia-${Math.min(state.day,30)}.json`;
    document.body.append(link);link.click();link.remove();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
    $('backupNotice').textContent='Backup preparado para download. Guarde o arquivo para importar depois.';
  }catch{ $('backupNotice').textContent='Não foi possível baixar o backup. Sua partida continua aberta.'; }
};
$('importGame').onchange=async e=>{
  const file=e.target.files?.[0];if(!file)return;
  try{
    if(file.size>MAX_BACKUP_BYTES)throw new Error('size');
    const restored=decodeGame(await file.text());
    if(!confirm(`Importar a partida do dia ${Math.min(restored.day,30)} e substituir a atual? Baixe um backup antes se quiser preservá-la.`))return;
    state=restored;selectedScreen=state.over?'results':'operation';selectedDistrict=state.district??'center';syncControls();
    $('notice').textContent='';
    if(state.history.length)showResult(state.history.at(-1));
    else{ $('report').textContent='Partida importada. Prepare sua loja para o primeiro dia.'; $('lesson').textContent='Compare margem, estoque e capacidade antes de abrir.'; }
    persist();render();
    $('backupNotice').textContent='Partida importada. Você pode continuar de onde parou.';
  }catch{ $('backupNotice').textContent='Arquivo inválido, incompatível ou maior que 100 KB. A partida atual foi preservada.'; }
  finally{e.target.value='';}
};
$('upgrade').onclick=()=>{if(!confirm('Investir R$ 900 na máquina? Ela adiciona 15 atendimentos por dia na rede e economiza R$ 20/dia de operação. Não garante demanda adicional.'))return;if(upgrade(state)){ $('notice').textContent='Máquina instalada!'; $('lesson').textContent='Economizar R$ 20/dia recuperaria R$ 900 em 45 dias. Para compensar antes, a capacidade extra precisa atender clientes que você estava perdendo. Comprar equipamento não cria demanda.';persist();render()}};
$('borrow').onclick=()=>{if(!confirm('Receber R$ 2.000 e pagar 10 parcelas diárias de R$ 220, começando hoje? Total: R$ 2.200 (R$ 200 de juros fixos).'))return;if(borrow(state)){ $('notice').textContent='Crédito recebido. A parcela será cobrada ao encerrar cada dia.'; $('lesson').textContent='Empréstimo aumenta o caixa, mas não é receita. Compare a margem adicional do investimento com juros e parcelas; reserve dinheiro para pagar mesmo em dias fracos.';persist();render()}};
$('repay').onclick=()=>{if(!confirm(`Quitar ${money(debt(state))}? Neste contrato fictício, a antecipação não reduz os juros.`))return;if(repay(state)){ $('notice').textContent='Empréstimo quitado.';persist();render()}};
$('districtMap').onchange=e=>{if(e.target.name==='district'&&Object.hasOwn(districts,e.target.value)){selectedDistrict=e.target.value;render()}};
$('expand').onclick=()=>{
  const location=districts[selectedDistrict];
  if(!confirm(`Investir ${money(location.cost)} em ${location.name}? A operação custará mais ${money(location.rent)} por dia. Estoque e preços serão compartilhados.`))return;
  if(expand(state,selectedDistrict)){
    $('notice').textContent=`Segunda unidade aberta em ${location.name}! Prepare estoque para a nova demanda.`;
    $('lesson').textContent='O ponto comercial muda a demanda e o custo fixo. Movimento alto só gera lucro se houver capacidade e estoque; preserve uma reserva depois do investimento.';
    persist();render();
  }
};
$('price').oninput=e=>{state.price=Number(e.target.value);persist();render()};
$('marketing').onchange=e=>{state.marketing=Number(e.target.value);persist();render()};
$('staff').onchange=e=>{state.staff=e.target.checked;persist();render()};
function purchasePreview(){
  const offer=suppliers[$('supplier').value],quantity=Number($('quantity').value);
  $('quantity').min=offer.min;
  $('purchasePreview').textContent=Number.isSafeInteger(quantity)&&quantity>=offer.min&&quantity<=1000?`Compra: ${money(quantity*offer.cost)} · caixa após comprar: ${money(state.cash-quantity*offer.cost)}.`:`${offer.name}: mínimo ${offer.min} unidades, máximo 1.000 por compra.`;
}
$('supplier').onchange=purchasePreview;
$('quantity').oninput=purchasePreview;
$('buy').onclick=()=>{$('notice').textContent=buy(state,Number($('quantity').value),$('supplier').value)?'Estoque recebido!':'Confira quantidade mínima do fornecedor, limite de 1.000 unidades e caixa disponível.';persist();render()};
function showResult(r){
  $('notice').textContent='';
  $('report').textContent=`${r.event} Você vendeu ${r.sold} unidades para uma demanda total de ${r.demand}. Faturamento: ${money(r.revenue)}. Lucro operacional do dia: ${money(r.profit)}. Parcela: ${money(r.payment)}.${r.lost?` ${r.lost} unidades de demanda não foram atendidas.`:''}`;
  $('lesson').textContent=r.lost?'Demanda sem atendimento prejudica a reputação. Compare estoque e capacidade antes de contratar: salários só compensam quando as vendas extras cobrem seu custo.':r.profit<0?'Houve vendas, mas o dia deu prejuízo. Compare a receita com o custo dos lotes vendidos e os custos diários; comprar mais barato ajuda, mas prende dinheiro em estoque.':'Um dia lucrativo! Observe o caixa: parte dele está investida em estoque. Guarde uma reserva para dias de demanda baixa.';
  if(r.contractSold)$('report').textContent+=` Encomenda entregue: ${r.contractSold} unidades.`;
  if(r.contractFailed)$('report').textContent+=' Encomenda não entregue: multa de R$ 80 incluída nas despesas e perda de 8 pontos de reputação.';
  if(state.over)$('report').textContent+=state.cash<0?' Sua empresa ficou sem caixa. Recomece e tente manter uma reserva.':netCash(state)>=targetFor(state)?' Meta alcançada! Você concluiu seus primeiros 30 dias.':' Você concluiu os 30 dias. A meta não foi alcançada; experimente outra estratégia!';
}
$('next').onclick=()=>{
  const r=runDay(state);
  if(!r)return;
  showResult(r);if(state.over)selectedScreen='results';persist();render();
};
function scenarioPreview(){
  const scenario=scenarios[$('scenario').value];
  $('scenarioPreview').textContent=`${scenario.description} Capital: ${money(scenario.cash)} · meta: ${money(scenario.goal)} de caixa líquido · 30 dias. Regras de demanda, custos e crédito são iguais nos três cenários.`;
}
function startGame(scenario){
  state=initial(scenario);selectedScreen='operation';selectedDistrict='center';syncControls();
  $('notice').textContent='';$('backupNotice').textContent='';
  $('report').textContent=`${scenarios[scenario].name}: prepare sua loja para o primeiro dia.`;
  $('lesson').textContent='Compare margem e custos e mantenha uma reserva de caixa.';
  persist();render();
}
$('scenario').innerHTML=Object.entries(scenarios).map(([id,s])=>`<option value="${id}">${s.name}</option>`).join('');
$('scenario').onchange=scenarioPreview;
$('newGame').onclick=()=>{const chosen=$('scenario').value;if(!confirm(`Iniciar ${scenarios[chosen].name} e substituir a partida salva? Baixe um backup para preservar o progresso atual.`))return;startGame(chosen)};
$('reset').onclick=()=>{if(!confirm('Recomeçar o mesmo cenário e substituir a partida salva?'))return;startGame(state.scenario)};

town=createTown({canvas:$('townCanvas'),info:$('townInfo'),inspect:$('inspectSite'),controls:$('townControls'),onChoose:id=>{if(state.over||state.branches===2){$('townInfo').textContent='A localização da sua filial já está definida ou a partida terminou.';return;}selectedDistrict=id;render()}});
syncControls();
if(state.history.length)showResult(state.history.at(-1));
$('saveStatus').textContent=loaded.status==='loaded'?'Partida retomada. Progresso salvo neste navegador.':loaded.status==='invalid'?'O salvamento anterior não pôde ser lido. Uma nova partida foi iniciada.':loaded.status==='unavailable'?'Armazenamento indisponível. Esta partida não será salva.':'O progresso será salvo automaticamente neste navegador.';
render();
