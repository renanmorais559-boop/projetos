import {marketInfluence} from './competition.js';
import {operationCost,cafePayroll,creditTerms} from './engine.js';
import {businessTypes,businessOperation} from './ventures.js';
import {restockPlan} from './restocking.js';
export function workingCapital(s,days=3){
  if(!Number.isInteger(days)||days<1||days>7)throw new Error('Prazo inválido.');
  const replenishment=restockPlan(s,days).total;
  const daily=operationCost(s)+s.marketing+cafePayroll(s)+marketInfluence('cafe',s.price,s.positioning,s.day,s.sandbox).daily+s.ventures.reduce((total,v)=>total+(v.paused?businessOperation(v)/2:businessOperation(v)+marketInfluence(v.id,v.price,v.positioning,s.day,s.sandbox).daily+(v.staff?businessTypes[v.id].wage:0)),0);
  const operations=daily*days,payments=s.loan?Math.min(days,s.loan.remaining)*creditTerms.installment:0;
  const reserve=replenishment+operations+payments;
  return {days,replenishment,daily,operations,payments,reserve,gap:Math.max(0,reserve-s.cash),afterReserve:s.cash-reserve};
}
