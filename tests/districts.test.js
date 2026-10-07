import {test} from 'node:test';
import assert from 'node:assert/strict';
import {initial,expand,runDay} from '../engine.js';
import {SAVE_KEY,loadGame,saveGame} from '../storage.js';
test('bairro determina abertura, movimento e operação',()=>{
  for(const [id,cost,demand,expenses] of [['residential',1400,40,150],['center',1800,48,180],['station',2300,58,230]]){
    const s=initial();assert.equal(expand(s,id),true);assert.equal(s.cash,2500-cost);s.stock=100;s.lots=[{quantity:100,cost:8}];
    const r=runDay(s,()=>0);assert.equal(r.demand,demand);assert.equal(r.expenses,expenses);assert.equal(r.sold,Math.min(50,demand));
  }
});
test('local desconhecido e caixa insuficiente não alteram partida',()=>{
  const s=initial(),before=structuredClone(s);assert.equal(expand(s,'toString'),false);assert.deepEqual(s,before);
  s.cash=2000;assert.equal(expand(s,'station'),false);assert.equal(s.cash,2000);assert.equal(s.district,null);
});
test('save anterior de duas lojas mantém localização equivalente e histórico',()=>{
  const s=initial();expand(s);s.stock=100;s.lots=[{quantity:100,cost:8}];runDay(s,()=>0);const old=structuredClone(s);delete old.district;
  let raw=JSON.stringify({version:2,state:old});const store={getItem:()=>raw,setItem:(k,v)=>{assert.equal(k,SAVE_KEY);raw=v}};
  const loaded=loadGame(store);assert.equal(loaded.status,'loaded');assert.deepEqual(loaded.state,s);
  const newState=initial();expand(newState,'station');assert.equal(saveGame(store,newState),true);assert.deepEqual(loadGame(store).state,newState);
});
