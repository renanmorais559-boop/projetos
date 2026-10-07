import {test} from 'node:test';
import assert from 'node:assert/strict';
import {initial,buy,runDay} from '../engine.js';
test('compra preserva caixa quando inválida e cobra estoque válido',()=>{const s=initial();assert.equal(buy(s,1000),false);assert.equal(buy(s,-1),false);assert.equal(s.cash,2500);assert.equal(buy(s,20),true);assert.equal(s.cash,2340);assert.equal(s.stock,50)});
test('dia normal contabiliza margem e caixa sem cobrar estoque duas vezes',()=>{const s=initial();const r=runDay(s,()=>0);assert.equal(r.sold,24);assert.equal(r.profit,198);assert.equal(s.cash,2890);assert.equal(s.stock,6)});
test('capacidade e falta de estoque limitam vendas',()=>{const s=initial();s.stock=2;s.lots=[{quantity:2,cost:8}];const r=runDay(s,()=>.3);assert.equal(r.sold,2);assert.ok(r.lost>0);assert.equal(s.reputation,46)});
test('partida termina após exatamente 30 dias',()=>{const s=initial();s.cash=100000;s.stock=10000;s.lots=[{quantity:10000,cost:8}];for(let i=0;i<30;i++)runDay(s,()=>0);assert.equal(s.history.length,30);assert.equal(s.over,true);assert.equal(runDay(s),null)});
