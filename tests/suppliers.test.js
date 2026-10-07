import {test} from 'node:test';
import assert from 'node:assert/strict';
import {initial,buy,runDay,inventoryCost,projectDay,breakEven} from '../engine.js';
import {encodeGame,decodeGame} from '../storage.js';
test('atacado exige lote mínimo e preserva caixa em compra inválida',()=>{const s=initial();assert.equal(buy(s,49,'wholesale'),false);assert.equal(buy(s,50,'unknown'),false);assert.equal(s.cash,2500);assert.equal(buy(s,50,'wholesale'),true);assert.equal(s.cash,2200);assert.equal(s.stock,80);assert.equal(inventoryCost(s),540)});
test('FIFO mantém custo antigo e depois usa custo do atacado',()=>{const s=initial();buy(s,50,'wholesale');let r=runDay(s,()=>0);assert.equal(r.goodsCost,192);assert.deepEqual(s.lots,[{quantity:6,cost:8},{quantity:50,cost:6}]);const preview=projectDay(s);r=runDay(s,()=>0);assert.equal(r.sold,25);assert.equal(r.goodsCost,162);assert.equal(r.profit,r.revenue-162-r.expenses);assert.deepEqual(preview,r);assert.equal(inventoryCost(s),186)});
test('margem, save e validação consideram lotes',()=>{const s=initial();s.stock=50;s.lots=[{quantity:50,cost:6}];assert.equal(breakEven(s),7);assert.deepEqual(decodeGame(encodeGame(s)),s);assert.throws(()=>decodeGame(JSON.stringify({version:7,state:{...s,stock:49}})));assert.equal(buy(s,1001),false)});
test('migração mantém custos anteriores e valor do estoque',()=>{const s=initial();runDay(s,()=>0);const old=structuredClone(s);delete old.lots;delete old.history[0].goodsCost;assert.deepEqual(decodeGame(JSON.stringify({version:6,state:old})),s)});
