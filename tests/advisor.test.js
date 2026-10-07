import {test} from 'node:test';
import assert from 'node:assert/strict';
import {initial} from '../engine.js';
import {advise} from '../advisor.js';
test('orientação prioriza loja vazia e risco de caixa',()=>{const s=initial();s.ventures=[{id:'bakery',stock:0,price:12,staff:false,reputation:50}];assert.match(advise(s),/sem estoque/);s.ventures=[];s.stock=0;s.lots=[];s.cash=0;assert.match(advise(s),/reserva/)});
test('meta alcançada não incentiva investimento desnecessário',()=>{const s=initial();s.cash=6000;assert.match(advise(s),/Preserve a reserva/);s.over=true;assert.match(advise(s),/terminou/)});
