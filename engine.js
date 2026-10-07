import {projectBusiness} from './ventures.js';
export const scenarios={
  standard:{name:'Início equilibrado',cash:2500,goal:5000,description:'Aprenda a equilibrar margem, estoque e reserva antes de expandir.'},
  bootstrap:{name:'Orçamento apertado',cash:1500,goal:3500,description:'Comece com menos caixa. Priorize capital de giro e evite comprometer sua reserva.'},
  growth:{name:'Expansão acelerada',cash:4000,goal:9000,description:'Mais capital, mas uma meta maior. Planeje investimentos que tragam vendas e margem adicionais.'}
};
export const targetFor=s=>scenarios[s.scenario].goal;
export const districts = {
  residential:{name:'Vila Jardim',cost:1400,rent:60,demand:16,description:'Bairro residencial · menor custo, movimento moderado'},
  center:{name:'Centro',cost:1800,rent:90,demand:24,description:'Comércio e escritórios · custo e movimento equilibrados'},
  station:{name:'Estação',cost:2300,rent:140,demand:34,description:'Terminal de transporte · mais clientes, aluguel alto'}
};
export const operationCost=s=>90+(s.branches===2?districts[s.district].rent:0)-(s.equipment?20:0);
export const capacity=s=>(s.staff?45+s.training*8:25)+25*(s.branches-1)+(s.equipment?15:0);
export const cafePayroll=s=>s.staff?100+s.training*20:0;
export function trainTeam(s){
  const cost=s.training===0?300:500;
  if(s.over||!s.staff||s.training>=2||s.cash<cost)return false;
  s.cash-=cost;s.training++;return true;
}
export function upgrade(s){
  if(s.over||s.equipment||s.cash<900)return false;
  s.cash-=900;s.equipment=true;return true;
}
export const initial = (scenario='standard') => {
  if(!Object.hasOwn(scenarios,scenario))throw new Error('Cenário desconhecido.');
  return {scenario,day:1,cash:scenarios[scenario].cash,stock:30,lots:[{quantity:30,cost:8}],price:20,marketing:0,staff:false,branches:1,district:null,loan:null,contract:null,equipment:false,training:0,ventures:[],decisions:[],promotionUntil:0,reputation:50,history:[],over:false};
};
export const suppliers={regular:{name:'Distribuidor local',cost:8,min:1},wholesale:{name:'Atacado',cost:6,min:50}};
export function inventoryCost(s,quantity=s.stock){
  let remaining=quantity,total=0;
  for(const lot of s.lots){const take=Math.min(remaining,lot.quantity);total+=take*lot.cost;remaining-=take;if(!remaining)break;}
  return total;
}
export function buy(s,quantity,supplier='regular'){
  const offer=Object.hasOwn(suppliers,supplier)?suppliers[supplier]:null;
  if(!offer||!Number.isSafeInteger(quantity)||quantity<offer.min||quantity>1000||!Number.isSafeInteger(s.stock+quantity)||s.over||s.cash<quantity*offer.cost)return false;
  s.cash-=quantity*offer.cost;s.stock+=quantity;
  const last=s.lots.at(-1);
  if(last?.cost===offer.cost)last.quantity+=quantity;
  else s.lots.push({quantity,cost:offer.cost});
  return true;
}
export function breakEven(s){
  const fixed=operationCost(s)+s.marketing+cafePayroll(s);
  for(let n=1;n<=Math.min(s.stock,capacity(s));n++)if(n*s.price-inventoryCost(s,n)>=fixed)return n;
  return null;
}
export function expand(s,district='center'){
  const location=Object.hasOwn(districts,district)?districts[district]:null;
  if(!location||s.over||s.branches!==1||s.cash<location.cost)return false;
  s.cash-=location.cost;s.branches=2;s.district=district;return true;
}
export const creditTerms={principal:2000,installment:220,days:10,total:2200};
export const debt=s=>s.loan?s.loan.remaining*creditTerms.installment:0;
export const netCash=s=>s.cash-debt(s);
export function borrow(s){
  if(s.over||s.loan||s.day>21)return false;
  s.cash+=creditTerms.principal;s.loan={remaining:creditTerms.days};return true;
}
export function repay(s){
  const amount=debt(s);
  if(s.over||!s.loan||s.cash<amount)return false;
  s.cash-=amount;s.loan=null;return true;
}
export const orders={
  5:{client:'Escritório Horizonte',quantity:15,price:16},
  12:{client:'Feira de empreendedores',quantity:25,price:16},
  20:{client:'Encontro da Estação',quantity:40,price:17}
};
export const availableOrder=s=>!s.over&&Object.hasOwn(orders,s.day)?orders[s.day]:null;
export function acceptOrder(s){
  if(!availableOrder(s)||s.contract!==null)return false;
  s.contract=s.day;return true;
}
export const events=[{title:'Dia normal',factor:1},{title:'Festival no bairro: mais movimento!',factor:1.35},{title:'Chuva forte: menos clientes na rua',factor:.7},{title:'Concorrente em promoção',factor:.85}];
export function projectCafe(s,event=events[0]){
  const retailDemand=Math.max(0,Math.round((24+(s.day<=s.promotionUntil?8:0)+(s.branches===2?districts[s.district].demand:0)+(s.reputation-50)*.25+s.marketing*.12)*Math.max(.1,1+(20-s.price)*.065)*event.factor));
  const order=s.contract===null?null:orders[s.contract];
  const contractFailed=Boolean(order&&(s.stock<order.quantity||capacity(s)<order.quantity));
  const contractSold=order&&!contractFailed?order.quantity:0;
  const retailSold=Math.min(s.stock-contractSold,retailDemand,capacity(s)-contractSold);
  const sold=retailSold+contractSold,demand=retailDemand+(order?.quantity??0);
  const revenue=retailSold*s.price+contractSold*(order?.price??0),expenses=operationCost(s)+s.marketing+cafePayroll(s)+(contractFailed?80:0),goodsCost=inventoryCost(s,sold),profit=revenue-goodsCost-expenses;
  const payment=s.loan?creditTerms.installment:0;
  return {day:s.day,event:event.title,demand,sold,revenue,expenses,goodsCost,profit,payment,contractSold,contractFailed,lost:demand-sold};
}
export function projectDay(s,event=events[0]){
  const cafe=projectCafe(s,event),ventures=s.ventures.map(v=>projectBusiness(v,event));
  const result={...cafe,cafe:{...cafe},ventures};
  for(const key of ['demand','sold','revenue','expenses','goodsCost','profit','lost'])
    result[key]+=ventures.reduce((sum,v)=>sum+v[key],0);
  return result;
}
export function runDay(s,random=Math.random){
  if(s.over)return null;
  const result=projectDay(s,events[Math.min(3,Math.floor(random()*4))]);
  if(s.loan){s.loan.remaining--;if(s.loan.remaining===0)s.loan=null;}
  let remaining=result.cafe.sold;
  while(remaining>0){const lot=s.lots[0],take=Math.min(remaining,lot.quantity);lot.quantity-=take;remaining-=take;if(lot.quantity===0)s.lots.shift();}
  s.stock-=result.cafe.sold;s.cash+=result.revenue-result.expenses-result.payment;
  s.reputation=Math.max(0,Math.min(100,s.reputation+(result.contractFailed?-8:result.cafe.sold>=result.cafe.demand?3+(s.staff?s.training:0):-4)));
  for(const report of result.ventures){
    const venture=s.ventures.find(v=>v.id===report.id);
    venture.stock-=report.sold;
    venture.reputation=Math.max(0,Math.min(100,venture.reputation+(report.lost===0?3:-4)));
  }
  s.contract=null;
  s.history.push(result);s.day++;
  s.over=s.cash<0||s.day>30;
  return result;
}
