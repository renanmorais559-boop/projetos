import {test} from 'node:test';
import assert from 'node:assert/strict';
import {initial,buy,runDay,continueCompany} from '../engine.js';
import {openBusiness,buyBusinessStock,configureBusiness} from '../ventures.js';
import {storeHealth} from '../store-health.js';
const ready=()=>{const s=initial();s.cash=100000;while(s.day<=30){buy(s,30);runDay(s,()=>0)}continueCompany(s);while(s.day<45){buy(s,30);runDay(s,()=>0)}return s;};
test('estoque vazio não justifica contratar para vender mais',()=>{
 const s=ready();openBusiness(s,'bakery');const before=structuredClone(s),health=storeHealth(s,'bakery');assert.equal(health.projection.sold,0);assert.ok(health.stockGap>0);assert.equal(health.staffSalesDelta,0);assert.equal(health.staffProfitDelta,-80);assert.deepEqual(s,before);assert.equal(storeHealth(s,'missing'),null);
});
test('diagnóstico calcula retorno da equipe com estoque e capacidade limitante',()=>{
 const s=ready();openBusiness(s,'electronics');buyBusinessStock(s,'electronics',100);s.ventures[0].reputation=100;const health=storeHealth(s,'electronics');assert.equal(health.stockGap,0);assert.ok(health.capacityGap>0);assert.ok(health.staffSalesDelta>0);assert.ok(health.staffProfitDelta>0);
 const expected=health.projection.profit+health.staffProfitDelta;configureBusiness(s,'electronics','staff',true);assert.equal(storeHealth(s,'electronics').projection.profit,expected);
});
test('diagnóstico histórico usa últimos sete dias e suspensão conserva custos corretos',()=>{
 const s=ready();openBusiness(s,'market');buyBusinessStock(s,'market',100);const r=runDay(s,()=>0).ventures[0],health=storeHealth(s,'market');assert.equal(health.days,1);assert.equal(health.sold,r.sold);assert.equal(health.profit,r.profit);configureBusiness(s,'market','paused',true);const paused=storeHealth(s,'market');assert.equal(paused.stockGap,0);assert.equal(paused.capacityGap,0);assert.equal(paused.staffProfitDelta,0);
});
