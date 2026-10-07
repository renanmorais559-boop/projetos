import {netCash,debt,targetFor} from './engine.js';
export function summarize(s){
  const days=s.history.length;
  const sold=s.history.reduce((n,r)=>n+r.sold,0);
  const demand=s.history.reduce((n,r)=>n+r.demand,0);
  const profit=s.history.reduce((n,r)=>n+r.profit,0);
  const profitable=s.history.filter(r=>r.profit>0).length;
  const service=demand?Math.round(sold/demand*100):null;
  const missions=[
    {title:'Primeiros clientes',description:'Venda 100 unidades na partida.',value:Math.min(sold,100),target:100},
    {title:'Operação consistente',description:'Encerre 10 dias com lucro operacional positivo.',value:Math.min(profitable,10),target:10},
    {title:'Atendimento completo',description:'Atenda toda a demanda em 5 dias com clientes.',value:Math.min(s.history.filter(r=>r.demand>0&&r.lost===0).length,5),target:5},
    {title:'Sua primeira rede',description:'Abra a segunda cafeteria.',value:s.branches-1,target:1},
    {title:'Primeiro império',description:`Conclua 30 dias com ${targetFor(s).toLocaleString('pt-BR',{style:'currency',currency:'BRL'})} de caixa líquido.`,value:s.over&&s.day===31&&netCash(s)>=targetFor(s)?1:0,target:1}
    ,{title:'Diversifique',description:'Abra a padaria ou o minimercado.',value:Math.min(s.ventures.length,1),target:1}
    ,{title:'Lidere sua equipe',description:'Invista no primeiro treinamento da cafeteria.',value:Math.min(s.training,1),target:1}
  ].map(m=>({...m,done:m.value===m.target}));
  const feedback=[];
  if(s.cash<0)feedback.push('O caixa ficou negativo. Na próxima partida, reserve dinheiro para operação e parcelas antes de investir.');
  if(profitable<days/2)feedback.push('A maioria dos dias não gerou lucro. Compare margem por unidade com publicidade, salários e operação.');
  if(service!==null&&service<85)feedback.push('Parte da demanda ficou sem atendimento. Confira estoque e capacidade antes de ampliar a publicidade.');
  if(debt(s)>0)feedback.push('Ainda há dívida a pagar. O dinheiro emprestado não representa receita nem melhora o caixa líquido.');
  if(s.stock>Math.max(30,days?sold/days*3:30))feedback.push('Há bastante dinheiro parado em estoque. Compre em lotes menores e acompanhe o ritmo de vendas.');
  if(!feedback.length)feedback.push('Sua operação está equilibrada. Compare o retorno de uma expansão com o caixa que precisa manter em reserva.');
  const outcome=!s.over?'Partida em andamento':s.cash<0?'Empresa sem caixa':netCash(s)>=targetFor(s)?'Meta alcançada!':'Ciclo concluído: hora de ajustar a estratégia';
  return {days,sold,demand,profit,profitable,service,missions,feedback,outcome,netCash:netCash(s)};
}
