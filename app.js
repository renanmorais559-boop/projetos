import {restockPlan,replenishCompany} from './restocking.js';
import {financialReport,exportLedger} from './reports.js';
import {initial,buy,runDay,expand,districts,operationCost,borrow,repay,debt,netCash,upgrade,capacity,scenarios,targetFor,suppliers,inventoryCost,breakEven,availableOrder,acceptOrder,trainTeam,cafePayroll,continueCompany} from './engine.js';
import {advise} from './advisor.js';
import {createDayPlayer} from './day-player.js';
import {createBusinessUI} from './business-ui.js';
import {businessTypes} from './ventures.js';
import {availableDilemma,resolveDilemma} from './story.js';
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
let portfolio;
let dayPlayer;
let fastDays=false;
const screens={operation:'Operação',city:'Cidade',business:'Negócios',investment:'Investimentos',results:'Resultados'};
function showScreen(){
  for(const node of document.querySelectorAll('[data-view]'))node.hidden=node.dataset.view!==selectedScreen||(node.id==='planning'&&state.over)||(node.id==='review'&&!state.over)||(node.id==='storyCard'&&!availableDilemma(state));
  for(const button of document.querySelectorAll('[data-screen]'))button.setAttribute('aria-pressed',String(button.dataset.screen===selectedScreen));
  town?.setActive(selectedScreen==='city');
  $('screenStatus').textContent=`${screens[selectedScreen]} · Dia ${state.sandbox?`${state.day} · Modo livre`:`${Math.min(30,state.day)} de 30`}`;
}
$('navigation').onclick=e=>{const button=e.target.closest('[data-screen]');if(button&&Object.hasOwn(screens,button.dataset.screen)){selectedScreen=button.dataset.screen;showScreen()}};
function flash(message){$('actionToast').textContent=message;}
function persist(){ $('saveStatus').textContent=saveGame(storage,state)?'Progresso salvo neste navegador.':'Não foi possível salvar. Mantenha esta página aberta para continuar.'; }
function syncControls(){ $('supplier').value='regular';$('quantity').value=20; $('scenario').value=state.scenario;scenarioPreview(); $('price').value=state.price; $('marketing').value=state.marketing; $('staff').checked=state.staff; }
function render(){
  $('coachText').textContent=advise(state);
  portfolio?.render();
  const story=availableDilemma(state);
  $('storyCard').hidden=!story;
  $('storyTitle').textContent=story?.title??'';
  $('storyText').textContent=story?.text??'';
  $('storyChoices').innerHTML=story?story.choices.map(c=>`<button class="story-choice" data-story-choice="${c.id}" ${state.cash<c.cost?'disabled':''}><strong>${c.title}</strong><span>${c.description}</span></button>`).join(''):'';
  $('trainingStatus').textContent=state.staff?`Treinamento nível ${state.training}/2 · capacidade da rede ${capacity(state)} · salários ${money(cafePayroll(state))}/dia.`:'Contrate um atendente da cafeteria para liberar o treinamento.';
  $('trainTeam').disabled=state.over||!state.staff||state.training>=2||state.cash<(state.training===0?300:500);
  $('trainTeam').textContent=state.training>=2?'Equipe no nível máximo':`Treinar equipe · ${money(state.training===0?300:500)}`;
  $('staffDescription').textContent=`Atendente da cafeteria · ${money(cafePayroll({...state,staff:true}))}/dia · +${20+state.training*8} de capacidade`;
  const latest=state.history.at(-1);
  $('businessLedger').innerHTML=latest?([{name:'Rede Café Aurora',...latest.cafe},...latest.ventures.map(v=>({name:businessTypes[v.id].name,...v}))]).map(v=>`<tr><td>${v.name}</td><td>${v.sold}</td><td>${money(v.revenue)}</td><td>${money(v.expenses)}</td><td class="${v.profit>=0?'positive':'negative'}">${money(v.profit)}</td></tr>`).join(''):'<tr><td colspan="5">Encerre um dia para comparar os negócios.</td></tr>';

  const milestone=state.sandbox?(state.day<40?'Dia 40: desbloqueie Aurora Tecnologia':'Modo livre: desenvolva seu grupo empresarial'):state.day<8?'Dia 8: desbloqueie a padaria':state.day<15?'Dia 15: desbloqueie o minimercado':'Última etapa: consolide sua empresa até o dia 30';
  $('milestoneText').textContent=milestone;
  $('milestoneProgress').value=Math.min(state.day-1,30);
  $('goalCaption').textContent=state.sandbox?`Campanha ${state.campaign.won?'conquistada':'concluída'} · agora em modo livre`:'caixa líquido até o dia 30';
  $('goalValue').textContent=money(targetFor(state));
  $('progress').max=targetFor(state);
  $('activeScenario').textContent=`Cenário atual: ${scenarios[state.scenario].name}`;
  $('profitChart').innerHTML=profitChart(state.history.slice(-30));
  $('chartSummary').textContent=state.history.length?`${state.history.filter(r=>r.profit>0).length} dias lucrativos em ${state.history.length} dias no diário. Total da empresa: ${state.totals.days} dias.`:'Abra a loja para registrar seu primeiro resultado.';
  const order=availableOrder(state);
  $('acceptOrder').disabled=!order||state.contract!==null;
  $('orderStatus').textContent=order?`${order.client}: ${order.quantity} unidades por ${money(order.price)} cada · receita ${money(order.quantity*order.price)}. ${state.contract!==null?'Aceita: entrega automática ao encerrar este dia.':'Disponível só hoje. Você pode ignorar sem penalidade.'}`:`Novas encomendas aparecem nos dias 5, 12 e 20${state.sandbox?' de cada ciclo de 30 dias':''}. Não há proposta disponível agora.`;
  $('orderReadiness').textContent=order?`Estoque ${state.stock} / ${order.quantity} exigido · capacidade ${capacity(state)} / ${order.quantity} exigida. ${state.stock<order.quantity||capacity(state)<order.quantity?'Você ainda não consegue entregar: ajuste estoque e capacidade antes de encerrar o dia.':'A encomenda cabe agora; ela terá prioridade sobre o balcão.'}`:'';
  const plan=forecast(state);
  $('planning').hidden=state.over;
  $('forecastBody').innerHTML=plan.scenarios.map(r=>`<tr><td>${r.label}</td><td>${r.demand}</td><td>${r.sold}</td><td class="${r.profit>=0?'positive':'negative'}">${money(r.profit)}</td><td class="${r.cash>=0?'positive':'negative'}">${money(r.cash)}</td></tr>`).join('');
  $('planningAlerts').replaceChildren(...plan.alerts.map(text=>{const p=document.createElement('p');p.textContent=text;return p}));
  const summary=summarize(state);
  $('missionCount').textContent=`${summary.missions.filter(m=>m.done).length} / ${summary.missions.length} conquistas`;
  $('missions').innerHTML=summary.missions.map(m=>`<article class="mission ${m.done?'completed':''}"><strong>${m.done?'✓':'◇'} ${m.title}</strong><p>${m.description}</p><progress max="${m.target}" value="${m.value}" aria-label="${m.title}"></progress><span>${m.value} / ${m.target}${m.done?' · Conquistado':''}</span></article>`).join('');
  $('continueCompany').hidden=!(state.over&&!state.sandbox&&state.day===31&&state.cash>=0);
  $('campaignRecord').textContent=state.campaign?`Campanha de 30 dias: ${state.campaign.won?'meta alcançada':'meta não alcançada'} · caixa líquido final ${money(state.campaign.netCash)}. Este resultado fica preservado no modo livre.`:'';
  renderManagement();
  $('reviewTitle').textContent=summary.outcome;
  $('review').hidden=!state.over;
  $('reviewStats').textContent=`${summary.days} dias · ${summary.sold} vendas · atendimento ${summary.service===null?'sem demanda':summary.service+'%'} · lucro operacional acumulado ${money(summary.profit)} · caixa líquido ${money(summary.netCash)}`;
  $('reviewAdvice').replaceChildren(...summary.feedback.map(text=>{const p=document.createElement('p');p.textContent=text;return p}));

  $('stats').innerHTML=[['Caixa da empresa',money(state.cash)],['Estoque da cafeteria',`${state.stock} unidades`],['Reputação da cafeteria',`${state.reputation}/100`],['Lucro da empresa',money(state.totals.profit)]].map(([label,value])=>`<div class="stat"><span>${label}</span><strong>${value}</strong></div>`).join('');
  $('day').textContent=state.sandbox?`DIA ${state.day} · LIVRE`:`DIA ${Math.min(30,state.day)} / 30`;$('progress').value=Math.max(0,netCash(state));
  $('creditStatus').textContent=state.loan?`Saldo a pagar: ${money(debt(state))} · ${state.loan.remaining} parcelas diárias de R$ 220. Caixa após quitar: ${money(netCash(state))}.`:`Sem dívida. Caixa líquido: ${money(netCash(state))}.`;
  $('borrow').disabled=state.over||Boolean(state.loan)||(!state.sandbox&&state.day>21);
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
  $('history').innerHTML=state.history.slice(-Number($('historyDays').value)).reverse().map(r=>`<tr><td>${r.day}</td><td>${r.sold} / ${r.demand} clientes</td><td>${r.contractFailed?'Falhou':r.contractSold?`${r.contractSold} unidades`: '—'}</td><td>${money(r.revenue)}</td><td>${money(r.goodsCost)}</td><td>${money(r.expenses)}</td><td>${money(r.payment)}</td><td class="${r.profit>=0?'positive':'negative'}">${money(r.profit)}</td></tr>`).join('');
  for(const id of ['next','buy','price','marketing','staff','quantity','supplier'])$(id).disabled=state.over;
  showScreen();
}
function renderManagement(){
  const plan=restockPlan(state,Number($('restockDays').value));
  $('restockRows').innerHTML=plan.items.map(i=>`<tr><td>${i.name}</td><td>${i.stock}</td><td>${i.target}</td><td>${i.quantity}</td><td>${money(i.cost)}</td></tr>`).join('');
  $('restockTotal').textContent=`Compra conjunta: ${money(plan.total)} · caixa restante: ${money(state.cash-plan.total)}. Lojas suspensas ficam fora da compra.`;
  $('restockAll').disabled=state.over||plan.total===0||state.cash<plan.total;
  const r=financialReport(state);
  $('financialPeriod').textContent=r.days?`Dias ${r.first} a ${r.last} · ${r.days} dias encerrados`:'Aguardando o primeiro expediente';
  $('financialStats').innerHTML=[['Receita',money(r.revenue)],['Lucro operacional',money(r.profit)],['Margem operacional',r.margin===null?'—':r.margin.toFixed(1)+'%'],['Atendimento',r.service===null?'—':r.service.toFixed(1)+'%']].map(([k,v])=>`<div class="stat"><span>${k}</span><strong>${v}</strong></div>`).join('');
  $('financialRows').innerHTML=r.businesses.map(b=>`<tr><td>${b.name}</td><td>${b.days}</td><td>${money(b.revenue)}</td><td>${money(b.goodsCost+b.expenses)}</td><td class="${b.profit>=0?'positive':'negative'}">${money(b.profit)}</td></tr>`).join('');
  $('financialComparison').textContent=r.days===7&&r.previousDays===7?`Lucro dos sete dias anteriores: ${money(r.previousProfit)} · variação: ${money(r.profit-r.previousProfit)}.`:'A comparação com a semana anterior aparece após 14 dias completos.';
  $('exportLedger').disabled=!state.history.length;
  $('historyWindow').textContent=`Mostrando ${Math.min(state.history.length,Number($('historyDays').value))} de ${state.history.length} dias disponíveis (máximo 120). Os totais e conquistas preservam os ${state.totals.days} dias da empresa; o gráfico exibe até 30 dias recentes.`;
}
$('historyDays').onchange=render;
$('restockDays').onchange=renderManagement;
$('restockAll').onclick=()=>{const days=Number($('restockDays').value),plan=restockPlan(state,days);if(!confirm(`Comprar ${money(plan.total)} em estoque para as lojas ativas? A estimativa usa demanda normal por ${days} dias; eventos e reputação podem mudar o consumo. Caixa restante: ${money(state.cash-plan.total)}.`))return;if(replenishCompany(state,days)){flash('Compra conjunta recebida. Estoques e caixa atualizados.');persist();render()}};
$('continueCompany').onclick=()=>{if(continueCompany(state)){selectedScreen='operation';flash('Modo livre iniciado. Você mantém caixa, estoque, dívida e todas as lojas; a empresa pode continuar por novos dias.');persist();render()}};
$('exportLedger').onclick=()=>{const url=URL.createObjectURL(new Blob([exportLedger(state)],{type:'text/csv;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download=`primeiro-imperio-financas-dia-${state.day}.csv`;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);flash('Relatório CSV preparado para abrir em uma planilha. Linhas consolidadas e por loja são identificadas separadamente.');};
$('storyChoices').onclick=e=>{const button=e.target.closest('[data-story-choice]');if(button&&resolveDilemma(state,button.dataset.storyChoice)){flash('Escolha registrada. Caixa, reputação e demanda foram atualizados.');persist();render()}};
$('trainTeam').onclick=()=>{const cost=state.training===0?300:500;if(!confirm(`Investir ${money(cost)} em treinamento? A equipe ganha +8 de capacidade, melhora a reputação quando atende toda a demanda e recebe +R$ 20/dia de salário.`))return;if(trainTeam(state)){flash('Treinamento concluído. Equipe mais produtiva e novos salários na previsão.');persist();render()}};
$('acceptOrder').onclick=()=>{
  const order=availableOrder(state);if(!order)return;
  if(!confirm(`Aceitar ${order.quantity} unidades a ${money(order.price)} cada para ${order.client}? A entrega usa estoque e capacidade antes do balcão. Se não conseguir entregar, pagará R$ 80 e perderá 8 pontos de reputação.`))return;
  if(acceptOrder(state)){ $('notice').textContent='Encomenda aceita. Prepare estoque e capacidade antes de abrir.';persist();render()}
};
$('exportGame').onclick=()=>{
  try{
    const blob=new Blob([encodeGame(state)],{type:'application/json'});
    const url=URL.createObjectURL(blob),link=document.createElement('a');
    link.href=url;link.download=`primeiro-imperio-dia-${state.day}.json`;
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
    if(!confirm(`Importar a partida do dia ${restored.day} e substituir a atual? Baixe um backup antes se quiser preservá-la.`))return;
    state=restored;selectedScreen=state.over?'results':'operation';selectedDistrict=state.district??'center';syncControls();
    $('notice').textContent='';
    if(state.history.length)showResult(state.history.at(-1));
    else{ $('report').textContent='Partida importada. Prepare sua loja para o primeiro dia.'; $('lesson').textContent='Compare margem, estoque e capacidade antes de abrir.'; }
    persist();render();
    $('backupNotice').textContent='Partida importada. Você pode continuar de onde parou.';
  }catch{ $('backupNotice').textContent='Arquivo inválido, incompatível ou maior que 1 MB. A partida atual foi preservada.'; }
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
  $('report').textContent=`${r.event} Sua empresa vendeu ${r.sold} unidades para uma demanda total de ${r.demand}. Faturamento: ${money(r.revenue)}. Lucro operacional do dia: ${money(r.profit)}. Parcela: ${money(r.payment)}.${r.lost?` ${r.lost} unidades de demanda não foram atendidas.`:''}`;
  $('lesson').textContent=r.lost?'Demanda sem atendimento prejudica a reputação. Compare estoque e capacidade antes de contratar: salários só compensam quando as vendas extras cobrem seu custo.':r.profit<0?'Houve vendas, mas o dia deu prejuízo. Compare a receita com o custo dos lotes vendidos e os custos diários; comprar mais barato ajuda, mas prende dinheiro em estoque.':'Um dia lucrativo! Observe o caixa: parte dele está investida em estoque. Guarde uma reserva para dias de demanda baixa.';
  if(r.ventures.length)$('report').textContent+=` ${r.ventures.length} outros negócios incluídos no resultado.`;
  if(r.contractSold)$('report').textContent+=` Encomenda entregue: ${r.contractSold} unidades.`;
  if(r.contractFailed)$('report').textContent+=' Encomenda não entregue: multa de R$ 80 incluída nas despesas e perda de 8 pontos de reputação.';
  if(state.over)$('report').textContent+=state.cash<0?' Sua empresa ficou sem caixa. Recomece e tente manter uma reserva.':netCash(state)>=targetFor(state)?' Meta alcançada! Você concluiu seus primeiros 30 dias.':' Você concluiu os 30 dias. A meta não foi alcançada; experimente outra estratégia!';
}
$('next').onclick=()=>{
  const r=runDay(state);
  if(!r)return;
  showResult(r);if(state.over)selectedScreen='results';persist();render();dayPlayer.play(r,fastDays);
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

$('fastDays').onclick=()=>{fastDays=!fastDays;$('fastDays').setAttribute('aria-pressed',String(fastDays));$('fastDays').textContent=fastDays?'⚡ Resumo direto':'▶ Animar expediente'};
dayPlayer=createDayPlayer({dialog:$('dayDialog'),onDetails:()=>{selectedScreen='business';showScreen()}});
portfolio=createBusinessUI($('businessCards'),()=>state,message=>{flash(message);persist();render()});
town=createTown({canvas:$('townCanvas'),info:$('townInfo'),inspect:$('inspectSite'),controls:$('townControls'),onChoose:id=>{if(state.over||state.branches===2){$('townInfo').textContent='A localização da sua filial já está definida ou a partida terminou.';return;}selectedDistrict=id;render()}});
syncControls();
if(state.history.length)showResult(state.history.at(-1));
$('saveStatus').textContent=loaded.status==='loaded'?'Partida retomada. Progresso salvo neste navegador.':loaded.status==='invalid'?'O salvamento anterior não pôde ser lido. Uma nova partida foi iniciada.':loaded.status==='unavailable'?'Armazenamento indisponível. Esta partida não será salva.':'O progresso será salvo automaticamente neste navegador.';
render();
