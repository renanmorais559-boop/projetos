export const challengeTypes={
  profit:{name:'Semana rentável',description:'Gere R$ 2.000 de lucro operacional em sete dias.',metric:'profit',target:2000},
  service:{name:'Clientes bem atendidos',description:'Venda pelo menos 150 unidades e atenda 90% da demanda total em sete dias.',metric:'service',target:90},
  consistency:{name:'Gestão consistente',description:'Encerre todos os sete dias com lucro operacional positivo.',metric:'profitable',target:7}
};
export function challengeProgress(s,challenge=s.challenge){
  if(!challenge)return null;
  const base=challenge.baseline,t=s.totals,days=t.days-base.days;
  const sold=t.sold-base.sold,demand=t.demand-base.demand,profit=t.profit-base.profit,profitable=t.profitable-base.profitable;
  const service=demand?Math.floor(sold/demand*1000)/10:null;
  const id=challenge.id;
  const met=id==='profit'?profit>=2000:id==='service'?sold>=150&&demand>0&&sold/demand>=.9:profitable===7;
  return {days,sold,demand,profit,profitable,service,met,remaining:Math.max(0,7-days)};
}
export function startChallenge(s,id){
  if(!Object.hasOwn(challengeTypes,id)||s.over||!s.sandbox||s.challenge)return false;
  s.challenge={id,startDay:s.day,baseline:{...s.totals}};return true;
}
export function finishChallenge(s){
  if(!s.challenge)return null;
  const progress=challengeProgress(s);
  if(progress.days<7&&!s.over)return null;
  const won=progress.days===7&&progress.met;
  const result={id:s.challenge.id,startDay:s.challenge.startDay,endDay:s.day-1,won,progress};
  s.lastChallenge=result;
  if(won&&!s.badges.includes(result.id))s.badges.push(result.id);
  s.challenge=null;return result;
}
