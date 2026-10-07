import {test} from 'node:test';
import assert from 'node:assert/strict';
import {initial,borrow} from '../engine.js';
import {workingCapital} from '../capital.js';
import {restockPlan} from '../restocking.js';
test('reserva inclui reposição e despesas sem contar vendas futuras',()=>{
 const s=initial(),before=structuredClone(s),r=workingCapital(s,3);
 assert.equal(r.replenishment,restockPlan(s,3).total);assert.equal(r.operations,270);assert.equal(r.payments,0);assert.equal(r.reserve,r.replenishment+270);assert.equal(r.afterReserve,s.cash-r.reserve);assert.deepEqual(s,before);
});
test('reserva limita parcelas aos dias restantes e informa falta de caixa',()=>{
 const s=initial();borrow(s);s.loan.remaining=1;s.cash=1;const r=workingCapital(s,3);assert.equal(r.payments,220);assert.equal(r.gap,r.reserve-1);assert.throws(()=>workingCapital(s,8));
});
