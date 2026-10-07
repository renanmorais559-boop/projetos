import {projectDay,events} from './engine.js';
import {businessTypes} from './ventures.js';
function validChoice(s,id,choice){
  const type=id==='cafe'?{minPrice:10,maxPrice:35}:businessTypes[id];
  return type&&(id==='cafe'||s.ventures.some(v=>v.id===id))&&choice&&
    Number.isInteger(choice.price)&&choice.price>=type.minPrice&&choice.price<=type.maxPrice&&typeof choice.staff==='boolean'&&
    (id!=='cafe'||[0,40,100].includes(choice.marketing));
}
export function strategyPreview(s,id,choice){
  if(!validChoice(s,id,choice))throw new Error('Estratégia inválida.');
  const candidate=structuredClone(s),v=id==='cafe'?candidate:candidate.ventures.find(v=>v.id===id);
  v.price=choice.price;v.staff=choice.staff;if(id==='cafe')v.marketing=choice.marketing;
  return [['Fraco',events[2]],['Normal',events[0]],['Forte',events[1]]].map(([label,event])=>{
    const baseline=projectDay(s,event),next=projectDay(candidate,event);
    const current=id==='cafe'?baseline.cafe:baseline.ventures.find(v=>v.id===id);
    const proposed=id==='cafe'?next.cafe:next.ventures.find(v=>v.id===id);
    return {label,current,proposed,delta:proposed.profit-current.profit,companyCash:s.cash+next.revenue-next.expenses-next.payment};
  });
}
export function applyStrategy(s,id,choice){
  if(s.over||!validChoice(s,id,choice))return false;
  const v=id==='cafe'?s:s.ventures.find(v=>v.id===id);
  v.price=choice.price;v.staff=choice.staff;if(id==='cafe')v.marketing=choice.marketing;
  return true;
}
