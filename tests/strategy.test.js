import {test} from 'node:test';
import assert from 'node:assert/strict';
import {initial,runDay} from '../engine.js';
import {strategyPreview,applyStrategy} from '../strategy.js';
test('laboratório compara lucro e caixa sem mutar ou avançar a partida',()=>{
 const s=initial(),before=structuredClone(s),rows=strategyPreview(s,'cafe',{price:22,staff:false,marketing:0});
 assert.equal(rows.length,3);assert.deepEqual(s,before);assert.ok(rows[1].delta>0);
 const next=structuredClone(s);assert.equal(applyStrategy(next,'cafe',{price:22,staff:false,marketing:0}),true);const cash=next.cash,r=runDay(next,()=>0);assert.equal(rows[1].proposed.profit,r.cafe.profit);assert.equal(rows[1].companyCash,next.cash);assert.equal(next.cash,cash+r.revenue-r.expenses);
});
test('proposta inválida ou partida encerrada não aplica mudanças parciais',()=>{
 const s=initial(),before=structuredClone(s);for(const proposal of [{price:99,staff:true,marketing:0},{price:25,staff:true,marketing:999},{price:25,staff:'yes',marketing:0}]){assert.equal(applyStrategy(s,'cafe',proposal),false);assert.throws(()=>strategyPreview(s,'cafe',proposal))}assert.deepEqual(s,before);assert.equal(applyStrategy(s,'toString',{price:10,staff:false}),false);s.over=true;assert.equal(applyStrategy(s,'cafe',{price:22,staff:false,marketing:0}),false);
});
