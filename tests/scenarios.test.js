import {test} from 'node:test';
import assert from 'node:assert/strict';
import {initial,targetFor} from '../engine.js';
import {summarize} from '../progress.js';
import {encodeGame,decodeGame} from '../storage.js';
test('cenários têm capitais e metas próprios e rejeitam nome desconhecido',()=>{for(const [id,cash,goal] of [['standard',2500,5000],['bootstrap',1500,3500],['growth',4000,9000]]){const s=initial(id);assert.equal(s.cash,cash);assert.equal(targetFor(s),goal);assert.equal(s.day,1)}assert.throws(()=>initial('toString'))});
test('meta do relatório respeita cenário e dívida',()=>{for(const id of ['standard','bootstrap','growth']){const s=initial(id);s.day=31;s.over=true;s.cash=targetFor(s);assert.equal(summarize(s).outcome,'Meta alcançada!');s.loan={remaining:1};assert.notEqual(summarize(s).outcome,'Meta alcançada!');assert.equal(summarize(s).missions[4].done,false)}});
test('backup restaura cenário e salva legado com padrão original',()=>{const s=initial('growth');assert.deepEqual(decodeGame(encodeGame(s)),s);const old=initial();delete old.scenario;assert.deepEqual(decodeGame(JSON.stringify({version:5,state:old})),initial());assert.throws(()=>decodeGame(JSON.stringify({version:6,state:{...s,scenario:'invalid'}})))});
