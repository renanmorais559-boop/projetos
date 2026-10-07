import {test} from 'node:test';
import assert from 'node:assert/strict';
import {initial,buy,runDay,continueCompany,borrow,availableOrder,acceptOrder} from '../engine.js';
import {openBusiness,buyBusinessStock,configureBusiness} from '../ventures.js';
import {encodeGame,decodeGame} from '../storage.js';
import {summarize} from '../progress.js';
const campaign=()=>{const s=initial();s.cash=100000;for(let i=0;i<30;i++){if(s.stock<50)buy(s,100,'wholesale');runDay(s,()=>0)}return s;};
test('continuar preserva campanha e recursos e não permite ressuscitar falência',()=>{
  const s=campaign(),snapshot=structuredClone(s);assert.equal(continueCompany(s),true);
  assert.equal(s.day,31);assert.equal(s.cash,snapshot.cash);assert.deepEqual(s.campaign,snapshot.campaign);assert.equal(s.over,false);
  assert.equal(continueCompany(s),false);assert.equal(summarize(s).missions[4].done,true);
  s.cash=0;s.stock=0;s.lots=[];runDay(s,()=>0);assert.equal(s.over,true);assert.equal(continueCompany(s),false);
  assert.equal(s.campaign.won,true);assert.equal(summarize(s).outcome,'Empresa sem caixa');
});
test('400 dias preservam totais com diário limitado, backups restauráveis e parcelas',()=>{
  const s=campaign();continueCompany(s);const campaignRecord=structuredClone(s.campaign);let totalSold=s.totals.sold,totalProfit=s.totals.profit;
  for(let day=31;day<=400;day++){
    if(s.stock<50)buy(s,100,'wholesale');if(day===100)assert.equal(borrow(s),true);
    const r=runDay(s,()=>0);totalSold+=r.sold;totalProfit+=r.profit;
    assert.deepEqual(decodeGame(encodeGame(s)),s);
  }
  assert.equal(s.day,401);assert.equal(s.history.length,120);assert.equal(s.history[0].day,281);
  assert.equal(s.totals.days,400);assert.equal(s.totals.sold,totalSold);assert.equal(s.totals.profit,totalProfit);
  assert.deepEqual(s.campaign,campaignRecord);assert.equal(s.loan,null);assert.equal(summarize(s).days,400);
});
test('modo livre repete encomendas e restaura pedido pendente no dia 35',()=>{
  const s=campaign();continueCompany(s);while(s.day<35){buy(s,30);runDay(s,()=>0)}
  assert.equal(availableOrder(s).quantity,15);assert.equal(acceptOrder(s),true);
  const restored=decodeGame(encodeGame(s));assert.equal(runDay(restored,()=>0).contractSold,15);
});
test('suspensão cobra só manutenção e conserva estoque, equipe e reputação',()=>{
  const s=campaign();continueCompany(s);openBusiness(s,'bakery');buyBusinessStock(s,'bakery',40);configureBusiness(s,'bakery','staff',true);
  configureBusiness(s,'bakery','paused',true);const before=structuredClone(s.ventures[0]);const r=runDay(s,()=>0).ventures[0];
  assert.equal(r.sold,0);assert.equal(r.expenses,55);assert.equal(r.profit,-55);assert.deepEqual(s.ventures[0],before);
  assert.deepEqual(decodeGame(encodeGame(s)),s);configureBusiness(s,'bakery','paused',false);
  assert.ok(runDay(s,()=>0).ventures[0].sold>0);
});
test('versão 9 publicada migra campanha e lojas sem perder histórico',()=>{
  const s=campaign(),old=structuredClone(s);delete old.sandbox;delete old.campaign;delete old.totals;
  assert.deepEqual(decodeGame(JSON.stringify({version:9,state:old})),s);
  for(const change of [x=>x.totals.days++,x=>x.history[0].day++,x=>x.campaign.won=false,x=>x.sandbox=true]){
    const copy=structuredClone(s);change(copy);
    if(copy.sandbox)copy.over=true;
    assert.throws(()=>decodeGame(JSON.stringify({version:10,state:copy})));
  }
});
test('tecnologia exige dia 40 e contabiliza mercadorias caras em três negócios',()=>{
  const s=campaign();continueCompany(s);assert.equal(openBusiness(s,'electronics'),false);
  while(s.day<40){buy(s,50);runDay(s,()=>0)}
  assert.equal(openBusiness(s,'electronics'),true);openBusiness(s,'bakery');openBusiness(s,'market');
  for(const v of s.ventures)buyBusinessStock(s,v.id,100);
  const before=s.cash,r=runDay(s,()=>0),tech=r.ventures.find(v=>v.id==='electronics');
  assert.equal(tech.sold,20);assert.equal(tech.goodsCost,800);assert.equal(tech.profit,480);
  assert.equal(s.cash,before+r.revenue-r.expenses-r.payment);assert.deepEqual(decodeGame(encodeGame(s)),s);
  assert.equal(summarize(s).missions.at(-1).done,true);
});
