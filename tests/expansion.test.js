import {test} from 'node:test';
import assert from 'node:assert/strict';
import {initial,expand,runDay} from '../engine.js';
import {SAVE_KEY,saveGame,loadGame} from '../storage.js';
test('expansão cobra uma vez e impede abertura sem caixa ou após fim',()=>{
  const s=initial();assert.equal(expand(s),true);assert.equal(s.cash,700);assert.equal(s.branches,2);assert.equal(expand(s),false);assert.equal(s.cash,700);
  const poor=initial();poor.cash=1799;assert.equal(expand(poor),false);assert.equal(poor.branches,1);
  const ended=initial();ended.over=true;assert.equal(expand(ended),false);
});
test('segunda unidade aumenta demanda, capacidade e despesas',()=>{
  const s=initial();expand(s);s.stock=100;s.lots=[{quantity:100,cost:8}];const r=runDay(s,()=>0);
  assert.equal(r.demand,48);assert.equal(r.sold,48);assert.equal(r.expenses,180);assert.equal(r.profit,396);assert.equal(s.cash,1480);
});
test('migra save antigo e restaura rede com vendas acima de 45',()=>{
  let raw;const store={getItem:()=>raw,setItem:(k,v)=>{assert.equal(k,SAVE_KEY);raw=v}};
  const old=initial();delete old.branches;raw=JSON.stringify({version:1,state:old});assert.equal(loadGame(store).state.branches,1);
  const s=initial();expand(s);s.stock=100;s.lots=[{quantity:100,cost:8}];runDay(s,()=>0);assert.equal(saveGame(store,s),true);assert.deepEqual(loadGame(store).state,s);
});
