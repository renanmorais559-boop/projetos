import {projectDay,events,capacity,netCash,targetFor} from './engine.js';
import {businessTypes} from './ventures.js';
export function advise(s){
  const money=n=>n.toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
  if(s.over)return 'Sua campanha terminou. Compare os resultados por negócio e leve uma nova estratégia para a próxima partida.';
  const empty=s.ventures.find(v=>v.stock===0);
  if(empty)return `${businessTypes[empty.id].name} está sem estoque e vai cobrar operação mesmo sem vender. Reponha antes de avançar o dia.`;
  const weak=projectDay(s,events[2]),normal=projectDay(s);
  if(s.cash+weak.revenue-weak.expenses-weak.payment<0)return 'Sua reserva não cobre o cenário fraco de hoje. Reduza despesas ou avalie uma fonte de caixa antes de abrir.';
  if(s.stock===0)return 'A cafeteria está sem mercadorias. Compare o fornecedor local com o atacado e preserve parte do caixa para operar.';
  if(normal.contractFailed)return 'Você aceitou uma encomenda que ainda não pode entregar. Ajuste estoque e capacidade para evitar a multa.';
  if(normal.cafe.sold<normal.cafe.demand&&s.stock<capacity(s))return 'A cafeteria pode perder vendas por falta de estoque. Uma compra menor preserva caixa; o atacado melhora a margem se você conseguir girar o lote.';
  const days=31-s.day,gap=Math.max(0,targetFor(s)-netCash(s));
  if(!gap)return 'Seu caixa líquido já alcançou a meta. Preserve a reserva até o dia 30; uma expansão tardia pode consumir o dinheiro necessário.';
  return `Faltam ${days} dias. Para chegar à meta, o caixa líquido precisa crescer em média ${money(Math.ceil(gap/days))} por dia. Compare esse objetivo com despesas, reposição e investimentos.`;
}
