import {test} from 'node:test';
import assert from 'node:assert/strict';
import {initial,upgrade,capacity,operationCost,runDay} from '../engine.js';
import {saveGame,loadGame} from '../storage.js';
test('melhoria exige caixa, só cobra uma vez e aumenta capacidade',()=>{const s=initial();assert.equal(upgrade(s),true);assert.equal(s.cash,1600);assert.equal(capacity(s),40);assert.equal(operationCost(s),70);assert.equal(upgrade(s),false);assert.equal(s.cash,1600);const poor=initial();poor.cash=899;assert.equal(upgrade(poor),false);const ended=initial();ended.over=true;assert.equal(upgrade(ended),false)});
test('equipamento atende demanda antes perdida e mantém custo do estoque',()=>{const s=initial();s.stock=100;s.lots=[{quantity:100,cost:8}];upgrade(s);const r=runDay(s,()=>.3);assert.equal(r.demand,32);assert.equal(r.sold,32);assert.equal(r.expenses,70);assert.equal(r.profit,314);assert.equal(s.cash,2170);assert.equal(s.stock,68)});
test('restaura máquina e migra save antigo sem equipamento',()=>{let raw;const store={getItem:()=>raw,setItem:(k,v)=>raw=v};const s=initial();upgrade(s);runDay(s,()=>0);assert.equal(saveGame(store,s),true);assert.deepEqual(loadGame(store).state,s);const old=initial();delete old.equipment;raw=JSON.stringify({version:4,state:old});assert.equal(loadGame(store).status,'loaded');assert.equal(loadGame(store).state.equipment,false)});
