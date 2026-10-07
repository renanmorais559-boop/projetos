import {test} from 'node:test';
import assert from 'node:assert/strict';
import {initial,buy,runDay,continueCompany,projectDay} from '../engine.js';
import {openBusiness,buyBusinessStock,upgradeBusiness,businessCapacity,businessOperation,configureBusiness} from '../ventures.js';
import {marketCalendar,calendarWeek} from '../calendar.js';
import {startChallenge,challengeProgress} from '../challenges.js';
import {resolveDilemma,availableDilemma} from '../story.js';
import {decodeGame,encodeGame} from '../storage.js';
import {restockPlan,replenishCompany} from '../restocking.js';
const free=()=>{const s=initial();s.cash=100000;s.price=27;for(let i=0;i<30;i++){buy(s,30);runDay(s,()=>0)}continueCompany(s);return s;};
const advance=(s,to)=>{while(s.day<to){if(s.stock<50)buy(s,100,'wholesale');runDay(s,()=>0)}return s;};
test('melhorias próprias acrescentam capacidade, economizam operação e têm dois níveis',()=>{
  const s=free();openBusiness(s,'bakery');const v=s.ventures[0],cash=s.cash;
  assert.equal(upgradeBusiness(s,'bakery'),true);assert.equal(s.cash,cash-850);assert.equal(v.level,1);assert.equal(businessCapacity(v),30);assert.equal(businessOperation(v),100);
  assert.equal(upgradeBusiness(s,'bakery'),true);assert.equal(s.cash,cash-850-1250);assert.equal(businessCapacity(v),35);assert.equal(businessOperation(v),90);assert.equal(upgradeBusiness(s,'bakery'),false);
  configureBusiness(s,'bakery','staff',true);assert.equal(businessCapacity(v),55);
  configureBusiness(s,'bakery','paused',true);assert.equal(projectDay(s).ventures[0].expenses,45);
  assert.deepEqual(decodeGame(encodeGame(s)),s);s.cash=0;assert.equal(upgradeBusiness(s,'missing'),false);
});
test('calendário é neutro na campanha e altera cada ramo no modo livre',()=>{
  for(let day=1;day<=30;day++)assert.deepEqual(marketCalendar(day).factors,{cafe:1,bakery:1,market:1,electronics:1});
  const s=advance(free(),40);openBusiness(s,'electronics');buyBusinessStock(s,'electronics',100);
  const friday=projectDay(s);assert.equal(marketCalendar(40,true).name,'Sexta-feira');assert.equal(friday.ventures[0].demand,25);
  const saturday={...s,day:41};assert.equal(projectDay(saturday).ventures[0].demand,24);
  assert.equal(calendarWeek(s).length,7);assert.equal(calendarWeek(s)[6].day,46);
});
test('previsões do calendário reproduzem o dia real sem mudar estado',()=>{
  const s=free();openBusiness(s,'bakery');buyBusinessStock(s,'bakery',100);upgradeBusiness(s,'bakery');
  const before=structuredClone(s),preview=projectDay(s);assert.deepEqual(s,before);const r=runDay(s,()=>0);assert.deepEqual(r,preview);assert.deepEqual(decodeGame(encodeGame(s)),s);
});
test('compra conjunta considera os próximos dias, capacidade melhorada e o fim da promoção',()=>{
  const s=advance(free(),40);openBusiness(s,'electronics');upgradeBusiness(s,'electronics');s.stock=0;s.lots=[];
  const plan=restockPlan(s,3),item=plan.items.find(i=>i.id==='electronics');
  assert.equal(item.target,25+24+16);assert.equal(item.cost,item.quantity*40);
  assert.equal(replenishCompany(s,3),true);assert.equal(s.ventures[0].stock,item.target);
  assert.deepEqual(decodeGame(encodeGame(s)),s);
});
test('desafios exigem modo livre, persistem no meio e reconhecem sete dias positivos',()=>{
  assert.equal(startChallenge(initial(),'profit'),false);const s=free();assert.equal(startChallenge(s,'consistency'),true);assert.equal(startChallenge(s,'profit'),false);assert.equal(startChallenge(s,'toString'),false);
  for(let i=0;i<7;i++){buy(s,30);runDay(s,()=>0);assert.deepEqual(decodeGame(encodeGame(s)),s);if(i<6)assert.equal(challengeProgress(s).days,i+1)}
  assert.equal(s.challenge,null);assert.equal(s.lastChallenge.won,true);assert.deepEqual(s.badges,['consistency']);
  assert.equal(startChallenge(s,'consistency'),true);for(let i=0;i<7;i++){buy(s,30);runDay(s,()=>0)}assert.deepEqual(s.badges,['consistency']);
});
test('falência encerra desafio sem medalha e metas de atendimento usam o grupo inteiro',()=>{
  const s=free();startChallenge(s,'service');s.cash=0;s.stock=0;s.lots=[];runDay(s,()=>0);assert.equal(s.lastChallenge.won,false);assert.equal(s.challenge,null);assert.equal(s.lastChallenge.progress.days,1);assert.deepEqual(s.badges,[]);assert.deepEqual(decodeGame(encodeGame(s)),s);
  const ready=free();startChallenge(ready,'service');for(let i=0;i<7;i++){buy(ready,30);runDay(ready,()=>0)}assert.equal(ready.lastChallenge.progress.service,100);assert.equal(ready.lastChallenge.won,ready.lastChallenge.progress.sold>=150);
});
test('decisões recorrentes têm efeito uma vez, respeitam suspensão e voltam na semana seguinte',()=>{
  const s=advance(free(),33);openBusiness(s,'bakery');configureBusiness(s,'bakery','paused',true);const rep=s.ventures[0].reputation;
  assert.ok(availableDilemma(s));assert.equal(resolveDilemma(s,'network'),true);assert.equal(resolveDilemma(s,'network'),false);assert.equal(s.ventures[0].reputation,rep);assert.deepEqual(decodeGame(encodeGame(s)),s);
  advance(s,40);assert.equal(resolveDilemma(s,'outreach'),true);assert.equal(s.promotionUntil,42);assert.deepEqual(decodeGame(encodeGame(s)),s);
  advance(s,43);assert.equal(availableDilemma(s),null);const before=projectDay(s).cafe.demand;const copy=structuredClone(s);copy.promotionUntil=0;assert.equal(projectDay(copy).cafe.demand,before);
});
test('versão 10 mantém modo livre e totais ao migrar melhorias e desafios',()=>{
  const s=free();openBusiness(s,'bakery');const old=structuredClone(s);delete old.challenge;delete old.lastChallenge;delete old.badges;for(const v of old.ventures)delete v.level;
  assert.deepEqual(decodeGame(JSON.stringify({version:10,state:old})),s);
  const broken=structuredClone(s);broken.ventures[0].level=3;assert.throws(()=>decodeGame(JSON.stringify({version:11,state:broken})));
  startChallenge(s,'profit');const corrupt=structuredClone(s);corrupt.challenge.baseline.days--;assert.throws(()=>decodeGame(JSON.stringify({version:11,state:corrupt})));
});
test('capacidade máxima de todas as lojas segue contabilizável e salvável',()=>{
  const s=advance(free(),40);s.staff=true;s.training=2;s.equipment=true;s.branches=2;s.district='station';s.price=10;s.reputation=100;
  for(const id of ['bakery','market','electronics']){openBusiness(s,id);configureBusiness(s,id,'staff',true);upgradeBusiness(s,id);upgradeBusiness(s,id);const v=s.ventures.find(v=>v.id===id);v.price=({bakery:8,market:16,electronics:55})[id];v.reputation=100;buyBusinessStock(s,id,200)}
  const r=runDay(s,()=>.3);assert.ok(r.sold>240);assert.equal(r.sold,253);assert.deepEqual(decodeGame(encodeGame(s)),s);
});
test('atendimento arredondado não transforma uma meta abaixo de 90% em vitória',()=>{
  const s=free();startChallenge(s,'service');const base=s.challenge.baseline;
  s.totals={...base,days:base.days+7,sold:base.sold+899,demand:base.demand+999,profit:base.profit+3000,profitable:base.profitable+7};
  const p=challengeProgress(s);assert.equal(p.service,89.9);assert.equal(p.met,false);
});
