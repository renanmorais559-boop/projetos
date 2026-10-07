import {buy,projectCafe,events,capacity,suppliers} from './engine.js';
import {businessTypes,buyBusinessStock,projectBusiness} from './ventures.js';
export function restockPlan(s,days=2){
  if(!Number.isInteger(days)||days<1||days>7)throw new Error('Escolha de 1 a 7 dias.');
  const cafe=projectCafe(s,events[0]);
  const cafeTarget=Math.min(cafe.demand,capacity(s))+(days-1)*Math.min(cafe.demand-cafe.contractSold,capacity(s));
  const quantity=Math.max(0,cafeTarget-s.stock),supplier=quantity>=50?'wholesale':'regular';
  const items=[{id:'cafe',name:'Rede Café Aurora',stock:s.stock,target:cafeTarget,quantity,supplier,cost:quantity*suppliers[supplier].cost}];
  for(const v of s.ventures){
    if(v.paused)continue;
    const type=businessTypes[v.id],forecast=projectBusiness(v,events[0]);
    const target=Math.min(forecast.demand,v.staff?type.staffedCapacity:type.capacity)*days;
    const quantity=Math.max(0,target-v.stock);
    items.push({id:v.id,name:type.name,stock:v.stock,target,quantity,cost:quantity*type.cost});
  }
  return {days,items,total:items.reduce((n,i)=>n+i.cost,0)};
}
export function replenishCompany(s,days=2){
  if(s.over)return false;
  const plan=restockPlan(s,days);
  if(plan.total===0||s.cash<plan.total)return false;
  const next=structuredClone(s);
  for(const item of plan.items){
    if(!item.quantity)continue;
    if(!(item.id==='cafe'?buy(next,item.quantity,item.supplier):buyBusinessStock(next,item.id,item.quantity)))return false;
  }
  Object.assign(s,next);return true;
}
