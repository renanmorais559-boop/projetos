import {test} from 'node:test';
import assert from 'node:assert/strict';
import {initial,buy,runDay} from '../engine.js';
import {openBusiness,configureBusiness} from '../ventures.js';
import {restockPlan,replenishCompany} from '../restocking.js';
import {financialReport,exportLedger} from '../reports.js';
const ready=()=>{const s=initial();s.cash=100000;while(s.day<15){buy(s,30);runDay(s,()=>0)}openBusiness(s,'bakery');openBusiness(s,'market');return s;};
test('compra conjunta é exata, não compra para loja suspensa e não muda estado na previsão',()=>{
  const s=ready();configureBusiness(s,'market','paused',true);const before=structuredClone(s),plan=restockPlan(s,3);
  assert.deepEqual(s,before);assert.equal(plan.items.length,2);assert.ok(!plan.items.some(i=>i.id==='market'));
  assert.equal(replenishCompany(s,3),true);assert.equal(s.cash,before.cash-plan.total);
  for(const i of plan.items)assert.equal(i.id==='cafe'?s.stock:s.ventures.find(v=>v.id===i.id).stock,Math.max(i.stock,i.target));
  assert.equal(restockPlan(s,3).total,0);assert.equal(replenishCompany(s,3),false);
});
test('caixa insuficiente rejeita a compra inteira sem reposição parcial',()=>{
  const s=ready();s.cash=1;const before=structuredClone(s);assert.equal(replenishCompany(s,3),false);assert.deepEqual(s,before);
  assert.throws(()=>restockPlan(s,8));assert.throws(()=>restockPlan(s,1.5));
});
test('painel soma somente últimos sete dias e compara semana anterior',()=>{
  const s=ready(),r=financialReport(s),rows=s.history.slice(-7);assert.equal(r.days,7);assert.equal(r.previousDays,7);
  assert.equal(r.profit,rows.reduce((n,v)=>n+v.profit,0));assert.equal(r.revenue,rows.reduce((n,v)=>n+v.revenue,0));
  assert.equal(r.businesses.reduce((n,b)=>n+b.profit,0),r.profit);
  assert.equal(financialReport(initial()).margin,null);
});
test('CSV distingue total e lojas, mantém eventos entre aspas e neutraliza fórmulas',()=>{
  const s=ready();replenishCompany(s,2);runDay(s,()=>0);s.history.at(-1).event='=HYPERLINK("teste")';
  const csv=exportLedger(s);assert.ok(csv.startsWith('\uFEFF'));assert.match(csv,/Empresa consolidada/);assert.match(csv,/Padaria Pão da Vila/);
  assert.ok(!csv.includes('"=HYPERLINK'));assert.match(csv,/""teste""/);
});
