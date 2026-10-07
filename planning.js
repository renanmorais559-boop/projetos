import {projectDay,events,capacity} from './engine.js';
export function forecast(s){
  const scenarios=[['Movimento fraco',events[2]],['Dia normal',events[0]],['Movimento forte',events[1]]].map(([label,event])=>{
    const result=projectDay(s,event);
    return {...result,label,cash:s.cash+result.revenue-result.expenses-result.payment};
  });
  const high=scenarios[2],low=scenarios[0],alerts=[];
  if(low.contractFailed)alerts.push('A encomenda aceita não pode ser entregue com o estoque ou capacidade atuais. A projeção inclui R$ 80 de multa; haverá perda de reputação.');
  if(s.stock<Math.min(high.demand,capacity(s)))alerts.push(`Seu estoque pode limitar as vendas. Faltam ${Math.min(high.demand,capacity(s))-s.stock} unidades para atender o cenário forte dentro da sua capacidade. Compare os fornecedores: lotes grandes são mais baratos por unidade, mas a compra reduz sua reserva de caixa.`);
  if(high.demand>capacity(s))alerts.push('No cenário forte, sua capacidade é menor que a demanda. Compare equipe e equipamento com o custo de atender mais clientes.');
  if(low.cash<0)alerts.push('No cenário fraco, o caixa fica negativo e a partida termina. Revise despesas ou prepare uma reserva antes de abrir.');
  if(low.profit<0)alerts.push('No cenário fraco, a operação dá prejuízo. Ajuste a margem ou reduza custos; publicidade não garante vendas suficientes.');
  if(!alerts.length)alerts.push('Estoque, capacidade e caixa cobrem os três cenários atuais. Preserve a reserva ao fazer novos investimentos.');
  return {scenarios,alerts};
}
