import {test} from 'node:test';
import assert from 'node:assert/strict';
import {initial,borrow,expand,upgrade,runDay} from '../engine.js';
import {forecast} from '../planning.js';
test('previsão não altera estado nem sorteia evento',()=>{const s=initial(),before=structuredClone(s),p=forecast(s);assert.deepEqual(s,before);assert.deepEqual(p.scenarios.map(r=>r.demand),[17,24,32]);assert.deepEqual(p.scenarios.map(r=>r.sold),[17,24,25]);assert.ok(p.alerts.some(t=>t.includes('capacidade')))});
test('cenários reproduzem caixa e lucro reais com equipamento, expansão e dívida',()=>{const s=initial();borrow(s);expand(s,'residential');upgrade(s);s.stock=100;s.lots=[{quantity:100,cost:8}];s.marketing=40;s.staff=true;for(const [i,random] of [[0,.5],[1,0],[2,.3]]){const p=forecast(s).scenarios[i],copy=structuredClone(s),r=runDay(copy,()=>random);assert.equal(p.demand,r.demand);assert.equal(p.profit,r.profit);assert.equal(p.cash,copy.cash);assert.equal(p.payment,220)}});
test('estoque vazio e caixa baixo geram alertas financeiros e de reposição',()=>{const s=initial();s.stock=0;s.lots=[];s.cash=50;const p=forecast(s);assert.ok(p.alerts.some(t=>t.includes('estoque')));assert.ok(p.alerts.some(t=>t.includes('caixa fica negativo')));assert.equal(p.scenarios[0].cash,-40)});
