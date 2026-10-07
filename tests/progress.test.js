import {test} from 'node:test';
import assert from 'node:assert/strict';
import {initial,buy,runDay,borrow} from '../engine.js';
import {summarize} from '../progress.js';
test('partida nova não concede conquistas e não inventa atendimento',()=>{const p=summarize(initial());assert.equal(p.service,null);assert.equal(p.missions.filter(m=>m.done).length,0);assert.equal(p.outcome,'Partida em andamento')});
test('objetivos refletem dias realmente jogados e não contam demanda zero',()=>{const s=initial();s.price=20;for(let i=0;i<5;i++){buy(s,30);runDay(s,()=>0)}const p=summarize(s);assert.equal(p.missions[0].done,true);assert.equal(p.missions[2].done,false);assert.equal(p.profitable,5);assert.equal(p.sold,s.history.reduce((n,r)=>n+r.sold,0))});
test('meta só é conquistada após dia 30 e dívida não infla resultado',()=>{const s=initial();s.cash=4000;borrow(s);assert.equal(summarize(s).netCash,3800);assert.equal(summarize(s).missions[4].done,false);s.cash=100000;s.stock=10000;s.lots=[{quantity:10000,cost:8}];for(let i=0;i<30;i++)runDay(s,()=>0);const p=summarize(s);assert.equal(p.missions[4].done,true);assert.equal(p.outcome,'Meta alcançada!')});
test('falência produz conselho sobre reserva e não concede vitória',()=>{const s=initial();s.cash=0;s.stock=0;s.lots=[];runDay(s,()=>0);const p=summarize(s);assert.equal(p.outcome,'Empresa sem caixa');assert.ok(p.feedback.some(t=>t.includes('reserve')));assert.equal(p.missions[4].done,false)});
