import {businessTypes} from './ventures.js';
export function createDayPlayer({dialog,onDetails}){
  const $=id=>document.getElementById(id),money=n=>n.toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
  let timer=null,result=null,finished=false,elapsed=0;
  function stop(){if(timer!==null)clearInterval(timer);timer=null;}
  function complete(){
    stop();finished=true;
    $('dayClock').textContent='18:00 · expediente encerrado';$('dayTimeline').value=100;
    $('daySales').textContent=`${result.sold} unidades vendidas`;
    $('dayAnimation').classList.remove('running');
    $('dayNumbers').hidden=false;
    $('dayNumbers').innerHTML=[['Receita',money(result.revenue)],['Custo dos produtos',money(result.goodsCost)],['Despesas',money(result.expenses)],['Lucro operacional',money(result.profit)]].map(([label,value])=>`<div><small>${label}</small><strong>${value}</strong></div>`).join('');
    $('dayOutcome').textContent=result.contractFailed?'A encomenda não foi entregue. Multa e reputação foram afetadas.':result.lost?`${result.lost} unidades de demanda ficaram sem atendimento. Confira estoque e capacidade para o próximo dia.`:'Toda a demanda foi atendida. Seus clientes saíram satisfeitos!';
    $('dayBusinessResults').innerHTML=[{name:'Café Aurora',...result.cafe},...result.ventures.map(v=>({name:businessTypes[v.id].name,...v}))].map(v=>`<div><span>${v.name} · ${v.sold} vendas</span><strong class="${v.profit>=0?'positive':'negative'}">${money(v.profit)}</strong></div>`).join('');
    $('dayPayments').textContent=result.payment?`Parcela do empréstimo: ${money(result.payment)} descontada do caixa, separada do lucro operacional.`:'Nenhuma parcela de empréstimo cobrada hoje.';
    $('dayContinue').textContent='Preparar o próximo dia';$('dayDetails').hidden=false;
  }
  $('dayContinue').onclick=()=>{if(!finished)complete();else dialog.close()};
  $('dayDetails').onclick=()=>{dialog.close();onDetails()};
  dialog.addEventListener('cancel',e=>{if(!finished){e.preventDefault();complete()}});
  dialog.addEventListener('close',()=>{stop();$('dayAnimation').classList.remove('running')});
  return {play(r,fast=false){
    stop();result=r;finished=false;elapsed=0;
    $('dayDialogTitle').textContent=`Dia ${r.day} · sua empresa em movimento`;
    $('dayEvent').textContent=r.event;$('dayClock').textContent='08:00 · abrindo as portas';
    $('daySales').textContent='O movimento está começando';$('dayTimeline').value=0;
    $('dayNumbers').hidden=true;$('dayDetails').hidden=true;
    $('dayOutcome').textContent='Acompanhe o expediente e avalie o resultado de suas decisões.';
    $('dayBusinessResults').innerHTML='';$('dayPayments').textContent='';
    $('dayContinue').textContent='Pular animação';dialog.showModal();
    if(fast||matchMedia('(prefers-reduced-motion: reduce)').matches){complete();return;}
    $('dayAnimation').classList.add('running');
    timer=setInterval(()=>{
      elapsed+=100;const ratio=Math.min(1,elapsed/2600);
      const hour=8+Math.floor(ratio*10);
      $('dayClock').textContent=`${String(hour).padStart(2,'0')}:00 · ${hour<12?'primeiros clientes':hour<16?'horário de movimento':'fechando o caixa'}`;
      $('daySales').textContent=`${Math.floor(r.sold*ratio)} unidades vendidas`;
      $('dayTimeline').value=ratio*100;
      if(ratio===1)complete();
    },100);
  }};
}
