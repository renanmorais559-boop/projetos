import {test} from 'node:test';
import assert from 'node:assert/strict';
import {initial,buy,runDay,continueCompany,projectDay} from '../engine.js';
import {openBusiness,buyBusinessStock,configureBusiness} from '../ventures.js';
import {competitionFor,marketInfluence,setPositioning} from '../competition.js';
import {encodeGame,decodeGame} from '../storage.js';
import {forecast} from '../planning.js';
import {restockPlan} from '../restocking.js';
import {workingCapital} from '../capital.js';
const free=()=>{const s=initial();s.cash=100000;s.price=27;while(s.day<=30){buy(s,30);runDay(s,()=>0)}continueCompany(s);while(s.day<45){buy(s,30);runDay(s,()=>0)}return s;};
test('concorrência se ativa só no modo livre a partir de 45 e muda semanalmente',()=>{
 assert.equal(competitionFor('cafe',45).active,false);assert.equal(competitionFor('cafe',44,true).active,false);assert.equal(competitionFor('cafe',45,true).active,true);
 const week=competitionFor('market',45,true);assert.equal(competitionFor('market',49,true).price,week.price);assert.notEqual(competitionFor('market',50,true).price,week.price);
 assert.equal(competitionFor('unknown',45,true),null);assert.equal(competitionFor('toString',45,true),null);
 for(const price of [1,20,1000])assert.ok(Math.abs(marketInfluence('cafe',price,'balanced',45,true).effect)<=.12);
});
test('posicionamento exige modo livre, não cobra antecipado e não muda preço ou estoque',()=>{
 assert.equal(setPositioning(initial(),'cafe','premium'),false);const s=free(),before=structuredClone(s);assert.equal(setPositioning(s,'cafe','premium'),true);
 assert.equal(s.cash,before.cash);assert.equal(s.price,before.price);assert.equal(s.stock,before.stock);assert.equal(s.positioning,'premium');assert.equal(setPositioning(s,'cafe','toString'),false);assert.equal(setPositioning(s,'unknown','value'),false);
 assert.deepEqual(decodeGame(encodeGame(s)),s);
});
test('posicionamento altera elasticidade e despesas e previsão coincide com o caixa real',()=>{
 const s=free();openBusiness(s,'electronics');buyBusinessStock(s,'electronics',100);s.ventures[0].price=90;
 const regular=projectDay(s).ventures[0];setPositioning(s,'electronics','premium');const premium=projectDay(s).ventures[0];assert.ok(premium.demand>regular.demand);assert.equal(premium.expenses,regular.expenses+30);
 const plan=forecast(s).scenarios[1],before=s.cash,r=runDay(s,()=>0);assert.equal(plan.profit,r.profit);assert.equal(plan.cash,s.cash);assert.equal(s.cash,before+r.revenue-r.expenses);assert.deepEqual(decodeGame(encodeGame(s)),s);
});
test('loja suspensa não cobra posicionamento e reserva inclui os custos da marca ativa',()=>{
 const s=free();openBusiness(s,'bakery');buyBusinessStock(s,'bakery',30);const before=workingCapital(s,3).operations;
 setPositioning(s,'cafe','premium');setPositioning(s,'bakery','value');assert.equal(workingCapital(s,3).operations,before+45*3);
 configureBusiness(s,'bakery','paused',true);const report=projectDay(s).ventures[0];assert.equal(report.expenses,55);assert.equal(report.demand,0);
 assert.ok(!restockPlan(s,3).items.some(v=>v.id==='bakery'));
});
test('versão 11 migra lojas e desafios mantendo os históricos',()=>{
 const s=free();openBusiness(s,'bakery');const old=structuredClone(s);delete old.positioning;for(const v of old.ventures)delete v.positioning;
 assert.deepEqual(decodeGame(JSON.stringify({version:11,state:old})),s);
 const invalid=structuredClone(s);invalid.ventures[0].positioning='unknown';assert.throws(()=>decodeGame(JSON.stringify({version:12,state:invalid})));
});
